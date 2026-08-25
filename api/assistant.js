// POST /api/assistant — the Ask Claude endpoint.
//
// Chain: browser sends the user's Supabase access token -> we verify it ->
// we check the profile role -> we build a Supabase client bound to THAT user's
// JWT (so RLS applies to them, no service-role key anywhere) -> Claude runs
// with tools that read through that client -> the answer comes back.

import { requireOwner } from './_lib/auth.js';
import { runAssistant } from './_lib/assistant.js';

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'The assistant is not configured on the server (ANTHROPIC_API_KEY is missing).',
      code: 'CONFIG_MISSING',
    });
  }

  // Verifies the bearer token, then confirms the caller is an owner. The
  // returned client carries their JWT, so RLS decides what the tools can read.
  const auth = await requireOwner(req);
  if (!auth.ok) return res.status(auth.status).json(auth.body);
  const { supabase, user, profile } = auth;

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
