'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingBag, User, Menu, X, Sprout, LogOut, ChartNoAxesCombined
} from 'lucide-react';

const navItems = [
  { href: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/farmer/products', label: 'Inventory', icon: Package },
  { href: '/farmer/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/farmer/earnings', label: 'Earnings', icon: ChartNoAxesCombined },
  { href: '/farmer/profile', label: 'Settings', icon: User },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/farmer/login');
  };

  return (
    <div className="flex h-screen bg-earth-50 overflow-hidden font-sans">
      
      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-earth-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-earth-200 shadow-sm
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-earth-100 flex-shrink-0">
          <Link href="/farmer/dashboard" className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary-600" />
            <span className="text-lg font-bold text-earth-900 tracking-tight">Farm Connect</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg text-earth-400 hover:text-earth-600 hover:bg-earth-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-earth-600 hover:bg-earth-100 hover:text-earth-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-earth-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-earth-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
              <span className="text-sm font-bold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'F'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-earth-900 truncate">{user?.name || 'Farmer'}</p>
              <p className="text-xs text-earth-500 truncate">Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-earth-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 text-earth-400 group-hover:text-red-500" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Topbar */}
        <header className="md:hidden h-16 bg-white border-b border-earth-200 flex items-center justify-between px-4 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary-600" />
            <span className="font-bold text-earth-900 tracking-tight">Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-earth-600 p-2 rounded-lg hover:bg-earth-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-earth-50">
          <div className="container-app py-8 animate-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
