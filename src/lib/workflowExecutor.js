import { db } from '@/api/supabaseClient';

async function invokeLLM(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.map(b => b.text || '').join('') || '';
}

async function executeStep(step, context, connectors) {
  const action = step.action?.toLowerCase() || '';
  const connectorName = step.connector?.toLowerCase() || 'internal';
  const matchedConnector = connectors.find(
    (c) => c.name.toLowerCase() === connectorName && c.status === 'active' && c.config?.endpoint
  );
  if (matchedConnector?.config?.endpoint) {
    try {
      await fetch(matchedConnector.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(matchedConnector.config.api_key ? { Authorization: `Bearer ${matchedConnector.config.api_key}` } : {}),
        },
        body: JSON.stringify({ action: step.action, config: step.config, context }),
      });
      return `Webhook fired to ${matchedConnector.name}`;
    } catch {
      return `Webhook to ${matchedConnector.name} failed (endpoint unreachable)`;
    }
  }
  if (action.includes('generate') || action.includes('create') || action.includes('pitch') || action.includes('post') || action.includes('summary')) {
    const result = await invokeLLM(`Perform this business automation step:
Action: ${step.action}
Config/Notes: ${step.config || 'none'}
Context: ${JSON.stringify(context)}
Keep it concise and actionable. Output the result directly.`);
    await db.entities.GeneratedContent.create({
      content_type: action.includes('pitch') ? 'pitch' : action.includes('post') ? 'social_post' : 'action_plan',
      title: `${step.action} (auto)`,
      content: result,
      status: 'draft',
    });
    return result.slice(0, 100) + (result.length > 100 ? '…' : '');
  }
  if (action.includes('email') || action.includes('follow')) {
    const draft = await invokeLLM(`Write a short follow-up email for a small business owner.
Purpose: ${step.action}
Config: ${step.config || 'general follow-up'}
Context: ${JSON.stringify(context)}
Output subject and body only.`);
    await db.entities.GeneratedContent.create({
      content_type: 'email',
      title: `Email: ${step.action} (auto)`,
      content: draft,
      status: 'draft',
    });
    return 'Follow-up email drafted and saved';
  }
  if (action.includes('lead status') || action.includes('update lead')) {
    if (context.leadId) {
      const newStatus = step.config || 'guide_sent';
      await db.entities.Lead.update(context.leadId, { status: newStatus });
      return `Lead status updated to "${newStatus}"`;
    }
    return 'No lead in context to update';
  }
  if (action.includes('memory') || action.includes('insight') || action.includes('save')) {
    await db.entities.BusinessInsight.create({
      category: 'decision',
      content: `Workflow auto-saved: ${step.action}. ${step.config || ''}`,
      importance: 'medium',
    });
    return 'Insight saved to Memory Bank';
  }
  if (action.includes('log')) return 'Logged to Action Log';
  return `Step "${step.action}" executed`;
}

export async function runWorkflow(workflow, context = {}) {
  const connectors = await db.entities.Connector.list();
  const steps = workflow.steps || [];
  const results = [];
  for (const step of steps) {
    const result = await executeStep(step, context, connectors);
    results.push({ action: step.action, result });
  }
  await db.entities.ActionLog.create({
    action: 'workflow_run',
    entity_type: 'workflow',
    entity_id: workflow.id,
    details: {
      summary: `Ran workflow: "${workflow.name}" (${steps.length} steps)`,
      detail: results.map((r, i) => `Step ${i + 1} — ${r.action}: ${r.result}`).join('\n'),
      status: 'success',
    },
  });
  return results;
}

export async function triggerWorkflows(triggerType, context = {}) {
  const all = await db.entities.Workflow.list();
  const matching = all.filter((w) => w.status === 'active' && w.trigger === triggerType);
  const allResults = [];
  for (const wf of matching) {
    const results = await runWorkflow(wf, context);
    allResults.push({ workflow: wf.name, results });
  }
  return allResults;
}
