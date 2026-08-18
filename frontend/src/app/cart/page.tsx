// frontend/src/app/cart/page.tsx

'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const DELIVERY_FEE = 30;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal } = useCart();
  const router = useRouter();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add fresh products from nearby farmers</p>
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 flex gap-4"
            >
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">
                  {product.farmer_name} • {product.distance_km.toFixed(1)} km
                </p>
                <p className="text-primary-600 font-semibold mt-1">
                  ₹{product.price}/{product.unit}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stock_available}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-sm text-gray-500">{product.unit}</span>
                </div>

                {quantity > product.stock_available && (
                  <p className="text-red-600 text-sm mt-2">
                    Only {product.stock_available} available
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between items-end">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  aria-label="Remove"
                >
                  <Trash2 size={20} />
                </button>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Subtotal</p>
                  <p className="text-lg font-bold">
                    ₹{(product.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">₹{DELIVERY_FEE}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{(subtotal + DELIVERY_FEE).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => router.push('/marketplace')}
              className="w-full mt-3 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

