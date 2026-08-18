// frontend/src/components/layout/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Leaf, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import NotificationBell from '../common/NotificationBell';

interface NavLink {
  href: string;
  label: string;
  role?: 'farmer' | 'consumer' | 'all';
}

const navLinks: NavLink[] = [
  { href: '/marketplace', label: 'Marketplace', role: 'all' },
  { href: '/farmer/dashboard', label: 'Farmer Portal', role: 'farmer' },
  { href: '/about', label: 'About', role: 'all' },
];

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { getItemCount } = useCart();
  const cartItemCount = isMounted ? getItemCount() : 0;

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const visibleLinks = navLinks.filter(link => {
    if (link.role === 'all') return true;
    if (link.role === 'farmer' && isLoggedIn && userRole === 'farmer') return true;
    return false;
  });

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Leaf className="h-7 w-7" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">Farm Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-emerald-600 font-semibold transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart button (Only show for consumers or guests) */}
            {(!isLoggedIn || userRole === 'consumer') && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-50"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-xs font-black rounded-full h-5 w-5 flex items-center justify-center shadow-xs">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell (Only show when logged in) */}
            {isLoggedIn && <NotificationBell />}

            {/* Auth / User profile section */}
            {isMounted && (
              <>
                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={userRole === 'farmer' ? '/farmer/profile' : '/profile'}
                      className="p-2 text-gray-650 hover:text-emerald-600 transition-colors rounded-lg hover:bg-gray-50"
                      aria-label="User profile"
                    >
                      <User className="h-6 w-6" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-xs"
                  >
                    Login
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-50 transition-colors rounded-lg"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden py-4 border-t border-gray-100 animate-fade-in"
          >
            <div className="flex flex-col space-y-2">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-emerald-600 hover:bg-gray-55/30 px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
