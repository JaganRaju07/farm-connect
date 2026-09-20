'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/cartcontext';
import { usePathname } from 'next/navigation';
import { Sprout, ShoppingCart, LogOut, User, Tractor } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Header() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { getItemCount } = useCart();
  const pathname = usePathname();

  // Hide header on dashboard layouts (which have their own sidebars), auth pages, and the landing page (which has a custom nav)
  const hideHeaderPaths = ['/farmer', '/admin', '/login', '/register'];
  if (hideHeaderPaths.some(path => pathname?.startsWith(path)) || pathname === '/') {
    return null;
  }

  const dashboardLink = 
    role === 'farmer' ? '/farmer/dashboard' : 
    role === 'consumer' ? '/marketplace' : 
    role === 'admin' ? '/admin/dashboard' : '/';

  return (
    <header className="bg-surface border-b border-border-default sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={isAuthenticated ? dashboardLink : '/'} className="flex items-center gap-2">
          <Sprout className="w-7 h-7 text-primary-600 dark:text-primary-500" />
          <span className="font-bold text-lg text-foreground font-display">Farm Connect</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Cart — consumers only */}
              {role === 'consumer' && (
                <Link href="/cart" className="relative p-2 hover:bg-surface-muted rounded-lg transition-colors">
                  <ShoppingCart className="w-6 h-6 text-foreground-secondary hover:text-foreground" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-muted rounded-lg">
                {role === 'farmer' 
                  ? <Tractor className="w-4 h-4 text-primary-700 dark:text-primary-500" />
                  : <User className="w-4 h-4 text-primary-600 dark:text-primary-500" />
                }
                <span className="text-sm font-medium text-foreground-secondary">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              {/* Logout */}
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-red-500 dark:hover:text-red-400 transition-colors p-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/login" className="text-sm text-foreground-secondary hover:text-foreground font-medium px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="bg-primary-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-subtle">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
