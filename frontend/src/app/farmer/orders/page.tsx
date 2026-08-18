// frontend/src/app/farmer/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, MapPin, Calendar, CheckCircle, Package, Truck, Award, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/v1/farmer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
      await axios.patch(`/api/v1/farmer/orders/${orderId}/status`, 
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              order_status: nextStatus,
              // Update timestamps as appropriate
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
      await axios.patch(`/api/v1/farmer/orders/${orderId}/status`, 
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        
        {/* Filters */}
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 self-start shadow-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No orders found matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            const status = order.order_status;
            const nextStat = NEXT_STATUS[status];
            const nextLabel = STATUS_TRANSITION_LABELS[status];
            const isActionLoading = actionLoadingId === order.id;

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:border-gray-300"
              >
                {/* Header Summary */}
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-lg">{order.order_number}</span>
                      <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : status === 'confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : status === 'packed'
                          ? 'bg-purple-100 text-purple-700'
                          : status === 'out_for_delivery'
                          ? 'bg-indigo-100 text-indigo-700'
                          : status === 'delivered' || status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {order.delivery_city} ({order.delivery_distance_km.toFixed(1)} km away)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                      <p className="text-lg font-bold text-emerald-600">₹{order.total_amount}</p>
                    </div>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Details (Collapsible) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50/30 space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Details</h4>
                        <p className="text-sm font-semibold text-gray-900">{order.consumer_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                        <p className="text-sm text-gray-600">{order.delivery_city} - {order.delivery_pincode}</p>
                        {order.consumer_notes && (
                          <div className="mt-3 bg-amber-50/50 p-2.5 rounded border border-amber-100 text-xs text-amber-800">
                            <strong>Note from buyer:</strong> {order.consumer_notes}
                          </div>
                        )}
                      </div>

                      {/* Items Summaries */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                        <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                          {itemsList && itemsList.map((item: any, idx: number) => (
                            <div key={idx} className="py-2.5 flex justify-between text-sm">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.quantity} {item.unit} x ₹{item.price}</p>
                              </div>
                              <p className="font-semibold text-gray-950">₹{item.quantity * item.price}</p>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-3 mt-1.5 flex justify-between text-xs text-gray-500">
                          <span>Subtotal</span>
                          <span>₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Delivery Fee</span>
                          <span>₹{order.delivery_fee}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-900 mt-1.5">
                          <span>Total</span>
                          <span>₹{order.total_amount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Status Machine */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                      <div className="text-xs text-gray-500 font-medium">
                        Payment Status: <span className={`font-semibold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.payment_status}</span>
                      </div>

                      <div className="flex gap-2">
                        {/* Cancel Button */}
                        {['pending', 'confirmed'].includes(status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isActionLoading}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <span className="flex items-center gap-1.5">
                              <XCircle className="w-4.5 h-4.5" />
                              Cancel Order
                            </span>
                          </button>
                        )}

                        {/* Transition Action Button */}
                        {nextStat && nextLabel && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, status, nextStat)}
                            disabled={isActionLoading}
                            className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <span className="flex items-center gap-1.5">
                              {status === 'pending' && <CheckCircle className="w-4.5 h-4.5" />}
                              {status === 'confirmed' && <Package className="w-4.5 h-4.5" />}
                              {status === 'packed' && <Truck className="w-4.5 h-4.5" />}
                              {status === 'out_for_delivery' && <Award className="w-4.5 h-4.5" />}
                              {nextLabel}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
