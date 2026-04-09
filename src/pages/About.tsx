import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Tv2, GraduationCap, BarChart2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
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
            About Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-brand-ink leading-tight mb-8 max-w-3xl"
          >
            Media Built for <span className="italic text-brand-olive">Craft Businesses</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brand-ink/70 max-w-2xl leading-relaxed"
          >
            Heritage Craft Media is a specialist media and education company. We work exclusively with artisans, independent makers, and heritage craft businesses to help them build a professional digital presence.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif text-brand-ink mb-6">Why We Exist</h2>
              <p className="text-brand-ink/70 leading-relaxed mb-6">
                Talented craft businesses are invisible online — not because their work isn't good enough, but because nobody taught them how to show it. Most can't afford a full agency, and most generic marketing courses weren't built with their world in mind.
              </p>
              <p className="text-brand-ink/70 leading-relaxed">
                We built Heritage Craft Media to fix that. Every service, every course, and every resource we produce is designed specifically for people who make things with their hands and want to build a business around it.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: <Tv2 size={24} />, label: 'Video Production' },
                { icon: <GraduationCap size={24} />, label: 'Online Education' },
                { icon: <BarChart2 size={24} />, label: 'Digital Strategy' },
                { icon: <Globe size={24} />, label: 'Social Media' },
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-3xl bg-[#F5F0E8] flex flex-col gap-3">
                  <div className="w-10 h-10 bg-brand-olive/10 rounded-xl flex items-center justify-center text-brand-olive">
                    {item.icon}
                  </div>
                  <span className="font-bold text-brand-ink text-sm">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-24 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-serif text-brand-ink mb-6">About the Founder</h2>
              <p className="text-brand-ink/70 leading-relaxed mb-6">
                Heritage Craft Media was founded by Scott Andrew — a media professional and business strategist with a background in content production, digital marketing, and working alongside independent craft businesses across the UK.
              </p>
              <p className="text-brand-ink/70 leading-relaxed mb-8">
                Scott built HCM after seeing first-hand how many skilled makers were struggling to communicate their value online. The mission is simple: give craft businesses the same quality of media support that larger brands take for granted.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif mb-6">Work With Us</h2>
            <p className="text-brand-cream/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Whether you're just getting started or ready to hand over your media entirely — we have a path for you.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-cream text-brand-olive rounded-full font-bold hover:bg-white transition-all"
            >
              Get Started <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
