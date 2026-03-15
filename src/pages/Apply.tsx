import React, { useState } from 'react';
import { Sprout, Paintbrush, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

type TabType = 'food_producer' | 'maker_artisan';

const PRODUCE_TYPES = ['Vegetables & Salad', 'Fruit & Berries', 'Dairy & Eggs', 'Meat & Poultry', 'Fish & Seafood', 'Bread & Bakery', 'Preserves & Condiments', 'Honey & Bee Products', 'Drinks & Juice', 'Other'];
const CRAFT_TYPES = ['Ceramics & Pottery', 'Jewellery & Silversmithing', 'Textiles & Weaving', 'Woodwork', 'Printmaking', 'Painting & Drawing', 'Candles & Soap', 'Leather Goods', 'Basketry & Willow', 'Other'];

interface FoodForm {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  description: string;
  website: string;
  attends_market: boolean | null;
}

interface MakerForm {
  business_name: string;
  contact_name: string;
  email: string;
  category: string;
  location: string;
  description: string;
  website: string;
  social: string;
}

export const Apply: React.FC = () => {
  const [tab, setTab] = useState<TabType>('food_producer');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [foodForm, setFoodForm] = useState<FoodForm>({
    business_name: '', contact_name: '', email: '', phone: '',
    category: '', location: '', description: '', website: '', attends_market: null,
  });

  const [makerForm, setMakerForm] = useState<MakerForm>({
    business_name: '', contact_name: '', email: '',
    category: '', location: '', description: '', website: '', social: '',
  });

  const inputClass = 'w-full px-5 py-3 rounded-2xl border border-brand-olive/20 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-olive/30 text-brand-ink';
  const selectClass = inputClass + ' cursor-pointer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = tab === 'food_producer'
      ? {
          type: 'food_producer' as const,
          business_name: foodForm.business_name,
          contact_name: foodForm.contact_name,
          email: foodForm.email,
          phone: foodForm.phone || null,
          category: foodForm.category,
          location: foodForm.location,
          description: foodForm.description,
          website: foodForm.website || null,
          attends_market: foodForm.attends_market,
          social: null,
        }
      : {
          type: 'maker_artisan' as const,
          business_name: makerForm.business_name,
          contact_name: makerForm.contact_name,
          email: makerForm.email,
          phone: null,
          category: makerForm.category,
          location: makerForm.location,
          description: makerForm.description,
          website: makerForm.website || null,
          social: makerForm.social || null,
          attends_market: null,
        };

    const { error: sbError } = await supabase.from('producer_applications').insert([payload]);

    if (sbError) {
      setError('Something went wrong — please try again or email us directly.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-brand-cream min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-6 py-24"
        >
          <CheckCircle2 size={64} className="text-brand-olive mx-auto" />
          <h2 className="text-3xl font-serif">Application received</h2>
          <p className="text-brand-ink/60 leading-relaxed">
            Thank you — we'll be in touch within 5 working days. If you have any questions in the meantime,
            feel free to reach out via the <a href="/feedback" className="text-brand-olive hover:underline">contact page</a>.
          </p>
          <a href="/directory" className="inline-block px-8 py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all">
            Browse the Directory
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* Hero */}
      <section className="py-20 md:py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
              Apply to <span className="italic">Join</span>
            </h1>
            <p className="text-xl opacity-80 leading-relaxed max-w-2xl">
              Join the Farmers Table Hub directory as a local food producer or artisan maker.
              We review every application personally and aim to respond within 5 working days.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Tab switcher */}
          <div className="flex p-1.5 bg-white rounded-full shadow-sm border border-brand-olive/10 mb-12">
            {[
              { id: 'food_producer' as TabType, label: 'Food Producer', icon: <Sprout size={16} /> },
              { id: 'maker_artisan' as TabType, label: 'Maker / Artisan', icon: <Paintbrush size={16} /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all ${
                  tab === t.id ? 'bg-brand-olive text-white shadow' : 'text-brand-ink/50 hover:text-brand-olive'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'food_producer' ? (
              <motion.form
                key="food"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Business name *</label>
                    <input type="text" required value={foodForm.business_name} onChange={e => setFoodForm(p => ({ ...p, business_name: e.target.value }))} className={inputClass} placeholder="Farnham Farm Shop" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Contact name *</label>
                    <input type="text" required value={foodForm.contact_name} onChange={e => setFoodForm(p => ({ ...p, contact_name: e.target.value }))} className={inputClass} placeholder="Jane Smith" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Email *</label>
                    <input type="email" required value={foodForm.email} onChange={e => setFoodForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="hello@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Phone <span className="font-normal opacity-50">(optional)</span></label>
                    <input type="tel" value={foodForm.phone} onChange={e => setFoodForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="07700 900000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Type of produce *</label>
                  <select required value={foodForm.category} onChange={e => setFoodForm(p => ({ ...p, category: e.target.value }))} className={selectClass}>
                    <option value="">Select a category…</option>
                    {PRODUCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Location / postcode *</label>
                  <input type="text" required value={foodForm.location} onChange={e => setFoodForm(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Farnham, GU9" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Brief description *</label>
                  <textarea rows={4} required value={foodForm.description} onChange={e => setFoodForm(p => ({ ...p, description: e.target.value }))} className={inputClass + ' resize-none'} placeholder="Tell us about your produce, your methods, and what makes it special…" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Website <span className="font-normal opacity-50">(optional)</span></label>
                  <input type="url" value={foodForm.website} onChange={e => setFoodForm(p => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://yourwebsite.co.uk" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-3 text-brand-ink/70">Do you attend Farnham market?</label>
                  <div className="flex gap-4">
                    {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setFoodForm(p => ({ ...p, attends_market: opt.val }))}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border ${
                          foodForm.attends_market === opt.val ? 'bg-brand-olive text-white border-brand-olive' : 'bg-white text-brand-ink/60 border-brand-olive/20 hover:border-brand-olive'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <button type="submit" disabled={submitting} className="w-full py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : 'Submit my application'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="maker"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Business name *</label>
                    <input type="text" required value={makerForm.business_name} onChange={e => setMakerForm(p => ({ ...p, business_name: e.target.value }))} className={inputClass} placeholder="The Clay Studio" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Contact name *</label>
                    <input type="text" required value={makerForm.contact_name} onChange={e => setMakerForm(p => ({ ...p, contact_name: e.target.value }))} className={inputClass} placeholder="Jane Smith" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Email *</label>
                  <input type="email" required value={makerForm.email} onChange={e => setMakerForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="hello@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Craft type *</label>
                  <select required value={makerForm.category} onChange={e => setMakerForm(p => ({ ...p, category: e.target.value }))} className={selectClass}>
                    <option value="">Select a craft…</option>
                    {CRAFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Location *</label>
                  <input type="text" required value={makerForm.location} onChange={e => setMakerForm(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Farnham, Surrey" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/70">Brief description *</label>
                  <textarea rows={4} required value={makerForm.description} onChange={e => setMakerForm(p => ({ ...p, description: e.target.value }))} className={inputClass + ' resize-none'} placeholder="Tell us about your craft, your materials, and what you make…" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Website <span className="font-normal opacity-50">(optional)</span></label>
                    <input type="url" value={makerForm.website} onChange={e => setMakerForm(p => ({ ...p, website: e.target.value }))} className={inputClass} placeholder="https://yoursite.co.uk" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-brand-ink/70">Social media handle <span className="font-normal opacity-50">(optional)</span></label>
                    <input type="text" value={makerForm.social} onChange={e => setMakerForm(p => ({ ...p, social: e.target.value }))} className={inputClass} placeholder="@yourcraftname" />
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

                <button type="submit" disabled={submitting} className="w-full py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : 'Submit my application'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </section>
    </div>
  );
};
