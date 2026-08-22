import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, CheckSquare, Square, Plus, Send,
  ThumbsUp, BrainCircuit, Calendar, CalendarDays,
  BookMarked, Settings, Loader2, Key, Check, X,
} from 'lucide-react';
// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
  due_date: string | null;
}
interface Approval {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}
interface LearningEntry {
  id: string;
  pattern: string;
  status: 'approved' | 'pending';
  created_at: string;
}
interface ChatMessage {
  role: 'user' | 'claude';
  text: string;
}
type Section = 'dashboard' | 'approvals' | 'ask-claude' | 'this-week' | 'this-month' | 'learning-log' | 'setup';
// ─── Helpers ──────────────────────────────────────────────────────────────────
function greeting(name: string): string {
  const h = new Date().getHours();
  const period = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${period}, ${name}`;
}
function weekDates(): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
const toISO = (d: Date) => d.toISOString().split('T')[0];
const WEEK_LABELS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PUBLISHING   = ['YouTube', 'TikTok', 'Instagram', 'Pinterest', 'LinkedIn', 'Ko-fi', 'Facebook Live'];
const MILESTONES   = ['Monthly backup', 'Budget review', 'Plan next month', 'Retainer reminders'];
const QUICK_PROMPTS = [
  'What are my tasks today?',
  'Draft an enquiry reply email',
  'Content plan this week',
  'Show me this week ahead',
  'I am having a fog day ❤️',
];
async function callClaude(prompt: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('hcm-chat', {
      body: { message: prompt },
    });
    if (error) throw error;
    return data?.reply ?? 'No response.';
  } catch {
    return 'Could not reach Claude. Check your API setup in Settings.';
  }
}
// ─── Section 1: Dashboard ─────────────────────────────────────────────────────
const DashboardSection: React.FC<{ userName: string; pendingCount: number }> = ({ userName, pendingCount }) => {
  const today = toISO(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  useEffect(() => {
    supabase
      .from('tasks')
      .select('id, title, priority, done, due_date')
      .eq('due_date', today)
      .then(({ data }) => {
        setTasks(data ?? []);
        setLoadingTasks(false);
      });
  }, [today]);
  const toggleTask = async (task: Task) => {
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
  };
  const addTask = async () => {
    if (!newTitle.trim()) return;
    const { data } = await supabase
      .from('tasks')
      .insert({ title: newTitle.trim(), priority: 'medium', done: false, due_date: today })
      .select()
      .single();
    if (data) {
      setTasks(prev => [...prev, data]);
      setNewTitle('');
      setAddingTask(false);
    }
  };
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    setChatLoading(true);
    const response = await callClaude(chatInput);
    setChatResponse(response);
    setChatLoading(false);
  };
  const done = tasks.filter(t => t.done).length;
  const todo = tasks.filter(t => !t.done).length;
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Greeting */}
      <div className="bg-brand-olive rounded-2xl px-7 py-6">
        <p className="text-2xl font-serif text-brand-cream">{greeting(userName)}</p>
        <p className="text-brand-cream/60 text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tasks Done', value: done },
          { label: 'Tasks To Do', value: todo },
          { label: 'Pending Approvals', value: pendingCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl px-4 py-5 border border-brand-olive/10 shadow-sm text-center">
            <p className="text-3xl font-bold text-brand-ink">{value}</p>
            <p className="text-xs text-brand-ink/50 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
      {/* Today's Tasks */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-brand-ink text-lg">Today's Tasks</h2>
          <button
            onClick={() => setAddingTask(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-brand-olive hover:text-brand-ink transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {loadingTasks ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-brand-olive/40" />
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.length === 0 && !addingTask && (
              <li className="text-brand-ink/40 text-sm text-center py-4">No tasks for today.</li>
            )}
            {tasks.map(task => (
              <li key={task.id}>
                <button onClick={() => toggleTask(task)} className="flex items-center gap-3 w-full text-left group">
                  {task.done
                    ? <CheckSquare size={18} className="text-brand-olive shrink-0" />
                    : <Square size={18} className="text-brand-ink/20 group-hover:text-brand-olive/40 shrink-0 transition-colors" />}
                  <span className={`text-sm flex-1 ${task.done ? 'line-through text-brand-ink/30' : 'text-brand-ink'}`}>
                    {task.title}
                  </span>
                  {task.priority === 'high' && !task.done && (
                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">High</span>
                  )}
                </button>
              </li>
            ))}
            {addingTask && (
              <li className="flex gap-2 pt-1">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAddingTask(false); }}
                  placeholder="Task title..."
                  className="flex-1 text-sm border border-brand-olive/20 rounded-lg px-3 py-2 outline-none focus:border-brand-olive bg-brand-cream"
                />
                <button
                  onClick={addTask}
                  className="px-3 py-2 bg-brand-olive text-brand-cream text-xs font-semibold rounded-lg hover:bg-brand-ink transition-colors"
                >
                  Save
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
      {/* Mini Claude chat */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit size={18} className="text-brand-olive" />
          <h2 className="font-serif text-brand-ink text-lg">Quick Ask</h2>
        </div>
        {chatResponse && (
          <div className="mb-4 p-4 bg-brand-cream rounded-xl text-sm text-brand-ink/80 whitespace-pre-wrap leading-relaxed">
            {chatResponse}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
            placeholder="Ask anything..."
            rows={2}
            className="flex-1 text-sm border border-brand-olive/20 rounded-xl px-3 py-2 outline-none focus:border-brand-olive bg-brand-cream resize-none"
          />
          <button
            onClick={sendChat}
            disabled={chatLoading || !chatInput.trim()}
            className="self-end px-4 py-2.5 bg-brand-olive text-brand-cream rounded-xl hover:bg-brand-ink transition-colors disabled:opacity-40"
          >
            {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
// ─── Section 2: Approvals ─────────────────────────────────────────────────────
const ApprovalsSection: React.FC<{ onCountChange: (n: number) => void }> = ({ onCountChange }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from('approvals')
      .select('id, title, description, status, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = data ?? [];
        setApprovals(list);
        onCountChange(list.filter(a => a.status === 'pending').length);
        setLoading(false);
      });
  }, []);
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('approvals').update({ status }).eq('id', id);
    setApprovals(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, status } : a);
      onCountChange(updated.filter(a => a.status === 'pending').length);
      return updated;
    });
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand-olive/40" />
      </div>
    );
  }
  const pending  = approvals.filter(a => a.status === 'pending');
  const resolved = approvals.filter(a => a.status !== 'pending');
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-serif text-brand-ink text-xl">Approvals</h2>
      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-10 text-center">
          <p className="text-brand-ink/50 text-sm">All clear — nothing waiting for approval</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-brand-ink">{a.title}</p>
                  {a.description && (
                    <p className="text-sm text-brand-ink/60 mt-1">{a.description}</p>
                  )}
                  <p className="text-xs text-brand-ink/30 mt-2">
                    {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => updateStatus(a.id, 'approved')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-olive text-brand-cream text-xs font-semibold rounded-lg hover:bg-brand-ink transition-colors"
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, 'rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {resolved.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-brand-ink/40 uppercase tracking-wide mb-3">Resolved</h3>
          <div className="space-y-2">
            {resolved.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-brand-olive/5 px-5 py-3 flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  a.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                }`}>{a.status}</span>
                <p className="text-sm text-brand-ink/50 flex-1">{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// ─── Section 3: Ask Claude ────────────────────────────────────────────────────
const AskClaudeSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    const response = await callClaude(text);
    setMessages(prev => [...prev, { role: 'claude', text: response }]);
    setLoading(false);
  };
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <div className="max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
      <h2 className="font-serif text-brand-ink text-xl mb-4">Ask Claude</h2>
      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-xs px-3 py-1.5 bg-white border border-brand-olive/20 text-brand-ink/70 rounded-full hover:border-brand-olive hover:text-brand-ink transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-5 space-y-4 mb-4">
        {messages.length === 0 && (
          <p className="text-brand-ink/30 text-sm text-center pt-8">
            Use a quick prompt or type your question below.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-olive text-brand-cream rounded-br-sm'
                : 'bg-brand-cream text-brand-ink rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-brand-cream rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 size={16} className="animate-spin text-brand-olive/50" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask Claude anything..."
          rows={2}
          className="flex-1 text-sm border border-brand-olive/20 rounded-xl px-4 py-3 outline-none focus:border-brand-olive bg-white resize-none"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="self-end px-4 py-3 bg-brand-olive text-brand-cream rounded-xl hover:bg-brand-ink transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
};
// ─── Section 4: This Week ─────────────────────────────────────────────────────
const ThisWeekSection: React.FC = () => {
  const days      = useMemo(() => weekDates(), []);
  const todayISO  = toISO(new Date());
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [loading, setLoading]     = useState(true);
  useEffect(() => {
    supabase
      .from('tasks')
      .select('id, title, priority, done, due_date')
      .gte('due_date', toISO(days[0]))
      .lte('due_date', toISO(days[6]))
      .then(({ data }) => {
        setWeekTasks(data ?? []);
        setLoading(false);
      });
  }, [days]);
  const tasksForDay  = (date: Date) => weekTasks.filter(t => t.due_date === toISO(date));
  const totalTasks   = weekTasks.length;
  const doneTasks    = weekTasks.filter(t => t.done).length;
  const progress     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-brand-ink text-xl">This Week</h2>
      {/* 7-column day grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const iso    = toISO(day);
          const isToday = iso === todayISO;
          const dayTasks = tasksForDay(day);
          return (
            <div
              key={iso}
              className={`rounded-xl border p-2 min-h-[130px] ${
                isToday ? 'bg-red-50 border-red-200' : 'bg-white border-brand-olive/10'
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-red-500' : 'text-brand-ink/40'}`}>
                {WEEK_LABELS[i]}
              </div>
              <div className={`text-lg font-bold mb-1 ${isToday ? 'text-red-600' : 'text-brand-ink'}`}>
                {day.getDate()}
              </div>
              {!loading && (
                <div className="space-y-1 mb-1">
                  {dayTasks.map(t => (
                    <div
                      key={t.id}
                      className={`text-xs px-1.5 py-0.5 rounded leading-tight ${
                        t.done
                          ? 'text-brand-ink/30 line-through'
                          : 'bg-brand-olive/10 text-brand-ink/70'
                      }`}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              )}
              <div className={`text-xs mt-1 ${isToday ? 'text-red-400' : 'text-brand-ink/30'}`}>
                {PUBLISHING[i]}
              </div>
            </div>
          );
        })}
      </div>
      {/* Publishing schedule card */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <h3 className="font-serif text-brand-ink text-lg mb-4">Publishing Schedule</h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {WEEK_LABELS.map((day, i) => (
            <div key={day}>
              <div className="text-xs font-semibold text-brand-ink/40 mb-1">{day}</div>
              <div className="text-xs text-brand-ink/70">{PUBLISHING[i]}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-brand-ink">Tasks completed this week</span>
          <span className="text-sm text-brand-ink/50">{doneTasks} / {totalTasks}</span>
        </div>
        <div className="h-2 bg-brand-cream rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-olive rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-brand-ink/40 mt-1">{progress}% complete</p>
      </div>
    </div>
  );
};
// ─── Section 5: This Month ────────────────────────────────────────────────────
const ThisMonthSection: React.FC = () => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [monthTasks, setMonthTasks] = useState<{ done: boolean }[]>([]);
  const now         = new Date();
  const firstOfMonth = useMemo(() => toISO(new Date(now.getFullYear(), now.getMonth(), 1)), []);
  const lastOfMonth  = useMemo(() => toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0)), []);
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth   = now.getDate();
  useEffect(() => {
    supabase
      .from('tasks')
      .select('done')
      .gte('due_date', firstOfMonth)
      .lte('due_date', lastOfMonth)
      .then(({ data }) => setMonthTasks(data ?? []));
  }, [firstOfMonth, lastOfMonth]);
  const totalMonthTasks = monthTasks.length;
  const doneMonthTasks  = monthTasks.filter(t => t.done).length;
  const tasksProgress   = totalMonthTasks > 0 ? Math.round((doneMonthTasks / totalMonthTasks) * 100) : 0;
  const contentProgress = Math.round((dayOfMonth / daysInMonth) * 100);
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-serif text-brand-ink text-xl">This Month</h2>
      {/* Key milestones */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <h3 className="font-serif text-brand-ink text-lg mb-4">Key Milestones</h3>
        <ul className="space-y-3">
          {MILESTONES.map((m, i) => (
            <li key={i}>
              <button
                onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
                className="flex items-center gap-3 w-full text-left group"
              >
                {checked[i]
                  ? <CheckSquare size={18} className="text-brand-olive shrink-0" />
                  : <Square size={18} className="text-brand-ink/20 group-hover:text-brand-olive/40 shrink-0 transition-colors" />}
                <span className={`text-sm ${checked[i] ? 'line-through text-brand-ink/30' : 'text-brand-ink'}`}>{m}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Month at a glance */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6 space-y-5">
        <h3 className="font-serif text-brand-ink text-lg">Month at a Glance</h3>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-brand-ink/70">Tasks completed</span>
            <span className="text-sm text-brand-ink/40">{doneMonthTasks} / {totalMonthTasks}</span>
          </div>
          <div className="h-2 bg-brand-cream rounded-full overflow-hidden">
            <div className="h-full bg-brand-olive rounded-full transition-all" style={{ width: `${tasksProgress}%` }} />
          </div>
          <p className="text-xs text-brand-ink/30 mt-1">{tasksProgress}%</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-brand-ink/70">Content published</span>
            <span className="text-sm text-brand-ink/40">Day {dayOfMonth} of {daysInMonth}</span>
          </div>
          <div className="h-2 bg-brand-cream rounded-full overflow-hidden">
            <div className="h-full bg-brand-earth rounded-full transition-all" style={{ width: `${contentProgress}%` }} />
          </div>
          <p className="text-xs text-brand-ink/30 mt-1">{contentProgress}% through the month</p>
        </div>
      </div>
      {/* Fog day note */}
      <div className="bg-brand-ink rounded-2xl p-6 text-center">
        <p className="text-brand-cream/80 text-sm">System holds the memory ❤️</p>
      </div>
    </div>
  );
};
// ─── Section 6: Learning Log ──────────────────────────────────────────────────
const LearningLogSection: React.FC = () => {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from('learning_log')
      .select('id, pattern, status, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEntries(data ?? []);
        setLoading(false);
      });
  }, []);
  const approve = async (id: string) => {
    await supabase.from('learning_log').update({ status: 'approved' }).eq('id', id);
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e));
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand-olive/40" />
      </div>
    );
  }
  const confirmed = entries.filter(e => e.status === 'approved');
  const pending   = entries.filter(e => e.status === 'pending');
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-brand-ink text-xl">Learning Log</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Confirmed Patterns */}
        <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-brand-ink/40 uppercase tracking-wide mb-4">Confirmed Patterns</h3>
          {confirmed.length === 0 ? (
            <p className="text-brand-ink/30 text-sm">No confirmed patterns yet.</p>
          ) : (
            <ul className="space-y-3">
              {confirmed.map(e => (
                <li key={e.id} className="text-sm text-brand-ink border-l-2 border-brand-olive/30 pl-3">
                  {e.pattern}
                  <span className="block text-xs text-brand-ink/30 mt-0.5">
                    {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Pending Approval */}
        <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-brand-ink/40 uppercase tracking-wide mb-4">Pending Approval</h3>
          {pending.length === 0 ? (
            <p className="text-brand-ink/30 text-sm">Nothing pending.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map(e => (
                <li key={e.id} className="flex items-start justify-between gap-3">
                  <div className="text-sm text-brand-ink border-l-2 border-brand-earth/40 pl-3 flex-1">
                    {e.pattern}
                    <span className="block text-xs text-brand-ink/30 mt-0.5">
                      {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <button
                    onClick={() => approve(e.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-olive bg-brand-olive/10 px-2.5 py-1 rounded-lg hover:bg-brand-olive hover:text-brand-cream transition-colors shrink-0"
                  >
                    <Check size={12} /> Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
// ─── Section 7: Setup ─────────────────────────────────────────────────────────
const SetupSection: React.FC = () => {
  const [apiKey, setApiKey]   = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'claude_api_key')
      .single()
      .then(({ data }) => { if (data?.value) setSavedKey(data.value); });
  }, []);
  const saveKey = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    await supabase.from('settings').upsert({ key: 'claude_api_key', value: apiKey.trim() });
    setSavedKey(apiKey.trim());
    setApiKey('');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const supabaseOk = !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
  return (
    <div className="max-w-xl space-y-6">
      <h2 className="font-serif text-brand-ink text-xl">Setup</h2>
      {/* API key input */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key size={18} className="text-brand-olive" />
          <h3 className="font-serif text-brand-ink text-lg">API Key</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={savedKey ? '••••••••••••••••' : 'Enter Claude API key...'}
            className="flex-1 text-sm border border-brand-olive/20 rounded-xl px-4 py-3 outline-none focus:border-brand-olive bg-brand-cream"
          />
          <button
            onClick={saveKey}
            disabled={saving || !apiKey.trim()}
            className="px-4 py-3 bg-brand-olive text-brand-cream text-sm font-semibold rounded-xl hover:bg-brand-ink transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>
      {/* Status card */}
      <div className="bg-white rounded-2xl border border-brand-olive/10 shadow-sm p-6">
        <h3 className="font-serif text-brand-ink text-lg mb-4">System Status</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <span>{supabaseOk ? '✅' : '❌'}</span>
            <span className="text-brand-ink">Supabase connected</span>
          </li>
          <li className="flex items-center gap-3">
            <span>✅</span>
            <span className="text-brand-ink">Vercel hosting</span>
          </li>
          <li className="flex items-center gap-3">
            <span>{savedKey ? '✅' : '⚠️'}</span>
            <span className={savedKey ? 'text-brand-ink' : 'text-brand-ink/50'}>
              Claude AI {savedKey ? 'configured' : '— API key not saved'}
            </span>
          </li>
        </ul>
      </div>
      {/* Fog day reminder */}
      <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: '#2d2d2d' }}>
        <p className="text-white/80 text-sm">On fog days, the system holds the memory.</p>
        <p className="text-white/40 text-xs mt-1">You only need to show up. ❤️</p>
      </div>
    </div>
  );
};
// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={16} /> },
  { id: 'approvals',    label: 'Approvals',    icon: <ThumbsUp size={16} /> },
  { id: 'ask-claude',   label: 'Ask Claude',   icon: <BrainCircuit size={16} /> },
  { id: 'this-week',    label: 'This Week',    icon: <Calendar size={16} /> },
  { id: 'this-month',   label: 'This Month',   icon: <CalendarDays size={16} /> },
  { id: 'learning-log', label: 'Learning Log', icon: <BookMarked size={16} /> },
  { id: 'setup',        label: 'Setup',        icon: <Settings size={16} /> },
];
// ─── Main component ───────────────────────────────────────────────────────────
export const FounderDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [section, setSection]         = useState<Section>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  const isAuthorised = user?.role === 'founder' || user?.role === 'admin';
  useEffect(() => {
    if (authLoading) return;
    if (!user)        { navigate('/login',          { replace: true }); return; }
    if (!isAuthorised){ navigate('/staffdashboard', { replace: true }); return; }
  }, [user, authLoading, isAuthorised, navigate]);
  // Fetch initial pending count for nav badge
  useEffect(() => {
    if (!isAuthorised) return;
    supabase
      .from('approvals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count ?? 0));
  }, [isAuthorised]);
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Loader2 size={28} className="animate-spin text-brand-olive/40" />
      </div>
    );
  }
  const renderSection = () => {
    switch (section) {
      case 'dashboard':    return <DashboardSection userName={user?.name ?? 'Scott'} pendingCount={pendingCount} />;
      case 'approvals':    return <ApprovalsSection onCountChange={setPendingCount} />;
      case 'ask-claude':   return <AskClaudeSection />;
      case 'this-week':    return <ThisWeekSection />;
      case 'this-month':   return <ThisMonthSection />;
      case 'learning-log': return <LearningLogSection />;
      case 'setup':        return <SetupSection />;
    }
  };
  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-brand-olive/10 fixed top-[80px] bottom-0 flex flex-col overflow-y-auto z-20">
        <div className="px-4 py-5 border-b border-brand-olive/10">
          <p className="text-xs font-semibold text-brand-ink/30 uppercase tracking-wide">Heritage Craft Media</p>
          <p className="text-sm font-semibold text-brand-ink mt-0.5">{user?.name ?? 'Founder'}</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                section === item.id
                  ? 'bg-brand-olive/10 text-brand-olive'
                  : 'text-brand-ink/60 hover:bg-brand-cream hover:text-brand-ink'
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === 'approvals' && pendingCount > 0 && (
                <span className="ml-auto bg-brand-olive text-brand-cream text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="ml-56 flex-1 py-8 px-8">
        {renderSection()}
      </main>
    </div>
  );
};
