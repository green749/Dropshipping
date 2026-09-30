import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if accessing forbidden role route
    const defaultRedirect =
      user.role === 'DEALER'
        ? '/dealer'
        : user.role === 'MARKETING'
        ? '/marketing'
        : user.role === 'SALES'
        ? '/sales/orders'
        : '/admin';
    return <Navigate to={defaultRedirect} replace />;
  }

  return <Outlet />;
};
