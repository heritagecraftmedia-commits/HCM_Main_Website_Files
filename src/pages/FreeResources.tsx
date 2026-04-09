import React from 'react';
import { motion } from 'motion/react';
import { Download, FileText, CheckSquare, Video, BookOpen } from 'lucide-react';

const resources = [
  {
    icon: <CheckSquare size={20} />,
    category: 'Checklist',
    title: 'Social Media Setup Checklist',
    desc: 'Everything you need to set up your craft business profiles on Instagram, Facebook, and TikTok — done right from the start.',
    type: 'PDF',
  },
  {
    icon: <FileText size={20} />,
    category: 'Guide',
    title: 'How to Write a Bio That Sells',
    desc: 'A simple formula for writing your social media bio — so the right customers know exactly what you do and why they should buy from you.',
    type: 'PDF',
  },
  {
    icon: <CheckSquare size={20} />,
    category: 'Checklist',
    title: 'Product Photography Checklist',
    desc: 'Get consistent, professional-looking product photos using only your phone. Lighting, angles, backgrounds — all covered.',
    type: 'PDF',
  },
  {
    icon: <BookOpen size={20} />,
    category: 'Guide',
    title: 'The Craft Business Content Calendar',
    desc: 'A 30-day content plan template with post ideas designed specifically for makers and artisans.',
    type: 'PDF',
  },
  {
    icon: <Video size={20} />,
    category: 'Video',
    title: 'Film Your Process — Beginner Workshop',
    desc: 'A free 20-minute video workshop on filming your making process for social media using your phone.',
    type: 'Video',
  },
  {
    icon: <FileText size={20} />,
    category: 'Guide',
    title: 'Pricing Your Craft Work Fairly',
    desc: 'A straightforward guide to working out what to charge — without underselling yourself or scaring customers away.',
    type: 'PDF',
  },
];

export default function FreeResources() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="py-24 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1 rounded-full bg-brand-olive/10 text-brand-olive text-sm font-bold uppercase tracking-widest mb-6"
          >
            Free Resources
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-brand-ink leading-tight mb-8 max-w-3xl"
          >
            Tools to Help You <span className="italic text-brand-olive">Get Started</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brand-ink/70 max-w-2xl leading-relaxed"
          >
            Guides, checklists, and templates for craft businesses — completely free. No email required.
          </motion.p>
        </div>
      </section>

      {/* Resources */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#F5F0E8] rounded-3xl p-8 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-olive">
                    {resource.icon} {resource.category}
                  </span>
                  <span className="text-xs font-bold text-brand-ink/30 bg-white px-2 py-1 rounded-full">
                    {resource.type}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-brand-ink">{resource.title}</h3>
                <p className="text-brand-ink/60 text-sm leading-relaxed">{resource.desc}</p>
                <button className="mt-auto flex items-center gap-2 text-sm font-bold text-brand-olive hover:gap-3 transition-all">
                  <Download size={16} /> Download Free
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade nudge */}
      <section className="py-20 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Want to go deeper?</h2>
          <p className="text-brand-cream/70 mb-8 max-w-xl mx-auto">
            The HCM Academy takes you step by step through everything a craft business needs to grow online.
          </p>
          <a
            href="/academy"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-cream text-brand-olive rounded-full font-bold hover:bg-white transition-all"
          >
            Explore the Academy
          </a>
        </div>
      </section>

    </div>
  );
}
