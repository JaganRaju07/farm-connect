'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, User, Navigation, ShoppingCart, SlidersHorizontal, Search } from 'lucide-react';
import { LocationProvider } from '@/context/locationcontext';
import ProductCard from '@/components/product/productcard';

function MarketplaceContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radius, setRadius] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    // Standard structured fallback data array matching backend types completely
    setProducts([
      { id: 1, farmer_id: 101, name: 'Organic Fresh Tomatoes', category: 'Vegetables', price: 40, distance_km: 2.4, stock_available: 12, farmer_name: 'Anand Gowda', farmer_city: 'Mysore Rural' },
      { id: 2, farmer_id: 102, name: 'Premium Alphonso Mangoes', category: 'Fruits', price: 180, distance_km: 5.1, stock_available: 45, farmer_name: 'Ramesh K.', farmer_city: 'Mandya' },
      { id: 3, farmer_id: 101, name: 'Fresh Farm Spinach', category: 'Vegetables', price: 25, distance_km: 1.8, stock_available: 8, farmer_name: 'Anand Gowda', farmer_city: 'Mysore Rural' },
      { id: 4, farmer_id: 103, name: 'Pure Natural Honey', category: 'Dairy & Extras', price: 220, distance_km: 12.0, stock_available: 15, farmer_name: 'Suresh Kumar', farmer_city: 'Hunsur' }
    ]);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f4' }}>
      
      {/* Top Header Banner Wrapper */}
      <div className="hero-gradient-banner">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1>Find Local Farmers</h1>
          <p>Discover fresh, organic produce harvested straight from farms near you.</p>
          
          {/* Dashboard Inline Inputs Box Panel */}
          <div className="controls-flex-row">
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Search for tomatoes, mangoes, honey..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="radius-slider-panel">
              <div className="radius-slider-header">
                <span>Search Radius</span>
                <span style={{ color: '#4ade80' }}>{radius} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Body Split Panel */}
      <div className="main-layout-container">
        
        {/* Left Sidebar Filter Column */}
        <div>
          <div className="white-sidebar-card">
            <h2>Categories</h2>
            <div className="filter-buttons-list">
              {['All', 'Vegetables', 'Fruits', 'Dairy & Extras'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`filter-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Dashboard Results Grid Column */}
        <div>
          <div className="marketplace-products-grid">
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <LocationProvider>
      <MarketplaceContent />
    </LocationProvider>
  );
}