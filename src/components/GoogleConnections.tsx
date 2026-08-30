import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, HardDrive, CalendarDays, Loader2, Check, ExternalLink } from 'lucide-react';

// Connect Scott's Google account to the assistant, one service at a time.
//
// Pressing Connect sends him to Google's own consent screen. Nothing sensitive
// passes through the browser: the refresh token is exchanged and stored by the
// google-oauth-callback Edge Function, and this page can only ever see whether
// a connection exists, never the credential behind it.

type Service = 'gmail' | 'drive' | 'calendar';

interface ConnectionRow {
  service: Service;
  connected: boolean;
  google_email: string | null;
  scopes: string[];
  connected_at: string;
}

const SERVICES: {
  id: Service;
  name: string;
  icon: React.ReactNode;
  what: string;
}[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: <Mail size={18} className="text-brand-olive" />,
    what: 'Reads your email so answers are based on what people actually wrote, and can leave a draft reply for you. It can never send.',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: <CalendarDays size={18} className="text-brand-olive" />,
    what: 'Reads your diary so "show me this week ahead" includes your real appointments.',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: <HardDrive size={18} className="text-brand-olive" />,
    what: 'Searches and reads your files, including shared drives, so it can find things for you.',
  },
];

// Plain-language outcomes for what Google sends back on the return trip.
const RETURN_MESSAGES: Record<string, string> = {
  cancelled: 'No problem — nothing was connected.',
  not_configured: 'Google connections are not set up on the server yet.',
  missing_code: 'Google did not send anything back. Please try again.',
  bad_state: 'That connection link had expired. Please try again.',
  expired: 'That connection link had expired. Please try again.',
  exchange_failed: 'Google would not complete the connection. Please try again.',
  no_refresh_token: 'Google did not give us a lasting connection. Please try again.',
  store_failed: 'The connection could not be saved. Please try again.',
  unexpected: 'Something went wrong. Please try again.',
};

const GoogleConnections: React.FC = () => {
  const [rows, setRows] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Service | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('google_connection_status');
    if (!error && Array.isArray(data)) setRows(data as ConnectionRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Read the outcome Google redirected back with, then tidy it out of the URL
  // so a refresh doesn't replay the message.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('google');
    if (!result) return;

    if (result === 'connected') {
      const svc = params.get('service');
      const label = SERVICES.find(s => s.id === svc)?.name ?? 'That account';
      setNotice(`${label} is connected.`);
    } else if (result === 'cancelled') {
      setNotice(RETURN_MESSAGES.cancelled);
    } else {
      setNotice(RETURN_MESSAGES[params.get('reason') ?? 'unexpected'] ?? RETURN_MESSAGES.unexpected);
    }

    params.delete('google');
    params.delete('service');
    params.delete('reason');
    const qs = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
  }, []);

  const connect = async (service: Service) => {
    setBusy(service);
    setNotice(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setNotice('You are signed out. Sign in again and try once more.');
        setBusy(null);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ service, redirect_to: window.location.pathname }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        setNotice(data.error ?? 'Could not start the connection. Please try again.');
        setBusy(null);
        return;
      }

      // Hand over to Google's consent screen.
      window.location.href = data.url;
    } catch {
      setNotice('Could not reach the server. Check your connection and try again.');
      setBusy(null);
    }
  };

  const disconnect = async (service: Service) => {
    setBusy(service);
    setNotice(null);
    const { error } = await supabase.rpc('google_disconnect', { p_service: service });
    setNotice(error ? 'Could not disconnect. Please try again.' : 'Disconnected.');
    await load();
    setBusy(null);
  };

  const statusFor = (id: Service) => rows.find(r => r.service === id);

  return (
    <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <ExternalLink size={18} className="text-brand-olive" />
        <h3 className="font-serif text-brand-ink text-lg">Connected accounts</h3>
      </div>
      <p className="text-sm text-brand-ink/60 mb-4">
        Connect an account and the assistant can use it. Disconnect any time — it stops immediately.
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
      ) : (
        <div className="space-y-3">
          {SERVICES.map(svc => {
            const status = statusFor(svc.id);
            const isBusy = busy === svc.id;
            return (
              <div
                key={svc.id}
                className="flex items-start justify-between gap-4 border border-brand-olive/10 rounded-xl p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {svc.icon}
                    <span className="font-semibold text-brand-ink text-sm">{svc.name}</span>
                    {status && (
                      <span className="inline-flex items-center gap-1 text-xs text-brand-olive">
                        <Check size={13} /> Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-ink/60 mt-1">{svc.what}</p>
                  {status?.google_email && (
                    <p className="text-xs text-brand-ink/45 mt-1">{status.google_email}</p>
                  )}
                </div>

                <button
                  onClick={() => (status ? disconnect(svc.id) : connect(svc.id))}
                  disabled={isBusy}
                  className={
                    status
                      ? 'shrink-0 px-4 py-2 text-sm font-semibold rounded-xl border border-brand-olive/25 text-brand-ink hover:bg-brand-cream transition-colors disabled:opacity-40'
                      : 'shrink-0 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-olive text-brand-cream hover:bg-brand-ink transition-colors disabled:opacity-40'
                  }
                >
                  {isBusy
                    ? <Loader2 size={15} className="animate-spin" />
                    : status ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoogleConnections;
