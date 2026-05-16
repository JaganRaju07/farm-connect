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
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
        <button
          onClick={fetchOrder}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg"
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Success banner */}
      {justPlaced && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-8 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-green-900 mb-1">
              Order Placed Successfully!
            </h2>
            <p className="text-green-700">
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
            <p className="text-gray-600">
              {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-primary-600">
              ₹{order.total_amount.toFixed(2)}
            </p>
            <p className="text-sm text-amber-600">Cash on Delivery</p>
          </div>
        </div>

        <div className="border-t pt-4 flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Farmer</p>
            <p className="font-medium">{order.farmer_name}</p>
            <a
              href={`tel:${order.farmer_phone}`}
              className="text-sm text-primary-600 flex items-center gap-1 mt-1"
            >
              <Phone size={14} />
              {order.farmer_phone}
            </a>
          </div>
          <button
            onClick={fetchOrder}
            className="self-start sm:self-center flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
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
        <div className="divide-y">
          {items.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit} × ₹{item.price}
                </p>
              </div>
              <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mt-2 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery ({order.delivery_distance_km.toFixed(1)} km)</span>
            <span>₹{order.delivery_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
