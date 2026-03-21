import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== 'https://placeholder.supabase.co' && url.includes('supabase.co');
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const Signup: React.FC = () => {
  const { signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: authError } = await loginWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const { error: authError } = await signUp(email, password, fullName);
    setLoading(false);
    if (authError) { setError(authError); return; }
    setDone(true);
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
            <h1 className="text-2xl font-serif mb-3">Check your email</h1>
            <p className="text-brand-ink/60 text-sm mb-8">
              We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all"
            >
              Back to Sign In
            </Link>
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
            <User size={32} />
          </div>
          <h1 className="text-3xl font-serif mb-1">Create Account</h1>
          <p className="text-brand-ink/50 text-sm mb-8">Join the Heritage Craft Media community</p>

          {supabaseReady ? (
            <>
              {/* ── PRIMARY: Google Sign Up ── */}
              <button
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-[#2C2C2C]/15 rounded-2xl font-bold text-[#2C2C2C] hover:border-[#2C2C2C]/30 hover:bg-gray-50 transition-all disabled:opacity-50 mb-2"
              >
                <GoogleIcon />
                {googleLoading ? 'Redirecting...' : 'Sign up with Google'}
              </button>
              <p className="text-xs text-brand-ink/40 mb-6">Quickest way — uses your existing Google account</p>

              {/* ── DIVIDER ── */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-brand-olive/10" />
                <span className="text-xs text-brand-ink/40 font-medium uppercase tracking-wider">or sign up with email</span>
                <div className="flex-1 h-px bg-brand-olive/10" />
              </div>

              {/* ── EMAIL FORM ── */}
              <form onSubmit={handleEmailSignup} className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/60">Your name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 bg-[#F5F0E8]/50 rounded-2xl border border-brand-olive/10 focus:ring-2 focus:ring-brand-olive/20 focus:outline-none text-sm"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/60">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full pl-10 pr-4 py-4 bg-[#F5F0E8]/50 rounded-2xl border border-brand-olive/10 focus:ring-2 focus:ring-brand-olive/20 focus:outline-none text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-brand-ink/60">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/30" />
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)} required
                      className="w-full pl-10 pr-4 py-4 bg-[#F5F0E8]/50 rounded-2xl border border-brand-olive/10 focus:ring-2 focus:ring-brand-olive/20 focus:outline-none text-sm"
                      placeholder="At least 6 characters"
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
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-2xl text-sm text-yellow-700 text-left">
              <strong>Demo Mode:</strong> Supabase not configured — account creation is disabled.
            </div>
          )}

          {/* ── SIGN IN LINK ── */}
          <p className="mt-8 text-sm text-brand-ink/50">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-olive font-bold hover:underline">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
