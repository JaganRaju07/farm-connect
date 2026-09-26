'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/cartcontext';
import { usePathname } from 'next/navigation';
import { Sprout, ShoppingCart, LogOut, User, Tractor, Heart } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Header() {
  const { isAuthenticated, user, role, logout } = useAuth();
  const { getItemCount } = useCart();
  const pathname = usePathname();

  // Hide header on dashboard layouts (which have their own sidebars), auth pages, and the landing page (which has its own nav)
  const hideHeaderPaths = ['/farmer', '/admin', '/login', '/register'];
  if (hideHeaderPaths.some(path => pathname?.startsWith(path)) || pathname === '/') {
    return null;
  }

  const dashboardLink = 
    role === 'farmer' ? '/farmer/dashboard' : 
    role === 'consumer' ? '/marketplace' : 
    role === 'admin' ? '/admin/dashboard' : '/';

  const cartCount = getItemCount();

  return (
    <header className="bg-surface/95 backdrop-blur-md border-b border-border-default sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link 
          href={isAuthenticated ? dashboardLink : '/'} 
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          aria-label="Farm Connect Home"
        >
          <div className="bg-primary-50 dark:bg-primary-950 p-1.5 rounded-lg border border-primary-200 dark:border-primary-800">
            <Sprout className="w-5 h-5 text-primary-700 dark:text-primary-400" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg text-foreground font-display tracking-tight">Farm Connect</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Cart — consumers only */}
              {role === 'consumer' && (
                <Link 
                  href="/cart" 
                  className="relative p-2 text-foreground-secondary hover:text-foreground hover:bg-surface-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 bg-primary-700 dark:bg-primary-600 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
                      aria-hidden="true"
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Wishlist — consumers only */}
              {role === 'consumer' && (
                <Link 
                  href="/consumer/wishlist" 
                  className="p-2 text-foreground-secondary hover:text-red-500 hover:bg-surface-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" 
                  title="My Wishlist"
                  aria-label="View My Wishlist"
                >
                  <Heart className="w-5 h-5" aria-hidden="true" />
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-muted rounded-lg border border-border-subtle">
                {role === 'farmer' 
                  ? <Tractor className="w-4 h-4 text-primary-700 dark:text-primary-400" aria-hidden="true" />
                  : <User className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                }
                <span className="text-xs font-semibold text-foreground">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              {/* Logout */}
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-surface-muted rounded-lg transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                aria-label="Sign out of your account"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link 
                href="/login" 
                className="text-xs sm:text-sm text-foreground-secondary hover:text-foreground font-semibold px-3 py-2 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-xs sm:text-sm px-4 py-2 rounded-xl font-semibold transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
