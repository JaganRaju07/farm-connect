'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, CreditCard, ShieldCheck, Trash2 } from 'lucide-react';

export default function CartPage() {
  const [address, setAddress] = useState('');
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Organic Fresh Tomatoes', price: 40, unit: 'kg', quantity: 3 },
    { id: 2, name: 'Premium Alphonso Mangoes', price: 180, unit: 'kg', quantity: 2 }
  ]);

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = itemTotal > 0 ? 30 : 0;

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f4', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Continue Shopping
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111c11', marginBottom: '24px' }}>Your Shopping Basket</h1>

        {cartItems.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
            
            {/* Left Column: Basket Items & Delivery Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Delivery Input Card */}
              <div className="white-sidebar-card" style={{ padding: '24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1.2rem' }}>
                  <MapPin size={20} className="text-green-700" /> Delivery Logistics Details
                </h2>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                  Complete Destination Address
                </label>
                <textarea 
                  placeholder="Enter your complete house/flat number, apartment name, street layout, and landmark city info..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', height: '90px', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', fontSize: '0.95rem' }}
                />
              </div>

              {/* Items List Card */}
              <div className="white-sidebar-card" style={{ padding: '24px' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Selected Produce</h2>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f0f4f0' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '700', color: '#111c11' }}>{item.name}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>₹{item.price}/{item.unit} × {item.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <span style={{ fontWeight: '800', color: '#111c11', fontSize: '1.1rem' }}>₹{item.price * item.quantity}</span>
                      <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="white-sidebar-card" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', borderBottom: '2px solid #f0f4f0', paddingBottom: '10px' }}>Payment Settlement</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: '#4b5563' }}>
                <span>Subtotal Items</span>
                <span style={{ fontWeight: '600', color: '#111c11' }}>₹{itemTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.95rem', color: '#4b5563', borderBottom: '1px solid #f0f4f0', paddingBottom: '14px' }}>
                <span>Standard Delivery Fee</span>
                <span style={{ fontWeight: '600', color: '#111c11' }}>₹{deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'baseline' }}>
                <span style={{ fontWeight: '700', color: '#111c11' }}>Total Amount</span>
                <span style={{ color: '#15803d', fontSize: '1.6rem', fontWeight: '800' }}>₹{itemTotal + deliveryFee}</span>
              </div>

              <button 
                onClick={() => alert('Order registered securely on direct farm settlement rail networks!')}
                style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CreditCard size={18} /> Place Order Now
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '16px', color: '#9ca3af', fontSize: '0.8rem', fontWeight: '600' }}>
                <ShieldCheck size={14} style={{ color: '#10b981' }} /> Direct Settlement Protocol Confirmed
              </div>
            </div>

          </div>
        ) : (
          <div className="white-sidebar-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🛒</span>
            <h3 style={{ margin: '0 0 8px 0', color: '#111c11' }}>Your cart basket is completely empty</h3>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>Explore fresh agricultural yields straight from nearby farms!</p>
            <Link href="/marketplace" style={{ background: '#16a34a', color: 'white', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', display: 'inline-block' }}>
              Go to Marketplace
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}