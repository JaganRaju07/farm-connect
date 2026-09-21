'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /wishlist → /consumer/wishlist for backward compatibility
export default function WishlistRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/consumer/wishlist');
  }, [router]);
  return null;
}
