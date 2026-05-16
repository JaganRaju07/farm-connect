// frontend/src/app/checkout/page.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useCart } from '@/context/CartContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRouter } from 'next/navigation';
import { placeOrder } from '@/lib/api/orders';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';

const DELIVERY_FEE = 30;

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCart();
  const { latitude, longitude } = useGeolocation();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getSubtotal();

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
        farmerId: i.product.farmer_id,
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
      router.push(`/orders/${order.id}?placed=true`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location indicator */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary-800">Delivery Location</p>
                <p className="text-xs text-primary-600">
                  {latitude?.toFixed(6)}°N, {longitude?.toFixed(6)}°E
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Address *</label>
              <textarea
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="House/Flat, Street, Landmark..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Bengaluru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="560001"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Any requests for the farmer..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order (Cash on Delivery)'
              )}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate pr-2">
                    {product.name} × {quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium">₹{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>₹{(subtotal + DELIVERY_FEE).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-sm text-amber-800">
                💰 Cash on Delivery — Pay when your order arrives
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
