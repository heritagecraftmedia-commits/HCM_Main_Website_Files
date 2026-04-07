import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Download, CreditCard, MessageSquare, ExternalLink, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Enrollment {
  id: string;
  course_id: number;
  course_name: string;
  enrolled_at: string;
  completed_at: string | null;
}

interface ResourceDownload {
  id: string;
  resource_name: string;
  downloaded_at: string;
}

interface Purchase {
  id: string;
  product_name: string;
  amount_paid: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  learn_more_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRAND = {
  red: '#8B1A1A',
  charcoal: '#2C2C2C',
  parchment: '#F5F0E8',
};

const formatCurrency = (pence: number, currency = 'gbp') => {
  const amount = pence / 100;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-[#2C2C2C]/10 mb-6 overflow-hidden">
    <div className="px-6 py-4 border-b border-[#2C2C2C]/10 flex items-center gap-3">
      <span style={{ color: BRAND.red }}>{icon}</span>
      <h2 className="font-semibold text-lg" style={{ color: BRAND.charcoal }}>{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const StudentDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [downloads, setDownloads] = useState<ResourceDownload[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Support form
  const [supportSubject, setSupportSubject] = useState('Course question');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportError, setSupportError] = useState('');

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (user.role === 'founder' || user.role === 'admin') {
      navigate('/hcmofficehub', { replace: true });
      return;
    }
  }, [user, authLoading, navigate]);

  // Load data
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);

    const [enrollRes, dlRes, purchaseRes, courseRes] = await Promise.all([
      supabase.from('enrollments').select('id, course_id, course_name, enrolled_at, completed_at').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
      supabase.from('resource_downloads').select('id, resource_name, downloaded_at').eq('user_id', user.id).order('downloaded_at', { ascending: false }),
      supabase.from('purchases').select('id, product_name, amount_paid, currency, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title, learn_more_url').eq('available', true),
    ]);

    if (enrollRes.data) setEnrollments(enrollRes.data);
    if (dlRes.data) setDownloads(dlRes.data);
    if (purchaseRes.data) setPurchases(purchaseRes.data);
    if (courseRes.data) setCourses(courseRes.data);

    setDataLoading(false);
  };

  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim() || !user) return;
    setSupportSending(true);
    setSupportError('');

    const { error } = await supabase.from('contact_submissions').insert({
      name: user.name,
      email: user.email || '',
      message: `[${supportSubject}] ${supportMessage}`,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setSupportError('Could not send message. Please try again.');
    } else {
      setSupportSent(true);
      setSupportMessage('');
      setSupportSubject('Course question');
    }
    setSupportSending(false);
  };

  const getCourseUrl = (enrollment: Enrollment) => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return course?.learn_more_url || '/academy';
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.parchment }}>
        <div className="w-8 h-8 border-2 border-[#8B1A1A]/30 border-t-[#8B1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BRAND.parchment }}>
      <div className="px-4 py-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: BRAND.charcoal }}>
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-[#2C2C2C]/60">Your learning hub — courses, downloads, and more.</p>
        </div>

        {/* ── My Courses ─────────────────────────────────────────────────────── */}
        <Section title="My Courses" icon={<BookOpen size={20} />}>
          {enrollments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[#2C2C2C]/50 mb-3">You haven't enrolled in any courses yet.</p>
              <Link to="/academy" className="text-sm font-medium" style={{ color: BRAND.red }}>
                Browse the Academy →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map(e => (
                <div key={e.id} className="flex items-center justify-between gap-4 p-3 border border-[#2C2C2C]/10 rounded-lg">
                  <div>
                    <p className="font-medium text-[#2C2C2C]">{e.course_name}</p>
                    <p className="text-xs text-[#2C2C2C]/50 mt-0.5">
                      Enrolled {new Date(e.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {e.completed_at && ' · Completed'}
                    </p>
                  </div>
                  <a
                    href={getCourseUrl(e)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-white whitespace-nowrap transition hover:opacity-90"
                    style={{ background: BRAND.red }}
                  >
                    {e.completed_at ? 'Review' : 'Continue'} <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── My Downloads ───────────────────────────────────────────────────── */}
        <Section title="My Downloads" icon={<Download size={20} />}>
          {downloads.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[#2C2C2C]/50 mb-3">No downloads yet.</p>
              <Link to="/free-resources" className="text-sm font-medium" style={{ color: BRAND.red }}>
                Browse free resources →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {downloads.map(d => (
                <div key={d.id} className="flex items-center justify-between gap-4 p-3 border border-[#2C2C2C]/10 rounded-lg">
                  <div>
                    <p className="font-medium text-[#2C2C2C] text-sm">{d.resource_name}</p>
                    <p className="text-xs text-[#2C2C2C]/50 mt-0.5">
                      Downloaded {new Date(d.downloaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <Link
                    to="/free-resources"
                    className="flex items-center gap-1 text-sm text-[#8B1A1A] hover:underline whitespace-nowrap"
                  >
                    <Download size={14} /> Re-download
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Purchase History ────────────────────────────────────────────────── */}
        <Section title="Purchase History" icon={<CreditCard size={20} />}>
          {purchases.length === 0 ? (
            <p className="text-[#2C2C2C]/50 text-center py-4">No purchases yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#2C2C2C]/50 border-b border-[#2C2C2C]/10">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.id} className="border-b border-[#2C2C2C]/5">
                      <td className="py-2 pr-4 font-medium text-[#2C2C2C]">{p.product_name}</td>
                      <td className="py-2 pr-4 text-[#2C2C2C]/70">{formatCurrency(p.amount_paid, p.currency)}</td>
                      <td className="py-2 pr-4 text-[#2C2C2C]/50">{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* ── Contact Support ─────────────────────────────────────────────────── */}
        <Section title="Contact Support" icon={<MessageSquare size={20} />}>
          {supportSent ? (
            <div className="flex items-center gap-3 py-4 text-green-700">
              <CheckCircle size={20} />
              <p className="font-medium">Message sent — we'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={submitSupport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1">Subject</label>
                <select
                  value={supportSubject}
                  onChange={e => setSupportSubject(e.target.value)}
                  className="w-full border border-[#2C2C2C]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A]"
                >
                  <option>Course question</option>
                  <option>Download issue</option>
                  <option>Billing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1">Message</label>
                <textarea
                  rows={4}
                  value={supportMessage}
                  onChange={e => setSupportMessage(e.target.value)}
                  placeholder="How can we help?"
                  className="w-full border border-[#2C2C2C]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B1A1A] resize-none"
                  required
                />
              </div>
              {supportError && <p className="text-sm text-red-600">{supportError}</p>}
              <button
                type="submit"
                disabled={supportSending || !supportMessage.trim()}
                className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                style={{ background: BRAND.red }}
              >
                {supportSending ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </Section>

      </div>
    </div>
  );
};
