import React, { useState } from 'react';

export default function Cart() {
  const [address, setAddress] = useState('');
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Organic Fresh Tomatoes', price: 40, unit: 'kg', quantity: 3 },
    { id: 3, name: 'Fresh Farm Spinach', price: 25, unit: 'bundle', quantity: 2 }
  ]);

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = itemTotal > 0 ? 30 : 0;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>Your Cart</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Items & Address Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>Delivery Details</h3>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Complete Delivery Address</label>
            <textarea 
              placeholder="Enter your full address house number, street, locality..." 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', resize: 'none', fontFamily: 'sans-serif' }}
            />
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '14px' }}>Items Basket</h3>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>₹{item.price}/{item.unit} × {item.quantity}</span>
                </div>
                <span style={{ fontWeight: '700', color: '#1f2937' }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Order Summary Checkout Card */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', position: 'sticky', top: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>Summary Settlement</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
            <span style={{ color: '#4b5563' }}>Subtotal</span>
            <span>₹{itemTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.95rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <span style={{ color: '#4b5563' }}>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>
            <span>Total Payable</span>
            <span style={{ color: '#16a34a' }}>₹{itemTotal + deliveryFee}</span>
          </div>
          <button style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' }}>
            Place Order Now
          </button>
        </div>

      </div>
    </div>
  );
}