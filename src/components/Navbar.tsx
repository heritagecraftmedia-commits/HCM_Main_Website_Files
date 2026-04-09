import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const desktopLinks = [
    { name: 'Academy', path: '/academy' },
    { name: 'Services', path: '/services' },
    { name: 'Resources', path: '/free-resources' },
    { name: 'About', path: '/about' },
  ];

  const allMenuLinks = [
    { name: 'Home', path: '/' },
    { name: 'Academy', path: '/academy' },
    { name: 'Services', path: '/services' },
    { name: 'Free Resources', path: '/free-resources' },
    { name: 'About', path: '/about' },
    { name: 'Get Started', path: '/get-started' },
  ];

  return (
    <nav className="bg-brand-cream border-b border-brand-olive/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl md:text-2xl font-bold text-brand-olive tracking-tight">
              Heritage Craft Media
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-bold transition-colors hover:text-brand-olive ${
                  location.pathname === link.path
                    ? 'text-brand-olive underline underline-offset-8'
                    : 'text-brand-ink/70'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-olive text-white rounded-full text-sm font-bold hover:bg-brand-olive/90 transition-all"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            ) : (
              <Link
                to="/get-started"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-olive text-white rounded-full text-sm font-bold hover:bg-brand-olive/90 transition-all"
              >
                Get Started
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-brand-ink/70 hover:bg-brand-olive/10 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1 px-4 py-2 bg-brand-olive text-white rounded-full text-sm font-bold"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-4 py-2 bg-brand-olive text-white rounded-full text-sm font-bold"
              >
                <LogIn size={14} /> Sign In
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-brand-ink/70 hover:bg-brand-olive/10 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 right-0 bg-brand-cream border-b border-brand-olive/10 z-40 shadow-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 gap-2 mb-8">
                {allMenuLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-bold py-3 px-4 rounded-2xl transition-all hover:bg-brand-olive/10 ${
                      location.pathname === link.path
                        ? 'text-brand-olive bg-brand-olive/5'
                        : 'text-brand-ink'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-brand-olive/10 pt-6">
                <p className="text-sm font-bold text-brand-ink/40 uppercase tracking-widest mb-3">
                  Heritage Craft Media
                </p>
                <p className="text-sm text-brand-ink/60 leading-relaxed">
                  Helping craft businesses grow through media, education, and digital strategy.
                </p>
                <Link
                  to="/get-started"
                  onClick={() => setIsOpen(false)}
                  className="inline-block mt-4 px-6 py-3 bg-brand-olive text-white rounded-full font-bold text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
