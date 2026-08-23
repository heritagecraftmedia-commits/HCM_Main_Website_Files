async function invokeLLM(prompt) {
  const response = await fetch('/api/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to generate summary');
  return data.text || '';
}
