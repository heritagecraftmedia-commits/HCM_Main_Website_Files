# tft-security

Permissions, RLS and role-based access for **The Farmers Table Hub CIC** —
a Heritage Craft Media *client* project, kept here because this is the branch
the work was commissioned on.

> **Why this is in the HCM repo.** `CLAUDE.md` keeps TFT content out of HCM's
> `src/`, and nothing here touches `src/` — this directory is SQL and docs
> only, and the TFT scan over `src/` stays clean. But these files belong in
> `heritagecraftmedia-commits/The-Farmers-Table-Hub-CIC` under
> `supabase/migrations/`, alongside `20260826_rls_admin_hardening.sql`. This
> session had read-only access to that repo, so they could not be pushed there.
> **Move them across before deploying.**

## Files

| File | What it is |
|---|---|
| `SECURITY-REPORT.md` | Findings, permissions matrix, test results, residual risks, deployment order. **Start here.** |
| `migrations/20260828_tft_permissions_rls.sql` | The migration. One transaction, idempotent, deletes nothing. |
| `app-patches/0001-public-directory-view.patch` | Required app change. Apply to the TFT repo **before** the migration. |
| `tests/00_local_supabase_shim.sql` | Supabase-compatible `auth`/`storage` shim for a local PostgreSQL 16. Test harness only — never deploy it. |
| `tests/10_seed_test_identities.sql` | Six test identities covering every role. **Staging/local only** — writes to `auth.users`. |
| `tests/20_privilege_escalation_tests.sql` | 97 attack and positive-path tests. Runs in a transaction and rolls back. |
| `tests/30_production_readonly_checks.sql` | Read-only. Safe against the live project. Run after deploying. |

## Reproducing the test run locally

```sh
initdb -D /var/lib/postgresql/tftdata -U postgres --auth=trust
pg_ctl -D /var/lib/postgresql/tftdata -o '-p 5433' start
createdb -p 5433 -U postgres tft_test

psql -p 5433 -U postgres -d tft_test -f tests/00_local_supabase_shim.sql
```

Then, from a checkout of the TFT repo (branch
`claude/farmers-table-hub-audit-vwzs5i`), apply in this order:

1. `supabase-schema.sql`
2. `supabase/migrations/20260317_create_directory_listings.sql`
3. `supabase/migrations/20260317_seed_directory_listings.sql`
4. `supabase/migrations/20260317_outreach_columns.sql`
5. `supabase/migrations/20260317_radio_events.sql`
6. `supabase/migrations/20260825_radio_v1.sql`
7. `supabase/migrations/20260825_radio_v2_alignment.sql`
8. `supabase/migrations/20260826_rls_admin_hardening.sql`
9. `supabase/migrations/20260827_untracked_tables.sql`

Step 2 fails on a clean database with `relation "profiles" does not exist` —
that is finding F13, a pre-existing ordering problem in the TFT migration set.
Continue past it; step 3 carries the seed.

Then:

```sh
psql -p 5433 -U postgres -d tft_test -f migrations/20260828_tft_permissions_rls.sql
psql -p 5433 -U postgres -d tft_test -c "set tft.allow_test_seed='on';" \
                                     -f tests/10_seed_test_identities.sql
psql -p 5433 -U postgres -d tft_test -f tests/20_privilege_escalation_tests.sql
```

Expected: `PASS | 97`, with no `FAIL` row.

## Status

**Not deployed.** The TFT Supabase project `lyitsfxbdpxezcwdeuvd` is not
reachable from the session this was built in. See `SECURITY-REPORT.md` section G
for the deployment order and section F for what could not be tested.
