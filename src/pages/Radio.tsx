import React, { useState, useEffect } from 'react';
import { Radio as RadioIcon, Play, Calendar, Clock, Music, Info, X } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface DbShow {
  id: string;
  title: string;
  host: string;
  time_slot: string;
  status: string;
}

type ApplyStatus = 'idle' | 'loading' | 'success' | 'error';

export const Radio: React.FC = () => {
  const [shows, setShows] = useState<DbShow[]>([]);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', show_idea: '' });
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');

  useEffect(() => {
    supabase
      .from('radio_shows')
      .select('id, title, host, time_slot, status')
      .in('status', ['live', 'planned'])
      .order('created_at')
      .then(({ data }) => setShows(data || []));
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyStatus('loading');
    const { error } = await supabase.from('radio_applications').insert({
      name: applyForm.name,
      email: applyForm.email,
      show_idea: applyForm.show_idea,
      status: 'pending',
    });
    if (error) {
      setApplyStatus('error');
    } else {
      setApplyStatus('success');
      setApplyForm({ name: '', email: '', show_idea: '' });
    }
  };

  return (
    <div className="py-16 md:py-24 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif mb-6">Community <span className="italic text-brand-olive">Radio</span></h1>
          <p className="text-xl text-brand-ink/70 max-w-2xl">
            Broadcasting local stories, producer spotlights, and the sounds of our community. Powered by Live365.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Player Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-brand-ink text-brand-cream rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-olive/20 blur-[100px] rounded-full -mr-32 -mt-32"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Live Now</span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                  <div className="w-48 h-48 bg-brand-olive rounded-3xl flex items-center justify-center shadow-inner overflow-hidden">
                    <img
                      src="https://picsum.photos/seed/radio/400/400"
                      alt="Now Playing"
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-serif mb-4">The Morning Harvest</h2>
                    <p className="text-brand-cream/60 text-lg mb-8">with Scott Andrew & Guests</p>
                    <div className="flex items-center justify-center md:justify-start gap-6">
                      <button className="w-20 h-20 rounded-full bg-brand-cream text-brand-ink flex items-center justify-center hover:scale-105 transition-transform">
                        <Play size={32} fill="currentColor" />
                      </button>
                      <div className="h-1 w-32 md:w-64 bg-brand-cream/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                          className="h-full bg-brand-olive"
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-brand-cream/10 flex flex-wrap gap-8 text-sm opacity-60">
                  <div className="flex items-center gap-2">
                    <Music size={16} />
                    <span>Acoustic Folk Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioIcon size={16} />
                    <span>128kbps Stereo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live365 Embed Player */}
            <div className="bg-white rounded-[32px] p-6 border border-brand-olive/5 overflow-hidden">
              {/* Replace LIVE365_STATION_ID with your actual Live365 station ID */}
              <iframe
                src="https://player.live-365.com/a_LIVE365_STATION_ID"
                title="Live365 Radio Player"
                width="100%"
                height="100"
                frameBorder="0"
                scrolling="no"
                allow="autoplay"
                className="rounded-2xl"
              />
            </div>

            {/* Upcoming Shows */}
            <div className="bg-white rounded-[32px] p-8 md:p-12 border border-brand-olive/5">
              <h3 className="text-3xl font-serif mb-8 flex items-center gap-4">
                <Calendar className="text-brand-olive" /> Upcoming Shows
              </h3>
              {shows.length === 0 ? (
                <p className="text-brand-ink/40 text-sm py-4">No shows scheduled yet — check back soon.</p>
              ) : (
                <div className="space-y-6">
                  {shows.map((show) => (
                    <div key={show.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-brand-cream transition-colors group">
                      <div className="text-brand-olive font-bold flex items-center gap-2">
                        <Clock size={16} />
                        <span>{show.time_slot}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{show.title}</h4>
                        <p className="text-sm text-brand-ink/50">Hosted by {show.host}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-olive">
                        <Info size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-brand-olive text-white rounded-[32px] p-8">
              <h3 className="text-2xl font-serif mb-4">Support Our Radio</h3>
              <p className="text-white/70 mb-8 leading-relaxed">
                Our community radio is 100% non-profit. Your donations and memberships keep us on the air.
              </p>
              <button className="w-full py-4 bg-white text-brand-olive rounded-full font-bold hover:bg-brand-cream transition-all">
                Become a Member
              </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-brand-olive/5">
              <h3 className="text-2xl font-serif mb-6">Broadcasting Info</h3>
              <div className="space-y-4 text-sm text-brand-ink/70">
                <p>We broadcast 24/7 via Live365. Our programming is focused on local food, community stories, and inclusive education.</p>
                <p>Want to host a show? We provide full training for stroke survivors and people with disabilities.</p>
                <button
                  onClick={() => { setShowApply(true); setApplyStatus('idle'); }}
                  className="text-brand-olive font-bold mt-4 underline underline-offset-4"
                >
                  Apply to Present
                </button>
              </div>
            </div>

            {/* Apply to Present Form */}
            {showApply && (
              <div className="bg-white rounded-[32px] p-8 border border-brand-olive/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif">Apply to Present</h3>
                  <button
                    onClick={() => { setShowApply(false); setApplyStatus('idle'); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-cream"
                  >
                    <X size={16} />
                  </button>
                </div>

                {applyStatus === 'success' ? (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-3">🎙️</div>
                    <p className="font-bold text-brand-olive mb-1">Application sent!</p>
                    <p className="text-sm text-brand-ink/60">We'll be in touch soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-ink/50 mb-1.5 uppercase tracking-wide">Your Name *</label>
                      <input
                        required
                        value={applyForm.name}
                        onChange={e => setApplyForm({ ...applyForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm"
                        placeholder="Scott Andrew"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-ink/50 mb-1.5 uppercase tracking-wide">Email *</label>
                      <input
                        required
                        type="email"
                        value={applyForm.email}
                        onChange={e => setApplyForm({ ...applyForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-ink/50 mb-1.5 uppercase tracking-wide">Your Show Idea *</label>
                      <textarea
                        required
                        rows={3}
                        value={applyForm.show_idea}
                        onChange={e => setApplyForm({ ...applyForm, show_idea: e.target.value })}
                        className="w-full px-4 py-3 bg-brand-cream/50 rounded-2xl border border-brand-olive/10 focus:outline-none focus:ring-2 focus:ring-brand-olive/20 text-sm resize-none"
                        placeholder="Tell us about the show you'd like to host..."
                      />
                    </div>
                    {applyStatus === 'error' && (
                      <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                    )}
                    <button
                      type="submit"
                      disabled={applyStatus === 'loading'}
                      className="w-full py-3 bg-brand-olive text-white rounded-full font-bold text-sm hover:bg-brand-olive/90 transition-all disabled:opacity-60"
                    >
                      {applyStatus === 'loading' ? 'Sending…' : 'Send Application'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
