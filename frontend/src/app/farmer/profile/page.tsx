'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Camera, Tractor, Check, ShieldCheck } from 'lucide-react';
import Button from '@/components/common/button';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function FarmerProfileContent() {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>(user?.profile_photo_url || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    delivery_address: (user as any)?.address || '',
    city: user?.city || '',
    pincode: (user as any)?.pincode || '',
    bio: (user as any)?.bio || '',
    farming_type: (user as any)?.farming_type || '',
    farm_size_acres: (user as any)?.farm_size_acres || '',
    years_of_farming: (user as any)?.years_of_farming || ''
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
      
      if (form.name !== user?.name) data.append('name', form.name);
      if (form.email) data.append('email', form.email);
      if (form.delivery_address) data.append('address', form.delivery_address);
      if (form.city) data.append('city', form.city);
      if (form.pincode) data.append('pincode', form.pincode);
      if (form.bio) data.append('bio', form.bio);
      if (form.farming_type) data.append('farming_type', form.farming_type);
      if (form.farm_size_acres) data.append('farm_size_acres', form.farm_size_acres.toString());
      if (form.years_of_farming) data.append('years_of_farming', form.years_of_farming.toString());
      if (photoFile) data.append('photo', photoFile);

      const res = await axios.patch(`${API}/farmer/profile`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(res.data.data.farmer);
      success('Farmer profile updated successfully!');
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
      delivery_address: (user as any)?.address || '',
      city: user?.city || '',
      pincode: (user as any)?.pincode || '',
      bio: (user as any)?.bio || '',
      farming_type: (user as any)?.farming_type || '',
      farm_size_acres: (user as any)?.farm_size_acres || '',
      years_of_farming: (user as any)?.years_of_farming || ''
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-earth-900 tracking-tight">Farm Settings</h1>
          <p className="text-earth-500 text-sm mt-1">Manage your farm's public profile and contact details.</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="secondary" className="self-start md:self-auto">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 self-start md:self-auto">
            <Button onClick={handleCancel} disabled={loading} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} isLoading={loading} variant="primary">
              {!loading && <Check className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        
        {/* Section 1: Public Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-earth-200">
          <div className="md:col-span-1">
            <h2 className="text-base font-semibold text-earth-900">Public Profile</h2>
            <p className="text-sm text-earth-500 mt-1 leading-relaxed">
              This information will be displayed publicly to consumers on the marketplace.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-6 card p-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-4">Farm Logo or Photo</label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-earth-50 border-2 border-earth-100 flex items-center justify-center overflow-hidden shrink-0">
                    {preview 
                      ? <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                      : <Tractor className="w-8 h-8 text-earth-300" />
                    }
                  </div>
                  {editing && (
                    <label className="absolute -bottom-1 -right-1 bg-white text-earth-700 p-1.5 rounded-full cursor-pointer hover:bg-earth-50 shadow-sm border border-earth-200 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
                <div className="text-sm text-earth-500">
                  <p>JPG, GIF or PNG. 1MB max.</p>
                  <p className="text-xs mt-1">A good photo builds trust with consumers.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Farm/Farmer Name</label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Kisan Farm"
                  disabled={!editing}
                  className="max-w-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Farm Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  disabled={!editing}
                  rows={4}
                  placeholder="Tell consumers about your farming practices and history..."
                  className="w-full px-4 py-2 border rounded-lg text-earth-900 placeholder:text-earth-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 border-earth-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-earth-100 disabled:cursor-not-allowed resize-none"
                />
                <p className="text-xs text-earth-500 mt-1.5">Brief description for your farm profile.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Farm Specifics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-earth-200">
          <div className="md:col-span-1">
            <h2 className="text-base font-semibold text-earth-900">Farm Details</h2>
            <p className="text-sm text-earth-500 mt-1 leading-relaxed">
              Specifics about your agricultural practices. This helps us categorize your products.
            </p>
          </div>
          
          <div className="md:col-span-2 card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Farming Type</label>
                <div className="relative">
                  <select
                    value={form.farming_type}
                    onChange={e => setForm({ ...form, farming_type: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-2 border rounded-lg text-earth-900 placeholder:text-earth-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 border-earth-300 focus:border-primary-500 focus:ring-primary-500 disabled:bg-earth-100 disabled:cursor-not-allowed appearance-none"
                  >
                    <option value="">Select type</option>
                    <option value="organic">100% Organic</option>
                    <option value="conventional">Conventional</option>
                    <option value="mixed">Mixed</option>
                    <option value="hydroponic">Hydroponic</option>
                  </select>
                  {form.farming_type === 'organic' && (
                    <ShieldCheck className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Farm Size (Acres)</label>
                <Input
                  type="number"
                  value={form.farm_size_acres}
                  onChange={e => setForm({ ...form, farm_size_acres: e.target.value })}
                  disabled={!editing}
                  placeholder="e.g. 5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Years of Farming</label>
                <Input
                  type="number"
                  value={form.years_of_farming}
                  onChange={e => setForm({ ...form, years_of_farming: e.target.value })}
                  disabled={!editing}
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-earth-200">
          <div className="md:col-span-1">
            <h2 className="text-base font-semibold text-earth-900">Contact & Location</h2>
            <p className="text-sm text-earth-500 mt-1 leading-relaxed">
              Used for order fulfillment and platform communications.
            </p>
          </div>
          
          <div className="md:col-span-2 card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Email Address (Optional)</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="kisan@example.com"
                  disabled={!editing}
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Farm Address</label>
                <Input
                  type="text"
                  value={form.delivery_address}
                  onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                  placeholder="Survey No 12..."
                  disabled={!editing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">City / District</label>
                <Input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Mandya"
                  disabled={!editing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-earth-700 mb-1.5">Pincode</label>
                <Input
                  type="text"
                  value={form.pincode}
                  onChange={e => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="571401"
                  disabled={!editing}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function FarmerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['farmer']} redirectTo="/farmer/login">
      <FarmerProfileContent />
    </ProtectedRoute>
  );
}
