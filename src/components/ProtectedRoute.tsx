import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  /** If set, user must have this role or they are redirected to / */
  requiredRole?: UserRole;
}

/**
 * ProtectedRoute — wraps a page and enforces authentication + optional role.
 *
 * - Loading  → shows a spinner (avoids flash-of-content while session restores)
 * - No user  → redirects to /login
 * - Wrong role → redirects to / (home)
 * - Correct  → renders children
 */
export const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="w-8 h-8 border-2 border-brand-olive/30 border-t-brand-olive rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
