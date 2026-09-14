'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useToast } from '@/context/ToastContext';
import { Package, XCircle, ChevronRight, Loader2, Clock, CheckCircle, MapPin, Store } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' }
];

function ConsumerOrdersContent() {
  const { error: showError, success } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
      const res = await axios.get(`${API}/consumer/orders${params}`);
      setOrders(res.data.data.orders);
    } catch {
      showError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return;
    setCancelling(orderId);
    try {
      await axios.patch(`${API}/consumer/orders/${orderId}/cancel`, {
        reason: 'Cancelled by consumer'
      });
      success('Order cancelled. Stock restored.');
      fetchOrders();
    } catch (err: any) {
      showError(err.response?.data?.error?.message || 'Cannot cancel this order');
    } finally {
      setCancelling(null);
    }
  };

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
      case 'completed': return { icon: CheckCircle, color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-200' };
      case 'out_for_delivery': return { icon: MapPin, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'cancelled': return { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
      default: return { icon: Package, color: 'text-earth-700', bg: 'bg-earth-100', border: 'border-earth-200' };
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 font-sans pb-24 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-display text-earth-900 tracking-tight">Order History</h1>
          <p className="text-earth-500 mt-1">Track and manage your farm-fresh deliveries.</p>
        </div>
        
        {/* ── Tabs ── */}
        <div className="flex overflow-x-auto gap-2 bg-earth-100 p-1.5 rounded-xl mb-8 w-fit scrollbar-hide border border-earth-200">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-primary-700 shadow-sm border border-earth-200'
                  : 'text-earth-600 hover:text-earth-900 hover:bg-earth-200/50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Orders List ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-32 animate-pulse bg-white border border-earth-200" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-20 px-6">
            <Package className="w-16 h-16 text-earth-200 mx-auto mb-4" />
            <p className="text-lg font-bold font-display text-earth-900">No {activeTab !== 'all' ? activeTab : ''} orders found</p>
            <p className="text-earth-500 mt-1 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link href="/marketplace" className="btn-primary inline-flex">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order: any) => {
              const statusConf = getStatusConfig(order.order_status);
              const StatusIcon = statusConf.icon;
              
              return (
                <div key={order.id} className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-primary-300 transition-colors">
                  
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-earth-900 text-lg group-hover:text-primary-700 transition-colors">
                        {order.order_number}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{order.order_status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-earth-500 flex items-center gap-2">
                      <span>{new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      <span className="w-1 h-1 rounded-full bg-earth-300" />
                      <span className="flex items-center gap-1 text-earth-700">
                        <Store className="w-3.5 h-3.5 text-earth-400" />
                        {order.farmer_name}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                    <p className="font-black text-xl text-primary-700">{formatCurrency(order.total_amount)}</p>
                    
                    <div className="flex items-center gap-3">
                      {order.order_status === 'pending' && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancelling === order.id}
                          className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors disabled:opacity-50">
                          {cancelling === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          Cancel
                        </button>
                      )}
                      <Link href={`/orders/${order.id}`}
                        className="flex items-center gap-1.5 text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-1.5 rounded-lg border border-primary-200 transition-colors">
                        Track Order <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConsumerOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']} redirectTo="/login">
      <ConsumerOrdersContent />
    </ProtectedRoute>
  );
}
