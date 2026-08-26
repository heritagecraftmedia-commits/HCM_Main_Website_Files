// Shared CORS handling for HCM Edge Functions.
//
// The owner assistant is NOT a public endpoint, so it must never answer
// `Access-Control-Allow-Origin: *`. Only the established HCM production
// origins are allowed. A request from anywhere else gets no CORS grant and
// the browser blocks it.
//
// NOTE: local development origins are deliberately absent. If Scott wants to
// exercise the assistant from a local dev server, an origin must be added here
// explicitly — it is not being assumed.

const ALLOWED_ORIGINS = [
  'https://heritagecraftmedia.com',
  'https://www.heritagecraftmedia.com',
  // TEMPORARY - preview verification only, 26 Aug 2026.
  // Added so the hcm-dashboard-assistant preview build can exercise the
  // assistant before anything reaches production. Exact origin, no wildcard,
  // production origins unchanged.
  // REMOVE THIS LINE AND REDEPLOY hcm-chat once preview testing is signed off.
  'https://hcm-website-git-hcm-dashboard-assistant-heritage-craft-media.vercel.app',
];

const BASE_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

/** CORS headers for a request, granting an origin only if it is allow-listed. */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return { ...BASE_HEADERS, 'Access-Control-Allow-Origin': origin };
  }
  return { ...BASE_HEADERS };
}

/** Standard preflight response. */
export function preflight(req: Request): Response {
  return new Response('ok', { headers: corsHeaders(req) });
}

/** JSON response helper that always carries the correct CORS headers. */
export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}
