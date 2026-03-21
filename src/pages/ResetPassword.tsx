import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://heritagecraftmedia.com/update-password',
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setSent(true);
  };

  return (
    <div className="py-16 md:py-24 bg-[#F5F0E8] min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-brand-olive/5 text-center"
        >
          <div className="w-16 h-16 bg-[#F5F0E8] rounded-2xl flex items-center justify-center text-brand-olive mx-auto mb-6">
            <KeyRound size={32} />
          </div>

          {sent ? (
            <>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-serif mb-3">Check your email</h1>
              <p className="text-brand-ink/60 text-sm mb-8">
                We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to choose a new password.
              </p>
              <p className="text-xs text-brand-ink/40 mb-6">Didn't get it? Check your spam folder, or try again below.</p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-[#8B1A1A] hover:underline font-medium"
              >
                ← Try a different email
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-serif mb-1">Reset Password</h1>
              <p className="text-brand-ink/50 text-sm mb-8">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/60">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full pl-10 pr-4 py-4 bg-[#F5F0E8]/50 rounded-2xl border border-brand-olive/10 focus:ring-2 focus:ring-brand-olive/20 focus:outline-none text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-[#8B1A1A] text-[#F5F0E8] rounded-full font-bold hover:bg-[#7a1616] transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
              <p className="mt-8 text-sm text-brand-ink/50">
                Remember it?{' '}
                <Link to="/login" className="text-brand-olive font-bold hover:underline">
                  Back to sign in →
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
