// src/components/product/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User, Star, ShieldCheck, Clock } from 'lucide-react';
import { Product } from '@/types';
import WishlistButton from '@/components/product/WishlistButton';

interface ProductCardProps {
  product: Product & {
    distance_km?: number;
    rating?: number;
    reviews_count?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    name,
    price,
    unit,
    farmerName,
    farmerCity,
    imageUrl,
    stockAvailable,
    isOrganic,
    distance_km,
    rating,
    reviews_count
  } = product;

  const isOutOfStock = stockAvailable === 0;
  const isLowStock = stockAvailable > 0 && stockAvailable <= 10;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/product/${id}`} className="block group h-full">
      <article className="card h-full flex flex-col relative overflow-hidden bg-white">
        
        {/* ── Image Container ── */}
        <div className="relative h-56 w-full overflow-hidden bg-earth-100">
          <Image
            src={imageUrl || '/images/placeholder-product.jpg'}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isOrganic && (
              <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-primary-700 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                <ShieldCheck className="w-3 h-3" />
                Organic
              </span>
            )}
            {isLowStock && (
              <span className="inline-flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                <Clock className="w-3 h-3" />
                Low Stock
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 z-10">
            <div onClick={(e) => e.preventDefault()}>
              <WishlistButton productId={Number(id)} size="sm" />
            </div>
          </div>

          {/* Hover CTA */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 w-[90%]">
            <div className="bg-primary-600 text-white text-center py-2 rounded-lg text-sm font-semibold shadow-md">
              View Details
            </div>
          </div>
        </div>

        {/* ── Content Container ── */}
        <div className="p-5 flex flex-col flex-grow">
          
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-earth-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
              {name}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-earth-700">{rating}</span>
                {reviews_count && <span className="text-xs text-earth-400">({reviews_count})</span>}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-black text-primary-700 tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-earth-500 text-sm font-medium">
              / {unit}
            </span>
          </div>

          {/* Farmer & Location Info */}
          <div className="mt-auto space-y-2 bg-earth-50 p-3 rounded-lg border border-earth-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-earth-700 font-medium">
                <User className="w-4 h-4 mr-2 text-earth-400" />
                <span className="truncate max-w-[120px]">{farmerName}</span>
              </div>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600">Out of Stock</span>
              ) : (
                <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded text-center">Available</span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-earth-500">
              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-earth-400" />
                <span className="truncate">{farmerCity}</span>
              </div>
              {distance_km && (
                <span className="font-semibold text-earth-600 bg-earth-200/50 px-1.5 py-0.5 rounded">
                  {distance_km.toFixed(1)} km
                </span>
              )}
            </div>
          </div>

        </div>
      </article>
    </Link>
  );
}
