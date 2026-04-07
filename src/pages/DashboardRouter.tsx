import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OWNER_EMAILS = [
  'heritagecraftmedia@gmail.com',
  'scottmarkandrew@gmail.com',
  'junk2tip@gmail.com',
  'scott@heritagecraftmedia.com',
];

export const DashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    const isOwner =
      user.role === 'founder' ||
      user.role === 'admin' ||
      OWNER_EMAILS.includes(user.email);
    if (isOwner) {
      navigate('/founder-dashboard', { replace: true });
    } else if (user.role === 'staff' || user.role === 'rep') {
      navigate('/staffdashboard', { replace: true });
    } else {
      navigate('/studentdashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="w-8 h-8 border-2 border-brand-olive/30 border-t-brand-olive rounded-full animate-spin" />
    </div>
  );
};
