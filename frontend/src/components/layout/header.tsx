'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/cartcontext';
import { Sprout, ShoppingCart, LogOut, User, Tractor } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Header() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { getItemCount } = useCart();

  const dashboardLink = 
    role === 'farmer' ? '/farmer/dashboard' : 
    role === 'consumer' ? '/marketplace' : 
    role === 'admin' ? '/admin/dashboard' : '/';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={isAuthenticated ? dashboardLink : '/'} className="flex items-center gap-2">
          <Sprout className="w-7 h-7 text-primary-600" />
          <span className="font-bold text-lg text-gray-900">Farm Connect</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Cart — consumers only */}
              {role === 'consumer' && (
                <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                {role === 'farmer' 
                  ? <Tractor className="w-4 h-4 text-primary-700" />
                  : <User className="w-4 h-4 text-primary-600" />
                }
                <span className="text-sm font-medium text-gray-700">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              {/* Logout */}
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors p-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2">
                Sign In
              </Link>
              <Link href="/register" className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-primary-700">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
