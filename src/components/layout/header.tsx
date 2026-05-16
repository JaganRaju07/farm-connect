// frontend/src/components/layout/Header.tsx

'use client';

import Link from 'next/link';
import { ShoppingCart, MapPin, User } from 'lucide-react';
import { useCart } from '@/context/cartcontext';

export default function Header() {
  const { getItemCount } = useCart();
  const count = getItemCount();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          🌱 Farm Connect
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/marketplace"
            className="text-gray-700 hover:text-primary-600 flex items-center gap-1"
          >
            <MapPin size={18} />
            <span className="hidden sm:inline">Marketplace</span>
          </Link>

          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-primary-600"
          >
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          <Link
            href="/orders"
            className="text-gray-700 hover:text-primary-600 hidden sm:block"
          >
            Orders
          </Link>

          <Link
            href="/profile"
            className="text-gray-700 hover:text-primary-600"
          >
            <User size={22} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
