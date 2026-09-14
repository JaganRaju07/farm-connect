import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="card h-[400px] flex flex-col p-4 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-earth-200 rounded-2xl mb-4 shrink-0" />
      
      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Category & Rating */}
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 w-20 bg-earth-200 rounded" />
          <div className="h-4 w-12 bg-earth-200 rounded" />
        </div>
        
        {/* Title */}
        <div className="h-6 w-3/4 bg-earth-200 rounded mb-4" />
        
        {/* Price & Unit */}
        <div className="flex items-center gap-2 mb-auto">
          <div className="h-6 w-20 bg-earth-200 rounded" />
          <div className="h-4 w-10 bg-earth-200 rounded" />
        </div>
        
        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-earth-100 flex justify-between">
          <div className="h-4 w-24 bg-earth-200 rounded" />
          <div className="h-4 w-16 bg-earth-200 rounded" />
        </div>
      </div>
    </div>
  );
}
