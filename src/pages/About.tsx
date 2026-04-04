import React from 'react';
import { Heart, Radio, Users, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
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
            We Tell the Stories That <span className="italic text-brand-olive">Matter</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brand-ink/70 max-w-2xl leading-relaxed"
          >
            Heritage Craft Media is a community-driven media organisation dedicated to celebrating makers, heritage crafts, and the communities that keep these traditions alive.
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
              <h2 className="text-4xl font-serif text-brand-ink mb-6">Our Mission</h2>
              <p className="text-brand-ink/70 leading-relaxed mb-6">
                We believe that heritage skills and craft traditions deserve to be heard, seen, and celebrated. Through community radio, long-form storytelling, and a growing network of members, we connect audiences with the people who make, build, and create.
              </p>
              <p className="text-brand-ink/70 leading-relaxed">
                Whether it's a blacksmith in a rural workshop, a weaver preserving generations of knowledge, or a community garden growing its own future — we're here to tell those stories with care and intention.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { icon: <Radio size={24} />, label: 'Community Radio' },
                { icon: <BookOpen size={24} />, label: 'Maker Stories' },
                { icon: <Users size={24} />, label: 'Member Network' },
                { icon: <Heart size={24} />, label: 'Community First' },
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

      {/* Join CTA */}
      <section className="py-24 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif text-brand-ink mb-6">Get Involved</h2>
            <p className="text-brand-ink/60 mb-8 max-w-xl mx-auto leading-relaxed">
              We're always looking for makers, storytellers, and community members who want to be part of what we're building.
            </p>
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all"
            >
              Join Heritage Craft Media
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
