'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, TrendingUp, AlertCircle, ArrowRight, Clock, CheckCircle, PackageCheck } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface DashboardStats {
  activeProducts: number;
  pendingOrders: number;
  totalEarnings: number;
  lowStockCount: number;
  recentOrders: any[];
}

function FarmerDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, ordersRes, profileRes] = await Promise.all([
          axios.get('/api/v1/farmer/products?status=active', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/v1/farmer/orders?status=pending', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/v1/farmer/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const allOrdersRes = await axios.get('/api/v1/farmer/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const productsList = productsRes.data?.data?.products ?? [];
        const activeCount = productsRes.data?.data?.count ?? productsList.length ?? 0;
        const lowStockCount = productsList.filter((p: any) => p.stock_available < 10).length;
        const pendingCount = ordersRes.data?.data?.count ?? ordersRes.data?.data?.orders?.length ?? 0;
        const earnings = profileRes.data?.data?.farmer?.total_earnings ?? 0;
        const ordersList = allOrdersRes.data?.data?.orders ?? [];

        setStats({
          activeProducts: activeCount,
          pendingOrders: pendingCount,
          totalEarnings: earnings,
          lowStockCount: lowStockCount,
          recentOrders: ordersList.slice(0, 5),
        });
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-earth-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-32 animate-pulse flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-earth-200 rounded-lg" />
                <div className="h-6 w-16 bg-earth-200 rounded" />
              </div>
              <div className="h-4 w-24 bg-earth-200 rounded mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'confirmed': return { icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'delivered': 
      case 'completed': return { icon: PackageCheck, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-200' };
      default: return { icon: Clock, color: 'text-earth-700', bg: 'bg-earth-100', border: 'border-earth-200' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-earth-900 tracking-tight">Overview</h1>
        <p className="text-earth-500 text-sm mt-1">Here's what's happening with your farm today.</p>
      </div>
      
      {/* Low Stock Warning */}
      {stats && stats.lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Inventory Alert</h3>
            <p className="text-sm text-red-700 mt-1 leading-relaxed">
              You have {stats.lowStockCount} products running dangerously low on stock.
            </p>
            <Link href="/farmer/products" className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 mt-2 hover:text-red-900">
              Update inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
              <Package className="w-6 h-6 text-primary-700" />
            </div>
            <span className="text-xs font-semibold text-earth-500 bg-earth-100 px-2 py-1 rounded-md">Live</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-earth-500 mb-1">Active Products</p>
            <p className="text-3xl font-bold text-earth-900 tracking-tight">{stats?.activeProducts || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <ShoppingBag className="w-6 h-6 text-amber-700" />
            </div>
            <span className="text-xs font-semibold text-earth-500 bg-earth-100 px-2 py-1 rounded-md">Action Required</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-earth-500 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-earth-900 tracking-tight">{stats?.pendingOrders || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
              <TrendingUp className="w-6 h-6 text-primary-700" />
            </div>
            <Link href="/farmer/earnings" className="text-xs font-semibold text-primary-600 hover:text-primary-800">
              View Analytics →
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-earth-500 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-primary-700 tracking-tight">{formatCurrency(stats?.totalEarnings || 0)}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-earth-100 flex items-center justify-between bg-white">
          <h2 className="text-lg font-semibold font-display text-earth-900">Recent Orders</h2>
          <Link href="/farmer/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-earth-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-earth-200">
                <ShoppingBag className="w-6 h-6 text-earth-400" />
              </div>
              <h3 className="text-sm font-medium text-earth-900 mb-1">No orders yet</h3>
              <p className="text-sm text-earth-500">When customers buy your produce, they will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-earth-50/50 border-b border-earth-100">
                  <th className="px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-earth-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 bg-white">
                {stats.recentOrders.map(order => {
                  const statusConf = getStatusConfig(order.order_status);
                  const StatusIcon = statusConf.icon;
                  return (
                    <tr key={order.id} className="hover:bg-earth-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-earth-900">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-earth-600">{order.consumer_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-earth-900">{formatCurrency(order.total_amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">{order.order_status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  return (
    <ProtectedRoute allowedRoles={['farmer']}>
      <ErrorBoundary>
        <FarmerDashboardContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
