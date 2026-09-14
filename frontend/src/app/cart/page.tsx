// frontend/src/app/cart/page.tsx
'use client';

import { useCart } from '@/context/cartcontext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';

const DELIVERY_FEE = 30;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal } = useCart();
  const router = useRouter();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-earth-50 flex items-center justify-center font-sans">
        <div className="card text-center p-12 max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-earth-400" />
          </div>
          <h2 className="text-2xl font-bold font-display text-earth-900 mb-2">Your cart is empty</h2>
          <p className="text-earth-500 mb-8">Add fresh products from nearby farmers</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="btn-primary w-full text-base h-12"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-earth-50 font-sans pb-24">
      
      {/* ── Top Nav ── */}
      <div className="bg-white border-b border-earth-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-earth-600 hover:text-earth-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-enter">
        <h1 className="text-3xl font-extrabold font-display text-earth-900 mb-8 tracking-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="card p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-earth-100 rounded-xl overflow-hidden border border-earth-100">
                  <Image
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col min-w-0 py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-earth-900 truncate">{product.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-earth-500 mt-1">
                        <span>{product.farmer_name}</span>
                        {product.distance_km && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-earth-300" />
                            <MapPin className="w-3 h-3 text-earth-400" />
                            <span>{product.distance_km.toFixed(1)} km</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-primary-700">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div className="flex items-center bg-earth-50 border border-earth-200 rounded-xl p-1 shrink-0 h-10">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-earth-600 hover:bg-white hover:text-earth-900 rounded-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-earth-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock_available}
                        className="w-8 h-8 flex items-center justify-center text-earth-600 hover:bg-white hover:text-earth-900 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-earth-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                  
                  {quantity > product.stock_available && (
                    <p className="text-red-600 text-xs font-semibold mt-2">
                      Only {product.stock_available} available in stock
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold font-display text-earth-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-earth-600 font-medium">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-earth-900 font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-earth-600 font-medium">
                  <span>Platform & Delivery Fee</span>
                  <span className="text-earth-900 font-semibold">{formatPrice(DELIVERY_FEE)}</span>
                </div>
              </div>
              
              <div className="border-t border-earth-100 pt-4 mb-8 flex justify-between items-center">
                <span className="text-base font-bold text-earth-900">Total</span>
                <span className="text-2xl font-black text-primary-700">{formatPrice(subtotal + DELIVERY_FEE)}</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/checkout')}
                  className="btn-primary w-full h-12 text-base flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => router.push('/marketplace')}
                  className="btn-secondary w-full h-12"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
