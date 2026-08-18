// frontend/src/app/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getOrderById, Order } from '@/lib/api/orders';
import OrderTimeline from '@/components/order/OrderTimeline';
import { CheckCircle, Loader2, Phone, RefreshCw } from 'lucide-react';

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const justPlaced = searchParams.get('placed') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
        <button
          onClick={fetchOrder}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const items = JSON.parse(order.items) as Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      {/* Success banner */}
      {justPlaced && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 mb-8 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-emerald-900 mb-1">
              Order Placed Successfully!
            </h2>
            <p className="text-emerald-700">
              Order <span className="font-medium">{order.order_number}</span> is waiting
              for farmer confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
            <p className="text-gray-650 text-sm">
              {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-505">Total</p>
            <p className="text-2xl font-bold text-emerald-600">
              ₹{order.total_amount.toFixed(2)}
            </p>
            <p className="text-sm text-amber-600 font-medium">Cash on Delivery</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Farmer</p>
            <p className="font-semibold text-gray-900">{order.farmer_name}</p>
            <a
              href={`tel:${order.farmer_phone}`}
              className="text-sm text-emerald-650 hover:text-emerald-700 flex items-center gap-1 mt-1 font-medium"
            >
              <Phone size={14} />
              {order.farmer_phone}
            </a>
          </div>
          <button
            onClick={fetchOrder}
            className="self-start sm:self-center flex items-center gap-2 text-sm text-gray-550 hover:text-emerald-600 font-medium transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Order Status</h2>
        <OrderTimeline
          status={order.order_status}
          timestamps={{
            created_at: order.created_at,
            confirmed_at: order.confirmed_at,
            packed_at: order.packed_at,
            out_for_delivery_at: order.out_for_delivery_at,
            delivered_at: order.delivered_at,
            completed_at: order.completed_at,
          }}
        />
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between">
              <div>
                <p className="font-medium text-gray-950">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.unit} × ₹{item.price}
                </p>
              </div>
              <p className="font-semibold text-gray-900">₹{(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <span>Delivery ({order.delivery_distance_km.toFixed(1)} km)</span>
            <span>₹{order.delivery_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
