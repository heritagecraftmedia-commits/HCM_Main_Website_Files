import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Users, CheckCircle, XCircle, BookOpen, UserPlus, AlertCircle, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status?: string;
}

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  category: string;
  available: boolean;
  enrolment_count?: number;
}

interface Approval {
  id: string;
  type: string;
  title: string;
  summary: string;
  status: string;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  craft_type: string;
  interest: string;
  created_at: string;
  status?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRAND = {
  red: '#8B1A1A',
  charcoal: '#2C2C2C',
  parchment: '#F5F0E8',
};

const badge = (status: string) => {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    read: 'bg-yellow-100 text-yellow-800',
    replied: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    contacted: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

// ─── Panel wrapper ────────────────────────────────────────────────────────────

const Panel: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#2C2C2C]/10 mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        style={{ background: BRAND.red }}
      >
        <div className="flex items-center gap-3 text-white font-semibold text-lg">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={18} className="text-white/70" /> : <ChevronDown size={18} className="text-white/70" />}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const StaffDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Panel data
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // UI state
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [enrolCourseId, setEnrolCourseId] = useState<Record<string, number>>({});
  const [toast, setToast] = useState('');

  // Role checks
  const isAdmin = user?.role === 'founder' || user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'rep' || isAdmin;
  const hasAcademyAccess = isAdmin || user?.role === 'staff';
  const hasApprovalsAccess = isAdmin || user?.role === 'staff';
  const hasLeadsAccess = isAdmin || user?.role === 'staff' || user?.role === 'rep';

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    if (!isStaff) { navigate('/studentdashboard', { replace: true }); return; }
  }, [user, authLoading, isStaff, navigate]);

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !isStaff) return;
    loadAll();
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadAll = async () => {
    setDataLoading(true);
    const [contactsRes, studentsRes, coursesRes, approvalsRes, leadsRes] = await Promise.all([
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('id, full_name, email, role, created_at').in('role', ['student', 'client', 'customer']).order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title, category, available').order('title'),
      supabase.from('approvals').select('id, type, title, summary, status, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('leads').select('id, name, email, craft_type, interest, created_at, status').order('created_at', { ascending: false }).limit(50),
    ]);

    if (contactsRes.data) setContacts(contactsRes.data);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (approvalsRes.data) setApprovals(approvalsRes.data);

    // Attach enrolment counts to courses
    if (coursesRes.data) {
      const { data: enrolCounts } = await supabase
        .from('enrollments')
        .select('course_id');
      const counts: Record<number, number> = {};
      (enrolCounts || []).forEach((e: { course_id: number }) => {
        counts[e.course_id] = (counts[e.course_id] || 0) + 1;
      });
      setCourses(coursesRes.data.map(c => ({ ...c, enrolment_count: counts[c.id] || 0 })));
    }

    setDataLoading(false);
  };

  // ── Communications handlers ─────────────────────────────────────────────────
  const markContact = async (id: string, status: string) => {
    await supabase.from('contact_submissions').update({ status }).eq('id', id);
    setContacts(cs => cs.map(c => c.id === id ? { ...c, status } : c));
    showToast(`Marked as ${status}`);
  };

  const sendReply = async (contact: ContactSubmission) => {
    const reply = replyText[contact.id];
    if (!reply?.trim()) return;
    // Log reply to Supabase (email sending not configured)
    await supabase.from('contact_submissions').update({ status: 'replied' }).eq('id', contact.id);
    setContacts(cs => cs.map(c => c.id === contact.id ? { ...c, status: 'replied' } : c));
    setReplyText(r => ({ ...r, [contact.id]: '' }));
    showToast('Reply logged (email sending not yet configured)');
  };

  // ── Academy handlers ────────────────────────────────────────────────────────
  const enrolStudent = async (studentId: string, courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const { error } = await supabase.from('enrollments').insert({
      user_id: studentId,
      course_id: courseId,
      course_name: course.title,
      enrolled_at: new Date().toISOString(),
    });
    if (error) { showToast('Enrolment failed: ' + error.message); return; }
    showToast('Student enrolled successfully');
    loadAll();
  };

  // ── Approvals handlers ──────────────────────────────────────────────────────
  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('approvals').update({ status, actioned_at: new Date().toISOString() }).eq('id', id);
    setApprovals(as => as.map(a => a.id === id ? { ...a, status } : a));
    showToast(`Item ${status}`);
  };

  // ── Leads handlers ──────────────────────────────────────────────────────────
  const updateLeadStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id);
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    showToast('Lead updated');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BRAND.parchment }}>
        <div className="w-8 h-8 border-2 border-[#8B1A1A]/30 border-t-[#8B1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BRAND.parchment }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#2C2C2C] text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: BRAND.charcoal }}>
            Staff Dashboard
          </h1>
          <p className="mt-1 text-[#2C2C2C]/60">
            Welcome back, {user?.name || 'team member'} · <span className="capitalize">{user?.role}</span>
          </p>
        </div>

        {/* Refresh */}
        <button
          onClick={loadAll}
          className="flex items-center gap-2 text-sm mb-6 px-3 py-1.5 rounded-lg border border-[#8B1A1A]/30 text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition"
        >
          <RefreshCw size={14} /> Refresh all panels
        </button>

        {/* ── Panel: Communications (all staff) ────────────────────────────── */}
        <Panel title="Communications" icon={<Mail size={20} />}>
          {contacts.length === 0 ? (
            <p className="text-[#2C2C2C]/50 text-sm">No contact submissions yet.</p>
          ) : (
            <div className="space-y-4">
              {contacts.map(c => (
                <div key={c.id} className="border border-[#2C2C2C]/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-[#2C2C2C]">{c.name}</p>
                      <p className="text-sm text-[#2C2C2C]/60">{c.email}</p>
                      <p className="text-sm mt-2 text-[#2C2C2C]/80">{c.message}</p>
                      <p className="text-xs text-[#2C2C2C]/40 mt-1">{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge(c.status || 'new')}`}>
                      {c.status || 'new'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => markContact(c.id, 'read')} className="text-xs px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition">
                      Mark read
                    </button>
                    <button onClick={() => markContact(c.id, 'replied')} className="text-xs px-3 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 transition">
                      Mark replied
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a reply note..."
                      value={replyText[c.id] || ''}
                      onChange={e => setReplyText(r => ({ ...r, [c.id]: e.target.value }))}
                      className="flex-1 text-sm border border-[#2C2C2C]/20 rounded px-3 py-1.5 focus:outline-none focus:border-[#8B1A1A]"
                    />
                    <button
                      onClick={() => sendReply(c)}
                      className="text-sm px-3 py-1.5 rounded text-white transition"
                      style={{ background: BRAND.red }}
                    >
                      Log reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ── Panel: Academy Management ─────────────────────────────────────── */}
        {hasAcademyAccess && (
          <Panel title="Academy Management" icon={<BookOpen size={20} />}>
            <div className="space-y-8">
              {/* Students list */}
              <div>
                <h3 className="font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"><Users size={16} /> Students</h3>
                {students.length === 0 ? (
                  <p className="text-sm text-[#2C2C2C]/50">No students enrolled yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[#2C2C2C]/50 border-b border-[#2C2C2C]/10">
                          <th className="pb-2 pr-4">Name</th>
                          <th className="pb-2 pr-4">Email</th>
                          <th className="pb-2 pr-4">Role</th>
                          <th className="pb-2 pr-4">Joined</th>
                          <th className="pb-2">Enrol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.id} className="border-b border-[#2C2C2C]/5">
                            <td className="py-2 pr-4 font-medium">{s.full_name || '—'}</td>
                            <td className="py-2 pr-4 text-[#2C2C2C]/60">{s.email}</td>
                            <td className="py-2 pr-4">
                              <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A]">{s.role}</span>
                            </td>
                            <td className="py-2 pr-4 text-[#2C2C2C]/50">{new Date(s.created_at).toLocaleDateString('en-GB')}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <select
                                  value={enrolCourseId[s.id] || ''}
                                  onChange={e => setEnrolCourseId(ec => ({ ...ec, [s.id]: Number(e.target.value) }))}
                                  className="text-xs border border-[#2C2C2C]/20 rounded px-2 py-1 focus:outline-none focus:border-[#8B1A1A]"
                                >
                                  <option value="">Choose course…</option>
                                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <button
                                  onClick={() => enrolStudent(s.id, enrolCourseId[s.id])}
                                  disabled={!enrolCourseId[s.id]}
                                  className="text-xs px-2 py-1 rounded text-white disabled:opacity-40 transition"
                                  style={{ background: BRAND.red }}
                                >
                                  <UserPlus size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Courses list */}
              <div>
                <h3 className="font-semibold text-[#2C2C2C] mb-3 flex items-center gap-2"><BookOpen size={16} /> Courses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map(c => (
                    <div key={c.id} className="border border-[#2C2C2C]/10 rounded-lg p-3">
                      <p className="font-medium text-[#2C2C2C]">{c.title}</p>
                      <p className="text-xs text-[#2C2C2C]/50 mt-0.5">{c.category}</p>
                      <p className="text-sm mt-1 text-[#8B1A1A]">{c.enrolment_count} enrolled</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${c.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* ── Panel: Approvals ──────────────────────────────────────────────── */}
        {hasApprovalsAccess && (
          <Panel title="Approvals" icon={<AlertCircle size={20} />}>
            {approvals.filter(a => a.status === 'pending').length === 0 ? (
              <p className="text-sm text-[#2C2C2C]/50">No pending approvals.</p>
            ) : null}
            <div className="space-y-3">
              {approvals.map(a => (
                <div key={a.id} className="border border-[#2C2C2C]/10 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#2C2C2C]">{a.title || a.type}</p>
                      {a.summary && <p className="text-sm text-[#2C2C2C]/60 mt-0.5">{a.summary}</p>}
                      <p className="text-xs text-[#2C2C2C]/40 mt-1">{new Date(a.created_at).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${badge(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleApproval(a.id, 'approved')}
                        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-green-100 text-green-800 hover:bg-green-200 transition"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleApproval(a.id, 'rejected')}
                        className="flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-red-100 text-red-800 hover:bg-red-200 transition"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {approvals.length === 0 && (
                <p className="text-sm text-[#2C2C2C]/50">No approval items found.</p>
              )}
            </div>
          </Panel>
        )}

        {/* ── Panel: Leads ──────────────────────────────────────────────────── */}
        {hasLeadsAccess && (
          <Panel title="Leads" icon={<TrendingUp size={20} />}>
            {leads.length === 0 ? (
              <p className="text-sm text-[#2C2C2C]/50">No leads yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#2C2C2C]/50 border-b border-[#2C2C2C]/10">
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 pr-4">Craft / Interest</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l.id} className="border-b border-[#2C2C2C]/5">
                        <td className="py-2 pr-4 font-medium">{l.name}</td>
                        <td className="py-2 pr-4 text-[#2C2C2C]/60 text-xs">{l.email}</td>
                        <td className="py-2 pr-4 text-[#2C2C2C]/70">{l.craft_type || l.interest || '—'}</td>
                        <td className="py-2 pr-4 text-[#2C2C2C]/50 text-xs">{new Date(l.created_at).toLocaleDateString('en-GB')}</td>
                        <td className="py-2">
                          <select
                            value={l.status || 'new'}
                            onChange={e => updateLeadStatus(l.id, e.target.value)}
                            className="text-xs border border-[#2C2C2C]/20 rounded px-2 py-1 focus:outline-none focus:border-[#8B1A1A]"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="rejected">Not interested</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
};
