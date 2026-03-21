import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogIn, User, ShieldCheck, Store, Mail, Lock, AlertCircle } from 'lucide-react';
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

export const Login: React.FC = () => {
  const { login, loginWithGoogle, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: authError } = await loginWithGoogle();
    setGoogleLoading(false);
    if (authError) setError(authError);
    // On success, Supabase redirects to /dashboard automatically
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await login(email, password);
    setLoading(false);
    if (authError) { setError(authError); return; }
    navigate('/dashboard');
  };

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) { loginAsRole(selectedRole); navigate('/dashboard'); }
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
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-serif mb-1">Welcome Back</h1>
          <p className="text-brand-ink/50 text-sm mb-8">Sign in to your HCM account</p>

          {supabaseReady ? (
            <>
              {/* ── PRIMARY: Google Sign In ── */}
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-[#2C2C2C]/15 rounded-2xl font-bold text-[#2C2C2C] hover:border-[#2C2C2C]/30 hover:bg-gray-50 transition-all disabled:opacity-50 mb-2"
              >
                <GoogleIcon />
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>
              <p className="text-xs text-brand-ink/40 mb-6">Recommended — sign in with your Google account</p>

              {/* ── DIVIDER ── */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-brand-olive/10" />
                <span className="text-xs text-brand-ink/40 font-medium uppercase tracking-wider">or sign in with email</span>
                <div className="flex-1 h-px bg-brand-olive/10" />
              </div>

              {/* ── EMAIL / PASSWORD ── */}
              <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
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
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="text-right mt-2">
                    <Link to="/reset-password" className="text-xs text-[#8B1A1A] hover:underline font-medium">
                      Forgot your password? Reset it →
                    </Link>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? 'Signing in...' : 'Sign In with Email'}
                </button>
              </form>

              {/* ── CREATE ACCOUNT ── */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-brand-olive/10" />
                <span className="text-xs text-brand-ink/40 font-medium uppercase tracking-wider">new here?</span>
                <div className="flex-1 h-px bg-brand-olive/10" />
              </div>
              <Link
                to="/signup"
                className="flex items-center justify-center gap-3 w-full py-4 bg-[#8B1A1A] text-[#F5F0E8] rounded-full font-bold hover:bg-[#7a1616] transition-all text-sm"
              >
                Create your account →
              </Link>
            </>
          ) : (
            // Demo mode when Supabase not yet configured
            <>
              <p className="text-brand-ink/60 mb-3">Select your access level to continue</p>
              <div className="mb-4 p-3 bg-yellow-50 rounded-xl text-xs text-yellow-700 text-left">
                <strong>Demo Mode:</strong> Add Supabase credentials to enable real login.
              </div>
              <form onSubmit={handleDemoLogin} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {([
                    { role: 'founder' as UserRole, Icon: ShieldCheck, label: 'Founder Access', sub: 'Full site management' },
                    { role: 'staff' as UserRole, Icon: User, label: 'Staff Access', sub: 'Tasks & notes' },
                    { role: 'customer' as UserRole, Icon: Store, label: 'Customer Access', sub: 'Manage your listings' },
                  ]).map(({ role, Icon, label, sub }) => (
                    <button
                      key={role} type="button" onClick={() => setSelectedRole(role)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedRole === role ? 'border-brand-olive bg-brand-olive/5' : 'border-brand-cream hover:border-brand-olive/20'}`}
                    >
                      <Icon className={selectedRole === role ? 'text-brand-olive' : 'text-brand-ink/40'} />
                      <div className="text-left">
                        <span className="block font-bold">{label}</span>
                        <span className="text-xs opacity-50">{sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="submit" disabled={!selectedRole}
                  className="w-full py-4 bg-brand-olive text-white rounded-full font-bold hover:bg-brand-olive/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </button>
              </form>
              <div className="mt-6">
                <Link to="/signup" className="text-sm text-[#8B1A1A] hover:underline font-medium">
                  New here? Create your account →
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
