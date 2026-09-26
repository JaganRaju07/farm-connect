'use client';

import { useState, useEffect, useRef } from 'react';
import { Package, ShoppingBag, TrendingUp, AlertCircle, ArrowRight, Clock, CheckCircle, PackageCheck, Plus, ListOrdered } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AnimatedBeam } from '@/components/magicui/AnimatedBeam';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { EmptyState } from '@/components/common/EmptyState';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface RecentOrder {
  id: string | number;
  order_number: string;
  consumer_name: string;
  total_amount: number;
  order_status: string;
}

interface DashboardStats {
  activeProducts: number;
  pendingOrders: number;
  totalEarnings: number;
  lowStockCount: number;
  recentOrders: RecentOrder[];
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
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-32 flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-24 mt-4" />
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
      case 'pending': return { icon: Clock, variant: 'warning' as const };
      case 'confirmed': return { icon: CheckCircle, variant: 'info' as const };
      case 'delivered': 
      case 'completed': return { icon: PackageCheck, variant: 'success' as const };
      default: return { icon: Clock, variant: 'default' as const };
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
        <p className="text-foreground-secondary text-sm mt-1">Here&apos;s what&apos;s happening with your farm today.</p>
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
            <Link href="/farmer/products" className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 dark:text-red-400 mt-2 hover:text-red-900 dark:hover:text-red-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1 -ml-1">
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
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">Live</Badge>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground-secondary mb-1">Active Products</p>
            <p className="text-3xl font-bold text-foreground tracking-tight tabular-nums">{stats?.activeProducts || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between ring-1 ring-amber-500/50 bg-amber-50/30 dark:bg-amber-900/10 dark:ring-amber-500/30">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl border border-amber-200 dark:border-amber-800 transition-colors">
              <ShoppingBag className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            </div>
            <Badge variant="warning" className="uppercase tracking-wider text-[10px]">Action Required</Badge>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-amber-900/80 dark:text-amber-200/80 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 tracking-tight tabular-nums">{stats?.pendingOrders || 0}</p>
          </div>
        </div>

        <div className="card p-6 flex flex-col justify-between bg-primary-900 dark:bg-primary-950 text-white border-primary-800 dark:border-primary-900">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <Link href="/farmer/earnings" className="text-xs font-semibold text-primary-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md px-2 py-1">
              View Analytics →
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-primary-200 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-white tracking-tight tabular-nums">{formatCurrency(stats?.totalEarnings || 0)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold font-display text-foreground tracking-tight mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/farmer/products/new" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all group">
            <div className="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-all"><Plus className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Add Product</span>
          </Link>
          <Link href="/farmer/products" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all group">
            <div className="p-2.5 bg-surface-elevated border border-border-default rounded-lg text-foreground-secondary group-hover:scale-110 transition-all"><Package className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Inventory</span>
          </Link>
          <Link href="/farmer/orders" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all group">
            <div className="p-2.5 bg-surface-elevated border border-border-default rounded-lg text-foreground-secondary group-hover:scale-110 transition-all"><ListOrdered className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Manage Orders</span>
          </Link>
          <Link href="/farmer/earnings" className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-default hover:border-primary-500 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all group">
            <div className="p-2.5 bg-surface-elevated border border-border-default rounded-lg text-foreground-secondary group-hover:scale-110 transition-all"><TrendingUp className="w-5 h-5" /></div>
            <span className="font-semibold text-foreground">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border-default flex items-center justify-between bg-surface transition-colors">
          <h2 className="text-lg font-semibold font-display text-foreground">Recent Orders</h2>
          <Link href="/farmer/orders" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <EmptyState 
              className="border-0 shadow-none rounded-none py-12"
              icon={<ShoppingBag className="w-12 h-12 text-foreground-muted" />}
              title="No orders yet"
              description="When customers buy your produce, they will appear here."
            />
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
                      <td className="px-6 py-4 whitespace-nowrap text-right tabular-nums">
                        <span className="text-sm font-bold text-foreground">{formatCurrency(order.total_amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Badge variant={statusConf.variant} className="capitalize gap-1.5 ml-auto">
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.order_status}
                        </Badge>
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
