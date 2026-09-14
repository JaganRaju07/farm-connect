// frontend/src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield, Users, ShoppingCart, Tag, IndianRupee, LogOut, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/common/ProtectedRoute';

function AdminDashboardContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/v1/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data.data);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        } else {
          setError('Failed to load platform analytics.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3 font-bold text-lg text-primary-400">
            <Shield className="w-6 h-6" />
            <span>FC Admin Console</span>
          </div>

          <nav className="flex flex-col gap-2">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 text-white font-medium shadow-xs"
            >
              <span>📊 Dashboard</span>
            </Link>
            <Link 
              href="/admin/farmers" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-850 hover:text-white transition-all font-medium"
            >
              <span>🧑‍🌾 Farmer Verification</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-earth-900">Platform Analytics</h1>
              <p className="text-earth-500 text-sm mt-1">Real-time statistics across the Farm Connect network</p>
            </div>
            <Link
              href="/admin/farmers"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Verify Pending Farmers
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Revenue card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gross GMV</p>
                  <p className="text-3xl font-black text-primary-600">₹{analytics?.revenue?.total_gmv || 0}</p>
                </div>
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Last 30 Days: <strong className="text-gray-900 font-semibold">₹{analytics?.revenue?.last_30_days || 0}</strong></p>
            </div>

            {/* Farmers card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Farmers</p>
                  <p className="text-3xl font-black text-gray-900">{analytics?.farmers?.total || 0}</p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Verified: <strong className="text-primary-600 font-semibold">{analytics?.farmers?.verified || 0}</strong> • Pending: <strong className="text-amber-600 font-semibold">{analytics?.farmers?.pending_verification || 0}</strong></p>
            </div>

            {/* Consumers card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Consumers</p>
                  <p className="text-3xl font-black text-gray-900">{analytics?.consumers?.total || 0}</p>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">New this week: <strong className="text-gray-900 font-semibold">{analytics?.consumers?.new_this_week || 0}</strong></p>
            </div>

            {/* Orders card */}
            <div className="card flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Orders</p>
                  <p className="text-3xl font-black text-gray-900">{analytics?.orders?.total || 0}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Delivered: <strong className="text-primary-600 font-semibold">{analytics?.orders?.delivered || 0}</strong> • Pending: <strong className="text-amber-600 font-semibold">{analytics?.orders?.pending || 0}</strong></p>
            </div>
          </div>

          {/* Details sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Products & Inventory Metrics */}
            <div className="card p-6">
              <h2 className="text-lg font-bold font-display text-earth-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-500" />
                Products & Inventory
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Total Products Listed</span>
                  <span className="font-bold text-gray-900">{analytics?.products?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Active Listings</span>
                  <span className="font-bold text-primary-600">{analytics?.products?.active || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Product Categories</span>
                  <span className="font-bold text-gray-900">{analytics?.products?.categories || 0}</span>
                </div>
              </div>
            </div>

            {/* Order Pipelines */}
            <div className="card p-6">
              <h2 className="text-lg font-bold font-display text-earth-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Order Pipelines
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Pending Confirmation</span>
                  <span className="font-bold text-amber-600">{analytics?.orders?.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Delivered / Completed</span>
                  <span className="font-bold text-primary-600">{analytics?.orders?.delivered || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Cancelled Orders</span>
                  <span className="font-bold text-red-600">{analytics?.orders?.cancelled || 0}</span>
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
