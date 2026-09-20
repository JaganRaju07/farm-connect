'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from '@/context/LocationContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ProductCard from '@/components/product/productcard';
import ProductSkeleton from '@/components/product/ProductSkeleton';
import { ProductFilter, FilterState } from '@/components/product/productfilter';
import { MapPin, Search, Loader2, SlidersHorizontal, ChevronDown, X, Map, Grid, History } from 'lucide-react';
import { Product } from '@/types';
import MapExplorer from '@/components/common/MapExplorer';
import Input from '@/components/ui/Input';
import LocalFarmPulse from '@/components/marketplace/LocalFarmPulse';
import { debounce } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function MarketplaceContent() {
  const { latitude, longitude, loading: locLoading, error: locError, refreshLocation } = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  const debouncedSetSearchQuery = useMemo(
    () => debounce((val: any) => {
      setSearchQuery(val);
    }, 300),
    []
  );

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('farmconnect_recent_searches');
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch (e) { setRecentSearches([]); }
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    let saved = [...recentSearches];
    saved = saved.filter(t => t.toLowerCase() !== term.trim().toLowerCase());
    saved.unshift(term.trim());
    if (saved.length > 5) saved = saved.slice(0, 5);
    setRecentSearches(saved);
    localStorage.setItem('farmconnect_recent_searches', JSON.stringify(saved));
  };

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

  useEffect(() => {
    const controller = new AbortController();
    
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
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        
        const res = await axios.get(url, { signal: controller.signal });
        setProducts(res.data.data || []);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled', error.message);
        } else {
          console.error('Failed to fetch marketplace products:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    return () => {
      controller.abort();
    };
  }, [latitude, longitude, locLoading, appliedFilters, searchQuery]);

  const [quickFilter, setQuickFilter] = useState<'all' | 'nearby' | 'harvested' | 'available'>('all');

  const displayedProducts = useMemo(() => {
    let filtered = products;
    if (quickFilter === 'nearby') {
      filtered = filtered.filter(p => p.distance_km != null && p.distance_km <= 5);
    } else if (quickFilter === 'harvested') {
      const now = new Date();
      filtered = filtered.filter(p => {
        if (!p.harvestDate) return false;
        const diff = (now.getTime() - new Date(p.harvestDate).getTime()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 3;
      });
    } else if (quickFilter === 'available') {
      filtered = filtered.filter(p => p.stockAvailable > 0);
    }
    return filtered;
  }, [products, quickFilter]);

  return (
    <div className="min-h-screen bg-earth-50 pt-20 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Page Header & Search ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* View Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-earth-200 shadow-sm shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-earth-500 hover:text-earth-900'}`}
              >
                <Grid className="w-4 h-4" /> Grid
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-earth-500 hover:text-earth-900'}`}
              >
                <Map className="w-4 h-4" /> Map
              </button>
            </div>
            
            <div className="relative flex-1 md:w-64">
              <Input
                type="text"
                placeholder="Search products or farms..."
                value={inputValue}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  debouncedSetSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveRecentSearch(inputValue);
                  }
                }}
                leftIcon={<Search className="w-5 h-5" />}
                className="h-full"
              />
              
              {isSearchFocused && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-earth-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 flex justify-between items-center border-b border-earth-100">
                    <span className="text-xs font-bold text-earth-500 uppercase">Recent Searches</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecentSearches([]);
                        localStorage.removeItem('farmconnect_recent_searches');
                      }} 
                      className="text-xs font-medium text-primary-600 hover:text-primary-800"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputValue(term);
                        setSearchQuery(term);
                        saveRecentSearch(term);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-earth-50 flex items-center gap-3 transition-colors text-earth-700"
                    >
                      <History className="w-4 h-4 text-earth-400" />
                      <span className="font-medium">{term}</span>
                    </button>
                  ))}
                </div>
              )}
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
        
        {/* Local Farm Pulse Widget */}
        <LocalFarmPulse products={products} isLoading={loading} />

        {/* ── Discovery Quick Filters ── */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
          <button
            onClick={() => setQuickFilter('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${quickFilter === 'all' ? 'bg-earth-800 text-white border-earth-800' : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'}`}
          >
            All Products
          </button>
          <button
            onClick={() => setQuickFilter('nearby')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${quickFilter === 'nearby' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'}`}
          >
            Nearby (5km)
          </button>
          <button
            onClick={() => setQuickFilter('harvested')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${quickFilter === 'harvested' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'}`}
          >
            Recently Harvested
          </button>
          <button
            onClick={() => setQuickFilter('available')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${quickFilter === 'available' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'}`}
          >
            Available Now
          </button>
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

        {/* ── Main Content Area ── */}
        {viewMode === 'map' ? (
          <div className="animate-enter mb-8">
            <MapExplorer 
              products={displayedProducts} 
              consumerLocation={latitude && longitude ? { lat: latitude, lon: longitude } : null} 
            />
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
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
                {displayedProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
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