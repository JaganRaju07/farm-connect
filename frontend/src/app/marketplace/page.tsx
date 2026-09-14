'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from '@/context/LocationContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ProductCard from '@/components/product/productcard';
import { MapPin, Search, Loader2, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Product } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function MarketplaceContent() {
  const { latitude, longitude, loading: locLoading, error: locError, refreshLocation } = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(25); // Default 25km radius

  useEffect(() => {
    // Only fetch if we have location, or if location failed (we can fetch without it, just no distance sorting)
    if (locLoading) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API}/products?`;
        if (latitude && longitude) {
          url += `lat=${latitude}&lon=${longitude}&radius=${radius}`;
        }
        
        const res = await axios.get(url);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch marketplace products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [latitude, longitude, locLoading, radius]);

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
                {locLoading ? 'Locating you...' : locError ? 'Location unavailable' : `Showing farms within ${radius}km`}
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
            <button className="btn-secondary px-4 py-2.5 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="card h-[400px] animate-pulse flex flex-col overflow-hidden">
                <div className="h-48 bg-earth-200" />
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="h-6 w-3/4 bg-earth-200 rounded" />
                  <div className="h-8 w-1/2 bg-earth-200 rounded" />
                  <div className="mt-auto h-16 bg-earth-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card text-center py-20 px-6">
            <Search className="w-12 h-12 text-earth-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold font-display text-earth-900 mb-1">No products found</h3>
            <p className="text-earth-500">Try expanding your search radius or modifying your filters.</p>
            <div className="mt-6">
              <button 
                onClick={() => setRadius(radius === 25 ? 50 : 100)}
                className="btn-secondary"
              >
                Expand Search Radius to {radius === 25 ? '50km' : '100km'}
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
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']} redirectTo="/login">
      <MarketplaceContent />
    </ProtectedRoute>
  );
}