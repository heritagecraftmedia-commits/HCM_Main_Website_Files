// POST /api/assistant — the Ask Claude endpoint.
//
// Chain: browser sends the user's Supabase access token -> we verify it ->
// we check the profile role -> we build a Supabase client bound to THAT user's
// JWT (so RLS applies to them, no service-role key anywhere) -> Claude runs
// with tools that read through that client -> the answer comes back.

import { createClient } from '@supabase/supabase-js';
import { runAssistant } from './_lib/assistant.js';

// Server-side names first; the VITE_ names are accepted as a fallback because
// that is what this project already has configured for the browser build.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Roles allowed to query the founder's data. `profiles.role` stores 'owner'.
const ALLOWED_ROLES = new Set(['owner', 'founder', 'admin']);

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

/** Normalise into Anthropic message shape, dropping anything malformed. */
function normaliseMessages(body) {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages
      .filter(m => m && typeof m.content === 'string' && m.content.trim())
      .map(m => ({
        role: m.role === 'assistant' || m.role === 'claude' ? 'assistant' : 'user',
        content: m.content.trim(),
      }));
  }
  if (typeof body.prompt === 'string' && body.prompt.trim()) {
    return [{ role: 'user', content: body.prompt.trim() }];
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  // --- configuration ---------------------------------------------------------
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'The assistant is not configured on the server (ANTHROPIC_API_KEY is missing).',
      code: 'CONFIG_MISSING',
    });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({
      error:
        'The assistant cannot reach your data (SUPABASE_URL / SUPABASE_ANON_KEY are not set on the server).',
      code: 'CONFIG_MISSING',
    });
  }

  // --- authentication --------------------------------------------------------
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({
      error: 'You need to be signed in for me to look at your data.',
      code: 'AUTH_REQUIRED',
    });
  }

  // This client carries the caller's JWT on every request, so Postgres sees
  // them as themselves and RLS is enforced normally.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  let user;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Your session has expired. Please sign in again.',
        code: 'AUTH_INVALID',
      });
    }
    user = data.user;
  } catch (err) {
    return res.status(503).json({
      error: `I couldn't verify your session just now: ${err.message}`,
      code: 'AUTH_UNAVAILABLE',
    });
  }

  // --- authorisation ---------------------------------------------------------
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(503).json({
      error: `I couldn't check your account permissions just now: ${profileError.message}`,
      code: 'PROFILE_UNAVAILABLE',
    });
  }
  if (!profile || !ALLOWED_ROLES.has(profile.role)) {
    return res.status(403).json({
      error: 'This assistant is only available to Heritage Craft Media owners.',
      code: 'FORBIDDEN',
    });
  }

  // --- the actual work -------------------------------------------------------
  const body = readBody(req);
  const messages = normaliseMessages(body);
  if (messages.length === 0) {
    return res.status(400).json({ error: 'Missing question', code: 'EMPTY_PROMPT' });
  }

  const displayName = (profile.full_name || user.email || 'Scott').split(' ')[0];

  try {
    const { text, toolCalls, dataError } = await runAssistant({
      supabase,
      displayName,
      messages,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    return res.status(200).json({ text, toolCalls, dataError });
  } catch (err) {
    // An upstream failure is a failure — it must not reach the user disguised
    // as the assistant cheerfully explaining it has no access to anything.
    return res.status(502).json({
      error: `I couldn't reach Claude just now: ${err.message}`,
      code: 'UPSTREAM_ERROR',
    });
  }
}
