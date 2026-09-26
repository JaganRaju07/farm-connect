import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function ProductSkeleton() {
  return (
    <div className="card h-full flex flex-col relative overflow-hidden bg-surface w-full !min-w-0 !p-0">
      {/* Image Skeleton */}
      <Skeleton className="relative h-56 w-full rounded-none border-0" />
      
      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title & Rating */}
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        {/* Price & Unit */}
        <div className="flex items-baseline gap-1 mb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-10" />
        </div>
        
        {/* Footer info box */}
        <div className="mt-auto space-y-2 bg-surface-muted p-3 rounded-lg border border-border-default">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 border-none" />
            <Skeleton className="h-4 w-16 border-none" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-3 w-20 border-none" />
            <Skeleton className="h-4 w-12 border-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
