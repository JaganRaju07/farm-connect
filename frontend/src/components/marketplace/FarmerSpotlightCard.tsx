// frontend/src/components/marketplace/FarmerSpotlightCard.tsx
'use client';

import { MapPin, Star, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FarmerSpotlightCardProps {
  farmer: any;
}

export default function FarmerSpotlightCard({ farmer }: FarmerSpotlightCardProps) {
  return (
    <div className="col-span-full bg-earth-900 text-white rounded-3xl overflow-hidden shadow-xl mb-4 flex flex-col md:flex-row relative group">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-400 via-transparent to-transparent transition-opacity group-hover:opacity-30 duration-500" />
      
      <div className="md:w-1/3 relative min-h-[200px] md:min-h-full bg-earth-800 overflow-hidden">
        <Image 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=166534&color=fff&size=400&bold=true`}
          alt={farmer.name}
          fill
          unoptimized
          className="object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-earth-900/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-earth-900/80 md:to-earth-900" />
      </div>

      <div className="md:w-2/3 p-8 md:p-10 relative z-10 flex flex-col justify-center">
        <div className="flex items-center gap-2 text-primary-400 mb-3 font-bold tracking-widest text-xs uppercase">
          <Star className="w-3.5 h-3.5 fill-primary-400" />
          Featured Local Farmer
        </div>
        
        <h3 className="text-3xl md:text-4xl font-extrabold font-display mb-4 tracking-tight">{farmer.name}</h3>
        
        <div className="flex flex-wrap items-center gap-3 text-earth-300 mb-8 text-sm">
          <div className="flex items-center gap-1.5 bg-earth-800/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-earth-700/50">
            <MapPin className="w-4 h-4 text-primary-400" />
            <span className="font-medium text-white">{farmer.city}</span>
          </div>
          {farmer.distance_km !== undefined && (
            <div className="flex items-center gap-1.5 bg-earth-800/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-earth-700/50">
              <span className="font-bold text-white">{farmer.distance_km.toFixed(1)} km</span> away
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-earth-800/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-earth-700/50">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-white">{farmer.rating?.toFixed(1)}</span>
            <span>({farmer.reviews_count} reviews)</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href={`/farmers/${farmer.id}`} className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-primary-900/50">
            <User className="w-4 h-4 mr-2" />
            View Farm Store
          </Link>
        </div>
      </div>
    </div>
  );
}
