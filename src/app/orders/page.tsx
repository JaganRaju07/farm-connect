'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Package } from 'lucide-react';

export default function OrdersPage() {
  const ordersList = [
    { id: 'ORD-54319', date: 'May 14, 2026', total: 150, items: 'Organic Fresh Tomatoes (3kg)', status: 'Delivered' },
    { id: 'ORD-53210', date: 'May 02, 2026', total: 360, items: 'Premium Alphonso Mangoes (2kg)', status: 'Delivered' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f4', padding: '30px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111c11', margin: '0 0 6px 0' }}>My Orders</h1>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Track and review your raw agricultural purchase transactions history ledger maps.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ordersList.map(order => (
            <div key={order.id} className="white-sidebar-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f4f0', paddingBottom: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={18} className="text-green-700" />
                  <span style={{ fontWeight: '800', color: '#111c11' }}>{order.id}</span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Settled on {order.date}</span>
                </div>
                <span style={{ background: '#e8f5e9', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> {order.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', color: '#4b5563', fontWeight: '600' }}>{order.items}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#111827' }}>₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}