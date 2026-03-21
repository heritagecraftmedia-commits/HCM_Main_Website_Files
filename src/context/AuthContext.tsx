import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>;
  loginAsRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== 'https://placeholder.supabase.co' && url.includes('supabase.co');
};

// Fetch role from profiles table; maps 'owner' → 'founder' for route guards
const fetchProfileRole = async (userId: string): Promise<UserRole> => {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  const raw = data?.role as string | null;
  if (raw === 'owner' || raw === 'founder') return 'founder';
  if (raw === 'staff') return 'staff';
  if (raw === 'customer') return 'customer';
  return 'customer';
};

const buildUser = async (supabaseUser: { id: string; email?: string | null }): Promise<User> => {
  const role = await fetchProfileRole(supabaseUser.id);
  return {
    id: supabaseUser.id,
    name: supabaseUser.email?.split('@')[0] || 'User',
    role,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured. Use demo login.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const loginWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) return { error: 'Supabase not configured.' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName || '',
        role: 'student',
        approved: false,
      });
    }
    return { error: null };
  };

  const loginAsRole = (role: UserRole) => {
    if (role === 'founder') setUser({ id: '1', name: 'Scott', role: 'founder' });
    else if (role === 'staff') setUser({ id: '2', name: 'Thalia', role: 'staff' });
    else if (role === 'customer') setUser({ id: '3', name: 'Local Producer', role: 'customer' });
  };

  const logout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signUp, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
