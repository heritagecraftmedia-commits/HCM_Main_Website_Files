import React, { useState } from 'react';
import { Heart, Mic, ShoppingBag, BookOpen, HelpingHand, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const ROLES = [
  { id: 'radio', label: 'Radio Presenter', icon: <Mic size={20} />, desc: 'Host a community show, interview local producers, or help run the broadcasting desk.' },
  { id: 'market', label: 'Market Stall Helper', icon: <ShoppingBag size={20} />, desc: 'Help producers set up and run stalls at our weekend Farnham markets and pop-up events.' },
  { id: 'directory', label: 'Directory Curator', icon: <BookOpen size={20} />, desc: 'Research and verify local producers, write listings, and keep the food directory accurate.' },
  { id: 'training', label: 'Training Support', icon: <HelpingHand size={20} />, desc: 'Support trainees returning to work — mentoring, practical help, and a friendly face.' },
];

const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Evenings'];

interface FormState {
  name: string;
  email: string;
  phone: string;
  roles: string[];
  availability: string[];
  message: string;
}

export const Volunteer: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', roles: [], availability: [], message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleArray = (field: 'roles' | 'availability', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      setError('Please select at least one role you\'re interested in.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: sbError } = await supabase.from('volunteer_enquiries').insert([{
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      roles: form.roles,
      availability: form.availability,
      message: form.message || null,
    }]);

    if (sbError) {
      setError('Something went wrong — please try again or email us directly.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* Hero */}
      <section className="py-24 md:py-28 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
              Join the <span className="italic">Community</span>
            </h1>
            <p className="text-xl opacity-80 leading-relaxed">
              Volunteering with Farmers Table Hub is a way to put down roots in Farnham — meet local
              makers, get behind a microphone, or simply lend a hand at the market. No experience needed.
              Just show up and we'll figure the rest out together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Role cards */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">What volunteering looks like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {ROLES.map((role) => (
              <div key={role.id} className="bg-white rounded-[28px] p-8 border border-brand-olive/5 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-brand-olive/10 flex items-center justify-center text-brand-olive">
                  {role.icon}
                </div>
                <h3 className="text-xl font-serif">{role.label}</h3>
                <p className="text-sm text-brand-ink/60 leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-brand-ink/50 italic mt-4">
            All volunteer roles are flexible — we work around your life, not the other way round.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-center">Express your interest</h2>
          <p className="text-brand-ink/60 text-center mb-12 leading-relaxed">
            Fill in this short form and someone from the team will be in touch within a week.
            No commitment required — just a conversation.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-4"
              >
                <CheckCircle2 size={56} className="text-brand-olive mx-auto" />
                <h3 className="text-2xl font-serif">Thank you!</h3>
                <p className="text-brand-ink/60 leading-relaxed">
                  We've received your expression of interest. Someone will be in touch within the week.
                  In the meantime, take a look at our{' '}
                  <a href="/directory" className="text-brand-olive hover:underline">Food Directory</a>.
                </p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Your name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-brand-olive/20 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-olive/30 text-brand-ink"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Email address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-brand-olive/20 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-olive/30 text-brand-ink"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">
                    Phone <span className="font-normal opacity-50">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-brand-olive/20 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-olive/30 text-brand-ink"
                    placeholder="07700 900000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-brand-ink/70">Which roles interest you? *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleArray('roles', role.id)}
                        className={`px-4 py-3 rounded-2xl text-sm font-semibold text-left transition-all border ${
                          form.roles.includes(role.id)
                            ? 'bg-brand-olive text-white border-brand-olive'
                            : 'bg-brand-cream text-brand-ink/70 border-brand-olive/20 hover:border-brand-olive'
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-brand-ink/70">
                    When are you available? <span className="font-normal opacity-50">(tick all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABILITY_OPTIONS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleArray('availability', slot)}
                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                          form.availability.includes(slot)
                            ? 'bg-brand-earth text-white border-brand-earth'
                            : 'bg-white text-brand-ink/70 border-brand-olive/20 hover:border-brand-olive'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">
                    Anything else? <span className="font-normal opacity-50">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-brand-olive/20 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-olive/30 text-brand-ink resize-none"
                    placeholder="Tell us a bit about yourself, or ask a question..."
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><Loader2 size={18} className="animate-spin" /> Sending…</>
                    : 'Send my expression of interest'
                  }
                </button>

              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
};
