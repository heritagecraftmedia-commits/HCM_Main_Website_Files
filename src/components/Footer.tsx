import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-brand-ink text-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-bold text-brand-cream block mb-4">
              Heritage Craft Media
            </span>
            <p className="text-brand-cream/60 leading-relaxed max-w-sm">
              Helping craft businesses and independent makers grow through professional media, education, and digital strategy.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-cream/40 mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/academy" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">HCM Academy</Link></li>
              <li><Link to="/services" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Services</Link></li>
              <li><Link to="/free-resources" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Free Resources</Link></li>
              <li><Link to="/get-started" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-cream/40 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">About</Link></li>
              {user ? (
                <li><Link to="/dashboard" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Dashboard</Link></li>
              ) : (
                <li><Link to="/login" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Sign In</Link></li>
              )}
              <li><Link to="/privacy" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-brand-cream/70 hover:text-brand-cream text-sm transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-cream/40 text-sm">
            &copy; {new Date().getFullYear()} Heritage Craft Media. All rights reserved.
          </p>
          <p className="text-brand-cream/30 text-xs">
            heritagecraftmedia.com
          </p>
        </div>
      </div>
    </footer>
  );
};
