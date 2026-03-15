import React, { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, Sprout, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string | null;
}

export const Resources: React.FC = () => {
  const [producers, setProducers] = useState<Resource[]>([]);
  const [community, setCommunity] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ftf_resources')
      .select('id, title, description, category, file_url')
      .eq('is_active', true)
      .order('created_at')
      .then(({ data }) => {
        if (data) {
          setProducers(data.filter(r => r.category === 'producers'));
          setCommunity(data.filter(r => r.category === 'community'));
        }
        setLoading(false);
      });
  }, []);

  const ResourceCard: React.FC<{ resource: Resource; index: number }> = ({ resource, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-[24px] p-6 border border-brand-olive/5 shadow-sm flex items-start justify-between gap-4 group hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-olive shrink-0 mt-0.5">
          <FileText size={18} />
        </div>
        <div>
          <h3 className="font-bold text-brand-ink mb-1 leading-snug">{resource.title}</h3>
          <p className="text-sm text-brand-ink/60 leading-relaxed">{resource.description}</p>
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-olive/60 bg-brand-olive/10 px-2 py-0.5 rounded-full">PDF</span>
        </div>
      </div>
      <a
        href={resource.file_url ?? '#'}
        target={resource.file_url ? '_blank' : undefined}
        rel="noopener noreferrer"
        className={`shrink-0 mt-1 p-2.5 rounded-xl transition-all ${
          resource.file_url
            ? 'bg-brand-olive/10 text-brand-olive hover:bg-brand-olive hover:text-white'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
        title={resource.file_url ? 'Download' : 'Coming soon'}
        onClick={e => { if (!resource.file_url) e.preventDefault(); }}
      >
        <Download size={16} />
      </a>
    </motion.div>
  );

  const SkeletonCard = () => (
    <div className="bg-white rounded-[24px] p-6 border border-brand-olive/5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-brand-cream min-h-screen">

      {/* Hero */}
      <section className="py-20 md:py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">Resource <span className="italic">Library</span></h1>
            <p className="text-xl opacity-80 max-w-2xl leading-relaxed">
              Free downloadable guides for producers and community members. Practical, plain-English,
              and updated regularly as the hub grows.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Update notice */}
      <div className="bg-brand-earth/10 border-b border-brand-earth/20 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-brand-earth">
          <RefreshCw size={14} />
          Resources updated regularly — check back soon for new guides.
        </div>
      </div>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* For Producers */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                  <Sprout size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif">For Producers</h2>
              </div>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : producers.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)
                }
              </div>
            </div>

            {/* For Community */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Users size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif">For Community Members</h2>
              </div>
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : community.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)
                }
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="mt-20 p-10 bg-white rounded-[40px] border border-brand-olive/5 text-center space-y-4">
            <h3 className="text-2xl font-serif">Can't find what you're looking for?</h3>
            <p className="text-brand-ink/60 leading-relaxed max-w-md mx-auto">
              Suggest a resource or ask for a specific guide and we'll look into it.
            </p>
            <a
              href="/feedback"
              className="inline-block px-8 py-3.5 bg-brand-olive text-white rounded-full font-bold text-sm hover:bg-brand-olive/90 transition-all"
            >
              Request a resource
            </a>
          </div>

        </div>
      </section>

    </div>
  );
};
