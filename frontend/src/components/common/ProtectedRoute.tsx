'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('farmer' | 'consumer' | 'admin')[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirect=${pathname}`);
      return;
    }

    // Correct user type but wrong role — send to their own dashboard
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      if (role === 'farmer') router.push('/farmer/dashboard');
      if (role === 'consumer') router.push('/marketplace');
      if (role === 'admin') router.push('/admin/dashboard');
    }
  }, [isAuthenticated, role, isLoading]);

  // Show spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (allowedRoles && role && !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
