import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, GraduationCap, Tv2, Gift, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative py-24 md:py-36 bg-[#F5F0E8] overflow-hidden">
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
              Grow Your <span className="italic text-brand-olive">Craft</span> Business
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-brand-ink/70 mb-12 leading-relaxed max-w-2xl"
            >
              Heritage Craft Media helps artisans and independent craft businesses build their presence online — through professional media, education, and done-for-you digital strategy.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/get-started"
                className="px-8 py-4 bg-brand-olive text-white rounded-full font-bold flex items-center gap-2 hover:bg-brand-olive/90 transition-all shadow-lg shadow-brand-olive/20"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link
                to="/academy"
                className="px-8 py-4 bg-white text-brand-olive border border-brand-olive/20 rounded-full font-bold flex items-center gap-2 hover:bg-brand-cream transition-all"
              >
                Explore the Academy <GraduationCap size={20} />
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
            className="text-4xl md:text-5xl font-serif text-brand-ink mb-4"
          >
            Everything You Need to Grow
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-brand-ink/60 text-lg mb-16 max-w-2xl"
          >
            From learning the basics to having a full team handle your media — we've got a path for every stage.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <GraduationCap size={28} />,
                title: 'HCM Academy',
                desc: 'Online courses built for craft businesses — social media, video, branding, and more. Learn at your own pace.',
                link: '/academy',
                cta: 'Browse Courses',
              },
              {
                icon: <Tv2 size={28} />,
                title: 'Done-For-You Services',
                desc: 'Our team handles your social media, video production, photography, and website so you can focus on your craft.',
                link: '/services',
                cta: 'See Services',
              },
              {
                icon: <Gift size={28} />,
                title: 'Free Resources',
                desc: 'Guides, templates, and checklists to help you take your first steps — no cost, no catch.',
                link: '/free-resources',
                cta: 'Download Free',
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
                  {item.cta} <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif text-brand-ink mb-16 text-center"
          >
            Built for People Who Make Things
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "I went from zero social presence to booking clients through Instagram within 3 months of joining the Academy.",
                name: "Sarah T.",
                craft: "Ceramics",
              },
              {
                quote: "The HCM team handled everything — filming, editing, posting. I just focused on my work and watched my following grow.",
                name: "James R.",
                craft: "Woodworking",
              },
              {
                quote: "The free resources alone gave me a proper strategy. I didn't even need to pay for anything to get started.",
                name: "Anika M.",
                craft: "Textiles",
              },
            ].map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl flex flex-col gap-4"
              >
                <div className="flex gap-1 text-brand-olive">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-brand-ink/70 leading-relaxed italic">"{item.quote}"</p>
                <div className="mt-auto pt-4 border-t border-brand-olive/10">
                  <p className="font-bold text-brand-ink text-sm">{item.name}</p>
                  <p className="text-brand-ink/40 text-xs">{item.craft}</p>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to Start?</h2>
            <p className="text-xl text-brand-cream/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Tell us where you are now and we'll show you the fastest route to growing your craft business online.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 px-10 py-5 bg-brand-cream text-brand-olive rounded-full font-bold text-lg hover:bg-white transition-all shadow-lg"
            >
              Get Started Today <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
