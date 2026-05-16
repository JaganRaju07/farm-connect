'use client';

import React from 'react';
import { LocationProvider } from '@/context/locationcontext';
import { CartProvider } from '@/context/cartcontext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <LocationProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
          {children}
        </div>
      </LocationProvider>
    </CartProvider>
  );
}