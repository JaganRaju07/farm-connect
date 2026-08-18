// frontend/src/components/product/ProductFilters.tsx

'use client';

import { getCategories } from '@/lib/api/products';

interface ProductFiltersProps {
  radius: number;
  onRadiusChange: (r: number) => void;
  category: string;
  onCategoryChange: (c: string) => void;
  isOrganic: boolean | undefined;
  onOrganicChange: (o: boolean | undefined) => void;
}

export default function ProductFilters({
  radius,
  onRadiusChange,
  category,
  onCategoryChange,
  isOrganic,
  onOrganicChange,
}: ProductFiltersProps) {
  const categories = getCategories();

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Radius */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Distance:</label>
          <select
            value={radius}
            onChange={e => onRadiusChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={15}>15 km</option>
            <option value={25}>25 km</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={category}
            onChange={e => onCategoryChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm capitalize"
          >
            <option value="">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Organic toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isOrganic === true}
            onChange={e => onOrganicChange(e.target.checked ? true : undefined)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Organic only</span>
        </label>
      </div>
    </div>
  );
}
