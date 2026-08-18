// frontend/src/components/layout/AxiosInterceptorWrapper.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setupAxiosInterceptors } from '@/lib/api/auth';

interface AxiosInterceptorWrapperProps {
  children: React.ReactNode;
}

/**
 * WHY A WRAPPER?
 * Next.js App Router layout is a Server Component. We cannot call client hooks like
 * useRouter directly inside it. We wrap the initialization of Axios interceptors in this 
 * Client Component, allowing us to safely obtain the Next.js router instance and pass it
 * to the setup interceptor logic.
 */
export default function AxiosInterceptorWrapper({ children }: AxiosInterceptorWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    setupAxiosInterceptors(router);
  }, [router]);

  return <>{children}</>;
}
