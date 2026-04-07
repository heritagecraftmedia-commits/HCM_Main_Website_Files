import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, Mail, BookOpen, CreditCard, Mic2,
  BrainCircuit, ShieldCheck, Settings, TrendingUp, TrendingDown,
  Users, MessageSquare, PoundSterling, Briefcase, CheckSquare, Square,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',    label: 'Overview',          icon: <LayoutDashboard size={16} /> },
  { id: 'comms',       label: 'Communications',    icon: <Mail size={16} /> },
  { id: 'academy',     label: 'Academy',           icon: <BookOpen size={16} /> },
  { id: 'billing',     label: 'Billing',           icon: <CreditCard size={16} /> },
  { id: 'voiceqa',     label: 'Voice QA Lab',      icon: <Mic2 size={16} /> },
  { id: 'ai',          label: 'AI Command Centre', icon: <BrainCircuit size={16} /> },
  { id: 'security',    label: 'Security',          icon: <ShieldCheck size={16} /> },
  { id: 'settings',    label: 'Settings',          icon: <Settings size={16} /> },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ComingSoon: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-center min-h-[240px]">
    <div className="text-center p-10 bg-white rounded-3xl border border-brand-olive/10 shadow-sm max-w-sm w-full">
      <p className="text-2xl font-serif text-brand-ink mb-2">{label}</p>
      <p className="text-brand-ink/40 text-sm">Coming soon</p>
    </div>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}> = ({ label, value, trend, icon }) => (
  <div className="bg-white rounded-2xl p-6 border border-brand-olive/10 shadow-sm flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-brand-ink/40">{icon}</span>
      {trend === 'up' && <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><TrendingUp size={13} /> +w/w</span>}
      {trend === 'down' && <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><TrendingDown size={13} /> -w/w</span>}
      {trend === 'neutral' && <span className="text-xs font-semibold text-brand-ink/30">— w/w</span>}
    </div>
    <p className="text-4xl font-bold text-brand-ink">{value}</p>
    <p className="text-sm font-medium text-brand-ink/50">{label}</p>
  </div>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const OverviewTab: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard label="Total Enquiries"   value="—" trend="neutral" icon={<MessageSquare size={20} />} />
    <StatCard label="Academy Students"  value="—" trend="neutral" icon={<Users size={20} />} />
    <StatCard label="Monthly Revenue"   value="—" trend="neutral" icon={<PoundSterling size={20} />} />
    <StatCard label="Active Clients"    value="—" trend="neutral" icon={<Briefcase size={20} />} />
  </div>
);

const CommsTab: React.FC = () => {
  const [rows, setRows] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('contact_submissions')
      .select('id, name, email, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-brand-olive/30 border-t-brand-olive rounded-full animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center p-10 bg-white rounded-3xl border border-brand-olive/10 shadow-sm">
          <Mail size={32} className="mx-auto text-brand-ink/20 mb-3" />
          <p className="text-brand-ink/50 text-sm">No contact submissions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-olive/10 bg-brand-cream/60">
            <th className="text-left px-5 py-3 font-semibold text-brand-ink/50 text-xs uppercase tracking-wide">Name</th>
            <th className="text-left px-5 py-3 font-semibold text-brand-ink/50 text-xs uppercase tracking-wide">Email</th>
            <th className="text-left px-5 py-3 font-semibold text-brand-ink/50 text-xs uppercase tracking-wide">Message</th>
            <th className="text-left px-5 py-3 font-semibold text-brand-ink/50 text-xs uppercase tracking-wide">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-b border-brand-olive/5 ${i % 2 === 0 ? '' : 'bg-brand-cream/20'}`}>
              <td className="px-5 py-3 font-medium text-brand-ink">{r.name}</td>
              <td className="px-5 py-3 text-brand-ink/60">{r.email}</td>
              <td className="px-5 py-3 text-brand-ink/70 max-w-xs truncate">{r.message}</td>
              <td className="px-5 py-3 text-brand-ink/40 whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AcademyTab: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {[
      { label: 'Manage Courses',  sub: 'Add, edit, and publish courses',      href: '#' },
      { label: 'Student List',    sub: 'View and manage enrolled students',   href: '#' },
      { label: 'Certificates',    sub: 'Issue and track completion awards',   href: '#' },
      { label: 'Analytics',       sub: 'Course performance and enrolments',   href: '#' },
    ].map(({ label, sub, href }) => (
      <a
        key={label}
        href={href}
        className="block bg-white rounded-2xl p-6 border border-brand-olive/10 shadow-sm hover:border-brand-olive/30 hover:shadow-md transition-all group"
      >
        <BookOpen size={24} className="text-brand-olive mb-4 group-hover:scale-110 transition-transform" />
        <p className="font-bold text-brand-ink text-lg mb-1">{label}</p>
        <p className="text-brand-ink/50 text-sm">{sub}</p>
      </a>
    ))}
  </div>
);

const SECURITY_ITEMS = [
  '2FA enabled on all admin accounts',
  'API keys rotated this month',
  'Supabase Row Level Security (RLS) active',
  'Vercel environment variables audited',
  'Database backups verified',
];

const SecurityTab: React.FC = () => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setChecked(c => ({ ...c, [i]: !c[i] }));
  const allDone = SECURITY_ITEMS.every((_, i) => checked[i]);

  return (
    <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-8 max-w-lg">
      <h3 className="font-bold text-brand-ink text-lg mb-1">Security Checklist</h3>
      <p className="text-brand-ink/40 text-sm mb-6">Tick off each item manually when verified. Local state only — resets on refresh.</p>
      <ul className="space-y-4">
        {SECURITY_ITEMS.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              className="flex items-center gap-3 text-left w-full group"
            >
              {checked[i]
                ? <CheckSquare size={20} className="text-brand-olive shrink-0" />
                : <Square size={20} className="text-brand-ink/20 group-hover:text-brand-olive/50 shrink-0 transition-colors" />}
              <span className={`text-sm ${checked[i] ? 'text-brand-ink/40 line-through' : 'text-brand-ink'}`}>{item}</span>
            </button>
          </li>
        ))}
      </ul>
      {allDone && (
        <div className="mt-6 p-3 bg-green-50 rounded-xl text-green-700 text-sm font-medium text-center">
          All items checked — security review complete.
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const FounderDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const isFounder = user?.role === 'founder' || user?.role === 'admin';

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (!isFounder) { navigate('/staffdashboard', { replace: true }); return; }
  }, [user, authLoading, isFounder, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="w-8 h-8 border-2 border-brand-olive/30 border-t-brand-olive rounded-full animate-spin" />
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab />;
      case 'comms':     return <CommsTab />;
      case 'academy':   return <AcademyTab />;
      case 'billing':   return <ComingSoon label="Billing" />;
      case 'voiceqa':   return <ComingSoon label="Voice QA Lab" />;
      case 'ai':        return <ComingSoon label="AI Command Centre" />;
      case 'security':  return <SecurityTab />;
      case 'settings':  return <ComingSoon label="Settings" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="border-b border-brand-olive/10 bg-white/60 backdrop-blur-sm sticky top-[80px] z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4 mb-0">
            <div>
              <h1 className="text-2xl font-serif text-brand-ink">Founder Dashboard</h1>
              <p className="text-xs text-brand-ink/40 mt-0.5">Heritage Craft Media · {user?.name || 'Founder'}</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-brand-olive text-brand-olive'
                    : 'border-transparent text-brand-ink/50 hover:text-brand-ink hover:border-brand-ink/20'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {renderTab()}
      </div>
    </div>
  );
};
