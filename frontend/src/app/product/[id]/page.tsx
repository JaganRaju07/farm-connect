'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { useCart } from '@/context/cartcontext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Star, Leaf, Package, Minus, Plus, ShoppingCart, ArrowLeft, ShieldCheck, Share2, Clock } from 'lucide-react';
import ReviewForm from '@/components/reviews/ReviewForm';
import Link from 'next/link';
import ProductDetailSkeleton from '@/components/product/ProductDetailSkeleton';
import Button from '@/components/common/button';
import { getRelativeHarvestDate } from '@/lib/utils';
import { getFallbackImageUrl } from '@/components/product/productcard';
import Input from '@/components/ui/Input';
import FreshnessSnapshot from '@/components/product/FreshnessSnapshot';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { success, error: showError } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/products/${id}`),
      axios.get(`${API}/reviews/product/${id}`)
    ]).then(([pRes, rRes]) => {
      setProduct(pRes.data.data.product || pRes.data.data);
      setReviews(rRes.data.data);
      
      // Handle Recently Viewed
      const saved = localStorage.getItem('farmconnect_recently_viewed');
      let viewed = [];
      if (saved) {
        try { viewed = JSON.parse(saved); } catch (e) { viewed = []; }
      }
      setRecentlyViewed(viewed.filter((v: any) => v.id !== parseInt(id))); // Don't show current product in recently viewed
      
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (product) {
      const saved = localStorage.getItem('farmconnect_recently_viewed');
      let viewed = [];
      if (saved) {
        try { viewed = JSON.parse(saved); } catch (e) { viewed = []; }
      }
      viewed = viewed.filter((p: any) => p.id !== product.id);
      viewed.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        category: product.category,
        primary_image_url: product.imageUrl,
        is_organic: product.isOrganic
      });
      if (viewed.length > 5) viewed = viewed.slice(0, 5);
      localStorage.setItem('farmconnect_recently_viewed', JSON.stringify(viewed));
    }
  }, [product]);

  if (loading) return <ProductDetailSkeleton />;

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 font-sans">
      <div className="card text-center p-12">
        <Package className="w-12 h-12 text-earth-300 mx-auto mb-4" />
        <p className="text-lg text-earth-900 font-bold font-display mb-4">Product not found</p>
        <Button onClick={() => router.push('/marketplace')} variant="secondary">
          Return to Marketplace
        </Button>
      </div>
    </div>
  );

  const images = product.image_urls?.length > 0 
    ? product.image_urls 
    : product.imageUrl ? [product.imageUrl] : [getFallbackImageUrl(product.category, product.name)];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + window.location.pathname); 
      return;
    }
    addToCart(product, qty);
    success(`${product.name} added to cart!`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Farm Connect!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Product link copied!');
    }
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  const totalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price * qty);

  return (
    <div className="min-h-screen bg-earth-50 font-sans pb-24">
      
      {/* ── Top Nav Area ── */}
      <div className="bg-white border-b border-earth-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-earth-600 hover:text-earth-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-enter">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* ── Left: Image Gallery ── */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-earth-100 rounded-2xl overflow-hidden border border-earth-200 group shadow-sm">
              <Image 
                src={images[activeImage]} 
                alt={product.name} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {product.isOrganic && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary-700 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm font-bold border border-primary-100">
                  <ShieldCheck className="w-4 h-4" /> Organic Certified
                </span>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === i ? 'border-primary-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div className="flex flex-col">
            <div className="mb-6 border-b border-earth-200 pb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">{product.category}</p>
                <button onClick={handleShare} className="p-2 text-earth-500 hover:text-earth-900 bg-earth-100 hover:bg-earth-200 rounded-full transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-earth-900 mb-4 tracking-tight leading-tight font-display">{product.name}</h1>
              
              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-earth-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-earth-800">
                    {parseFloat(product.rating).toFixed(1)}
                  </span>
                  <span className="text-sm text-earth-500">
                    ({product.reviews_count || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-primary-700 tracking-tight">{formattedPrice}</span>
                <span className="text-lg text-earth-500 font-medium">/ {product.unit}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-earth-900 mb-2 uppercase tracking-wider">About this product</h3>
                <p className="text-earth-600 leading-relaxed text-sm md:text-base">{product.description}</p>
              </div>
            )}

            {/* Freshness Snapshot */}
            <FreshnessSnapshot harvestDate={product.harvestDate} distanceKm={product.distance_km} />

            {/* Farmer Trust Card */}
            <div className="card p-5 mt-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-800 text-lg border border-primary-200 shrink-0">
                  {product.farmerName ? product.farmerName[0] : 'F'}
                </div>
                <div>
                  <p className="text-xs text-earth-500 font-medium mb-0.5">Grown by</p>
                  <p className="font-bold text-earth-900 text-lg leading-tight">{product.farmerName || 'Local Farmer'}</p>
                </div>
              </div>
              <div className="bg-earth-100/50 px-3 py-2 rounded-lg text-right">
                <div className="flex items-center gap-1.5 text-earth-700 font-medium text-sm">
                  <MapPin className="w-4 h-4 text-earth-400" /> {product.farmerCity || 'Nearby'}
                </div>
                {product.distance_km && (
                  <p className="text-xs font-semibold text-primary-700 mt-1">{product.distance_km.toFixed(1)} km away</p>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="mt-auto pt-6">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-earth-900">Availability</span>
                  {product.stock_available > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100">
                      <Package className="w-4 h-4" />
                      {product.stock_available} {product.unit} in stock
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                      Out of stock
                    </span>
                  )}
                </div>

                {product.harvestDate && getRelativeHarvestDate(product.harvestDate) && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-earth-900">Freshness</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-success-700 bg-success-50 px-2.5 py-1 rounded-md border border-success-100">
                      <Leaf className="w-4 h-4" />
                      {getRelativeHarvestDate(product.harvestDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Mobile / Inline Desktop Purchase Action */}
            {product.stock_available > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-earth-200 p-4 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] lg:static lg:bg-transparent lg:border-0 lg:p-0 lg:shadow-none lg:mt-2">
                <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-4">
                  {/* Qty Selector */}
                  <div className="flex items-center justify-between bg-earth-50 border border-earth-200 rounded-xl p-1 h-14 shrink-0 w-28 sm:w-32">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 sm:w-10 h-full flex items-center justify-center text-earth-600 hover:text-earth-900 hover:bg-white rounded-lg transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-center font-bold text-lg text-earth-900 flex-1">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock_available, q + 1))} className="w-8 sm:w-10 h-full flex items-center justify-center text-earth-600 hover:text-earth-900 hover:bg-white rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* CTA */}
                  <Button onClick={handleAddToCart} variant="primary" className="flex-1 h-14 text-base shadow-[0_4px_20px_rgba(21,128,61,0.2)]">
                    <ShoppingCart className="w-5 h-5 hidden sm:block" />
                    <span className="hidden sm:inline">Add to Cart — {totalPrice}</span>
                    <span className="sm:hidden">Add — {totalPrice}</span>
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="card p-8 lg:p-12 mt-16">
          <h2 className="text-2xl font-bold mb-8 text-earth-900 tracking-tight font-display">Customer Reviews</h2>
          
          {reviews?.summary && (
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-earth-100">
              <div className="text-center sm:text-left flex flex-col items-center sm:items-start bg-earth-50 p-6 rounded-2xl border border-earth-200">
                <p className="text-5xl font-black text-earth-900 tracking-tighter">
                  {parseFloat(reviews.summary.average_rating || '0').toFixed(1)}
                </p>
                <div className="flex gap-1 mt-3 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(reviews.summary.average_rating) ? 'text-amber-400 fill-amber-400' : 'text-earth-200'}`} />
                  ))}
                </div>
                <p className="text-sm font-semibold text-earth-500">Based on {reviews.summary.review_count} verified ratings</p>
              </div>
            </div>
          )}

          {reviews?.reviews?.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-earth-200 mx-auto mb-3" />
              <p className="text-earth-500 font-medium">No reviews yet. Be the first to review this product!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {reviews?.reviews?.map((review: any) => (
              <div key={review.id} className="bg-earth-50 p-6 rounded-2xl border border-earth-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-earth-200 flex items-center justify-center text-base font-bold text-earth-700 shrink-0">
                    {review.consumer_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-earth-900">{review.consumer_name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-earth-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-earth-700 leading-relaxed text-sm">"{review.review_text}"</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Review Form - Consumers can leave reviews */}
          {isAuthenticated && (
            <div className="pt-8 border-t border-earth-100">
              <h3 className="text-lg font-bold text-earth-900 mb-4">Leave a Review</h3>
              <ReviewForm 
                productId={Number(id)} 
                orderId={0} /* In a real app, you'd pass the actual orderId they purchased from */
                onSubmitted={() => {
                  axios.get(`${API}/reviews/product/${id}`).then(res => setReviews(res.data.data));
                }} 
              />
            </div>
          )}
        </div>

        {/* ── Recently Viewed Products ── */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 border-t border-earth-200 pt-16">
            <h2 className="text-2xl font-extrabold text-earth-900 mb-8 font-display">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed.map((p: any) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group block">
                  <div className="bg-white rounded-2xl p-3 border border-earth-100 shadow-sm hover:shadow-md transition-all hover:border-primary-200">
                    <div className="aspect-square relative rounded-xl overflow-hidden bg-earth-50 mb-3">
                      <Image 
                        src={p.primary_image_url || getFallbackImageUrl(p.category, p.name)} 
                        alt={p.name} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="font-bold text-sm text-earth-900 truncate group-hover:text-primary-700 transition-colors">{p.name}</p>
                    <p className="text-primary-700 font-extrabold mt-1">₹{p.price} <span className="text-xs text-earth-500 font-medium">/{p.unit}</span></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
