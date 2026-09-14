// frontend/src/app/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyOrders, Order } from '@/lib/api/orders';
import { ShoppingBag, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConsumerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (err) {
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Link 
          href="/marketplace" 
          className="text-sm font-semibold text-primary-650 hover:text-primary-700 flex items-center gap-1 transition-colors"
        >
          Back to Marketplace <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold text-lg">No orders placed yet!</p>
          <p className="text-gray-500 text-sm mt-1 mb-6">Explore our fresh products from local farmers.</p>
          <Link
            href="/marketplace"
            className="inline-block bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-950 text-base">#{order.order_number}</span>
                  <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    order.order_status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : order.order_status === 'confirmed'
                      ? 'bg-blue-100 text-blue-700'
                      : order.order_status === 'delivered' || order.order_status === 'completed'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </span>
                  <span>Farmer: <strong className="text-gray-750 font-semibold">{order.farmer_name}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-base font-bold text-primary-600">₹{order.total_amount.toFixed(2)}</p>
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="px-4 py-2 border border-gray-250 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                >
                  Track Order
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}