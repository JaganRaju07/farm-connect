// frontend/src/app/farmer/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Eye, EyeOff, Package, AlertCircle } from 'lucide-react';
import ProductFormModal from '@/components/farmer/ProductFormModal';
import { EmptyState } from '@/components/common/EmptyState';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function FarmerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [apiError, setApiError] = useState(false);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/farmers/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data?.products || []);
      setApiError(false);
    } catch (error: any) {
      console.error('Failed to fetch products:', error.message);
      if (error.response?.status === 404) {
        setApiError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleToggleActive = async (productId: number, currentStatus: boolean) => {
    try {
      await axios.put(`${API_BASE}/farmers/products/${productId}`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Toggle status failed:', error);
    }
  };

  const handleDelete = async (productId: number, name: string) => {
    if (!confirm(`Remove "${name}" from your listing?`)) return;
    try {
      await axios.delete(`${API_BASE}/farmers/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Delete product failed:', error);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-8 pb-12 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-earth-900 tracking-tight">Inventory</h1>
          <p className="text-sm text-earth-500 mt-1">Manage your farm's products and stock levels.</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="btn-primary shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-earth-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : apiError ? (
        <div className="card text-center p-16 border-blue-100 bg-blue-50/50">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <Package className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-earth-900 font-bold font-display text-lg mb-1">Backend Integration Pending</p>
          <p className="text-earth-500 mb-6 max-w-md mx-auto">The products endpoint is not yet available on the backend server. The UI is ready once the integration is complete.</p>
          <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="btn-secondary mx-auto">
            Test Form Validation
          </button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-10 h-10 text-earth-400" />}
          title="No products yet"
          description="Start by adding your first harvest to the marketplace."
          actionText="Add your first product"
          onAction={() => { setEditProduct(null); setShowModal(true); }}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-earth-50/50 border-b border-earth-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-earth-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 bg-white">
                {products.map((product, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={product.id} 
                    className="hover:bg-earth-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-earth-200 shadow-sm group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-12 h-12 bg-earth-50 rounded-xl flex items-center justify-center border border-earth-200">
                            <Package className="w-5 h-5 text-earth-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-earth-900 group-hover:text-primary-700 transition-colors">{product.name}</p>
                          <p className="text-xs font-medium text-earth-500 capitalize">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-earth-900 font-bold">
                      {formatPrice(product.price)} <span className="text-earth-500 text-xs font-medium">/ {product.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-earth-900">
                          {product.stock_available} {product.unit}
                        </span>
                        {product.stock_available === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                            <span className="w-2 h-2 rounded-full border-2 border-red-600 shrink-0"></span> Out of Stock
                          </span>
                        ) : product.stock_available <= 10 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                            <AlertCircle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600">
                            <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0"></span> In Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-bold border ${
                        product.is_active 
                          ? 'bg-primary-50 text-primary-700 border-primary-100' 
                          : 'bg-earth-100 text-earth-600 border-earth-200'
                      }`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                          className="p-2 text-earth-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                          title={product.is_active ? 'Hide Product' : 'Show Product'}
                        >
                          {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => { setEditProduct(product); setShowModal(true); }}
                          className="p-2 text-earth-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-earth-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchProducts(); }}
          token={token || ''}
        />
      )}
    </div>
  );
}
