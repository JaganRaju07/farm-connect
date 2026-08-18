// frontend/src/app/product/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, Product } from '@/lib/api/products';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { MapPin, User, Navigation, ShoppingCart, Plus, Minus, ArrowLeft, Loader2, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string, 10);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { latitude, longitude } = useLocation();

  useEffect(() => {
    if (isNaN(productId)) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
        if (data.minimum_order_quantity) {
          setQuantity(data.minimum_order_quantity);
        }
      } catch (err) {
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (val: number) => {
    if (!product) return;
    const min = product.minimum_order_quantity || 1;
    const max = product.stock_available;
    setQuantity(Math.max(min, Math.min(max, val)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-650 mb-4 font-semibold">{error || 'Product not found'}</p>
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const outOfStock = product.stock_available === 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      <Link 
        href="/marketplace" 
        className="flex items-center gap-2 text-sm text-gray-550 hover:text-emerald-600 transition-colors mb-6 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
        {/* Left: Image */}
        <div className="relative h-96 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          <Image
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.is_organic && (
            <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">
              🌿 Organic
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-black text-xl px-4 py-2 border-2 border-white rounded-md">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{product.category}</span>
              <h1 className="text-3xl font-black text-gray-950 mt-2">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">₹{product.price}</span>
              <span className="text-gray-500 text-sm">/ {product.unit}</span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {product.description || 'No description provided for this farm product.'}
            </p>

            {/* Logistics details */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Farmer</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1">
                    {product.farmer_name}
                    {product.farmer_verified && <Award className="w-4 h-4 text-emerald-600" />}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Origin</span>
                  <span className="font-semibold text-gray-900">{product.farmer_city}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-emerald-650 font-semibold">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <span>{product.distance_km ? `${product.distance_km.toFixed(1)} km away` : 'Calculating distance...'}</span>
              </div>
            </div>
          </div>

          {/* Cart triggers */}
          <div className="pt-6 border-t border-gray-100 mt-6 space-y-4">
            {!outOfStock ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Stock Available: </span>
                    <span className="font-semibold text-emerald-700">{product.stock_available} {product.unit}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="p-1.5 border border-gray-300 rounded hover:bg-gray-105 transition-colors cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-1.5 border border-gray-300 rounded hover:bg-gray-105 transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-sm text-gray-500 font-medium">{product.unit}</span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <ShoppingCart size={20} />
                  Add to Cart • ₹{(product.price * quantity).toFixed(0)}
                </button>
              </>
            ) : (
              <div className="bg-red-50 text-red-650 text-center py-3 rounded-lg font-bold">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
