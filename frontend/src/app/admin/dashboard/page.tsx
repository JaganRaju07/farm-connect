// frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Shield, Users, ShoppingCart, Tag, IndianRupee, LogOut, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/button';

function AdminDashboardContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const { logout } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/admin/platform-analytics');
        setAnalytics(res.data.data);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        } else {
          setError('Failed to load platform analytics.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router, logout, token]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-muted text-foreground border-r border-border-default flex flex-col justify-between p-6 transition-colors">
        <div className="space-y-8">
          <div className="flex items-center gap-3 font-bold text-lg text-primary-600 dark:text-primary-400">
            <Shield className="w-6 h-6" />
            <span>FC Admin Console</span>
          </div>

          <nav className="flex flex-col gap-2">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary-600 dark:bg-primary-500 text-white font-medium shadow-xs"
            >
              <span>📊 Dashboard</span>
            </Link>
            <Link 
              href="/admin/farmers" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-foreground-secondary hover:bg-surface-elevated hover:text-foreground transition-all font-medium"
            >
              <span>🧑‍🌾 Farmer Verification</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-border-default rounded-lg text-foreground-secondary hover:bg-surface-elevated hover:text-foreground transition-all cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-default pb-5 transition-colors">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-foreground">Platform Analytics</h1>
              <p className="text-foreground-secondary text-sm mt-1">Real-time statistics across the Farm Connect network</p>
            </div>
            <Link href="/admin/farmers">
              <Button variant="primary" size="sm" className="shadow-xs">
                <CheckCircle className="w-4 h-4" />
                Verify Pending Farmers
              </Button>
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 transition-colors">
              {error}
            </div>
          )}

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Revenue card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Gross GMV</p>
                  <p className="text-3xl font-black text-primary-600 dark:text-primary-400">₹{analytics?.revenue?.total_gmv || 0}</p>
                </div>
                <div className="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800 transition-colors">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-foreground-secondary mt-4">Last 30 Days: <strong className="text-foreground font-semibold">₹{analytics?.revenue?.last_30_days || 0}</strong></p>
            </div>

            {/* Farmers card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total Farmers</p>
                  <p className="text-3xl font-black text-foreground">{analytics?.farmers?.total || 0}</p>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-foreground-secondary mt-4">Verified: <strong className="text-primary-600 dark:text-primary-400 font-semibold">{analytics?.farmers?.verified || 0}</strong> • Pending: <strong className="text-amber-600 dark:text-amber-400 font-semibold">{analytics?.farmers?.pending_verification || 0}</strong></p>
            </div>

            {/* Consumers card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total Consumers</p>
                  <p className="text-3xl font-black text-foreground">{analytics?.consumers?.total || 0}</p>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-foreground-secondary mt-4">New this week: <strong className="text-foreground font-semibold">{analytics?.consumers?.new_this_week || 0}</strong></p>
            </div>

            {/* Orders card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Total Orders</p>
                  <p className="text-3xl font-black text-foreground">{analytics?.orders?.total || 0}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-foreground-secondary mt-4">Delivered: <strong className="text-primary-600 dark:text-primary-400 font-semibold">{analytics?.orders?.delivered || 0}</strong> • Pending: <strong className="text-amber-600 dark:text-amber-400 font-semibold">{analytics?.orders?.pending || 0}</strong></p>
            </div>
          </div>

          {/* Details sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Products & Inventory Metrics */}
            <div className="card p-6">
              <h2 className="text-lg font-bold font-display text-foreground mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-foreground-muted" />
                Products & Inventory
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border-default transition-colors">
                  <span className="text-foreground-secondary text-sm">Total Products Listed</span>
                  <span className="font-bold text-foreground">{analytics?.products?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-default transition-colors">
                  <span className="text-foreground-secondary text-sm">Active Listings</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{analytics?.products?.active || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground-secondary text-sm">Product Categories</span>
                  <span className="font-bold text-foreground">{analytics?.products?.categories || 0}</span>
                </div>
              </div>
            </div>

            {/* Order Pipelines */}
            <div className="card p-6">
              <h2 className="text-lg font-bold font-display text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-foreground-muted" />
                Order Pipelines
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border-default transition-colors">
                  <span className="text-foreground-secondary text-sm">Pending Confirmation</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{analytics?.orders?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-default transition-colors">
                  <span className="text-foreground-secondary text-sm">Delivered / Completed</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{analytics?.orders?.delivered || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground-secondary text-sm">Cancelled Orders</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{analytics?.orders?.cancelled || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
