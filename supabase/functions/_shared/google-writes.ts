// Everything the assistant can CHANGE, and the rules around each change.
//
// Three different postures, matching what Scott asked for:
//
//   Gmail draft      Allowed outright. A draft sits in Gmail waiting for him,
//                    so it is its own review step. Sending stays impossible —
//                    googleFetch() refuses every Gmail send endpoint.
//
//   Drive write      Gated. Never executed here on the assistant's say-so; the
//                    assistant only proposes, and this runs after Scott approves.
//
//   Calendar write   Gated the same way. He said "organises calendar" without
//                    saying it could act unattended, and the dashboard's own
//                    promise is that nothing happens without his approval, so
//                    it goes through the gate too. Moving it to unattended is a
//                    one-line change in tools.ts if he wants that.
//
// Deletion is never permanent. Drive removals go to the bin and calendar events
// are cancelled, both recoverable by hand.

import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { getConnection, googleFetch, type GoogleService } from './google.ts';

export interface WriteResult {
  ok: boolean;
  detail: string;
  data?: unknown;
}

async function connectionOr(
  admin: SupabaseClient,
  userId: string,
  service: GoogleService,
): Promise<{ token: string } | WriteResult> {
  const conn = await getConnection(admin, userId, service);
  if (!conn) {
    return { ok: false, detail: `${service} is not connected.` };
  }
  return { token: conn.accessToken };
}

function isFailure(v: { token: string } | WriteResult): v is WriteResult {
  return 'ok' in v;
}

/** RFC 2822 message, base64url encoded the way the Gmail API wants it. */
function encodeMessage(to: string, subject: string, body: string): string {
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n');

  // btoa cannot take multi-byte characters directly, so encode to bytes first.
  const bytes = new TextEncoder().encode(mime);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

/**
 * Leave a draft reply in Scott's Gmail.
 *
 * This is the one write that does not wait for approval, because the artefact
 * it produces IS the thing he reviews. It is never sent.
 */
export async function createGmailDraft(
  admin: SupabaseClient,
  userId: string,
  args: { to: string; subject: string; body: string; thread_id?: string },
): Promise<WriteResult> {
  const conn = await connectionOr(admin, userId, 'gmail');
  if (isFailure(conn)) return conn;

  try {
    const message: Record<string, unknown> = {
      raw: encodeMessage(args.to, args.subject, args.body),
    };
    // Attaching the thread id keeps the draft in the original conversation.
    if (args.thread_id) message.threadId = args.thread_id;

    const res = await googleFetch(
      conn.token,
      'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      },
    );

    if (!res.ok) {
      return { ok: false, detail: 'Gmail would not save the draft.' };
    }
    const data = await res.json();
    return {
      ok: true,
      detail: `Draft saved in Gmail for ${args.to}. It has not been sent.`,
      data: { draft_id: data.id },
    };
  } catch (err) {
    // A blocked send attempt lands here rather than reaching Google.
    return {
      ok: false,
      detail: err instanceof Error && err.name === 'BlockedRequestError'
        ? 'Blocked: this assistant cannot send email.'
        : 'The draft could not be saved.',
    };
  }
}

const CAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const DRIVE = 'https://www.googleapis.com/drive/v3/files';

/**
 * Run an approved action. Called only by assistant-actions, only after Scott
 * has approved the row, and only with the payload frozen at proposal time.
 */
export async function executeAction(
  admin: SupabaseClient,
  userId: string,
  kind: string,
  payload: Record<string, unknown>,
): Promise<WriteResult> {
  const service: GoogleService = kind.startsWith('calendar') ? 'calendar' : 'drive';
  const conn = await connectionOr(admin, userId, service);
  if (isFailure(conn)) return conn;
  const token = conn.token;

  const json = { 'Content-Type': 'application/json' };

  try {
    switch (kind) {
      case 'calendar_create': {
        const res = await googleFetch(token, CAL, {
          method: 'POST',
          headers: json,
          body: JSON.stringify({
            summary: payload.title,
            description: payload.description ?? undefined,
            location: payload.location ?? undefined,
            start: { dateTime: payload.start },
            end: { dateTime: payload.end },
          }),
        });
        if (!res.ok) return { ok: false, detail: 'The event could not be created.' };
        const data = await res.json();
        return { ok: true, detail: `Added "${payload.title}" to your calendar.`, data: { event_id: data.id } };
      }

      case 'calendar_update': {
        const patch: Record<string, unknown> = {};
        if (payload.title) patch.summary = payload.title;
        if (payload.location) patch.location = payload.location;
        if (payload.start) patch.start = { dateTime: payload.start };
        if (payload.end) patch.end = { dateTime: payload.end };

        const res = await googleFetch(token, `${CAL}/${payload.event_id}`, {
          method: 'PATCH',
          headers: json,
          body: JSON.stringify(patch),
        });
        if (!res.ok) return { ok: false, detail: 'The event could not be changed.' };
        return { ok: true, detail: 'Calendar updated.' };
      }

      case 'calendar_delete': {
        // Cancelled, not scrubbed — Google keeps it recoverable.
        const res = await googleFetch(token, `${CAL}/${payload.event_id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 410) {
          return { ok: false, detail: 'The event could not be cancelled.' };
        }
        return { ok: true, detail: 'Event cancelled.' };
      }

      case 'drive_create_folder': {
        const res = await googleFetch(token, `${DRIVE}?supportsAllDrives=true`, {
          method: 'POST',
          headers: json,
          body: JSON.stringify({
            name: payload.name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: payload.parent_id ? [payload.parent_id] : undefined,
          }),
        });
        if (!res.ok) return { ok: false, detail: 'The folder could not be created.' };
        const data = await res.json();
        return { ok: true, detail: `Created the folder "${payload.name}".`, data: { file_id: data.id } };
      }

      case 'drive_rename': {
        const res = await googleFetch(
          token,
          `${DRIVE}/${payload.file_id}?supportsAllDrives=true`,
          { method: 'PATCH', headers: json, body: JSON.stringify({ name: payload.name }) },
        );
        if (!res.ok) return { ok: false, detail: 'The file could not be renamed.' };
        return { ok: true, detail: `Renamed to "${payload.name}".` };
      }

      case 'drive_move': {
        const params = new URLSearchParams({
          supportsAllDrives: 'true',
          addParents: String(payload.new_parent_id ?? ''),
          removeParents: String(payload.old_parent_id ?? ''),
        });
        const res = await googleFetch(
          token,
          `${DRIVE}/${payload.file_id}?${params}`,
          { method: 'PATCH', headers: json, body: '{}' },
        );
        if (!res.ok) return { ok: false, detail: 'The file could not be moved.' };
        return { ok: true, detail: 'File moved.' };
      }

      case 'drive_trash': {
        // Bin, never permanent delete. Recoverable from Drive for 30 days.
        const res = await googleFetch(
          token,
          `${DRIVE}/${payload.file_id}?supportsAllDrives=true`,
          { method: 'PATCH', headers: json, body: JSON.stringify({ trashed: true }) },
        );
        if (!res.ok) return { ok: false, detail: 'The file could not be moved to the bin.' };
        return { ok: true, detail: 'Moved to the bin. You can restore it from Drive.' };
      }

      default:
        return { ok: false, detail: 'Unknown action.' };
    }
  } catch {
    return { ok: false, detail: 'The change could not be completed.' };
  }
}
