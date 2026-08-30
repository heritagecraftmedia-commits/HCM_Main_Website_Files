// Completes a Google connection.
//
// WHY THIS ONE FUNCTION RUNS WITH verify_jwt = false
//
// Google redirects the browser here directly. That request carries Google's
// authorisation code and nothing else — no Supabase session, no Authorization
// header. With verify_jwt = true the platform would reject it before any of
// this code ran, and no OAuth flow could ever complete.
//
// It is not unauthenticated. Identity comes from the single-use `state` nonce
// created by google-oauth-start, which only a signed-in owner could have
// obtained. The row is deleted the moment it is redeemed, so a replayed or
// guessed state gets nothing. This is the standard OAuth callback pattern and
// it is the ONLY function in this project permitted to skip JWT verification.
//
// This endpoint never returns a token to the browser. It stores the refresh
// token server-side and redirects the owner back to the dashboard.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  adminClient,
  exchangeCode,
  fetchGoogleEmail,
  googleConfigured,
  isGoogleService,
} from '../_shared/google.ts';

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://heritagecraftmedia.com';

/** Send the owner back to the dashboard with a short, non-technical outcome. */
function back(path: string, params: Record<string, string>): Response {
  const url = new URL(path, SITE_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
}

Deno.serve(async (req: Request) => {
  try {
    if (!googleConfigured()) {
      return back('/dashboard', { google: 'error', reason: 'not_configured' });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const denied = url.searchParams.get('error');

    // The owner pressed Cancel on Google's consent screen. Not an error.
    if (denied) return back('/dashboard', { google: 'cancelled' });
    if (!code || !state) return back('/dashboard', { google: 'error', reason: 'missing_code' });

    const admin = adminClient();

    // Redeem the nonce. Single use: it is deleted immediately, so the same
    // callback URL cannot be replayed.
    const { data: stateRow, error: stateError } = await admin
      .from('google_oauth_state')
      .select('state, user_id, service, redirect_to, expires_at')
      .eq('state', state)
      .maybeSingle();

    if (stateError || !stateRow) {
      return back('/dashboard', { google: 'error', reason: 'bad_state' });
    }

    await admin.from('google_oauth_state').delete().eq('state', state);

    if (Date.parse(stateRow.expires_at as string) < Date.now()) {
      return back('/dashboard', { google: 'error', reason: 'expired' });
    }

    const service = stateRow.service;
    if (!isGoogleService(service)) {
      return back('/dashboard', { google: 'error', reason: 'bad_service' });
    }

    const landing = typeof stateRow.redirect_to === 'string' && stateRow.redirect_to.startsWith('/')
      ? stateRow.redirect_to
      : '/dashboard';

    const tokens = await exchangeCode(code);

    if (!tokens.access_token) {
      console.error('token exchange failed:', tokens.error ?? 'unknown');
      return back(landing, { google: 'error', reason: 'exchange_failed' });
    }

    // No refresh token means the connection would die with this access token,
    // roughly an hour later. Better to fail loudly now than to look connected
    // and quietly stop working. Usually means prompt=consent was not honoured.
    if (!tokens.refresh_token) {
      return back(landing, { google: 'error', reason: 'no_refresh_token' });
    }

    const googleEmail = await fetchGoogleEmail(tokens.access_token);

    const { error: upsertError } = await admin
      .from('google_connections')
      .upsert({
        user_id: stateRow.user_id,
        service,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
        // Record what Google granted, not what we requested.
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        google_email: googleEmail,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,service' });

    if (upsertError) {
      console.error('could not store connection');
      return back(landing, { google: 'error', reason: 'store_failed' });
    }

    return back(landing, { google: 'connected', service });
  } catch (err) {
    console.error('google-oauth-callback failed:', err instanceof Error ? err.name : typeof err);
    return back('/dashboard', { google: 'error', reason: 'unexpected' });
  }
});
