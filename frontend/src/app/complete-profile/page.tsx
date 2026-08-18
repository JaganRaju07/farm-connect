// frontend/src/app/complete-profile/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import axios from 'axios';
import { User, MapPin, Leaf, Camera } from 'lucide-react';

/**
 * Profile Completion Page
 * 
 * WHY A SEPARATE STEP?
 * OTP registration is designed to be minimal to maximize user sign-up rates.
 * Asking for detailed addresses, profile pictures, and farmer qualifications upfront
 * causes onboarding friction. We use progressive onboarding: register instantly,
 * then prompt to complete the profile once authenticated before executing protected actions.
 * 
 * WHY FORMDATA?
 * When uploading binary assets (like files/images), standard JSON payloads won't suffice.
 * We construct a multipart/form-data request using JavaScript's FormData object.
 * Axios automatically appends the correct Content-Type header with the appropriate
 * boundary parameters.
 */
export default function CompleteProfilePage() {
  const router = useRouter();
  const { latitude, longitude } = useGeolocation();
  
  const userRole = typeof window !== 'undefined'
    ? localStorage.getItem('user_role') // 'farmer' or 'consumer'
    : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    farming_type: 'organic',
    bio: '',
    years_of_farming: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setPhotoFile(file);
    // Create local preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      setError('Location required. Please allow location access and refresh.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build FormData for multipart/form-data request (required for file upload)
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('latitude', latitude.toString());
      data.append('longitude', longitude.toString());
      data.append('city', formData.city);
      data.append('pincode', formData.pincode);

      if (userRole === 'farmer') {
        data.append('address', formData.address);
        data.append('farming_type', formData.farming_type);
        data.append('bio', formData.bio);
        data.append('years_of_farming', formData.years_of_farming);
      } else {
        data.append('delivery_address', formData.address);
      }

      if (photoFile) {
        data.append('photo', photoFile);
      }

      const token = localStorage.getItem('auth_token');
      const endpoint = userRole === 'farmer'
        ? '/api/v1/farmer/profile'
        : '/api/v1/consumer/profile';

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // DO NOT set Content-Type — axios sets multipart/form-data automatically with boundary
          }
        }
      );

      // Redirect to appropriate dashboard
      router.push(userRole === 'farmer' ? '/farmer/dashboard' : '/marketplace');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            {userRole === 'farmer'
              ? 'Set up your farm profile to start listing products'
              : 'Set up your profile to start ordering fresh produce'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-emerald-400" />
                </div>
              )}
              <label
                htmlFor="photo"
                className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <p className="text-sm text-gray-500">Upload profile photo (optional)</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder={userRole === 'farmer' ? 'Ravi Kumar' : 'Arjun Mehta'}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="yourname@email.com"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {userRole === 'farmer' ? 'Farm Address *' : 'Delivery Address *'}
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="House/Farm number, Street, Landmark..."
            />
          </div>

          {/* City + Pincode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="Bengaluru"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="560001"
              />
            </div>
          </div>

          {/* Farmer-specific fields */}
          {userRole === 'farmer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farming Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['organic', 'conventional', 'mixed'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, farming_type: type }))}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium capitalize flex items-center justify-center gap-1.5 transition-all ${
                        formData.farming_type === type
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {type === 'organic' && '🌿'}
                      {type === 'conventional' && '🚜'}
                      {type === 'mixed' && '🔄'}
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  About Your Farm (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tell consumers about your farm, your practices..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Farming Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={formData.years_of_farming}
                  onChange={e => setFormData(prev => ({ ...prev, years_of_farming: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="10"
                />
              </div>
            </>
          )}

          {/* GPS Location indicator */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800">
              {latitude && longitude
                ? `Location detected: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E`
                : 'Detecting your location...'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !latitude}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
          {userRole === 'farmer' && (
            <p className="text-xs text-gray-500 text-center">
              Your profile will be reviewed by our team before you can list products (usually within 24 hours).
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
