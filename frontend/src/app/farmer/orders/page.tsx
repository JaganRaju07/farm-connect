// frontend/src/app/farmer/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, MapPin, Calendar, CheckCircle, Package, Truck, Award, XCircle, ChevronDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/common/EmptyState';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const STATUS_TRANSITION_LABELS: Record<string, string> = {
  pending: 'Accept Order',
  confirmed: 'Mark as Packed',
  packed: 'Mark Out for Delivery',
  out_for_delivery: 'Mark as Delivered',
  delivered: 'Complete Order (Cash Received)'
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'packed',
  packed: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: 'completed'
};

const getStatusConfig = (status: string) => {
  switch(status?.toLowerCase()) {
    case 'pending': return { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'confirmed': return { icon: Package, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'packed': return { icon: Package, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
    case 'out_for_delivery': return { icon: Truck, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    case 'delivered': 
    case 'completed': return { icon: CheckCircle, color: 'text-success-700', bg: 'bg-success-50', border: 'border-success-200' };
    case 'cancelled': return { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
    default: return { icon: Package, color: 'text-earth-700', bg: 'bg-earth-100', border: 'border-earth-200' };
  }
};

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [apiError, setApiError] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/farmers/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data?.orders || []);
      setApiError(false);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error.message);
      if (error.response?.status === 404) {
        setApiError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleUpdateStatus = async (orderId: number, currentStatus: string, nextStatus: string) => {
    setActionLoadingId(orderId);
    try {
      await axios.patch(`${API_BASE}/farmers/orders/${orderId}/status`, 
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              order_status: nextStatus,
              [`${nextStatus}_at`]: new Date().toISOString()
            } 
          : order
      ));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to update order status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setActionLoadingId(orderId);
    try {
      await axios.patch(`${API_BASE}/farmers/orders/${orderId}/status`, 
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, order_status: 'cancelled', cancelled_at: new Date().toISOString() } 
          : order
      ));
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to cancel order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.order_status === 'pending';
    if (filter === 'active') return ['confirmed', 'packed', 'out_for_delivery'].includes(order.order_status);
    if (filter === 'completed') return ['delivered', 'completed'].includes(order.order_status);
    if (filter === 'cancelled') return order.order_status === 'cancelled';
    return true;
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-8 pb-12 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-earth-900 tracking-tight">Fulfillment Dashboard</h1>
          <p className="text-sm text-earth-500 mt-1">Manage and track customer orders.</p>
        </div>
        
        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 bg-earth-100 p-1.5 rounded-xl self-start border border-earth-200 scrollbar-hide">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-white text-primary-700 shadow-sm border border-earth-200'
                  : 'text-earth-600 hover:text-earth-900 hover:bg-earth-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-earth-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : apiError ? (
        <div className="card text-center p-16 border-blue-100 bg-blue-50/50">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <ShoppingBag className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-earth-900 font-bold font-display text-lg mb-1">Backend Integration Pending</p>
          <p className="text-earth-500 mb-6 max-w-md mx-auto">The orders endpoint is not yet available on the backend server. Your customer orders will appear here once connected.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-earth-400" />}
          title="No orders found"
          description="There are no orders matching this filter."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, i) => {
              const isExpanded = expandedOrderId === order.id;
              const itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              const status = order.order_status;
              const nextStat = NEXT_STATUS[status];
              const nextLabel = STATUS_TRANSITION_LABELS[status];
              const isActionLoading = actionLoadingId === order.id;
              const statusConf = getStatusConfig(status);
              const StatusIcon = statusConf.icon;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id} 
                  className="card overflow-hidden hover:border-primary-300 transition-colors"
                >
                  {/* Header Summary */}
                  <div 
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-earth-50/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-earth-900 text-lg">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-earth-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-earth-400" />
                          {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-earth-300 hidden md:block" />
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-earth-400" />
                          {order.delivery_city} ({order.delivery_distance_km.toFixed(1)} km away)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-left md:text-right">
                        <p className="text-xl font-black text-primary-700">{formatPrice(order.total_amount)}</p>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-earth-400">
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Details (Collapsible) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-4 border-t border-earth-100 bg-earth-50/50 space-y-6">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
                              <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-3">Delivery Details</h4>
                              <p className="text-base font-bold text-earth-900">{order.consumer_name}</p>
                              <p className="text-sm text-earth-600 mt-1">{order.delivery_address}</p>
                              <p className="text-sm text-earth-600">{order.delivery_city} - {order.delivery_pincode}</p>
                              {order.consumer_notes && (
                                <div className="mt-4 bg-amber-50 p-3 rounded-xl border border-amber-200 text-sm text-amber-800">
                                  <strong>Note from buyer:</strong> {order.consumer_notes}
                                </div>
                              )}
                            </div>

                            {/* Items Summaries */}
                            <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
                              <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-3">Order Items</h4>
                              <div className="divide-y divide-earth-100 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                                {itemsList && itemsList.map((item: any, idx: number) => (
                                  <div key={idx} className="py-2 flex justify-between items-start text-sm group">
                                    <div>
                                      <p className="font-semibold text-earth-900 group-hover:text-primary-700 transition-colors">{item.name}</p>
                                      <p className="text-xs font-medium text-earth-500">{item.quantity} {item.unit} x {formatPrice(item.price)}</p>
                                    </div>
                                    <p className="font-bold text-earth-900">{formatPrice(item.quantity * item.price)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-earth-100 pt-3 mt-2 space-y-1">
                                <div className="flex justify-between text-xs font-medium text-earth-500">
                                  <span>Subtotal</span>
                                  <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-earth-500">
                                  <span>Delivery Fee</span>
                                  <span>{formatPrice(order.delivery_fee)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-earth-900 pt-2">
                                  <span>Total to collect</span>
                                  <span className="text-primary-700">{formatPrice(order.total_amount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions and Status Machine */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-earth-200 pt-6">
                            <div className="bg-white px-4 py-2 rounded-xl border border-earth-200 inline-flex items-center gap-2">
                              <span className="text-xs text-earth-500 font-medium">Payment:</span>
                              <span className={`text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'text-primary-600' : 'text-amber-600'}`}>
                                {order.payment_status}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {/* Cancel Button */}
                              {['pending', 'confirmed'].includes(status) && (
                                <button
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={isActionLoading}
                                  className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-earth-200"
                                >
                                  <XCircle className="w-4 h-4" /> Cancel
                                </button>
                              )}

                              {/* Transition Action Button */}
                              {nextStat && nextLabel && (
                                <button
                                  onClick={() => handleUpdateStatus(order.id, status, nextStat)}
                                  disabled={isActionLoading}
                                  className="btn-primary"
                                >
                                  {status === 'pending' && <CheckCircle className="w-4 h-4" />}
                                  {status === 'confirmed' && <Package className="w-4 h-4" />}
                                  {status === 'packed' && <Truck className="w-4 h-4" />}
                                  {status === 'out_for_delivery' && <Award className="w-4 h-4" />}
                                  {nextLabel}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
