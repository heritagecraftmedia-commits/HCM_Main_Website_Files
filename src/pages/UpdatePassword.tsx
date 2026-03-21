import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export const UpdatePassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  // Supabase will have set the session from the email link by this point
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY event when the reset link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
    // Also check if there's already a valid session (page reload case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (done) {
    return (
      <div className="py-16 md:py-24 bg-[#F5F0E8] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-brand-olive/5 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-serif mb-3">Password updated!</h1>
            <p className="text-brand-ink/60 text-sm">Taking you to your dashboard…</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="py-16 md:py-24 bg-[#F5F0E8] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-brand-olive/5 text-center"
          >
            <div className="w-8 h-8 border-2 border-brand-olive/30 border-t-brand-olive rounded-full animate-spin mx-auto mb-6" />
            <p className="text-brand-ink/60 text-sm">Verifying your reset link…</p>
            <p className="text-xs text-brand-ink/40 mt-3">
              If this takes more than a few seconds, your link may have expired.{' '}
              <a href="/reset-password" className="text-[#8B1A1A] hover:underline">Request a new one →</a>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-serif mb-1">Choose a new password</h1>
          <p className="text-brand-ink/50 text-sm mb-8">Make it something memorable</p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-bold mb-2 text-brand-ink/60">New password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-4 py-4 bg-[#F5F0E8]/50 rounded-2xl border border-brand-olive/10 focus:ring-2 focus:ring-brand-olive/20 focus:outline-none text-sm"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-brand-ink/60">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="w-full pl-10 pr-4 py-4 bg-[#F5F0E8]/50 rounded-2xl border border-brand-olive/10 focus:ring-2 focus:ring-brand-olive/20 focus:outline-none text-sm"
                  placeholder="Same password again"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
