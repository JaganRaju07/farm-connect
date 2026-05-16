import React, { useState } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Harshita',
    email: 'harshita@engineering.edu',
    phone: '+91 98765 43210',
    role: 'Consumer / Buyer'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    alert('Account configuration parameters saved successfully!');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>Profile Settings</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Manage your regional user parameters and connection info.</p>

      <form onSubmit={handleUpdate} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Full Name</label>
          <input 
            type="text" value={profile.name} 
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Email Address</label>
          <input 
            type="email" value={profile.email} 
            disabled
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Phone Number</label>
          <input 
            type="text" value={profile.phone} 
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '6px' }}>Account Tier Classification</label>
          <input 
            type="text" value={profile.role} disabled
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
          />
        </div>

        <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginTop: '10px' }}>
          Save Preferences
        </button>
      </form>
    </div>
  );
}