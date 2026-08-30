// Begins a Google connection.
//
// Called from the dashboard with the owner's session token. It does NOT redirect
// itself — it returns the Google consent URL and the browser navigates there, so
// the caller keeps control and CORS stays simple.
//
// verify_jwt = true. Only the signed-in HCM owner can start a connection.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { preflight, json } from '../_shared/cors.ts';
import {
  SCOPES,
  isGoogleService,
  adminClient,
  oauthConfig,
  googleConfigured,
} from '../_shared/google.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req);
  if (req.method !== 'POST') return json(req, { error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json(req, { error: 'Not signed in.' }, 401);

    if (!googleConfigured()) {
      return json(
        req,
        { error: 'Google connections are not configured on the server yet.' },
        503,
      );
    }

    const db = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await db.auth.getUser();
    if (authError || !user) return json(req, { error: 'Not signed in.' }, 401);

    const { data: owner, error: ownerError } = await db.rpc('is_owner');
    if (ownerError) return json(req, { error: 'Could not verify access.' }, 500);
    if (owner !== true) {
      return json(req, { error: 'This assistant is for the HCM owner account only.' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const service = body?.service;
    if (!isGoogleService(service)) {
      return json(req, { error: 'Unknown service.' }, 400);
    }

    // Where to land the owner once Google sends them back. Only a path is
    // accepted, never a full URL — an attacker-supplied absolute URL here would
    // turn the callback into an open redirect.
    const rawRedirect = typeof body?.redirect_to === 'string' ? body.redirect_to : '/dashboard';
    const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

    // Single-use CSRF nonce tying this consent round trip to this user. The
    // callback arrives without a JWT, so this row is what proves who started it.
    const state = crypto.randomUUID() + crypto.randomUUID().replaceAll('-', '');

    const admin = adminClient();
    const { error: stateError } = await admin.from('google_oauth_state').insert({
      state,
      user_id: user.id,
      service,
      redirect_to: redirectTo,
    });
    if (stateError) return json(req, { error: 'Could not start the connection.' }, 500);

    // Opportunistic cleanup of expired nonces. Cheap, keeps the table honest.
    await admin.from('google_oauth_state').delete().lt('expires_at', new Date().toISOString());

    const { clientId, redirectUri } = oauthConfig();
    const params = new URLSearchParams({
      client_id: clientId ?? '',
      redirect_uri: redirectUri ?? '',
      response_type: 'code',
      scope: SCOPES[service].join(' '),
      // offline + consent together are what actually yield a refresh token.
      // Without prompt=consent Google omits it on every connection after the
      // first, and the connection silently stops surviving restarts.
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    });

    return json(req, {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    });
  } catch (err) {
    console.error('google-oauth-start failed:', err instanceof Error ? err.name : typeof err);
    return json(req, { error: 'Something went wrong. Please try again.' }, 500);
  }
});
