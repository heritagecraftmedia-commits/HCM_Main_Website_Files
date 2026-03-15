import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Loader2, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const FEEDBACK_TYPES = ['General', 'Food Directory', 'Radio', 'Events', 'Website'];

interface PublicFeedback {
  id: string;
  name: string | null;
  type: string;
  message: string;
  created_at: string;
}

export const Feedback: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicFeedback, setPublicFeedback] = useState<PublicFeedback[]>([]);

  useEffect(() => {
    supabase
      .from('feedback')
      .select('id, name, type, message, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setPublicFeedback(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: sbError } = await supabase.from('feedback').insert([{
      name: name || null,
      email: email || null,
      type,
      message,
    }]);

    if (sbError) {
      setError('Something went wrong — please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  const inputClass = 'w-full px-5 py-3 rounded-2xl border border-brand-olive/20 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-olive/30 text-brand-ink';

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* Hero */}
      <section className="py-20 md:py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">Your <span className="italic">Feedback</span></h1>
            <p className="text-xl opacity-80 max-w-2xl leading-relaxed">
              Help us grow. Whether it's a suggestion, a compliment, or a concern — every message
              is read by a real person and used to shape what we do.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-brand-olive/5">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <CheckCircle2 size={56} className="text-brand-olive mx-auto" />
                  <h3 className="text-3xl font-serif">Thank you!</h3>
                  <p className="text-brand-ink/60 leading-relaxed">
                    Your feedback has been received. We review every message and use it to improve the hub.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setMessage(''); setName(''); setEmail(''); }}
                    className="px-8 py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-brand-ink/70">
                        Name <span className="font-normal opacity-50">(optional)</span>
                      </label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-brand-ink/70">
                        Email <span className="font-normal opacity-50">(optional)</span>
                      </label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="jane@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-3 text-brand-ink/70">Type of feedback</label>
                    <div className="flex flex-wrap gap-2">
                      {FEEDBACK_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                            type === t ? 'bg-brand-olive text-white border-brand-olive' : 'bg-brand-cream text-brand-ink/60 border-brand-olive/20 hover:border-brand-olive'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Your message *</label>
                    <textarea
                      rows={6}
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className={inputClass + ' resize-none'}
                      placeholder="Tell us what's on your mind…"
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : <><Send size={18} /> Send feedback</>}
                  </button>

                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Public board */}
      {publicFeedback.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif mb-3 text-center">What people are saying</h2>
            <p className="text-center text-brand-ink/50 text-sm mb-12">Selected feedback from our community</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicFeedback.map(fb => (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-brand-cream rounded-[28px] p-8 border border-brand-olive/5 space-y-4"
                >
                  <Quote size={24} className="text-brand-olive/30" />
                  <p className="text-brand-ink/80 leading-relaxed italic">"{fb.message}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-brand-olive/10">
                    <span className="text-sm font-bold text-brand-ink/60">{fb.name || 'Anonymous'}</span>
                    <span className="text-xs px-3 py-1 bg-brand-olive/10 text-brand-olive rounded-full">{fb.type}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
