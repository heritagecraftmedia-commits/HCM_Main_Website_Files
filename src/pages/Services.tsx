import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Camera, Tv2, Globe, Share2, Palette, BarChart2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: <Share2 size={28} />,
    title: 'Social Media Management',
    desc: 'We handle your Instagram, Facebook, and TikTok — strategy, content creation, scheduling, and engagement.',
    features: ['Monthly content plan', 'Designed posts + captions', 'Story and reel creation', 'Community management'],
  },
  {
    icon: <Tv2 size={28} />,
    title: 'Video Production',
    desc: 'Professional videos that show your craft, your process, and your story — filmed and edited for you.',
    features: ['On-location filming', 'Professional editing', 'Short-form social cuts', 'YouTube-ready long-form'],
  },
  {
    icon: <Camera size={28} />,
    title: 'Product Photography',
    desc: 'Studio-quality photographs of your work, ready for your shop, website, and social channels.',
    features: ['White background shots', 'Lifestyle photography', 'Detail and close-up shots', 'High-res delivery'],
  },
  {
    icon: <Globe size={28} />,
    title: 'Website Design',
    desc: 'A professional website built to sell your work and tell your story — designed around your brand.',
    features: ['Custom design', 'Mobile-first', 'Shop integration', 'Ongoing support'],
  },
  {
    icon: <Palette size={28} />,
    title: 'Branding & Identity',
    desc: 'Logo, colour palette, fonts, and brand guidelines that reflect the quality of your craft.',
    features: ['Logo design', 'Brand guidelines', 'Business card design', 'Social profile assets'],
  },
  {
    icon: <BarChart2 size={28} />,
    title: 'Custom Strategy',
    desc: 'A bespoke digital strategy session — we audit what you have, identify the gaps, and build you a plan.',
    features: ['1:1 strategy session', 'Full digital audit', 'Prioritised action plan', 'Follow-up review'],
  },
];

export default function Services() {
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
            Our Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-brand-ink leading-tight mb-8 max-w-3xl"
          >
            Done For You — <span className="italic text-brand-olive">Properly</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brand-ink/70 max-w-2xl leading-relaxed"
          >
            Hand your media over to a team that understands craft businesses. We handle the content, you focus on the work.
          </motion.p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#F5F0E8] rounded-3xl p-8 flex flex-col gap-4"
              >
                <div className="w-12 h-12 bg-brand-olive/10 rounded-2xl flex items-center justify-center text-brand-olive">
                  {service.icon}
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-ink">{service.title}</h3>
                <p className="text-brand-ink/60 text-sm leading-relaxed">{service.desc}</p>
                <ul className="space-y-2 mt-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-brand-ink/70">
                      <Check size={14} className="text-brand-olive shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/get-started"
                  className="mt-auto pt-4 text-sm font-bold text-brand-olive flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Enquire <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-ink text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-serif mb-4">Not sure which service you need?</h2>
            <p className="text-brand-cream/60 mb-8 leading-relaxed">
              Start with a free discovery call. We'll look at your current situation and tell you exactly what would make the biggest difference.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all"
            >
              Book a Discovery Call <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
