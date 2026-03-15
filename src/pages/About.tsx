import React from 'react';
import { Heart, ShieldCheck, Users, Briefcase, Award, Radio, MapPin, Sprout, Link } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  return (
    <div className="bg-brand-cream min-h-screen">

      {/* Hero */}
      <section className="py-24 md:py-32 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-serif mb-8 leading-tight"
            >
              A Community <span className="italic">Interest</span> Company with a <span className="italic">Heart</span>
            </motion.h1>
            <p className="text-xl md:text-2xl opacity-80 leading-relaxed">
              The Farmers Table Hub CIC was founded to bridge the gap between local producers,
              community radio, and inclusive employment — right here in Farnham.
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-brand-earth text-brand-cream py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { stat: '50+', label: 'Local Producers' },
              { stat: '100%', label: 'Reinvested Profits' },
              { stat: 'Inclusive', label: 'Employment Model' },
            ].map((item) => (
              <div key={item.label}>
                <span className="block text-4xl md:text-5xl font-serif mb-1">{item.stat}</span>
                <span className="text-sm font-bold uppercase tracking-widest opacity-70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder story */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif">The Founder's Story</h2>
              <div className="space-y-6 text-lg text-brand-ink/70 leading-relaxed">
                <p>
                  Our founder, Scott Andrew, is a stroke survivor who understands first-hand the challenges of
                  navigating life and work with cognitive fatigue and "mind fog."
                </p>
                <p>
                  After his stroke, Scott realised that many existing systems weren't designed for people with
                  varying capacities. He envisioned a business that was not only resilient but also actively
                  supportive of people in similar situations.
                </p>
                <p>
                  The Farmers Table Hub CIC is the realisation of that vision — a social enterprise that
                  combines a passion for local food with community radio, inclusive training, and a stubborn
                  belief that everyone deserves a place in the local economy.
                </p>
              </div>
            </div>
            <div className="rounded-[40px] overflow-hidden shadow-2xl rotate-2">
              <img
                src="https://picsum.photos/seed/fth-founder/800/1000"
                alt="Scott Andrew, founder of Farmers Table Hub CIC"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Three Pillars</h2>
            <p className="text-xl text-brand-ink/60 max-w-2xl mx-auto">
              Everything we do flows from three interconnected commitments to the Farnham community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Sprout size={32} />,
                title: 'Food Directory',
                desc: 'A living, searchable directory of local producers, growers, and food makers. Connecting people with food they can trust and tracing it back to the people who made it.',
                colour: 'bg-green-50 text-green-700',
              },
              {
                icon: <Radio size={32} />,
                title: 'Community Radio',
                desc: 'A community-owned radio station giving a voice to local makers, producers, and residents. Real stories. Real Farnham. Broadcast by the people who live here.',
                colour: 'bg-amber-50 text-amber-700',
              },
              {
                icon: <Users size={32} />,
                title: 'Inclusive Training',
                desc: 'Paid training pathways for people returning to work — including stroke survivors, single parents, and anyone who\'s been out of the workforce. Flexible, supportive, and real.',
                colour: 'bg-blue-50 text-blue-700',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="p-10 rounded-[32px] bg-brand-cream/60 border border-brand-olive/5 space-y-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${pillar.colour} shadow-sm`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-serif text-center">{pillar.title}</h3>
                <p className="text-brand-ink/70 leading-relaxed text-center">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck size={32} />, title: 'Transparency', desc: 'We operate with an open-book policy. Every penny we make is reinvested back into the community.' },
              { icon: <Users size={32} />, title: 'Inclusivity', desc: 'Our systems are designed for everyone. We provide flexible roles for single parents and people with disabilities.' },
              { icon: <Award size={32} />, title: 'Quality', desc: 'We only feature producers who meet our standards for ethical production and local sourcing.' },
            ].map((value, i) => (
              <div key={i} className="p-10 rounded-[32px] bg-white border border-brand-olive/5 text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-olive mx-auto">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-serif">{value.title}</h3>
                <p className="text-brand-ink/70 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CIC registration */}
      <section className="py-16 bg-brand-olive/5 border-y border-brand-olive/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-serif">Legal & Registration</h2>
          <p className="text-brand-ink/70 leading-relaxed">
            The Farmers Table Hub is a registered Community Interest Company (CIC) in England and Wales.
            As a CIC, we are legally required to demonstrate that our activities benefit the community and
            that our assets are locked for community use.
          </p>
          <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-brand-ink/60">
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-olive" />
              Farnham, Surrey, England
            </span>
            <span className="flex items-center gap-2">
              <Link size={14} className="text-brand-olive" />
              CIC Registration No: <em className="text-brand-ink/40 ml-1">To be confirmed</em>
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-brand-olive" />
              Companies House regulated
            </span>
          </div>
          <p className="text-xs text-brand-ink/40 italic">
            Full registration details will be added once the CIC application is approved.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">The Team</h2>
            <p className="text-xl text-brand-ink/60 max-w-2xl mx-auto">
              Small team, big heart. Everyone here believes in what we're building.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {[
              { name: 'Scott Andrew', role: 'Founder & Director', initials: 'SA', bio: 'Stroke survivor, community builder, and the reason any of this exists.' },
              { name: 'Radio Manager', role: 'Head of Broadcasting', initials: 'RM', bio: 'Keeps the signal going and the community voices on air. Role to be filled — get in touch.' },
              { name: 'Community Coordinator', role: 'Producer Relations', initials: 'CC', bio: 'Connects producers, volunteers, and community members. Role to be filled — get in touch.' },
            ].map((member) => (
              <div key={member.name} className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-brand-olive/10 flex items-center justify-center text-brand-olive font-serif text-2xl mx-auto border-2 border-brand-olive/20">
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-xl font-serif">{member.name}</h3>
                  <p className="text-sm font-bold text-brand-olive/70 uppercase tracking-wide mb-2">{member.role}</p>
                  <p className="text-sm text-brand-ink/60 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-olive text-brand-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif">Want to get involved?</h2>
          <p className="text-xl opacity-80">
            Volunteer, apply to list your produce, or just come and say hello.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/volunteer" className="px-8 py-4 bg-white text-brand-olive rounded-full font-bold hover:bg-brand-cream transition-all">
              Volunteer with us
            </a>
            <a href="/apply" className="px-8 py-4 bg-transparent border-2 border-white/40 text-brand-cream rounded-full font-bold hover:bg-white/10 transition-all">
              Apply to join the directory
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
