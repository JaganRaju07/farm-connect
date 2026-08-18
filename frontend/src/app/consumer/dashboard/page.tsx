'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { ShoppingBag, Clock, MapPin, Package } from 'lucide-react';

function ConsumerDashboardContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API}/consumer/orders`);
        setOrders(res.data.data.orders.slice(0, 5)); // Show latest 5
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    packed: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary-600" />
          <span className="font-bold text-lg">Farm Connect</span>
        </div>
        <Link href="/marketplace" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700">
          Shop Now
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-green-100">Fresh produce from farmers near you</p>
          <Link href="/marketplace"
            className="inline-flex items-center gap-2 mt-4 bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50">
            Browse Products →
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: orders.length, icon: Package },
            { label: 'Active Orders', value: orders.filter(o => !['delivered','completed','cancelled'].includes(o.order_status)).length, icon: Clock },
            { label: 'Completed', value: orders.filter(o => o.order_status === 'completed').length, icon: ShoppingBag }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <stat.icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/consumer/orders" className="text-sm text-primary-600 hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link href="/marketplace" className="text-primary-600 text-sm hover:underline mt-1 block">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {order.farmer_name} • ₹{order.total_amount}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.order_status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.order_status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
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
