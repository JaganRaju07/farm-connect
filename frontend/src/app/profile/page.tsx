'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Camera, Loader2, User, Save, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>(user?.profile_photo_url || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    delivery_address: '',
    city: user?.city || '',
    pincode: '',
    preferred_delivery_time: ''
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      
      // Only append fields that changed
      if (form.name !== user?.name) data.append('name', form.name);
      if (form.email) data.append('email', form.email);
      if (form.delivery_address) data.append('delivery_address', form.delivery_address);
      if (form.city) data.append('city', form.city);
      if (form.pincode) data.append('pincode', form.pincode);
      if (form.preferred_delivery_time) data.append('preferred_delivery_time', form.preferred_delivery_time);
      if (photoFile) data.append('photo', photoFile);

      const res = await axios.patch(`${API}/consumer/profile`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(res.data.data.consumer);
      success('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      showError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setPreview(user?.profile_photo_url || '');
    setPhotoFile(null);
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      delivery_address: '',
      city: user?.city || '',
      pincode: '',
      preferred_delivery_time: ''
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        
        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden ring-4 ring-gray-50 shadow-inner">
              {preview 
                ? <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
              }
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-700 shadow-sm transition-transform hover:scale-105">
                <Camera className="w-4 h-4" />
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{user?.name}</p>
            <p className="text-gray-500 text-sm font-medium">{user?.phone}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Arjun Mehta' },
            { label: 'Email (Optional)', key: 'email', type: 'email', placeholder: 'arjun@example.com' },
            { label: 'Delivery Address', key: 'delivery_address', type: 'text', placeholder: 'Flat 302, 5th Cross...' },
            { label: 'City', key: 'city', type: 'text', placeholder: 'Bengaluru' },
            { label: 'Pincode', key: 'pincode', type: 'text', placeholder: '560041' },
          ].map(field => (
            <div key={field.key} className={field.key === 'delivery_address' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={(form as any)[field.key]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Time</label>
            <select
              value={form.preferred_delivery_time}
              onChange={e => setForm(prev => ({ ...prev, preferred_delivery_time: e.target.value }))}
              disabled={!editing}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 transition-shadow">
              <option value="">Select time slot</option>
              <option value="morning">Morning (7 AM – 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM – 5 PM)</option>
              <option value="evening">Evening (5 PM – 9 PM)</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        {editing && (
          <div className="flex gap-3 pt-2">
            <button onClick={handleCancel} disabled={loading}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']} redirectTo="/login">
      <ProfileContent />
    </ProtectedRoute>
  );
}
