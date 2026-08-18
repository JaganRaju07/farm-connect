// frontend/src/app/farmer/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface DashboardStats {
  activeProducts: number;
  pendingOrders: number;
  totalEarnings: number;
  recentOrders: any[];
}

export default function FarmerDashboard() {
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

        // Safe fallback in case API returns nested data or differently named keys
        const activeCount = productsRes.data?.data?.count ?? productsRes.data?.data?.products?.length ?? 0;
        const pendingCount = ordersRes.data?.data?.count ?? ordersRes.data?.data?.orders?.length ?? 0;
        const earnings = profileRes.data?.data?.farmer?.total_earnings ?? 0;
        const ordersList = allOrdersRes.data?.data?.orders ?? [];

        setStats({
          activeProducts: activeCount,
          pendingOrders: pendingCount,
          totalEarnings: earnings,
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
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Products Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeProducts || 0}</p>
            </div>
          </div>
          <Link href="/farmer/products" className="text-sm text-emerald-600 hover:underline mt-4 block font-medium">
            Manage products →
          </Link>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
            </div>
          </div>
          <Link href="/farmer/orders" className="text-sm text-amber-600 hover:underline mt-4 block font-medium">
            View orders →
          </Link>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats?.totalEarnings || 0).toFixed(0)}</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-4 block">Updated in real-time</span>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/farmer/orders" className="text-sm text-emerald-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No orders yet. Add products to start receiving orders!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.consumer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{order.total_amount}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
                    order.order_status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : order.order_status === 'confirmed'
                      ? 'bg-blue-100 text-blue-700'
                      : order.order_status === 'delivered' || order.order_status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
