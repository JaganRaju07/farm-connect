'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Shield, ArrowRight, User, MapPin, Navigation } from 'lucide-react';
import { useCart } from '@/context/cartcontext';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    // Dynamic matching dataset simulation corresponding completely with your marketplace parameters
    const mockInventory = [
      { id: 1, name: 'Organic Fresh Tomatoes', category: 'Vegetables', price: 40, distance_km: 2.4, stock_available: 12, farmer_name: 'Anand Gowda', farmer_city: 'Mysore Rural', description: 'Plucked straight from the organic vines this morning. Grown completely chemical-free using sustainable rain-fed agriculture processes.' },
      { id: 2, name: 'Premium Alphonso Mangoes', category: 'Fruits', price: 180, distance_km: 5.1, stock_available: 45, farmer_name: 'Ramesh K.', farmer_city: 'Mandya', description: 'Sweet, rich, juicy, and completely naturally ripened orchard crops harvested carefully by third-generation regional growers.' },
      { id: 3, name: 'Fresh Farm Spinach', category: 'Vegetables', price: 25, distance_km: 1.8, stock_available: 8, farmer_name: 'Anand Gowda', farmer_city: 'Mysore Rural', description: 'Crisp green leaves thoroughly washed with deep well water. Packed rich with natural iron metrics and iron elements.' },
      { id: 4, name: 'Pure Natural Honey', category: 'Dairy & Extras', price: 220, distance_km: 12.0, stock_available: 15, farmer_name: 'Suresh Kumar', farmer_city: 'Hunsur', description: 'Raw, unpasteurized, completely unfiltered pure wild honey collected from local seasonal farm apiaries across deciduous woodlands.' }
    ];

    const currentId = Number(params?.id);
    const matchedItem = mockInventory.find((item) => item.id === currentId);
    
    // Fallback safe assignment if parameter exceeds array
    setProduct(matchedItem || mockInventory[0]);
  }, [params]);

  if (!product) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f4f6f4', fontFamily: 'sans-serif' }}>
        <p style={{ fontWeight: 'bold', color: '#166534' }}>Loading dynamic crop metrics...</p>
      </div>
    );
  }

  const outOfStock = product.stock_available === 0;

  const handleAddToCartClick = () => {
    if (!outOfStock) {
      addToCart(product, quantity);
      alert(`${quantity} ${product.name} successfully added to your cart basket!`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f4', padding: '30px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Back Navigation Bar Trigger */}
        <button 
          onClick={() => router.push('/marketplace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#15803d',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '25px',
            padding: '0'
          }}
        >
          <ArrowLeft size={18} /> Back to Marketplace
        </button>

        {/* Master Detail Surface Card */}
        <div className="white-sidebar-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '40px', padding: '40px', maxWidth: '100%' }}>
          
          {/* Left Decorative Image Block Canvas */}
          <div className="from-green-100" style={{ height: '320px', borderRadius: '16px', border: '1px solid #e2f0e2' }}>
            <span style={{ fontSize: '4.5rem' }}>🌾</span>
            <span className="tag" style={{ marginTop: '10px' }}>{product.category}</span>
          </div>

          {/* Right Descriptions Parameter Column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111c11', margin: '0 0 10px 0' }}>{product.name}</h1>
            
            <div className="price-matrix-block" style={{ marginBottom: '20px' }}>
              <span className="currency" style={{ fontSize: '2.2rem' }}>Linear Price: ₹{product.price}</span>
              <span className="unit" style={{ fontSize: '1rem', marginLeft: '4px' }}>/ per unit</span>
            </div>

            {/* Farm Origins Meta Card Rows */}
            <div className="metadata-rows-list" style={{ background: '#fcfdfc', padding: '16px', borderRadius: '12px', border: '1px solid #ebf2eb', marginBottom: '20px' }}>
              <div className="metadata-row-item">
                <User size={16} style={{ color: '#9ca3af' }} />
                <span style={{ fontWeight: '600' }}>Cultivator: {product.farmer_name}</span>
              </div>
              <div className="metadata-row-item" style={{ marginTop: '8px' }}>
                <MapPin size={16} style={{ color: '#9ca3af' }} />
                <span>Harvest Location: {product.farmer_city}</span>
              </div>
              <div className="distance-badge-pill" style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                <Navigation size={12} /> Distance Matrix: {product.distance_km} km away from your device location
              </div>
            </div>

            <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1.02rem', margin: '0 0 25px 0' }}>
              {product.description}
            </p>

            {/* Action Item Totals Button Strip */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid #f0f4f0', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              
              {!outOfStock ? (
                <>
                  {/* Quantity Dropdown Counter Option */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4b5563' }}>Quantity:</span>
                    <select 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '600', outline: 'none' }}
                    >
                      {[...Array(Math.min(10, product.stock_available))].map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                      ))}
                    </select>
                  </div>

                  {/* Add to Basket Action Trigger Button */}
                  <button
                    onClick={handleAddToCartClick}
                    style={{
                      flex: '1',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#15803d'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#16a34a'}
                  >
                    <ShoppingCart size={18} /> Add Fresh Items to Basket
                  </button>
                </>
              ) : (
                <div style={{ background: '#fef2f2', color: '#b91c1c', fontWeight: '700', width: '100%', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                  Crop Stock Exhausted Temporarily
                </div>
              )}

            </div>

          </div>

        </div>
        
        {/* Secondary Trust Metric Footnote Element */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginTop: '20px', color: '#9ca3af', fontSize: '0.85rem' }}>
          <Shield size={16} style={{ color: '#10b981' }} />
          <span>100% Secure Direct Settlement Architecture Ledger System Verified</span>
        </div>

      </div>
    </div>
  );
}