// DEPRECATED — legacy assistant path.
//
// This route is still the live assistant endpoint used by the Founder
// Dashboard, so it stays in place and keeps working. It is NOT the intended
// destination for new functionality.
//
// The replacement is the authenticated Supabase Edge Function at
// supabase/functions/hcm-chat/, which verifies the caller is the HCM owner,
// reads task and content data server-side under RLS, and keeps the Anthropic
// credential in the function environment.
//
// This file has two properties that are why it is being replaced:
//   - no authentication: anyone who can reach the URL can spend the API key.
//   - no data access: it forwards a bare prompt, so answers about tasks,
//     content or the calendar are generated without ever seeing HCM data.
//
// Do not add features here. Do not delete it until the hcm-chat path has been
// proven in production.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    const text = data.content?.map((b) => b.text || '').join('') || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
