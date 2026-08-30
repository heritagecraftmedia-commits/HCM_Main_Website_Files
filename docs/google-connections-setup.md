# Connecting Google to the HCM Dashboard Assistant

What this gives you: a **Connected accounts** panel in the dashboard under
**Setup**, with a Connect button for Gmail, Google Calendar and Google Drive.
Pressing Connect takes you to Google's own consent screen. Once connected, the
assistant reads that account every time you ask it something.

The code is written and committed. It stays dormant and reports "not set up on
the server yet" until the four secrets in Step 4 exist. Nothing below is
destructive, and none of it touches how you sign in to the dashboard.

---

## First: which Google account?

This is the one decision that changes the outcome, and it is worth getting right
before you start.

| | **Workspace on heritagecraftmedia.com** | **Personal @gmail.com** |
|---|---|---|
| OAuth app type | **Internal** | **External** |
| Google review needed | **No** | **Yes**, for Gmail and Drive |
| How long a connection lasts | **Forever**, until you disconnect | **7 days**, until Google approves the app |

The short version: on a Workspace account you connect once and forget it. On a
personal Gmail you will be asked to reconnect **every week** until Google
formally verifies the app, because unverified External apps have their refresh
tokens expired after seven days.

Gmail and Drive access are what Google calls *restricted* scopes — the strictest
tier. Getting an External app verified for those needs a published privacy
policy, a demo video, and a third-party security assessment. It takes weeks.

**If you have a Workspace account on your domain, use it.** If you only have a
personal Gmail, Calendar alone will work fine permanently (it is a lower tier);
Gmail and Drive will nag you weekly until verification completes.

---

## Step 1 — Google Cloud project

1. Go to <https://console.cloud.google.com/> and sign in as the account you want
   the assistant to use.
2. Create a project (or pick an existing one). Name it something like `HCM Assistant`.

## Step 2 — Turn on the three APIs

Under **APIs & Services → Library**, search for and Enable each of:

- **Gmail API**
- **Google Calendar API**
- **Google Drive API**

## Step 3 — OAuth consent screen

Under **APIs & Services → OAuth consent screen**:

1. **User type**: choose **Internal** if you have Workspace on your own domain.
   Otherwise **External** — and add your own Gmail address under **Test users**,
   or the connection will be refused outright.
2. Fill in the app name, your support email, and your developer email.
3. Add these scopes:

   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/gmail.compose
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/drive
   ```

Then, under **Credentials → Create Credentials → OAuth client ID**:

4. Application type: **Web application**.
5. Under **Authorised redirect URIs**, add exactly this, with no trailing slash:

   ```
   https://jtpxdpjqxlqskhitifey.supabase.co/functions/v1/google-oauth-callback
   ```

6. Save, and copy the **Client ID** and **Client secret**.

## Step 4 — Supabase secrets

Supabase Dashboard → **Project Settings → Edge Functions → Secrets**, on the
`heritage-craft-media` project. Add:

| Secret | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | the Client ID from Step 3 |
| `GOOGLE_CLIENT_SECRET` | the Client secret from Step 3 |
| `GOOGLE_REDIRECT_URI` | `https://jtpxdpjqxlqskhitifey.supabase.co/functions/v1/google-oauth-callback` |
| `SITE_URL` | `https://heritagecraftmedia.com` |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected
by Supabase automatically. Do not add them by hand.

## Step 5 — Run the migrations

Run these two, in order, against the `heritage-craft-media` project (SQL Editor,
or `supabase db push`):

1. `supabase/migrations/20260826120000_google_connections.sql`
2. `supabase/migrations/20260826130000_assistant_actions.sql`

The first creates the token tables and two functions, with no policies on the
token tables **on purpose** — see the security note below. The second creates
the approval queue. Neither drops anything or alters an existing table.

## Step 6 — Deploy the functions

```bash
supabase functions deploy google-oauth-start
supabase functions deploy google-oauth-callback --no-verify-jwt
supabase functions deploy assistant-actions
supabase functions deploy hcm-chat
```

The `--no-verify-jwt` on the callback is required and is explained below. Every
other function keeps JWT verification on. `hcm-chat` needs redeploying because
it now reads the connections and can propose changes.

## Step 7 — Connect

Open the dashboard, go to **Setup → Connected accounts**, and press Connect on
each service you want. Google will ask you to approve; you land back on the
dashboard with the service marked Connected.

---

## Security notes worth reading once

**The tokens are not reachable from the browser.** `google_connections` and
`google_oauth_state` have row-level security enabled and *deliberately no
policies*, which under Supabase means no browser session can read or write them
at all — not even yours. Only the Edge Functions, using the service role, can
touch them. The dashboard learns whether a connection exists through
`google_connection_status()`, which returns the service name, the Google address
and the grant date, and never a credential.

Please do not "fix" the missing policies. They are missing on purpose.

**Why the callback skips JWT verification.** Google redirects your browser to
the callback directly, and that request carries no Supabase session. With JWT
verification on, the platform would reject it before any code ran and no
connection could ever complete. Instead, identity comes from a single-use
`state` nonce that only a signed-in owner could have obtained, and which is
deleted the instant it is used. This is the standard OAuth pattern, and this is
the only function in the project allowed to do it. `google-oauth-start` and
`hcm-chat` both keep `verify_jwt = true`.

**"Can draft but not send" is enforced by us, not by Google.** There is no
Google scope that means "drafts but no sending" — the narrowest scope that
allows creating a draft, `gmail.compose`, also permits sending. So the guarantee
lives in `supabase/functions/_shared/google.ts`, in `googleFetch()`, which is
the single point this codebase can reach Google from and which refuses outright
to call any Gmail send endpoint. If someone later adds a send call, it throws
instead of sending.

**How the approval gate works.** You asked that writing to Drive need your
approval. The assistant cannot perform a Drive or calendar change at all — the
only thing its `propose_calendar_change` and `propose_drive_change` tools can do
is insert a `pending` row in `assistant_actions`. Nothing touches Google until
you press Approve under **Approvals → Waiting for you**, at which point the
`assistant-actions` function runs it server-side.

The change that runs is the one frozen when it was proposed and read back from
the database. Your browser sends only an action id and a decision, so nothing
can be altered between the moment you read the card and the moment it runs. An
approval is also single-use — the row must still be `pending`, so the same
approval cannot be replayed to run a change twice.

Nothing is deleted permanently: Drive removals go to the bin (restorable for 30
days) and calendar events are cancelled rather than scrubbed.

**Drafting email is deliberately not gated.** A draft already sits in Gmail
waiting for you, so it is its own review step, and sending is impossible. Making
you approve a draft before it could become a draft would just be a second queue
in front of the queue Gmail already gives you.

## If something goes wrong

| What you see | What it means |
|---|---|
| "Google connections are not set up on the server yet" | The Step 4 secrets are missing or misspelled |
| "That connection link had expired" | You took more than 10 minutes on the consent screen — just press Connect again |
| "Google did not give us a lasting connection" | Google withheld the refresh token. Remove the app at <https://myaccount.google.com/permissions> and connect again |
| Connected, then stops working about a week later | The personal-Gmail 7-day expiry described at the top |
| Google says "access blocked" or "app not verified" | On an External app, add yourself under Test users on the consent screen |
