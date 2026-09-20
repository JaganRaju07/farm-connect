'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, TrendingUp, AlertCircle, ArrowRight, Clock, CheckCircle, PackageCheck, Plus, ListOrdered } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AnimatedBeam } from '@/components/magicui/AnimatedBeam';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const farmRef = useRef<HTMLDivElement>(null);
  const consumerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Fallback-friendly fetch for routes that might not exist yet
        const fetchSafe = async (url: string) => {
          try {
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            return res.data?.data;
          } catch (e: any) {
            console.warn(`Safe fetch failed for ${url}:`, e.message);
            return null;
          }
        };

        const [dashboardData, lowStockData] = await Promise.all([
          fetchSafe(`${API_BASE}/farmers/dashboard`),
          fetchSafe(`${API_BASE}/farmers/products/low-stock`)
        ]);

        const overview = dashboardData?.overview || {};
        const recentOrders = dashboardData?.recentOrders || [];

        setStats({
          activeProducts: Number(overview.active_products) || 0,
          pendingOrders: Number(overview.pending_count) || 0,
          totalEarnings: Number(overview.total_earnings) || 0,
          lowStockCount: lowStockData?.count || 0,
          recentOrders: recentOrders,
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
        <div className="h-8 w-48 bg-border-strong rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-32 animate-pulse flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-border-strong rounded-lg" />
                <div className="h-6 w-16 bg-border-strong rounded" />
              </div>
              <div className="h-4 w-24 bg-border-strong rounded mt-4" />
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
      case 'pending': return { icon: Clock, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800' };
      case 'confirmed': return { icon: CheckCircle, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' };
      case 'delivered': 
      case 'completed': return { icon: PackageCheck, color: 'text-primary-700 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30', border: 'border-primary-200 dark:border-primary-800' };
      default: return { icon: Clock, color: 'text-foreground-secondary', bg: 'bg-surface-muted', border: 'border-border-default' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* ── Animated Connection Visual ── */}
      <div ref={containerRef} className="relative w-full h-32 lg:h-40 bg-primary-900 dark:bg-primary-950 rounded-[2rem] p-6 lg:px-12 flex justify-between items-center overflow-hidden shadow-xl border border-primary-800 dark:border-primary-900 transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-primary-900 to-primary-900 dark:via-primary-950 dark:to-primary-950" />
        
        <div ref={farmRef} className="relative z-10 w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
          <Package className="w-8 h-8 lg:w-10 lg:h-10 text-primary-400" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h3 className="text-white font-display font-bold text-xl lg:text-2xl tracking-tight">Farm to Table</h3>
          <p className="text-primary-200 text-sm mt-1">Direct connection active</p>
        </div>
        
        <div ref={consumerRef} className="relative z-10 w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
          <ShoppingBag className="w-8 h-8 lg:w-10 lg:h-10 text-accent-400" />
        </div>

        <AnimatedBeam 
          containerRef={containerRef}
          fromRef={farmRef}
          toRef={consumerRef}
          curvature={-30}
          pathColor="rgba(255,255,255,0.05)"
          gradientStartColor="#60b682"
          gradientStopColor="#e76f51"
        />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">Overview</h1>
        <p className="text-foreground-secondary text-sm mt-1">Here's what's happening with your farm today.</p>
      </div>
      
      {/* Low Stock Warning */}
      {stats && stats.lowStockCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-4 transition-colors">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">Inventory Alert</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1 leading-relaxed">
              You have {stats.lowStockCount} products running dangerously low on stock.
            </p>
            <Link href="/farmer/products" className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 dark:text-red-400 mt-2 hover:text-red-900 dark:hover:text-red-300 transition-colors">
              Update inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-100 dark:border-primary-800 transition-colors">
              <Package className="w-6 h-6 text-primary-700 dark:text-primary-400" />
            </div>
            <span className="text-xs font-semibold text-foreground-secondary bg-surface-elevated px-2 py-1 rounded-md border border-border-default">Live</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground-secondary mb-1">Active Products</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.activeProducts || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800 transition-colors">
              <ShoppingBag className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-foreground-secondary bg-surface-elevated px-2 py-1 rounded-md border border-border-default">Action Required</span>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground-secondary mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.pendingOrders || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-100 dark:border-primary-800 transition-colors">
              <TrendingUp className="w-6 h-6 text-primary-700 dark:text-primary-400" />
            </div>
            <Link href="/farmer/earnings" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
              View Analytics →
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground-secondary mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-primary-700 dark:text-primary-400 tracking-tight">{formatCurrency(stats?.totalEarnings || 0)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold font-display text-foreground tracking-tight mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/farmer/products/new" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm transition-all group">
            <div className="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-all"><Plus className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Add Product</span>
          </Link>
          <Link href="/farmer/products" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm transition-all group">
            <div className="p-2.5 bg-surface-elevated border border-border-default rounded-lg text-foreground-secondary group-hover:scale-110 transition-all"><Package className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Inventory</span>
          </Link>
          <Link href="/farmer/orders" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm transition-all group">
            <div className="p-2.5 bg-surface-elevated border border-border-default rounded-lg text-foreground-secondary group-hover:scale-110 transition-all"><ListOrdered className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Manage Orders</span>
          </Link>
          <Link href="/farmer/earnings" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm transition-all group">
            <div className="p-2.5 bg-surface-elevated border border-border-default rounded-lg text-foreground-secondary group-hover:scale-110 transition-all"><TrendingUp className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border-default flex items-center justify-between bg-surface transition-colors">
          <h2 className="text-lg font-semibold font-display text-foreground">Recent Orders</h2>
          <Link href="/farmer/orders" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="p-12 text-center bg-surface transition-colors">
              <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border-default">
                <ShoppingBag className="w-6 h-6 text-foreground-muted" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No orders yet</h3>
              <p className="text-sm text-foreground-secondary">When customers buy your produce, they will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border-default transition-colors">
                  <th className="px-6 py-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-foreground-secondary uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default bg-surface transition-colors">
                {stats.recentOrders.map(order => {
                  const statusConf = getStatusConfig(order.order_status);
                  const StatusIcon = statusConf.icon;
                  return (
                    <tr key={order.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground-secondary">{order.consumer_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</span>
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
