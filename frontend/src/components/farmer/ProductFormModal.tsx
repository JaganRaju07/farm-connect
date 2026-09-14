// frontend/src/components/farmer/ProductFormModal.tsx
'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { X, Upload, ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
  product?: any; // null for new, object for edit
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

/**
 * ProductFormModal Component
 * 
 * WHY A TWO-STEP IMAGE UPLOAD?
 * 1. Immediate visual feedback: As soon as a user selects a file, we create a local
 *    object URL preview (`URL.createObjectURL(file)`) to display it instantly without waiting
 *    for network latency.
 * 2. Separation of concerns: We first upload the raw file to `/api/v1/upload/image` which
 *    saves it on Cloudinary and returns a public URL. 
 * 3. Atomic payload submission: When the user submits the form, we only send standard JSON
 *    representing the form data and the already generated Cloudinary URL. This is simpler to debug
 *    and allows standard JSON payload processing on the backend product endpoints.
 */
export default function ProductFormModal({ product, onClose, onSuccess, token }: ProductFormModalProps) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'vegetables',
    description: product?.description || '',
    price: product?.price || '',
    unit: product?.unit || 'kg',
    stock_available: product?.stock_available || '',
    is_organic: product?.is_organic ?? false,
  });

  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [imagePreview, setImagePreview] = useState(product?.image_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!form.name.trim()) errors.name = 'Product name is required';
    if (form.name.length > 50) errors.name = 'Name must be less than 50 characters';
    
    const priceNum = parseFloat(form.price as string);
    if (!form.price || isNaN(priceNum)) errors.price = 'Valid price is required';
    else if (priceNum <= 0) errors.price = 'Price must be greater than 0';
    else if (priceNum > 50000) errors.price = 'Price cannot exceed ₹50,000';
    
    const stockNum = parseInt(form.stock_available as string);
    if (form.stock_available === '' || isNaN(stockNum)) errors.stock_available = 'Valid stock amount is required';
    else if (stockNum < 0) errors.stock_available = 'Stock cannot be negative';
    else if (stockNum > 10000) errors.stock_available = 'Stock cannot exceed 10,000';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setImagePreview(URL.createObjectURL(file));

    // Upload to Cloudinary via backend
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_BASE}/api/v1/upload/image?folder=products`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // The backend should return the Cloudinary URL in response.data.data.url
      const url = response.data?.data?.url ?? response.data?.url;
      if (url) {
        setImageUrl(url);
      } else {
        throw new Error('Image URL not received from server');
      }
    } catch (err: any) {
      console.error(err);
      setError('Image upload failed. Please try again.');
      setImagePreview(imageUrl); // Revert preview to previous URL
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        image_url: imageUrl || null,
        price: parseFloat(form.price as string),
        stock_available: parseInt(form.stock_available as string) || 0,
      };

      if (isEdit) {
        await axios.put(
          `${API_BASE}/api/v1/farmer/products/${product.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE}/api/v1/farmer/products`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Backend integration pending: Feature not available yet in the API.');
      } else {
        setError(err.response?.data?.error?.message || 'Failed to save product');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-all"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-contain rounded-lg" />
              ) : (
                <div className="py-4">
                  <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, or WebP</p>
                </div>
              )}
              {uploading && <p className="text-sm text-primary-600 mt-2 font-medium">Uploading to cloud...</p>}
            </div>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect} 
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input 
              type="text" 
              required 
              value={form.name} 
              onChange={e => {
                setForm(p => ({ ...p, name: e.target.value }));
                if (validationErrors.name) setValidationErrors(p => ({ ...p, name: '' }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} 
              placeholder="Fresh Tomatoes" 
            />
            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select 
              value={form.category} 
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              {['vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'other'].map(c => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          {/* Price + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input 
                type="number" 
                required 
                min="1" 
                value={form.price} 
                onChange={e => {
                  setForm(p => ({ ...p, price: e.target.value }));
                  if (validationErrors.price) setValidationErrors(p => ({ ...p, price: '' }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${validationErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} 
                placeholder="40" 
              />
              {validationErrors.price && <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select 
                value={form.unit} 
                onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {['kg', 'g', 'litre', 'ml', 'dozen', 'bunch', 'piece'].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Stock *</label>
            <input 
              type="number" 
              required 
              min="0" 
              value={form.stock_available}
              onChange={e => {
                setForm(p => ({ ...p, stock_available: e.target.value }));
                if (validationErrors.stock_available) setValidationErrors(p => ({ ...p, stock_available: '' }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${validationErrors.stock_available ? 'border-red-300 bg-red-50' : 'border-gray-300'}`} 
              placeholder="50" 
            />
            {validationErrors.stock_available && <p className="text-red-500 text-xs mt-1">{validationErrors.stock_available}</p>}
          </div>

          {/* Organic toggle */}
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="organic" 
              checked={form.is_organic}
              onChange={e => setForm(p => ({ ...p, is_organic: e.target.checked }))}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 cursor-pointer" 
            />
            <label htmlFor="organic" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1.5">
              🌿 Organic product
            </label>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving || uploading}
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
