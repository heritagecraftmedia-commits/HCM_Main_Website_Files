import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Radio, Users, BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block px-4 py-1 rounded-full bg-brand-olive/10 text-brand-olive text-sm font-bold uppercase tracking-widest mb-6"
            >
              Heritage Craft Media
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-serif text-brand-ink leading-[0.9] mb-8"
            >
              Celebrating <span className="italic">Craft</span> &amp; <span className="italic text-brand-olive">Community</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-brand-ink/70 mb-12 leading-relaxed max-w-2xl"
            >
              Heritage Craft Media tells the stories of makers, craftspeople, and communities — through radio, storytelling, and media that matters.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6"
            >
              <Link
                to="/about"
                className="px-8 py-4 bg-brand-olive text-white rounded-full font-bold flex items-center gap-2 hover:bg-brand-olive/90 transition-all shadow-lg shadow-brand-olive/20"
              >
                Our Story <ArrowRight size={20} />
              </Link>
              <Link
                to="/radio"
                className="px-8 py-4 bg-white text-brand-olive border border-brand-olive/20 rounded-full font-bold flex items-center gap-2 hover:bg-brand-cream transition-all"
              >
                Community Radio <Radio size={20} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-brand-ink mb-16"
          >
            What We Do
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Radio size={28} />,
                title: 'Community Radio',
                desc: 'Broadcasting stories, music, and conversations that connect communities and celebrate local voices.',
                link: '/radio',
              },
              {
                icon: <BookOpen size={28} />,
                title: 'Maker Stories',
                desc: 'In-depth storytelling about the craftspeople and makers who keep heritage skills alive.',
                link: '/resources',
              },
              {
                icon: <Users size={28} />,
                title: 'Community Hub',
                desc: 'A space for members to connect, collaborate, and grow together around shared craft and culture.',
                link: '/join',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-[#F5F0E8] flex flex-col gap-4"
              >
                <div className="w-12 h-12 bg-brand-olive/10 rounded-2xl flex items-center justify-center text-brand-olive">
                  {item.icon}
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-ink">{item.title}</h3>
                <p className="text-brand-ink/60 leading-relaxed">{item.desc}</p>
                <Link
                  to={item.link}
                  className="mt-auto text-sm font-bold text-brand-olive flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart size={40} className="mx-auto mb-6 opacity-60" />
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Be Part of the Story</h2>
            <p className="text-xl text-brand-cream/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join Heritage Craft Media and help us celebrate the makers, skills, and stories that define our communities.
            </p>
            <Link
              to="/join"
              className="inline-flex items-center gap-2 px-10 py-5 bg-brand-cream text-brand-olive rounded-full font-bold text-lg hover:bg-white transition-all shadow-lg"
            >
              Join the Community <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
