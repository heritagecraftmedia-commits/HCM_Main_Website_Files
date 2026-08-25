// Shared authentication for the API routes.
//
// Both endpoints spend money (Anthropic tokens) and one reads private data, so
// neither may be open to the internet. Verification uses the caller's own
// Supabase JWT — never a service-role key — so Postgres RLS still applies.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const ALLOWED_ROLES = new Set(['owner', 'founder', 'admin']);

/**
 * Verify the bearer token and (optionally) the caller's role.
 *
 * @returns {{ ok: true, supabase, user, profile }}
 *        | {{ ok: false, status, body }}  ready to send straight back
 */
export async function requireOwner(req, { requireRole = true } = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      ok: false,
      status: 500,
      body: {
        error:
          'The server cannot reach Supabase (SUPABASE_URL / SUPABASE_ANON_KEY are not set).',
        code: 'CONFIG_MISSING',
      },
    };
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    return {
      ok: false,
      status: 401,
      body: { error: 'You need to be signed in to use this.', code: 'AUTH_REQUIRED' },
    };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  let user;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return {
        ok: false,
        status: 401,
        body: { error: 'Your session has expired. Please sign in again.', code: 'AUTH_INVALID' },
      };
    }
    user = data.user;
  } catch (err) {
    return {
      ok: false,
      status: 503,
      body: { error: `Couldn't verify your session: ${err.message}`, code: 'AUTH_UNAVAILABLE' },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      status: 503,
      body: {
        error: `Couldn't check your account permissions: ${profileError.message}`,
        code: 'PROFILE_UNAVAILABLE',
      },
    };
  }

  if (requireRole && (!profile || !ALLOWED_ROLES.has(profile.role))) {
    return {
      ok: false,
      status: 403,
      body: {
        error: 'This is only available to Heritage Craft Media owners.',
        code: 'FORBIDDEN',
      },
    };
  }

  return { ok: true, supabase, user, profile: profile || {} };
}
