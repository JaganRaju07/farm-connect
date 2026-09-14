import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="card h-full flex flex-col relative overflow-hidden bg-white w-full !min-w-0 !p-0 animate-pulse border-[1.5px] border-earth-200">
      {/* Image Skeleton */}
      <div className="relative h-56 w-full bg-earth-100" />
      
      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title & Rating */}
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 w-3/4 bg-earth-200 rounded-md" />
          <div className="h-4 w-12 bg-earth-200 rounded-md" />
        </div>
        
        {/* Price & Unit */}
        <div className="flex items-baseline gap-1 mb-4">
          <div className="h-8 w-24 bg-earth-200 rounded-md" />
          <div className="h-4 w-10 bg-earth-200 rounded-md" />
        </div>
        
        {/* Footer info box */}
        <div className="mt-auto space-y-2 bg-earth-50 p-3 rounded-lg border border-earth-100">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-earth-200 rounded-md" />
            <div className="h-4 w-16 bg-earth-200 rounded-md" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="h-3 w-20 bg-earth-200 rounded-md" />
            <div className="h-4 w-12 bg-earth-200 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
