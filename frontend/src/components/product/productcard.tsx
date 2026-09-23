'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User, Star, ShieldCheck, Clock, Leaf } from 'lucide-react';
import { Product } from '@/types';
import { getRelativeHarvestDate } from '@/lib/utils';
import WishlistButton from '@/components/product/WishlistButton';
import { ShineBorder } from '@/components/magicui/ShineBorder';

interface ProductCardProps {
  product: Product & {
    distance_km?: number;
    rating?: number;
    reviews_count?: number;
  };
}

// Helper to return a professional Unsplash image based on product category or name
export const getFallbackImageUrl = (category: string, name: string): string => {
  const n = name.toLowerCase();
  
  // High-Quality AI Generated Assets
  if (n.includes('honey')) return '/products/raw_honey_jar.jpg';
  if (n.includes('chilli') || n.includes('chili') || n.includes('basket')) return '/products/organic_vegetables_basket.jpg';
  if (n.includes('strawberry')) return '/products/fresh_strawberries.jpg';
  if (n.includes('spinach')) return '/products/organic_spinach.jpg';
  if (n.includes('egg')) return '/products/brown_eggs.jpg';
  if (n.includes('coconut oil')) return '/products/coconut_oil.jpg';
  if (n.includes('mint')) return '/products/mint_leaves.jpg';
  if (n.includes('avocado')) return '/products/local_avocados.jpg';
  if (n.includes('peanut butter')) return '/products/peanut_butter.jpg';
  if (n.includes('pepper')) return '/products/black_pepper.jpg';
  if (n.includes('milk') || n.includes('dairy')) return '/products/farm_fresh_dairy.jpg';
  if (n.includes('bread')) return '/products/artisanal_bread_wheat.jpg';
  if (n.includes('fruit assortment')) return '/products/exotic_fresh_fruits.jpg';
  
  // Reliable Unsplash Fallbacks
  if (n.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop';
  if (n.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop';
  if (n.includes('flour')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop';
  if (n.includes('turmeric') || n.includes('spice')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop';
  if (n.includes('onion')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=600&auto=format&fit=crop';
  if (n.includes('mushroom')) return 'https://images.unsplash.com/photo-1596464518939-50eb95f903dc?q=80&w=600&auto=format&fit=crop';
  if (n.includes('quinoa')) return 'https://images.unsplash.com/photo-1580828343064-fde4cad202d0?q=80&w=600&auto=format&fit=crop';
  if (n.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop';
  
  // Deterministic fallback from a pool of high-quality general farm images
  const fallbacks = [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop'
  ];
  
  // Simple hash based on name to pick a consistent image
  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = n.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbacks[Math.abs(hash) % fallbacks.length];
};

export default function ProductCard({ product }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || getFallbackImageUrl(product.category, product.name));

  const {
    id,
    name,
    price,
    unit,
    category,
    farmerName,
    farmerCity,
    imageUrl,
    stockAvailable,
    isOrganic,
    distance_km,
    rating,
    reviews_count,
    harvestDate
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
      <ShineBorder 
        borderRadius={24} 
        borderWidth={1.5} 
        color={["#3a9a62", "#e76f51", "#3a9a62"]}
        className="card h-full flex flex-col relative overflow-hidden bg-surface transition-colors w-full !min-w-0 !p-0"
      >
        
        {/* ── Image Container ── */}
        <div className="relative h-56 w-full overflow-hidden bg-surface-muted">
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => {
              setImgSrc(getFallbackImageUrl(category, name));
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {distance_km !== undefined && distance_km !== null && (
              <span className={`inline-flex items-center gap-1 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${
                distance_km < 2 ? 'bg-primary-500/90 text-white' : 
                distance_km < 5 ? 'bg-primary-100/90 dark:bg-primary-900/80 text-primary-700 dark:text-primary-300' : 
                'bg-surface/90 text-foreground-secondary border border-border-default'
              }`}>
                <MapPin className="w-3 h-3" />
                {distance_km < 2 ? 'Super Local' : distance_km < 5 ? 'Local' : 'Regional'}
              </span>
            )}
            {isOrganic && (
              <span className="inline-flex items-center gap-1 bg-surface/90 backdrop-blur-sm text-primary-700 dark:text-primary-400 border border-border-default px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
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
            <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {name}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold text-foreground-secondary">{rating}</span>
                {reviews_count && <span className="text-xs text-foreground-muted">({reviews_count})</span>}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-black text-primary-700 dark:text-primary-400 tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-foreground-muted text-sm font-medium">
              / {unit}
            </span>
          </div>

          {/* Farmer & Location Info */}
          <div className="mt-auto space-y-2 bg-surface-muted p-3 rounded-lg border border-border-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-foreground-secondary font-medium">
                <User className="w-4 h-4 mr-2 text-foreground-muted" />
                <span className="truncate max-w-[120px]">{farmerName}</span>
              </div>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 dark:text-red-400">Out of Stock</span>
              ) : (
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded text-center">Available</span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-foreground-muted" />
                <span className="truncate">{farmerCity}</span>
              </div>
              {distance_km && (
                <span className="font-semibold text-foreground-secondary bg-surface-elevated/50 px-1.5 py-0.5 rounded border border-border-default">
                  {distance_km.toFixed(1)} km
                </span>
              )}
            </div>

            {harvestDate && getRelativeHarvestDate(harvestDate) && (
              <div className="flex items-center text-xs font-medium text-success-700 dark:text-success-400 bg-success-50 dark:bg-success-900/30 mt-2 px-2 py-1 rounded">
                <Leaf className="w-3 h-3 mr-1.5" />
                {getRelativeHarvestDate(harvestDate)}
              </div>
            )}
          </div>

        </div>
      </ShineBorder>
    </Link>
  );
}
