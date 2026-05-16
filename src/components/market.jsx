import React, { useState } from 'react';

export default function Market() {
  const [radius, setRadius] = useState(10);
  const [search, setSearch] = useState('');

  // Structured sample data matching your farm application context
  const initialProducts = [
    { id: 1, name: 'Organic Fresh Tomatoes', farmer: 'Anand Gowda', price: 40, unit: 'kg', distance: 2.4, stock: 12, category: 'Vegetables' },
    { id: 2, name: 'Premium Alphonso Mangoes', farmer: 'Ramesh K.', price: 180, unit: 'kg', distance: 5.1, stock: 45, category: 'Fruits' },
    { id: 3, name: 'Fresh Farm Spinach', farmer: 'Anand Gowda', price: 25, unit: 'bundle', distance: 1.8, stock: 8, category: 'Vegetables' },
    { id: 4, name: 'Pure Natural Honey', farmer: 'Suresh Kumar', price: 220, unit: 'bottle', distance: 12.0, stock: 15, category: 'Extras' }
  ];

  const filteredProducts = initialProducts.filter(p => 
    p.distance <= radius && p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>Find Local Farmers</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Discover fresh produce from farms near you.</p>

      {/* Control Filters Wrapper Box */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input 
          type="text" 
          placeholder="🔍 Search crops, farmers, or categories..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem' }}
        />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            <span>Search Radius</span>
            <span style={{ color: '#16a34a' }}>{radius} km</span>
          </div>
          <input 
            type="range" min="1" max="50" value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#16a34a', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Responsive Products Matrix Grid */}
      {filteredProducts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>{product.category}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{product.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 12px 0' }}>👨‍🌾 Farmer: {product.farmer}</p>
              
              <div style={{ fontSize: '1.4rem', fontProfit: '800', color: '#16a34a', fontWeight: '800', marginBottom: '12px' }}>
                ₹{product.price}<span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}> / {product.unit}</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#4b5563', borderTop: '1px solid #f3f4f6', paddingTop: '10px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📍 {product.distance} km away</span>
                <button style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No farmers found within {radius}km matching your criteria. Try expanding your parameters!
        </div>
      )}
    </div>
  );
}