import React, { useState, useEffect } from 'react';
import { User, LogOut, ExternalLink, Edit, FileText, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Listing {
  id: string;
  vendor_name: string;
  craft_category: string;
  location: string;
  bio: string;
  website: string | null;
  approved: boolean;
  published: boolean;
}

interface Application {
  id: string;
  business_name: string;
  status: string;
  created_at: string;
}

export const Members: React.FC = () => {
  const { user, logout } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Check for claimed listing
    supabase
      .from('claimed_vendors')
      .select('id, vendor_name, craft_category, location, bio, website, approved, published')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setListing(data ?? null);
        setLoadingListing(false);
      });

    // Check for pending application
    supabase
      .from('producer_applications')
      .select('id, business_name, status, created_at')
      .eq('email', user.id) // best effort — email not on user obj; fall back to show nothing
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setApplication(data);
      });
  }, [user?.id]);

  const statusColour = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="bg-brand-cream min-h-screen py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-14 gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif mb-3">Members <span className="italic text-brand-olive">Area</span></h1>
            <p className="text-brand-ink/60 text-lg">
              Welcome back, <strong>{user?.name || 'member'}</strong>.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-brand-olive/20 text-brand-ink/60 rounded-full text-sm font-bold hover:border-brand-olive hover:text-brand-olive transition-all"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <div className="space-y-8">

          {/* Listing section */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-brand-ink/70">Your Listing</h2>

            {loadingListing ? (
              <div className="bg-white rounded-[32px] p-8 border border-brand-olive/5 animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ) : listing ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 border border-brand-olive/5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-serif mb-1">{listing.vendor_name}</h3>
                    <p className="text-sm text-brand-ink/50">{listing.craft_category} · {listing.location}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${listing.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {listing.approved ? '✓ Approved' : 'Pending approval'}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${listing.published ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {listing.published ? 'Published' : 'Not published'}
                    </span>
                  </div>
                </div>
                {listing.bio && (
                  <p className="text-brand-ink/70 text-sm leading-relaxed mb-6">{listing.bio}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  <a href="/directory" className="flex items-center gap-2 px-5 py-2.5 bg-brand-cream rounded-full text-sm font-bold text-brand-olive hover:bg-brand-olive/10 transition-all">
                    <ExternalLink size={14} /> View in directory
                  </a>
                  <a href="/claim/edit" className="flex items-center gap-2 px-5 py-2.5 bg-brand-olive text-white rounded-full text-sm font-bold hover:bg-brand-olive/90 transition-all">
                    <Edit size={14} /> Edit listing
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 border border-dashed border-brand-olive/20 text-center space-y-4"
              >
                <div className="w-14 h-14 bg-brand-olive/10 rounded-full flex items-center justify-center mx-auto">
                  <User size={24} className="text-brand-olive" />
                </div>
                <h3 className="text-xl font-serif">No listing yet</h3>
                <p className="text-brand-ink/60 text-sm leading-relaxed max-w-sm mx-auto">
                  You don't have a listing on the directory yet. Apply to join and we'll be in touch within 5 working days.
                </p>
                <a
                  href="/apply"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-olive text-white rounded-full text-sm font-bold hover:bg-brand-olive/90 transition-all"
                >
                  Apply to join the directory <ArrowRight size={14} />
                </a>
              </motion.div>
            )}
          </section>

          {/* Application status */}
          {application && (
            <section>
              <h2 className="text-xl font-bold mb-4 text-brand-ink/70">Application Status</h2>
              <div className="bg-white rounded-[32px] p-6 border border-brand-olive/5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-olive">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-bold">{application.business_name}</p>
                    <p className="text-xs text-brand-ink/50 flex items-center gap-1 mt-0.5">
                      <Clock size={11} /> Submitted {new Date(application.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${statusColour(application.status)}`}>
                  {application.status}
                </span>
              </div>
            </section>
          )}

          {/* Quick links */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-brand-ink/70">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Food Directory', href: '/directory', desc: 'Browse all local producers' },
                { label: 'What\'s On', href: '/whats-on', desc: 'Upcoming events and markets' },
                { label: 'Resources', href: '/resources', desc: 'Guides and downloads' },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="bg-white rounded-[24px] p-6 border border-brand-olive/5 shadow-sm hover:shadow-md hover:border-brand-olive/20 transition-all group"
                >
                  <h3 className="font-bold mb-1 group-hover:text-brand-olive transition-colors">{link.label}</h3>
                  <p className="text-sm text-brand-ink/50">{link.desc}</p>
                </a>
              ))}
            </div>
          </section>

          {/* HCM team message */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-brand-ink/70">From the HCM Team</h2>
            <div className="bg-brand-olive text-brand-cream rounded-[32px] p-8 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold uppercase tracking-wide opacity-70">Message from Scott</span>
              </div>
              <p className="leading-relaxed opacity-90">
                Thank you for being part of Heritage Craft Media. We're growing every week — more makers
                joining, more stories being told, and the radio studio getting closer. Don't hesitate to share your feedback.
              </p>
              <a href="/feedback" className="inline-block mt-2 text-sm font-bold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity">
                Leave feedback →
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
