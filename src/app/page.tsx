'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Package, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f6f4' }}>
      
      {/* Hero Header Presentation Banner with Navigation Links embedded */}
      <div className="hero-gradient-banner" style={{ textAlign: 'center', borderRadius: '0 0 32px 32px', padding: '40px 20px 60px 20px' }}>
        
        {/* Global Navigation Shortcut Links Line */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '16px' }}>
          <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '1.2rem', fontWeight: '900' }}>
            🌾 Farm Connect
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/marketplace" style={{ color: '#bbf7d0', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={16} /> Market
            </Link>
            <Link href="/cart" style={{ color: '#bbf7d0', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingCart size={16} /> My Basket
            </Link>
            <Link href="/orders" style={{ color: '#bbf7d0', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} /> Tracking
            </Link>
            <Link href="/profile" style={{ color: '#bbf7d0', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> Account
            </Link>
          </div>
        </div>

        <h1 style={{ fontSize: '3rem', color: '#ffffff', margin: '0 0 10px 0' }}>Farm Connect</h1>
        <p style={{ fontSize: '1.2rem', color: '#bbf7d0', margin: '0 0 30px 0' }}>Bridging the gap between passionate local farmers and you.</p>
        
        <Link href="/marketplace" style={{
          display: 'inline-block',
          background: '#ffffff',
          color: '#15803d',
          padding: '14px 36px',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '1.1rem',
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}>
          Explore Marketplace Now →
        </Link>
      </div>

      {/* Feature Intro Metrics Panel */}
      <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
        <div className="white-sidebar-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#111c11', marginBottom: '14px', border: 'none', padding: '0' }}>
            Welcome to the Platform
          </h2>
          <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1.05rem', margin: '0 0 30px 0' }}>
            Buy and sell fresh farm products directly from rural areas with zero middlemen interference. 
            Adjust your geographic search parameters to support cultivators directly in your neighborhood.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '14px', border: '1px solid #e2f0e2' }}>
              <span style={{ fontSize: '2.2rem' }}>🌱</span>
              <h4 style={{ margin: '10px 0 6px 0', color: '#15803d', fontSize: '1.1rem', fontWeight: '700' }}>100% Fresh</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534', fontWeight: '500' }}>Straight from harvesting vines</p>
            </div>
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '14px', border: '1px solid #e2f0e2' }}>
              <span style={{ fontSize: '2.2rem' }}>🚜</span>
              <h4 style={{ margin: '10px 0 6px 0', color: '#15803d', fontSize: '1.1rem', fontWeight: '700' }}>Direct Trade</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534', fontWeight: '500' }}>Empowering regional farmers</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}