'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '@/context/LocationContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ProductCard from '@/components/product/productcard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import { ProductFilter, FilterState } from '@/components/product/productfilter';
import { MapPin, Search, Loader2, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { Product } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function MarketplaceContent() {
  const { latitude, longitude, loading: locLoading, error: locError, refreshLocation } = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialFilters: FilterState = {
    category: '',
    minPrice: '',
    maxPrice: '',
    isOrganic: false,
    radius: 25,
  };
  
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialFilters);

  const fetchProducts = async () => {
    // Only fetch if we have location, or if location failed (we can fetch without it, just no distance sorting)
    if (locLoading) return;
    
    setLoading(true);
    try {
      let url = `${API}/products?`;
      if (latitude && longitude) {
        url += `lat=${latitude}&lon=${longitude}&radius=${appliedFilters.radius}`;
      }
      
      if (appliedFilters.category) url += `&category=${appliedFilters.category}`;
      if (appliedFilters.minPrice) url += `&minPrice=${appliedFilters.minPrice}`;
      if (appliedFilters.maxPrice) url += `&maxPrice=${appliedFilters.maxPrice}`;
      if (appliedFilters.isOrganic) url += `&isOrganic=true`;
      
      const res = await axios.get(url);
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch marketplace products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [latitude, longitude, locLoading, appliedFilters]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-earth-50 pt-20 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Page Header & Search ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-earth-900 tracking-tight font-display">Fresh Marketplace</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-earth-600">
                {locLoading ? 'Locating you...' : locError ? 'Location unavailable' : `Showing farms within ${appliedFilters.radius}km`}
              </span>
              {!locLoading && (
                <button onClick={refreshLocation} className="text-xs text-primary-600 hover:underline ml-2 font-medium">
                  Update
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
              <input
                type="text"
                placeholder="Search products or farms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="btn-secondary px-4 py-2.5 shrink-0 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(appliedFilters.category || appliedFilters.isOrganic || appliedFilters.minPrice || appliedFilters.maxPrice) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>

        {/* ── Active Filters Display ── */}
        {(appliedFilters.category || appliedFilters.isOrganic || appliedFilters.minPrice || appliedFilters.maxPrice) && (
          <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
            {appliedFilters.category && (
              <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-100">
                {appliedFilters.category}
                <button onClick={() => { setFilters(prev => ({ ...prev, category: '' })); setAppliedFilters(prev => ({ ...prev, category: '' })); }} className="p-1 hover:text-primary-900 rounded-md hover:bg-primary-100 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {appliedFilters.isOrganic && (
              <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-success-50 text-success-700 text-sm font-medium rounded-lg border border-success-100">
                Organic Only
                <button onClick={() => { setFilters(prev => ({ ...prev, isOrganic: false })); setAppliedFilters(prev => ({ ...prev, isOrganic: false })); }} className="p-1 hover:text-success-900 rounded-md hover:bg-success-100 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
              <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-accent-50 text-accent-700 text-sm font-medium rounded-lg border border-accent-100">
                ₹{appliedFilters.minPrice || '0'} - ₹{appliedFilters.maxPrice || 'Any'}
                <button onClick={() => { setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' })); setAppliedFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' })); }} className="p-1 hover:text-accent-900 rounded-md hover:bg-accent-100 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            <button 
              onClick={() => { setFilters(initialFilters); setAppliedFilters(initialFilters); }}
              className="text-sm font-medium text-earth-500 hover:text-earth-900 hover:underline px-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card text-center py-20 px-6">
            <Search className="w-12 h-12 text-earth-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold font-display text-earth-900 mb-1">No products found</h3>
            <p className="text-earth-500">Try expanding your search radius or modifying your filters.</p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  const newRadius = appliedFilters.radius === 25 ? 50 : 100;
                  setFilters(prev => ({ ...prev, radius: newRadius }));
                  setAppliedFilters(prev => ({ ...prev, radius: newRadius }));
                }}
                className="btn-secondary"
              >
                Expand Search Radius to {appliedFilters.radius === 25 ? '50km' : '100km'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-enter">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <ProductFilter 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => setAppliedFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setAppliedFilters(initialFilters);
        }}
      />
    </div>
  );
}

export default function MarketplacePage() {
  return <MarketplaceContent />;
}