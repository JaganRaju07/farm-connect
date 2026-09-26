'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Tractor, ArrowRight, ShieldCheck } from 'lucide-react';

interface Farmer {
  id: string | number;
  name: string;
  city: string;
  distance_km?: number;
  rating?: number;
  reviews_count?: number;
  bio?: string;
  farming_type?: string;
}

interface FeaturedFarmersProps {
  farmers: Farmer[];
  isLoading?: boolean;
}

const getFarmerFallbackImage = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22603b&color=fff&size=200&bold=true`;
};

export default function FeaturedFarmersEditorial({ farmers, isLoading }: FeaturedFarmersProps) {
  const displayFarmers = farmers.slice(0, 3);

  return (
    <section className="py-20 lg:py-28 bg-background border-b border-border-default transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-default">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Tractor className="w-4 h-4" />
              Verified Local Growers
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground font-display tracking-tight leading-tight">
              MEET THE FARMERS <br />
              <span className="text-primary-700 dark:text-primary-400">BEHIND YOUR FOOD.</span>
            </h2>

            <p className="text-foreground-secondary text-base sm:text-lg leading-relaxed">
              Real stewards tending Karnataka's soils. You know their names, their locations, and exactly how far their harvests travel.
            </p>
          </div>

          <Link
            href="/farmers"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-400 hover:underline shrink-0"
          >
            View All Cultivators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Editorial Profiles Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-72 bg-surface-muted rounded-3xl animate-pulse motion-reduce:animate-none border border-border-default" />
            ))
          ) : (
            displayFarmers.map((farmer) => (
              <div 
                key={farmer.id}
                className="bg-surface rounded-3xl border border-border-default p-7 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden relative bg-surface-muted border border-border-default shrink-0">
                      <Image
                        src={getFarmerFallbackImage(farmer.name)}
                        alt={farmer.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-foreground font-display truncate">
                        {farmer.name}
                      </h3>
                      
                      <div className="flex items-center text-xs text-foreground-secondary mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-foreground-muted shrink-0" />
                        <span className="truncate">{farmer.city}</span>
                      </div>

                      {farmer.distance_km !== undefined && (
                        <span className="inline-block text-[11px] font-mono font-semibold text-primary-700 dark:text-primary-400 mt-1">
                          {farmer.distance_km.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-surface-muted p-3.5 rounded-xl border border-border-subtle text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-foreground-secondary">
                      <span>Status:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Grower
                      </span>
                    </div>

                    {farmer.rating && (
                      <div className="flex items-center justify-between text-foreground-secondary">
                        <span>Rating:</span>
                        <span className="font-bold text-foreground flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {farmer.rating} {farmer.reviews_count && `(${farmer.reviews_count} reviews)`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border-subtle">
                  <Link
                    href={`/farmers/${farmer.id}`}
                    className="inline-flex items-center justify-between w-full text-xs font-bold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                  >
                    <span>Visit Farm Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
