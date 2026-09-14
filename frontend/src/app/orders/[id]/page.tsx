// frontend/src/app/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getOrderById, Order } from '@/lib/api/orders';
import OrderTimeline from '@/components/order/OrderTimeline';
import { CheckCircle, Loader2, Phone, RefreshCw, Package, MapPin, Store, ArrowLeft, Home, Truck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { AnimatedBeam } from '@/components/magicui/AnimatedBeam';

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const justPlaced = searchParams.get('placed') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const farmRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);

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
      <div className="min-h-screen bg-earth-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-earth-200 text-center max-w-md w-full">
          <Package className="w-16 h-16 text-earth-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-earth-900 mb-2">{error || 'Order not found'}</p>
          <p className="text-earth-500 mb-8">We couldn't locate this order in our system.</p>
          <div className="flex flex-col gap-3">
            <button onClick={fetchOrder} className="btn-primary w-full">Retry</button>
            <Link href="/consumer/orders" className="btn-secondary w-full">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = JSON.parse(order.items) as Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;

  const formatPrice = (price: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(price as string));

  return (
    <div className="min-h-screen bg-earth-50 font-sans pb-24">
      
      {/* ── Top Nav ── */}
      <div className="bg-white border-b border-earth-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link href="/consumer/orders" className="inline-flex items-center gap-2 text-earth-600 hover:text-earth-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-enter">
        
        {/* Success banner */}
        {justPlaced && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm"
          >
            <div className="bg-white p-2 rounded-full shadow-sm">
              <CheckCircle className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900 mb-1">
                Order Placed Successfully!
              </h2>
              <p className="text-primary-700 font-medium text-sm md:text-base">
                Order <span className="font-bold">{order.order_number}</span> is now waiting
                for farmer confirmation. Thank you for supporting local agriculture.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Animated Tracking Visual ── */}
        <div ref={containerRef} className="relative w-full h-32 lg:h-40 bg-earth-900 rounded-[2rem] p-6 lg:px-12 flex justify-between items-center overflow-hidden shadow-xl border border-earth-800 mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-earth-900 to-earth-900" />
          
          <div ref={farmRef} className="relative z-10 w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
            <Store className="w-8 h-8 lg:w-10 lg:h-10 text-primary-400" />
          </div>
          
          <div className="relative z-10 text-center px-4 bg-earth-900/50 backdrop-blur-sm rounded-full py-2 px-6 border border-white/5">
            <h3 className="text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary-400" /> 
              {order.order_status.replace('_', ' ')}
            </h3>
          </div>
          
          <div ref={homeRef} className="relative z-10 w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 lg:w-10 lg:h-10 text-accent-400" />
          </div>

          <AnimatedBeam 
            containerRef={containerRef}
            fromRef={farmRef}
            toRef={homeRef}
            curvature={20}
            pathColor="rgba(255,255,255,0.05)"
            gradientStartColor="#60b682"
            gradientStopColor="#e76f51"
            pathWidth={3}
          />
        </div>

        {/* Header */}
        <div className="card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-earth-900 tracking-tight">Order {order.order_number}</h1>
              <p className="text-earth-500 font-medium mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>
            <div className="text-left md:text-right bg-earth-50 p-4 rounded-xl border border-earth-100">
              <p className="text-sm font-bold text-earth-500 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-3xl font-black text-primary-700">
                {formatPrice(order.total_amount)}
              </p>
              <p className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded inline-block mt-2">Cash on Delivery</p>
            </div>
          </div>

          <div className="border-t border-earth-100 pt-6 flex flex-col sm:flex-row sm:justify-between gap-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-earth-500 uppercase tracking-wider mb-0.5">Sold By</p>
                <p className="font-bold text-earth-900 text-lg">{order.farmer_name}</p>
                <a
                  href={`tel:${order.farmer_phone}`}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1.5 mt-1 font-medium transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {order.farmer_phone}
                </a>
              </div>
            </div>
            <button
              onClick={fetchOrder}
              className="btn-secondary self-start sm:self-center h-10 px-4 py-0"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-3">
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-bold text-earth-900 mb-8 tracking-tight">Delivery Status</h2>
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
          </div>

          {/* Items & Delivery Details */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="card p-6">
              <h2 className="text-lg font-bold text-earth-900 mb-6 tracking-tight">Delivery Address</h2>
              <div className="flex gap-3 text-sm text-earth-700 font-medium">
                <MapPin className="w-5 h-5 text-earth-400 shrink-0" />
                <div>
                  <p className="font-bold text-earth-900">{order.consumer_name}</p>
                  <p className="mt-1">{order.delivery_address}</p>
                  <p>{order.delivery_city} - {order.delivery_pincode}</p>
                  <p className="text-primary-600 mt-2 font-bold">{order.delivery_distance_km.toFixed(1)} km from farm</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-earth-900 mb-6 tracking-tight">Order Items</h2>
              <div className="divide-y divide-earth-100">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between text-sm">
                    <div>
                      <p className="font-bold text-earth-900">{item.name}</p>
                      <p className="text-xs font-medium text-earth-500 mt-0.5">
                        {item.quantity} {item.unit} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-earth-900">{formatPrice(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-earth-100 pt-4 mt-2 space-y-3">
                <div className="flex justify-between text-earth-600 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="text-earth-900">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-earth-600 text-sm font-medium">
                  <span>Delivery Fee</span>
                  <span className="text-earth-900">{formatPrice(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-4 border-t border-earth-100 text-earth-900">
                  <span>Total</span>
                  <span className="text-primary-700">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
