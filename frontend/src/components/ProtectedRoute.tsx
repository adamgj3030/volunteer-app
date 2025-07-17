import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/auth';

interface Props {
  allow: UserRole[];          // roles allowed to view
  children: React.ReactNode;  // page component
  redirectTo?: string;        // fallback path
}

export const ProtectedRoute: React.FC<Props> = ({ allow, children, redirectTo }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or spinner
  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to={redirectTo ?? (user.role === 'ADMIN' ? '/admin' : '/volunteer')} replace />;
  }
  return <>{children}</>;
};