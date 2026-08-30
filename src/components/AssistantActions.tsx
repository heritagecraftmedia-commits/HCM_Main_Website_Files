import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Loader2, Check, X, Clock } from 'lucide-react';

// Changes the assistant wants to make, waiting on Scott.
//
// Nothing here has happened yet. Each card is a proposal the assistant recorded
// but could not carry out — Drive and calendar writes only run once Approve is
// pressed, and the change that runs is the one frozen when it was proposed, not
// anything this page sends back.

interface AssistantAction {
  id: string;
  kind: string;
  summary: string;
  status: 'pending' | 'rejected' | 'executed' | 'failed';
  result: { detail?: string } | null;
  created_at: string;
  decided_at: string | null;
}

const KIND_LABELS: Record<string, string> = {
  drive_create_folder: 'New Drive folder',
  drive_rename: 'Rename in Drive',
  drive_move: 'Move in Drive',
  drive_trash: 'Move to Drive bin',
  calendar_create: 'Add to calendar',
  calendar_update: 'Change an event',
  calendar_delete: 'Cancel an event',
};

const STATUS_STYLES: Record<string, string> = {
  executed: 'text-brand-olive',
  rejected: 'text-brand-ink/45',
  failed: 'text-red-600',
};

const AssistantActions: React.FC = () => {
  const [actions, setActions] = useState<AssistantAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const call = useCallback(async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-actions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    return res.json().catch(() => null);
  }, []);

  const load = useCallback(async () => {
    const data = await call({ action: 'list' });
    if (data?.actions) setActions(data.actions as AssistantAction[]);
    setLoading(false);
  }, [call]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id: string, decision: 'approve' | 'reject') => {
    setBusy(id);
    setNotice(null);
    const data = await call({ action: decision, id });
    setNotice(data?.detail ?? data?.error ?? 'Done.');
    await load();
    setBusy(null);
  };

  const pending = actions.filter(a => a.status === 'pending');
  const settled = actions.filter(a => a.status !== 'pending').slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={18} className="text-brand-olive" />
        <h3 className="font-serif text-brand-ink text-lg">Waiting for you</h3>
      </div>
      <p className="text-sm text-brand-ink/60 mb-4">
        Changes the assistant wants to make to Drive or your calendar. Nothing happens until you approve.
      </p>

      {notice && (
        <div className="mb-4 text-sm rounded-xl bg-brand-cream border border-brand-olive/20 px-4 py-3 text-brand-ink">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-brand-ink/60 py-4">
          <Loader2 size={16} className="animate-spin" /> Checking…
        </div>
      ) : pending.length === 0 ? (
        <p className="text-sm text-brand-ink/50 py-2">Nothing waiting. You are all clear.</p>
      ) : (
        <div className="space-y-3">
          {pending.map(a => (
            <div key={a.id} className="border border-brand-olive/15 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-olive mb-1">
                {KIND_LABELS[a.kind] ?? a.kind}
              </p>
              <p className="text-sm text-brand-ink">{a.summary}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => decide(a.id, 'approve')}
                  disabled={busy === a.id}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-olive text-brand-cream hover:bg-brand-ink transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                  {busy === a.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Check size={14} />}
                  Approve
                </button>
                <button
                  onClick={() => decide(a.id, 'reject')}
                  disabled={busy === a.id}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-brand-olive/25 text-brand-ink hover:bg-brand-cream transition-colors disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                  <X size={14} /> No thanks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <div className="mt-5 pt-4 border-t border-brand-olive/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink/40 mb-2">
            Recently decided
          </p>
          <ul className="space-y-1.5">
            {settled.map(a => (
              <li key={a.id} className="text-xs text-brand-ink/60 flex items-start gap-2">
                <Clock size={12} className="mt-0.5 shrink-0 text-brand-ink/30" />
                <span>
                  {a.summary}
                  {' — '}
                  <span className={STATUS_STYLES[a.status] ?? ''}>
                    {a.status === 'executed' ? 'done'
                      : a.status === 'rejected' ? 'turned down'
                      : 'did not work'}
                  </span>
                  {a.status === 'failed' && a.result?.detail ? ` (${a.result.detail})` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssistantActions;
