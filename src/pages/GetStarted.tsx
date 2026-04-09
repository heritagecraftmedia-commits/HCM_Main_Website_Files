import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

type Stage = 'form' | 'submitted';

export default function GetStarted() {
  const [stage, setStage] = useState<Stage>('form');
  const [form, setForm] = useState({
    name: '',
    email: '',
    craftType: '',
    goal: '',
    currentStage: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage('submitted');
  };

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="py-16 md:py-24 bg-brand-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {stage === 'submitted' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <CheckCircle2 size={64} className="text-brand-olive mx-auto mb-6" />
            <h2 className="text-4xl font-serif text-brand-ink mb-4">We've got your details</h2>
            <p className="text-brand-ink/60 text-lg leading-relaxed max-w-md mx-auto">
              Someone from Heritage Craft Media will be in touch within 1 working day to chat through the best next step for your business.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <span className="inline-block px-4 py-1 rounded-full bg-brand-olive/10 text-brand-olive text-sm font-bold uppercase tracking-widest mb-6">
                Get Started
              </span>
              <h1 className="text-5xl font-serif text-brand-ink mb-4">
                Tell us about your <span className="italic text-brand-olive">business</span>
              </h1>
              <p className="text-brand-ink/60 leading-relaxed">
                Fill in the form below and we'll come back to you with the most useful starting point — whether that's a course, a free resource, or a conversation about our services.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-[40px] p-8 md:p-12 space-y-6 border border-brand-olive/10"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">Your Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm"
                  placeholder="e.g. Sarah Jones"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">What do you make? *</label>
                <select
                  required
                  value={form.craftType}
                  onChange={update('craftType')}
                  className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm"
                >
                  <option value="">Select your craft</option>
                  <option>Woodworking</option>
                  <option>Textiles & Clothing</option>
                  <option>Ceramics & Pottery</option>
                  <option>Metalwork & Jewellery</option>
                  <option>Candles & Home</option>
                  <option>Illustration & Print</option>
                  <option>Heritage Skills</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">Where are you now?</label>
                <select
                  value={form.currentStage}
                  onChange={update('currentStage')}
                  className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm"
                >
                  <option value="">Choose one</option>
                  <option>Just starting out — no online presence yet</option>
                  <option>Some social media but not consistent</option>
                  <option>Active online but not getting results</option>
                  <option>Selling well — want to scale up</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-brand-ink/50">What's your main goal?</label>
                <textarea
                  rows={3}
                  value={form.goal}
                  onChange={update('goal')}
                  className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm resize-none"
                  placeholder="e.g. I want to start selling on Instagram and build a following..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-olive text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-brand-olive/90 transition-all"
              >
                Send — We'll Be in Touch <ArrowRight size={20} />
              </button>

              <p className="text-center text-xs text-brand-ink/30">
                No spam. No automated sequences. A real person will reply.
              </p>
            </motion.form>
          </>
        )}
      </div>
    </div>
  );
}
