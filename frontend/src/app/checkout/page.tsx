// frontend/src/app/checkout/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useCart } from '@/context/cartcontext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRouter } from 'next/navigation';
import { placeOrder } from '@/lib/api/orders';
import { MapPin, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import Button from '@/components/common/button';
import { useToast } from '@/context/ToastContext';

const DELIVERY_FEE = 30;

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']} redirectTo="/login">
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const { items, getSubtotal, clearCart } = useCart();
  const { latitude, longitude } = useGeolocation();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const subtotal = getSubtotal();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      setError('Location required. Please enable location access.');
      return;
    }

    if (items.length === 0) {
      setError('Cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        unit: i.product.unit,
        price: i.product.price,
        farmerId: i.product.farmerId,
      }));

      const order = await placeOrder({
        items: orderItems,
        deliveryAddress: address,
        deliveryCity: city,
        deliveryPincode: pincode,
        latitude,
        longitude,
        consumerNotes: notes || undefined,
      });

      clearCart();
      success('Order placed successfully!');
      router.push(`/orders/${order.id}?placed=true`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      setIsRedirecting(true);
      router.replace('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0 || isRedirecting) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-24 transition-colors duration-200">
      
      {/* ── Top Nav ── */}
      <div className="bg-surface border-b border-border-default sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/cart" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-enter">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold font-display text-foreground tracking-tight">Checkout</h1>
          <p className="text-foreground-secondary mt-2">Complete your order with farm-fresh products.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ── Form Section ── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-8 p-6 md:p-8">
              
              <div className="border-b border-border-default pb-6 transition-colors">
                <h2 className="text-lg font-bold font-display text-foreground mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-sm border border-primary-200 dark:border-primary-800">1</span>
                  Delivery Details
                </h2>
                
                {/* Location indicator */}
                <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/50 rounded-xl p-4 flex items-start gap-4 mb-6">
                  <div className="bg-surface p-2 rounded-lg shadow-sm border border-border-default">
                    <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">GPS Location Active</p>
                    <p className="text-sm text-foreground-secondary mt-0.5">
                      {latitude?.toFixed(4)}°N, {longitude?.toFixed(4)}°E
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-1">Delivery Address *</label>
                    <textarea
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-surface border rounded-lg text-foreground placeholder:text-foreground-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-surface border-border-default focus:border-primary-500 focus:ring-primary-500 disabled:bg-surface-muted disabled:cursor-not-allowed resize-none"
                      placeholder="House/Flat, Street, Landmark..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <Input
                      label="City *"
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Bengaluru"
                    />
                    <Input
                      label="Pincode *"
                      type="text"
                      required
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="560001"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 bg-surface border rounded-lg text-foreground placeholder:text-foreground-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-surface border-border-default focus:border-primary-500 focus:ring-primary-500 disabled:bg-surface-muted disabled:cursor-not-allowed resize-none"
                      placeholder="Any requests for the farmer (e.g. ring bell upon arrival)..."
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                loadingText="Placing Order..."
                variant="primary"
                fullWidth
                size="lg"
                className="h-14 text-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Place Order (Cash on Delivery)
              </Button>
            </form>
          </div>

          {/* ── Order Summary Section ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 bg-surface border-border-default transition-colors">
              <h2 className="text-lg font-bold font-display text-foreground mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-surface-muted border border-border-default text-foreground-secondary flex items-center justify-center text-sm">2</span>
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-start text-sm group">
                    <div className="pr-4">
                      <p className="font-semibold text-foreground">{product.name}</p>
                      <p className="text-foreground-muted text-xs mt-0.5">Qty: {quantity}</p>
                    </div>
                    <span className="font-bold text-foreground">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-default pt-6 space-y-4 transition-colors">
                <div className="flex justify-between text-sm text-foreground-secondary font-medium">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground-secondary font-medium">
                  <span>Platform & Delivery</span>
                  <span className="text-foreground font-semibold">{formatPrice(DELIVERY_FEE)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-border-default transition-colors">
                  <span className="text-base font-bold text-foreground">Total to pay</span>
                  <span className="text-2xl font-black text-primary-700 dark:text-primary-400">{formatPrice(subtotal + DELIVERY_FEE)}</span>
                </div>
              </div>

              <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/50 rounded-xl p-4 flex items-start gap-3">
                <div className="text-lg">💰</div>
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-500">Cash on Delivery</p>
                  <p className="text-xs text-amber-700 dark:text-amber-600/90 mt-0.5 leading-relaxed">
                    You only pay when your order arrives. No online payment required today.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
