// src/components/product/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User } from 'lucide-react';
import { Product } from '@/types/product';
import Badge from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product;
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
  } = product;

  const isOutOfStock = stockAvailable === 0;
  const isLowStock = stockAvailable > 0 && stockAvailable <= 10;

  // Format price with Indian rupee symbol
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/product/${id}`} className="block group">
      <article className="card overflow-hidden h-full flex flex-col">
        {/* Image container */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl || '/images/placeholder-product.jpg'}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges container */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isOrganic && (
              <Badge variant="success">Organic</Badge>
            )}
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Product name */}
          <h3 className="font-semibold text-lg text-earth-800 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold text-primary-600">
              {formattedPrice}
            </span>
            <span className="text-earth-500 text-sm">
              per {unit}
            </span>
          </div>

          {/* Farmer info */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center text-sm text-earth-600">
              <User 
                size={14} 
                className="mr-1.5 flex-shrink-0" 
                aria-hidden="true" 
              />
              <span className="truncate">{farmerName}</span>
            </div>
            <div className="flex items-center text-sm text-earth-600">
              <MapPin 
                size={14} 
                className="mr-1.5 flex-shrink-0" 
                aria-hidden="true" 
              />
              <span className="truncate">{farmerCity}</span>
            </div>
          </div>

          {/* Stock status */}
          <div className="mt-auto pt-2 border-t border-earth-100">
            {isOutOfStock ? (
              <span className="text-sm font-medium text-red-600">
                Out of stock
              </span>
            ) : isLowStock ? (
              <span className="text-sm font-medium text-amber-600">
                Only {stockAvailable} {unit} left
              </span>
            ) : (
              <span className="text-sm text-green-600">
                {stockAvailable} {unit} available
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
