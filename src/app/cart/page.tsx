'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/button';

const DELIVERY_FEE = 30;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal } = useCart();
  const router = useRouter();
  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-700">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-20 h-20 text-stone-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-stone-900 mb-2">Your cart is empty</h2>
            <p className="text-stone-600 mb-8">Add fresh products from nearby farmers.</p>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-8 py-3 rounded-lg"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <Card key={product.id} className="p-4 shadow-sm rounded-xl border border-stone-200 bg-white flex gap-4 items-center">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={product.image_url || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-lg text-stone-900 truncate">{product.name}</h3>
                    <p className="text-sm text-stone-600">
                      {product.farmer_name} • {product.distance_km.toFixed(1)} km
                    </p>
                    <p className="text-emerald-800 font-semibold mt-1">
                      ₹{product.price}/{product.unit}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 border border-stone-300 rounded hover:bg-stone-100 text-stone-600"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium text-stone-900">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock_available}
                        className="p-1 border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-50 text-stone-600"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="text-sm text-stone-500">{product.unit}</span>
                    </div>

                    {quantity > product.stock_available && (
                      <p className="text-red-600 text-sm mt-2">
                        Only {product.stock_available} available
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end h-full py-2">
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="text-right">
                      <p className="text-xs text-stone-500 mb-1">Subtotal</p>
                      <p className="text-lg font-bold text-stone-900">
                        ₹{(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div>
              <Card className="p-6 shadow-sm rounded-xl border border-stone-200 bg-white sticky top-24">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-serif text-stone-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4 mb-6 font-sans text-stone-700">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-stone-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-medium text-stone-900">₹{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-stone-200 pt-4 flex justify-between text-lg font-bold text-stone-900">
                      <span>Total</span>
                      <span>₹{(subtotal + DELIVERY_FEE).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-3"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push('/marketplace')}
                    className="w-full border border-stone-300 text-stone-700 hover:bg-stone-50 py-3 rounded-lg"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
