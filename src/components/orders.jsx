import React from 'react';

export default function Orders() {
  const previousOrders = [
    { id: 'ORD-98431', date: 'May 12, 2026', total: 210, items: 'Premium Alphonso Mangoes (1kg)', status: 'Delivered' },
    { id: 'ORD-97104', date: 'May 04, 2026', total: 110, items: 'Organic Fresh Tomatoes (2kg), Spinach (1 bundle)', status: 'Delivered' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>My Orders</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Track and review your recent farm-direct settlements.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {previousOrders.map(order => (
          <div key={order.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontWeight: '700', color: '#111827', marginRight: '10px' }}>{order.id}</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Placed on {order.date}</span>
              </div>
              <span style={{ background: '#e8f5e9', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                ✓ {order.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', fontWeight: '500' }}>{order.items}</p>
              <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>₹{order.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}