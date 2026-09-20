import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, User, Tractor, ArrowRight } from 'lucide-react';
import { ShineBorder } from '@/components/magicui/ShineBorder';
import Button from '@/components/ui/button';

interface FarmerStorefrontCardProps {
  farmer: {
    id: string | number;
    name: string;
    city: string;
    distance_km?: number;
    rating?: number;
    reviews_count?: number;
    joinedDate?: string;
    imageUrl?: string;
  };
}

const getFarmerFallbackImage = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=15803d&color=fff&size=200`;
};

export default function FarmerStorefrontCard({ farmer }: FarmerStorefrontCardProps) {
  return (
    <Link href={`/farmer/${farmer.id}`} className="block group">
      <ShineBorder 
        borderRadius={24} 
        borderWidth={1} 
        color={["#e1f3e7", "#c3e6d1"]}
        className="card h-full flex flex-col relative overflow-hidden bg-white w-full !min-w-0 !p-0 transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="relative h-20 bg-earth-200 w-full overflow-hidden">
          <Image 
            src="/products/organic_vegetables_basket.jpg" 
            alt="Farm Cover" 
            fill 
            className="object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        <div className="p-6 pt-0 relative">
          <div className="flex flex-col mb-4">
            <div className="-mt-8 mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white bg-earth-50 shrink-0 relative group-hover:border-primary-100 transition-colors shadow-sm">
                <Image 
                  src={farmer.imageUrl || getFarmerFallbackImage(farmer.name)} 
                  alt={farmer.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized={!farmer.imageUrl} 
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-earth-900 truncate font-display group-hover:text-primary-700 transition-colors">
                {farmer.name}
              </h3>
              
              <div className="flex items-center text-sm text-earth-500 mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-earth-400" />
                <span className="truncate">{farmer.city}</span>
              </div>
              
              {farmer.distance_km !== undefined && (
                <div className="mt-2 inline-flex items-center text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md border border-primary-100">
                  <Tractor className="w-3.5 h-3.5 mr-1" />
                  {farmer.distance_km < 1 ? 'Less than 1 km away' : `${farmer.distance_km.toFixed(1)} km away`}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-earth-100 mt-4">
            {farmer.rating ? (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-earth-900">{farmer.rating}</span>
                {farmer.reviews_count && (
                  <span className="text-xs text-earth-500">({farmer.reviews_count} reviews)</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-earth-400 italic">New Farmer</span>
            )}
            
            <span className="text-sm font-medium text-primary-600 flex items-center group-hover:translate-x-1 transition-transform">
              Visit Store <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </ShineBorder>
    </Link>
  );
}
