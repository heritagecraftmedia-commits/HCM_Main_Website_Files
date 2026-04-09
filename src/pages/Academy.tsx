import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, GraduationCap, Play, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const courses = [
  {
    title: 'Social Media for Craft Businesses',
    description: 'Build a consistent, professional social presence that attracts customers and tells your story.',
    category: 'Social Media',
    lessons: 12,
    isFree: false,
    price: '£49',
  },
  {
    title: 'Phone Video Masterclass',
    description: 'Film and edit professional-quality videos of your work using only your smartphone.',
    category: 'Video',
    lessons: 8,
    isFree: false,
    price: '£39',
  },
  {
    title: 'Craft Business Branding Basics',
    description: 'Develop a brand identity that reflects the quality of your work and stands out online.',
    category: 'Branding',
    lessons: 6,
    isFree: true,
    price: 'Free',
  },
  {
    title: 'Writing About Your Work',
    description: 'Learn to describe what you make in a way that connects with buyers and builds trust.',
    category: 'Copywriting',
    lessons: 5,
    isFree: false,
    price: '£29',
  },
  {
    title: 'Setting Up Your Online Shop',
    description: 'A step-by-step guide to launching on Etsy, Not On The High Street, or your own website.',
    category: 'E-Commerce',
    lessons: 10,
    isFree: false,
    price: '£45',
  },
  {
    title: 'The Digital Apprentice Starter Pack',
    description: 'Everything a new craft business needs to get online — in one focused programme.',
    category: 'Getting Started',
    lessons: 15,
    isFree: false,
    price: '£79',
  },
];

export default function Academy() {
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
            HCM Academy
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-brand-ink leading-tight mb-8 max-w-3xl"
          >
            Learn to Grow Your <span className="italic text-brand-olive">Craft Business</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brand-ink/70 max-w-2xl leading-relaxed"
          >
            Practical online courses built specifically for artisans and independent makers. No jargon. No fluff. Just the skills you need to get visible and sell more.
          </motion.p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif text-brand-ink mb-12">All Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#F5F0E8] rounded-3xl p-8 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-olive">{course.category}</span>
                  {course.isFree ? (
                    <span className="text-xs font-bold bg-brand-olive text-white px-3 py-1 rounded-full">Free</span>
                  ) : (
                    <span className="text-xs font-bold text-brand-ink/50">{course.price}</span>
                  )}
                </div>
                <h3 className="text-xl font-serif font-bold text-brand-ink">{course.title}</h3>
                <p className="text-brand-ink/60 text-sm leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-2 text-xs text-brand-ink/40 mt-auto pt-2 border-t border-brand-olive/10">
                  <Play size={12} /> {course.lessons} lessons
                </div>
                <button className="w-full py-3 rounded-full font-bold text-sm bg-brand-olive text-white hover:bg-brand-olive/90 transition-all flex items-center justify-center gap-2">
                  {course.isFree ? (
                    <><Play size={16} /> Start Free</>
                  ) : (
                    <><Lock size={16} /> Enrol — {course.price}</>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-olive text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap size={40} className="mx-auto mb-6 opacity-60" />
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Not sure where to start?</h2>
          <p className="text-brand-cream/70 mb-8 max-w-xl mx-auto">
            Tell us about your business and we'll recommend the right starting point.
          </p>
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-cream text-brand-olive rounded-full font-bold hover:bg-white transition-all"
          >
            Get a Recommendation <ArrowRight size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
}
