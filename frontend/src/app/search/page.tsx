'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Search, SlidersHorizontal, MapPin, X, Leaf } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const CATEGORIES = ['vegetables', 'fruits', 'dairy', 'grains', 'other'];

import { getFallbackImageUrl } from '@/components/product/productcard';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { latitude, longitude } = useGeolocation();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [isOrganic, setIsOrganic] = useState(false);
  const [sort, setSort] = useState('distance');
  const [radius, setRadius] = useState(10);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { sort };
      if (query) params.q = query;
      if (category) params.category = category;
      if (isOrganic) params.is_organic = true;
      if (latitude && longitude) {
        params.lat = latitude;
        params.lon = longitude;
        params.radius = radius;
      }

      const res = await axios.get(`${API}/products`, { params });
      setProducts(res.data.data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, category, isOrganic, sort, radius, latitude, longitude]);

  useEffect(() => { 
    search(); 
  }, [category, isOrganic, sort, radius]); // Auto-search on filter change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  const clearFilters = () => {
    setCategory(''); 
    setIsOrganic(false); 
    setSort('distance'); 
    setRadius(10); 
    setQuery('');
  };

  const hasFilters = category || isOrganic || radius !== 10 || sort !== 'distance';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600 transition-shadow shadow-sm"
          />
        </div>
        <button type="submit"
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 shadow-sm transition-colors hidden sm:block">
          Search
        </button>
        <button type="button" onClick={() => setShowFilters(f => !f)}
          className={`border px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors shadow-sm ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:block">Filters</span>
          {hasFilters && <span className="bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">!</span>}
        </button>
      </form>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm capitalize focus:ring-2 focus:ring-primary-600">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-600">
                <option value="distance">Nearest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex justify-between">
                Radius <span>{radius} km</span>
              </label>
              <input type="range" min={5} max={50} step={5} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full accent-primary-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
            </div>

            <div className="flex flex-col justify-center">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Type</label>
              <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={isOrganic}
                  onChange={e => setIsOrganic(e.target.checked)}
                  className="w-5 h-5 accent-primary-600 rounded border-gray-300" />
                <span className="text-sm font-medium flex items-center gap-1.5"><Leaf className="w-4 h-4 text-primary-600"/> Organic only</span>
              </label>
            </div>
            
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              className="mt-6 flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium transition-colors">
              <X className="w-4 h-4" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Location indicator */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-primary-50 px-3 py-1.5 rounded-lg w-fit border border-primary-100">
          <MapPin className="w-4 h-4 text-primary-600" />
          Showing results within <span className="font-semibold text-primary-700">{radius}km</span> of your location
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No products found.</p>
          <p className="text-gray-400 text-sm mt-1">Try expanding your search radius or clearing filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 font-medium mb-6 px-1">{products.length} products found</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`} className="group">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  
                  <div className="relative h-56 bg-gray-100 overflow-hidden">
                    <SearchProductImage 
                      primaryImageUrl={p.imageUrl} 
                      category={p.category} 
                      name={p.name} 
                    />
                    {p.isOrganic && (
                      <span className="absolute top-3 left-3 bg-primary-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Organic
                      </span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{p.name}</h3>
                    
                    <div className="flex items-baseline justify-between mt-2 mb-3">
                      <span className="text-2xl font-extrabold text-primary-600">₹{p.price}</span>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">/{p.unit}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-sm text-gray-600 font-medium truncate">{p.farmerName}</p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {p.farmerCity}
                        </p>
                        {p.distance_km > 0 && (
                          <p className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded">
                            {p.distance_km.toFixed(1)} km
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {p.stockAvailable <= 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-red-50 text-red-600 font-bold px-4 py-1.5 rounded-full text-sm border border-red-100 shadow-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchProductImage({ primaryImageUrl, category, name }: { primaryImageUrl?: string, category: string, name: string }) {
  const [imgSrc, setImgSrc] = useState(primaryImageUrl || getFallbackImageUrl(category, name));

  return (
    <Image 
      src={imgSrc} 
      alt={name}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => {
        setImgSrc(getFallbackImageUrl(category, name));
      }}
    />
  );
}
