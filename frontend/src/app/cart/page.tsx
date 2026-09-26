// frontend/src/app/cart/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/cartcontext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import Button, { getButtonClasses } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { GradientDivider } from '@/components/common/GradientDivider';
import { getFallbackImageUrl } from '@/components/product/productcard';

const DELIVERY_FEE = 30;

function CartItemImage({ product }: { product: any }) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || getFallbackImageUrl(product.category || '', product.name));
  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-surface-muted rounded-xl overflow-hidden border border-border-default">
      <Image
        src={imgSrc}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 100px, 128px"
        className="object-cover"
        onError={() => {
          const fallback = getFallbackImageUrl(product.category || '', product.name);
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          } else {
            setImgSrc('/products/organic_vegetables_basket.jpg');
          }
        }}
      />
    </div>
  );
}

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal } = useCart();
  const router = useRouter();
  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans px-4 transition-colors duration-200">
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10 text-foreground-muted" />}
          title="Your cart is empty"
          description="Add fresh products from nearby farmers."
          actionText="Browse Products"
          actionHref="/marketplace"
        />
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
    <div className="min-h-screen bg-background font-sans pb-24 transition-colors duration-200">
      
      {/* ── Top Nav ── */}
      <div className="bg-surface border-b border-border-default sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-enter">
        <h1 className="text-3xl font-extrabold font-display text-foreground mb-8 tracking-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="card p-4 flex gap-4 bg-surface border-border-default transition-colors"
              >
                <CartItemImage product={product} />

                <div className="flex-1 flex flex-col min-w-0 py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-foreground truncate">{product.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted mt-1">
                        <span>{product.farmerName}</span>
                        {product.distance_km && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border-default" />
                            <MapPin className="w-3 h-3 text-foreground-muted" />
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
                    <div className="flex items-center bg-surface-muted border border-border-default rounded-xl p-1 shrink-0 h-10 transition-colors">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-foreground-secondary hover:bg-surface hover:text-foreground rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-foreground" aria-live="polite">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stockAvailable}
                        className="w-8 h-8 flex items-center justify-center text-foreground-secondary hover:bg-surface hover:text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-foreground-muted hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                  
                  {quantity > product.stockAvailable && (
                    <p className="text-red-600 text-xs font-semibold mt-2">
                      Only {product.stockAvailable} available in stock
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 bg-surface border-border-default transition-colors">
              <h2 className="text-lg font-bold font-display text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-foreground-secondary font-medium">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-foreground-secondary font-medium">
                  <span>Platform & Delivery Fee</span>
                  <span className="text-foreground font-semibold">{formatPrice(DELIVERY_FEE)}</span>
                </div>
              </div>
              
              <GradientDivider intensity="light" className="mb-4" />
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-black text-primary-700 dark:text-primary-400">{formatPrice(subtotal + DELIVERY_FEE)}</span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className={getButtonClasses('primary', 'md', true, 'h-12 text-base flex items-center justify-center gap-2')}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Button
                  variant="secondary"
                  onClick={() => router.push('/marketplace')}
                  className="w-full h-12"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
