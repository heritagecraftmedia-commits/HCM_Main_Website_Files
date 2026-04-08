import React from 'react';
import { FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

const resources = [
  {
    id: '1',
    title: 'Getting Started with AI for Craft Businesses',
    description: 'A plain-English introduction to using AI tools to save time and grow your craft business.',
    file_url: null,
  },
  {
    id: '2',
    title: '28-Day AI Bootcamp Guide',
    description: 'Step-by-step guide to building your online presence over 28 days using free and low-cost tools.',
    file_url: null,
  },
  {
    id: '3',
    title: 'Festival & Market Selling Checklist',
    description: 'Everything you need to prepare for your first — or next — craft fair or market stall.',
    file_url: null,
  },
  {
    id: '4',
    title: 'Pricing Your Craft Work',
    description: 'A straightforward guide to pricing handmade goods without underselling your time and skills.',
    file_url: null,
  },
];

export const Resources: React.FC = () => {
  return (
    <div className="bg-brand-cream min-h-screen">

      <section className="py-20 md:py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">Resource <span className="italic">Library</span></h1>
            <p className="text-xl opacity-80 max-w-2xl leading-relaxed">
              Free downloadable guides for artisan makers and heritage craft businesses.
              Plain-English, practical, and built around real craft business challenges.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[24px] p-6 border border-brand-olive/5 shadow-sm flex items-start justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-olive shrink-0 mt-0.5">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-ink mb-1 leading-snug">{resource.title}</h3>
                    <p className="text-sm text-brand-ink/60 leading-relaxed">{resource.description}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-olive/60 bg-brand-olive/10 px-2 py-0.5 rounded-full">
                      {resource.file_url ? 'PDF' : 'Coming Soon'}
                    </span>
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
                  onClick={e => { if (!resource.file_url) e.preventDefault(); }}
                >
                  <Download size={16} />
                </a>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-10 bg-white rounded-[40px] border border-brand-olive/5 text-center space-y-4">
            <h3 className="text-2xl font-serif">Can't find what you're looking for?</h3>
            <p className="text-brand-ink/60 leading-relaxed max-w-md mx-auto">
              Suggest a resource or ask for a specific guide and we'll look into adding it.
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
