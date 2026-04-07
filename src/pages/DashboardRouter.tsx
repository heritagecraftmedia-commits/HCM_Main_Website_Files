import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardRouter — reads the user's role and redirects to the correct dashboard.
 *
 * owner / founder / admin → /founder-dashboard
 * staff / rep             → /staffdashboard
 * student / client / customer → /studentdashboard
 * not logged in           → /login
 */
export const DashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role === 'founder' || user.role === 'admin') {
      navigate('/founder-dashboard', { replace: true });
    } else if (user.role === 'staff' || user.role === 'rep') {
      navigate('/staffdashboard', { replace: true });
    } else {
      navigate('/studentdashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
      <div className="w-8 h-8 border-2 border-[#8B1A1A]/30 border-t-[#8B1A1A] rounded-full animate-spin" />
    </div>
  );
};
