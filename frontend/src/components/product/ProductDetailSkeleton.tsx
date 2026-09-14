import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-earth-50 font-sans pb-24 animate-pulse">
      {/* Top Nav Area Skeleton */}
      <div className="bg-white border-b border-earth-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <div className="w-32 h-4 bg-earth-200 rounded flex items-center gap-2"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left: Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-earth-200 rounded-2xl overflow-hidden border border-earth-200" />
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-earth-200 rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Right: Product Info Skeleton */}
          <div className="flex flex-col">
            <div className="mb-6 border-b border-earth-200 pb-6">
              <div className="h-4 w-24 bg-earth-200 rounded mb-2" />
              <div className="h-10 w-3/4 bg-earth-200 rounded mb-4" />
              <div className="h-6 w-32 bg-earth-200 rounded mb-4" />
              <div className="flex items-baseline gap-2 mt-2">
                <div className="h-10 w-32 bg-earth-200 rounded" />
                <div className="h-6 w-16 bg-earth-200 rounded" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="mb-8 space-y-2">
              <div className="h-4 w-32 bg-earth-200 rounded mb-4" />
              <div className="h-4 w-full bg-earth-200 rounded" />
              <div className="h-4 w-full bg-earth-200 rounded" />
              <div className="h-4 w-2/3 bg-earth-200 rounded" />
            </div>

            {/* Farmer Trust Card Skeleton */}
            <div className="card p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-earth-200 shrink-0" />
                <div>
                  <div className="h-3 w-16 bg-earth-200 rounded mb-1" />
                  <div className="h-5 w-32 bg-earth-200 rounded" />
                </div>
              </div>
              <div className="bg-earth-100/50 px-3 py-2 rounded-lg w-24 h-8" />
            </div>

            {/* Availability Skeleton */}
            <div className="mt-auto pt-6 mb-4 flex justify-between">
              <div className="h-5 w-24 bg-earth-200 rounded" />
              <div className="h-6 w-32 bg-earth-200 rounded" />
            </div>
            
            {/* CTA Skeleton */}
            <div className="h-14 w-full bg-earth-200 rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
