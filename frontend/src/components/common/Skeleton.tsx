export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
      <Skeleton className="w-full h-48" />
      <Skeleton className="w-3/4 h-6" />
      <div className="flex justify-between">
        <Skeleton className="w-1/3 h-8" />
        <Skeleton className="w-1/4 h-5" />
      </div>
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-32">
          <Skeleton className="w-12 h-12 mb-4" />
          <Skeleton className="w-24 h-8 mb-2" />
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </div>
  );
}
