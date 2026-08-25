// POST /api/generate-summary — plain text generation, no tools.
//
// Kept because it is a generic helper, but it is no longer open: it burns
// Anthropic credits, so it now requires a signed-in Heritage Craft Media owner
// exactly like /api/assistant does.
//
// For questions about Scott's tasks, calendar or approvals use /api/assistant
// instead — that one is connected to the data.

import { requireOwner } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({ error: 'ANTHROPIC_API_KEY is not set on the server.', code: 'CONFIG_MISSING' });
  }

  const auth = await requireOwner(req);
  if (!auth.ok) return res.status(auth.status).json(auth.body);

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing prompt', code: 'EMPTY_PROMPT' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt.trim() }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data.error?.message || 'Anthropic API error', code: 'UPSTREAM_ERROR' });
    }

    const text = data.content?.map(b => b.text || '').join('') || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(502).json({ error: err.message, code: 'UPSTREAM_ERROR' });
  }
}
