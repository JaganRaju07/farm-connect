'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface WishlistButtonProps {
  productId: number;
  size?: 'sm' | 'md';
}

export default function WishlistButton({ productId, size = 'md' }: WishlistButtonProps) {
  const { isAuthenticated, role } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || role !== 'consumer') return;
    // Simple state assumption for now. In a full implementation, we'd check against a global wishlist state or fetch.
    // Assuming 'saved' state is managed via global context or fetched on mount in a robust implementation.
  }, [isAuthenticated, role]);

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const btnSize = size === 'sm' ? 'p-1.5' : 'p-2.5';

  const isMutating = useRef(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isAuthenticated || role !== 'consumer') {
      router.push('/login'); 
      return;
    }

    // Protection against rapid-click race conditions before React re-renders
    if (isMutating.current) return;
    isMutating.current = true;

    const prevState = saved;
    setSaved(!saved); // Optimistic UI Update
    setLoading(true);

    try {
      await axios.post(`${API}/wishlist`, { productId });
      if (!prevState) {
        success('Added to wishlist');
      } else {
        success('Removed from wishlist');
      }
    } catch {
      setSaved(prevState); // Revert on failure
      error('Failed to update wishlist');
    } finally {
      setLoading(false);
      isMutating.current = false;
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${btnSize} rounded-full bg-white/90 hover:bg-white shadow-sm hover:shadow-md transition-all active:scale-90 z-10 ${
        loading ? 'opacity-50' : ''
      }`}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart className={`${iconSize} transition-colors duration-300 ${
        saved ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
      }`} />
    </button>
  );
}
