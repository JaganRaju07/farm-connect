import React, { useState } from 'react';
import { MapPin, User, ShoppingCart, ShoppingBag, LogOut, Search } from 'lucide-react';

// ==========================================
// 1. VIEW COMPONENTS INTEGRATION
// ==========================================

function Market() {
  const [radius, setRadius] = useState(10);
  const [search, setSearch] = useState('');

  const products = [
    { id: 1, name: 'Organic Fresh Tomatoes', farmer: 'Anand Gowda', price: 40, unit: 'kg', distance: 2.4, stock: 12, category: 'Vegetables' },
    { id: 2, name: 'Premium Alphonso Mangoes', farmer: 'Ramesh K.', price: 180, unit: 'kg', distance: 5.1, stock: 45, category: 'Fruits' },
    { id: 3, name: 'Fresh Farm Spinach', farmer: 'Anand Gowda', price: 25, unit: 'bundle', distance: 1.8, stock: 8, category: 'Vegetables' },
    { id: 4, name: 'Pure Natural Honey', farmer: 'Suresh Kumar', price: 220, unit: 'bottle', distance: 12.0, stock: 15, category: 'Extras' }
  ];

  const filtered = products.filter(p => 
    p.distance <= radius && p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>Find Local Farmers</h2>
      <p style={{ color: '#6b7280', margin: '0 0 24px 0', fontSize: '0.95rem' }}>Discover fresh produce from farms near you.</p>

      {/* Control Box */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input 
          type="text" 
          placeholder="Search crops, farmers, or categories..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
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

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {filtered.map(product => (
          <div key={product.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px', display: 'flex', flexDirection: 'column', minHeight: '180px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{product.name}</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 16px 0' }}>👨‍🌾 Farmer: {product.farmer}</p>
            <div style={{ fontSize: '1.5rem', color: '#16a34a', fontWeight: '800', marginBottom: '16px' }}>
              ₹{product.price}<span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}> / {product.unit}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4b5563', borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📍 {product.distance} km away</span>
              <button style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cart() {
  const [address, setAddress] = useState('');
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', margin: '0 0 20px 0' }}>Your Cart</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 14px 0' }}>Delivery Details</h3>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Complete Delivery Address</label>
          <textarea 
            placeholder="Enter your full shipping address here..." 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: '100%', height: '90px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', resize: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 12px 0', color: '#111827' }}>Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}><span style={{ color: '#4b5563' }}>Items Subtotal</span><span>₹170</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}><span style={{ color: '#4b5563' }}>Delivery Fee</span><span>₹30</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '800' }}><span>Total Payable</span><span style={{ color: '#16a34a' }}>₹200</span></div>
          <button style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>Place Order Now</button>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>My Orders</h2>
      <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Track and review your recent farm-direct settlements.</p>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: '700', color: '#111827', display: 'block', marginBottom: '4px' }}>ORD-98431</span>
          <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Premium Alphonso Mangoes (1kg)</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ background: '#e8f5e9', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block', marginBottom: '6px' }}>✓ Delivered</span>
          <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹180</div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>Profile Settings</h2>
      <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Manage your regional user parameters and connection info.</p>
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div><label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Full Name</label><input type="text" value="Harshita" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} /></div>
        <div><label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Email Address</label><input type="email" value="harshita@engineering.edu" readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#6b7280', boxSizing: 'border-box' }} /></div>
        <button style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Save Changes</button>
      </div>
    </div>
  );
}

// ==========================================
// 2. ROOT PLATFORM VIEW DISPATCHER
// ==========================================

export default function App() {
  const [activeView, setActiveView] = useState('market');

  const renderContent = () => {
    switch(activeView) {
      case 'market': return <Market />;
      case 'cart': return <Cart />;
      case 'orders': return <Orders />;
      case 'profile': return <Profile />;
      default: return <Market />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fdfbf7', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      
      {/* LEFT SIDEBAR NAVBAR */}
      <div style={{ width: '240px', backgroundColor: '#f4f2e9', borderRight: '1px solid #e2decb', display: 'flex', flexDirection: 'column', padding: '30px 16px', boxSizing: 'border-box' }}>
        <h1 style={{ color: '#166534', fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 40px 0', tracking: '0.05em' }}>Farm<br/>Connect</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <button onClick={() => setActiveView('market')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: activeView === 'market' ? '#16a34a' : 'transparent', color: activeView === 'market' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', textAlign: 'left', cursor: 'pointer' }}>🧺 Market</button>
          <button onClick={() => setActiveView('cart')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: activeView === 'cart' ? '#16a34a' : 'transparent', color: activeView === 'cart' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', textAlign: 'left', cursor: 'pointer' }}>🛒 My Cart</button>
          <button onClick={() => setActiveView('orders')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: activeView === 'orders' ? '#16a34a' : 'transparent', color: activeView === 'orders' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', textAlign: 'left', cursor: 'pointer' }}>📦 Orders</button>
          <button onClick={() => setActiveView('profile')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: activeView === 'profile' ? '#16a34a' : 'transparent', color: activeView === 'profile' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '700', textAlign: 'left', cursor: 'pointer' }}>👤 Profile</button>
        </div>

        <button style={{ color: '#dc2626', background: 'none', border: 'none', textAlign: 'left', padding: '12px 16px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}><LogOut size={18}/> Log Out</button>
      </div>

      {/* RIGHT MAIN CONTAINER PANE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* GREEN STATUS HEADER TOP BAR */}
        <div style={{ background: '#16a34a', color: 'white', padding: '18px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '800', fontSize: '1.2rem', tracking: '0.02em' }}>🚜 FARM-CONNECT</span>
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.95rem', fontWeight: '700' }}>
            <span style={{ cursor: 'pointer', opacity: 0.9 }}>Farmers</span>
            <span style={{ cursor: 'pointer', opacity: 0.9 }}>My Orders</span>
          </div>
        </div>

        {/* INJECTED DYNAMIC CONTENT SUBVIEW */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderContent()}
        </div>

        {/* BOTTOM GLOBAL FOOTER */}
        <div style={{ background: '#111827', color: '#9ca3af', padding: '30px', borderTop: '1px solid #374151', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <div><strong>🌾 FARM-CONNECT</strong><br/><span style={{ fontSize: '0.8rem' }}>Bridging the gap between farmers and you.</span></div>
          <div style={{ display: 'flex', gap: '20px', fontWeight: '600' }}><span>About Us</span><span>Support</span><span>Terms</span></div>
        </div>

      </div>

    </div>
  );
}