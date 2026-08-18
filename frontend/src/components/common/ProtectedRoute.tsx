'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('farmer' | 'consumer' | 'admin')[];
  redirectTo?: string;
}

/**
 * Wrap any page with ProtectedRoute to enforce authentication.
 * 
 * STUDY NOTE — How Protection Works:
 * 1. While checking auth (isLoading), show spinner
 * 2. If not authenticated, redirect to login
 * 3. If authenticated but wrong role, redirect to their dashboard
 * 4. If authenticated and correct role, show children (the page)
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Save current URL so we can redirect back after login
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${currentPath}`);
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // Authenticated but wrong role — send to their dashboard
      if (role === 'farmer') router.push('/farmer/dashboard');
      else if (role === 'consumer') router.push('/marketplace');
      else if (role === 'admin') router.push('/admin/dashboard');
    }
  }, [isAuthenticated, role, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
