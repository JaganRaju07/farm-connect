'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Smartphone, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const [userName, setUserName] = useState('Harshita');
  const [phone, setPhone] = useState('+91 98765 43210');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f4', padding: '30px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111c11', margin: '0 0 6px 0' }}>Profile Settings</h1>
        <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>Configure your secure regional consumer parameter parameters mapping variables here.</p>

        <div className="white-sidebar-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Full Consumer Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" value={userName} onChange={(e) => setUserName(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
                <User size={16} style={{ position: 'absolute', top: '15px', left: '14px', color: '#9ca3af' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" value="harshita@engineering.edu" disabled
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
                <Mail size={16} style={{ position: 'absolute', top: '15px', left: '14px', color: '#9ca3af' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Active Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
                <Smartphone size={16} style={{ position: 'absolute', top: '15px', left: '14px', color: '#9ca3af' }} />
              </div>
            </div>

            <button 
              onClick={() => alert('Profile credentials updated successfully!')}
              style={{ background: '#16a34a', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s' }}
            >
              Save Configuration Settings
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}