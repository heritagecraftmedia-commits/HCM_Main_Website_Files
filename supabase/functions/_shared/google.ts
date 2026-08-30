// Google account access for the HCM Dashboard Assistant.
//
// WHAT SCOTT ASKED FOR, AND HOW IT IS ENFORCED
//
//   Email     read, and draft replies — but NEVER send.
//   Drive     search and read freely; any write needs Scott's approval.
//   Calendar  read and organise.
//
// One important honesty note about the first line. Google has no OAuth scope
// meaning "drafts but not sending". The narrowest scope that allows creating a
// draft is gmail.compose, and that scope also permits sending. So the no-send
// guarantee CANNOT come from the scope — it has to come from us.
//
// It is enforced in googleFetch() below, which refuses to issue a request to
// any Gmail send endpoint. That is a structural block at the only place this
// codebase can reach Google from, not a promise in a system prompt. If someone
// later adds a send call, it throws instead of sending.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export type GoogleService = 'gmail' | 'drive' | 'calendar';

/**
 * Scopes requested per service.
 *
 * gmail.compose is required for drafts and unavoidably also permits sending;
 * see the no-send block in googleFetch(). drive (full) is what "read/write to
 * all drives" requires — writes are gated behind approval in the write layer,
 * not by the scope. calendar (full) is what "organises calendar" requires.
 */
export const SCOPES: Record<GoogleService, string[]> = {
  gmail: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
  ],
  drive: [
    'https://www.googleapis.com/auth/drive',
  ],
  calendar: [
    'https://www.googleapis.com/auth/calendar',
  ],
};

export const SERVICES: GoogleService[] = ['gmail', 'drive', 'calendar'];

export function isGoogleService(v: unknown): v is GoogleService {
  return typeof v === 'string' && (SERVICES as string[]).includes(v);
}

/** Service-role client. Only ever constructed inside OAuth//data code paths. */
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function oauthConfig() {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
  return { clientId, clientSecret, redirectUri };
}

export function googleConfigured(): boolean {
  const { clientId, clientSecret, redirectUri } = oauthConfig();
  return Boolean(clientId && clientSecret && redirectUri);
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  return (await res.json()) as TokenResponse;
}

/** Exchange the one-time authorisation code for tokens. */
export async function exchangeCode(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = oauthConfig();
  return tokenRequest({
    code,
    client_id: clientId ?? '',
    client_secret: clientSecret ?? '',
    redirect_uri: redirectUri ?? '',
    grant_type: 'authorization_code',
  });
}

/** Trade a stored refresh token for a fresh access token. */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const { clientId, clientSecret } = oauthConfig();
  return tokenRequest({
    refresh_token: refreshToken,
    client_id: clientId ?? '',
    client_secret: clientSecret ?? '',
    grant_type: 'refresh_token',
  });
}

/** Which Google account this is, for display only. */
export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.email === 'string' ? data.email : null;
  } catch {
    return null;
  }
}

export interface Connection {
  service: GoogleService;
  accessToken: string;
  scopes: string[];
  googleEmail: string | null;
}

/**
 * A usable access token for a service, or null if not connected.
 *
 * Refreshes and writes back when the stored token is within 60s of expiry. A
 * refresh failure means the grant was revoked or expired — the row is left in
 * place so the dashboard can report "needs reconnecting" rather than silently
 * appearing disconnected.
 */
export async function getConnection(
  admin: SupabaseClient,
  userId: string,
  service: GoogleService,
): Promise<Connection | null> {
  const { data, error } = await admin
    .from('google_connections')
    .select('refresh_token, access_token, expires_at, scopes, google_email')
    .eq('user_id', userId)
    .eq('service', service)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = data.expires_at ? Date.parse(data.expires_at as string) : 0;
  const stillValid = data.access_token && expiresAt > Date.now() + 60_000;

  if (stillValid) {
    return {
      service,
      accessToken: data.access_token as string,
      scopes: (data.scopes as string[]) ?? [],
      googleEmail: (data.google_email as string) ?? null,
    };
  }

  const refreshed = await refreshAccessToken(data.refresh_token as string);
  if (!refreshed.access_token) return null;

  const newExpiry = new Date(Date.now() + (refreshed.expires_in ?? 3600) * 1000).toISOString();
  await admin
    .from('google_connections')
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('service', service);

  return {
    service,
    accessToken: refreshed.access_token,
    scopes: (data.scopes as string[]) ?? [],
    googleEmail: (data.google_email as string) ?? null,
  };
}

/**
 * Endpoints this build refuses to call, whatever the granted scope allows.
 *
 * Gmail's send surfaces. gmail.compose technically permits all of these; we do
 * not. Drafting is allowed, delivery is not — that is Scott's rule and this is
 * where it is kept.
 */
const FORBIDDEN_PATTERNS: RegExp[] = [
  /gmail\.googleapis\.com\/gmail\/v1\/users\/[^/]+\/messages\/send/i,
  /gmail\.googleapis\.com\/gmail\/v1\/users\/[^/]+\/drafts\/send/i,
];

export class BlockedRequestError extends Error {
  constructor(url: string) {
    super(`Blocked: this assistant is not permitted to send email (${url})`);
    this.name = 'BlockedRequestError';
  }
}

/**
 * The single exit point to Google. Everything goes through here so the no-send
 * rule cannot be bypassed by accident.
 */
export async function googleFetch(
  accessToken: string,
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  if (FORBIDDEN_PATTERNS.some((re) => re.test(url))) {
    throw new BlockedRequestError(url);
  }
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
