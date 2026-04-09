import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, BookOpen, BarChart2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Members: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="py-16 md:py-24 bg-brand-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-serif text-brand-ink"
            >
              Welcome back
            </motion.h1>
            {user?.email && (
              <p className="text-brand-ink/50 mt-1 text-sm">{user.email}</p>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-ink/50 hover:text-brand-ink transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <GraduationCap size={24} />,
              title: 'My Courses',
              desc: 'Continue learning in the HCM Academy',
              link: '/academy',
            },
            {
              icon: <BookOpen size={24} />,
              title: 'Resources',
              desc: 'Access your downloads and guides',
              link: '/free-resources',
            },
            {
              icon: <BarChart2 size={24} />,
              title: 'My Progress',
              desc: 'Track your learning and goals',
              link: '/studentdashboard',
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border border-brand-olive/10 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-brand-olive/10 rounded-xl flex items-center justify-center text-brand-olive">
                {item.icon}
              </div>
              <h3 className="font-bold text-brand-ink">{item.title}</h3>
              <p className="text-sm text-brand-ink/50 leading-relaxed">{item.desc}</p>
              <Link
                to={item.link}
                className="mt-auto text-sm font-bold text-brand-olive flex items-center gap-1 hover:gap-2 transition-all"
              >
                Go <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Upgrade prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-brand-olive text-brand-cream rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-2xl font-serif mb-2">Want done-for-you media?</h2>
            <p className="text-brand-cream/70 max-w-md">
              Upgrade to a HCM Services plan and our team handles your social media, video production, and more.
            </p>
          </div>
          <Link
            to="/services"
            className="shrink-0 px-6 py-3 bg-brand-cream text-brand-olive rounded-full font-bold hover:bg-white transition-all"
          >
            See Services
          </Link>
        </motion.div>

      </div>
    </div>
  );
};
