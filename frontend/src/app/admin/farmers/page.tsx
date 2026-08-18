// frontend/src/app/admin/farmers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield, CheckCircle, XCircle, LogOut, ArrowLeft, User, Phone, MapPin, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function AdminFarmerVerificationPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  // State for rejection notes
  const [rejectionNotes, setRejectionNotes] = useState<Record<number, string>>({});
  const [activeRejectionId, setActiveRejectionId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

  const fetchPendingFarmers = async () => {
    try {
      const res = await axios.get('/api/v1/admin/farmers?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // The backend returns { farmers: [...], total, page, limit }
      setFarmers(res.data.data.farmers || []);
    } catch (err: any) {
      setError('Failed to load pending farmers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchPendingFarmers();
  }, [token, router]);

  const handleVerify = async (farmerId: number, decision: 'approved' | 'rejected') => {
    const note = rejectionNotes[farmerId] || '';
    if (decision === 'rejected' && !note.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }

    setActionLoadingId(farmerId);
    try {
      await axios.patch(`/api/v1/admin/farmers/${farmerId}/verify`, 
        { decision, adminNote: note || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from list
      setFarmers(prev => prev.filter(f => f.id !== farmerId));
      setActiveRejectionId(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Verification process failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3 font-bold text-lg text-emerald-400">
            <Shield className="w-6 h-6" />
            <span>FC Admin Console</span>
          </div>

          <nav className="flex flex-col gap-2">
            <Link 
              href="/admin/dashboard" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium"
            >
              <span>📊 Dashboard</span>
            </Link>
            <Link 
              href="/admin/farmers" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 text-white font-medium shadow-xs"
            >
              <span>🧑‍🌾 Farmer Verification</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard" 
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Farmer Profiles Pending Verification</h1>
              <p className="text-sm text-gray-500">Approve farmers to allow them to list products, or reject them with feedback</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {farmers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold text-lg">All profiles verified!</p>
              <p className="text-gray-500 text-sm mt-1">There are no farmers currently waiting for verification.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {farmers.map(farmer => {
                const isActionLoading = actionLoadingId === farmer.id;
                const isRejectionActive = activeRejectionId === farmer.id;

                return (
                  <div key={farmer.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6 hover:border-gray-300 transition-all">
                    {/* Header: photo preview + name */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                      {farmer.profile_photo_url ? (
                        <img 
                          src={farmer.profile_photo_url} 
                          alt="Farmer Profile" 
                          className="w-20 h-20 rounded-full object-cover border border-gray-150 shadow-xs" 
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <User className="w-10 h-10 text-emerald-400" />
                        </div>
                      )}
                      <div className="space-y-1.5 flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{farmer.name}</h3>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 flex items-center gap-1">
                          🚜 {farmer.farming_type || 'Organic'} Farming
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-sm text-gray-600 pt-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{farmer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{farmer.address}, {farmer.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span>{farmer.years_of_farming || 0} Years Experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span>{farmer.product_count || 0} Products Listed</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {farmer.bio && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                        <strong className="text-gray-900 block mb-1">About the Farm:</strong>
                        {farmer.bio}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-5">
                      {!isRejectionActive ? (
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setActiveRejectionId(farmer.id)}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-4.5 h-4.5" />
                            Reject Profile
                          </button>
                          <button
                            onClick={() => handleVerify(farmer.id, 'approved')}
                            disabled={isActionLoading}
                            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <CheckCircle className="w-4.5 h-4.5" />
                            Approve Profile
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">Rejection Reason *</label>
                          <textarea
                            rows={2}
                            value={rejectionNotes[farmer.id] || ''}
                            onChange={e => setRejectionNotes(p => ({ ...p, [farmer.id]: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-sm"
                            placeholder="State clearly why this profile is rejected (e.g. invalid photo, address unclear)..."
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setActiveRejectionId(null);
                                setRejectionNotes(p => ({ ...p, [farmer.id]: '' }));
                              }}
                              disabled={isActionLoading}
                              className="px-3.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleVerify(farmer.id, 'rejected')}
                              disabled={isActionLoading}
                              className="px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
