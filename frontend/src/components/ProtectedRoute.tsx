/**
 * Protected Route Component
 * Wraps routes that require authentication and optionally specific roles
 */
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, refreshUser } = useAuthStore();

  // Refresh user info on mount to verify token validity
  useEffect(() => {
    try {
      if (!user && localStorage.getItem('access_token')) {
        refreshUser();
      }
    } catch (error) {
      // localStorage access blocked
      console.warn('Cannot access localStorage:', error);
    }
  }, [user, refreshUser]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirect to dashboard with error message (or could show 403 page)
      return <Navigate to="/dashboard" state={{ error: 'Insufficient permissions' }} replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
