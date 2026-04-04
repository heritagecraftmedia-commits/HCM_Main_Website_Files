import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-olive text-brand-cream py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-3xl mb-6">Heritage Craft Media</h3>
            <p className="text-brand-cream/70 max-w-md leading-relaxed">
              Celebrating makers, heritage crafts, and community through storytelling, radio, and media.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest mb-6 opacity-50">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/radio" className="hover:text-white transition-colors">Community Radio</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
              <li><Link to="/join" className="hover:text-white transition-colors">Join the Community</Link></li>
              <li><Link to="/members" className="hover:text-white transition-colors">Members Area</Link></li>
              <li><Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase text-xs tracking-widest mb-6 opacity-50">Contact</h4>
            <ul className="space-y-4 text-brand-cream/70">
              <li>hello@heritagecraftmedia.com</li>
              <li className="flex items-center gap-2 pt-4">
                Made with <Heart size={16} className="text-red-400 fill-red-400" /> for the community
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-cream/50">
          <p>© {new Date().getFullYear()} Heritage Craft Media. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
