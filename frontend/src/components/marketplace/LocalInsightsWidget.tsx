import { Sprout, Users, MapPin, Search } from 'lucide-react';
import { Product } from '@/types';

interface LocalInsightsWidgetProps {
  products: Product[];
  isLoading: boolean;
}

export default function LocalInsightsWidget({ products, isLoading }: LocalInsightsWidgetProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-earth-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  // Calculate Insights
  const uniqueFarmers = new Set(products.map(p => p.farmerId)).size;
  const totalProducts = products.length;
  
  // Find top category
  const categoryCount = products.reduce((acc: Record<string, number>, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  
  let topCategory = 'Produce';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(categoryCount)) {
    if ((count as number) > maxCount) {
      maxCount = count as number;
      topCategory = cat;
    }
  }

  // Format category name
  const formattedCategory = topCategory.charAt(0).toUpperCase() + topCategory.slice(1);

  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-earth-500 uppercase tracking-wider mb-4 px-1">
        Local Availability Insights
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight 1 */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-earth-500 font-medium">Farms on Farm Connect</p>
            <p className="text-2xl font-bold text-earth-900">{uniqueFarmers} <span className="text-sm font-normal text-earth-500">nearby</span></p>
          </div>
        </div>

        {/* Insight 2 */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-earth-500 font-medium">Available Produce</p>
            <p className="text-2xl font-bold text-earth-900">{totalProducts} <span className="text-sm font-normal text-earth-500">items</span></p>
          </div>
        </div>

        {/* Insight 3 */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-earth-500 font-medium">Abundant Locally</p>
            <p className="text-xl font-bold text-earth-900 truncate pr-2">{formattedCategory}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
