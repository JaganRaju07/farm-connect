// src/components/product/ProductCard.tsx
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
const getFallbackImageUrl = (category: string, name: string): string => {
  const n = name.toLowerCase();
  
  if (n.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop';
  if (n.includes('spinach') || n.includes('leaf') || n.includes('cabbage')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600&auto=format&fit=crop';
  if (n.includes('milk')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600&auto=format&fit=crop';
  if (n.includes('egg')) return 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?q=80&w=600&auto=format&fit=crop';
  
  switch (category?.toLowerCase()) {
    case 'fruits': return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=600&auto=format&fit=crop';
    case 'vegetables': return 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=600&auto=format&fit=crop';
    case 'dairy': return 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=600&auto=format&fit=crop';
    case 'grains': return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop';
    default: return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600&auto=format&fit=crop';
  }
};

export default function ProductCard({ product }: ProductCardProps) {
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
        className="card h-full flex flex-col relative overflow-hidden bg-white w-full !min-w-0 !p-0"
      >
        
        {/* ── Image Container ── */}
        <div className="relative h-56 w-full overflow-hidden bg-earth-100">
          <img
            src={imageUrl || getFallbackImageUrl(category, name)}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              // If the provided imageUrl itself is broken, fallback to category image
              e.currentTarget.src = getFallbackImageUrl(category, name);
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {distance_km !== undefined && distance_km !== null && (
              <span className={`inline-flex items-center gap-1 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${
                distance_km < 2 ? 'bg-primary-500/90 text-white' : 
                distance_km < 5 ? 'bg-primary-100/90 text-primary-700' : 
                'bg-white/90 text-earth-700'
              }`}>
                <MapPin className="w-3 h-3" />
                {distance_km < 2 ? 'Super Local' : distance_km < 5 ? 'Local' : 'Regional'}
              </span>
            )}
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

            {harvestDate && getRelativeHarvestDate(harvestDate) && (
              <div className="flex items-center text-xs font-medium text-success-700 bg-success-50 mt-2 px-2 py-1 rounded">
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
