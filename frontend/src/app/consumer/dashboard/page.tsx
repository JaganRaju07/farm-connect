'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ShoppingBag, Clock, CheckCircle, MapPin, Package, ArrowRight, Store, Star } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function ConsumerDashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/consumer/dashboard`)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getStatusConfig = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'confirmed': return { icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'delivered': 
      case 'completed': return { icon: CheckCircle, color: 'text-success-700', bg: 'bg-success-50', border: 'border-success-200' };
      case 'out_for_delivery': return { icon: MapPin, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
      default: return { icon: Package, color: 'text-earth-700', bg: 'bg-earth-100', border: 'border-earth-200' };
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 py-10 px-4">
        <div className="h-8 w-48 bg-earth-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card h-32 animate-pulse p-6">
              <div className="w-10 h-10 bg-earth-200 rounded-lg mb-4" />
              <div className="h-6 w-16 bg-earth-200 rounded mb-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-earth-50 pt-10 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── Welcome Banner ── */}
        <div className="bg-primary-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <ShoppingBag className="w-48 h-48" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-200 text-lg mb-8 font-medium">Ready to discover fresh produce from local farmers?</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-sm">
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        </div>

        {/* ── Metrics Row ── */}
        <div>
          <h2 className="text-xl font-bold text-earth-900 mb-4 tracking-tight">Your Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="card p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-earth-500 mb-1 uppercase tracking-wider">Total Orders</p>
                <p className="text-3xl font-black text-earth-900 tracking-tight">{stats?.total_orders || 0}</p>
              </div>
            </div>

            <div className="card p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <Clock className="w-6 h-6 text-amber-700" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-earth-500 mb-1 uppercase tracking-wider">Active Orders</p>
                <p className="text-3xl font-black text-earth-900 tracking-tight">{stats?.active_orders || 0}</p>
              </div>
            </div>

            <div className="card p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                  <CheckCircle className="w-6 h-6 text-primary-700" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-earth-500 mb-1 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-black text-earth-900 tracking-tight">{stats?.completed_orders || 0}</p>
              </div>
            </div>

            <div className="card p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
                  <ShoppingBag className="w-6 h-6 text-primary-700" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-semibold text-earth-500 mb-1 uppercase tracking-wider">Total Spent</p>
                <p className="text-3xl font-black text-primary-700 tracking-tight">{formatCurrency(stats?.total_spent || 0)}</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-earth-100 flex items-center justify-between bg-white">
                <h2 className="text-lg font-bold text-earth-900 tracking-tight">Recent Orders</h2>
                <Link href="/consumer/orders" className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-6 flex-1 bg-earth-50/30">
                {!data?.recentOrders?.length ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-earth-300 mx-auto mb-4" />
                    <p className="text-sm font-semibold text-earth-900 mb-1">No orders yet</p>
                    <p className="text-sm text-earth-500">Your recent purchases will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recentOrders.map((order: any) => {
                      const statusConf = getStatusConfig(order.order_status);
                      const StatusIcon = statusConf.icon;
                      return (
                        <Link key={order.id} href={`/orders/${order.id}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-earth-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all group">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-bold text-earth-900 text-lg group-hover:text-primary-700 transition-colors">
                                {order.order_number}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                <span className="capitalize">{order.order_status.replace('_', ' ')}</span>
                              </span>
                            </div>
                            <p className="text-sm font-medium text-earth-500 flex items-center gap-1.5 mt-1.5">
                              <Store className="w-4 h-4 text-earth-400" />
                              {order.farmer_name}
                            </p>
                          </div>
                          <div className="mt-4 sm:mt-0 sm:text-right">
                            <span className="text-lg font-black text-earth-900">{formatCurrency(order.total_amount)}</span>
                            <div className="text-xs font-semibold text-primary-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                              View Details <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Favourite Farmers */}
          <div className="lg:col-span-1">
            <div className="card h-full flex flex-col">
              <div className="p-6 border-b border-earth-100 bg-white">
                <h2 className="text-lg font-bold text-earth-900 tracking-tight">Favourite Farmers</h2>
                <p className="text-sm text-earth-500 mt-1">Farms you frequently buy from</p>
              </div>

              <div className="p-6 flex-1 bg-earth-50/30">
                {!data?.favouriteFarmers?.length ? (
                  <div className="text-center py-10">
                    <Star className="w-10 h-10 text-earth-300 mx-auto mb-3" />
                    <p className="text-sm text-earth-500">You haven't ordered enough from a specific farmer yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.favouriteFarmers.map((farmer: any) => (
                      <Link key={farmer.id} href={`/farmers/${farmer.id}`}
                        className="flex items-center gap-4 p-4 bg-white border border-earth-200 rounded-xl hover:border-primary-300 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-primary-700 shrink-0">
                          {farmer.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-earth-900 truncate group-hover:text-primary-700 transition-colors">{farmer.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-earth-500 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {farmer.city}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-bold bg-earth-100 text-earth-600 px-2 py-1 rounded shrink-0">
                          {farmer.order_count} orders
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ConsumerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']} redirectTo="/login">
      <ConsumerDashboardContent />
    </ProtectedRoute>
  );
}
