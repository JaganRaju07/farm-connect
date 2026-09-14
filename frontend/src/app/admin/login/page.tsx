// frontend/src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await axios.post(`${API}/admin/login`, { email, password });
      
      const token = res.data.data.token;
      
      // Mock user for admin
      const mockAdminUser = {
        id: 999,
        name: 'Super Admin',
        phone: 'N/A',
        is_profile_complete: true
      };

      login(token, mockAdminUser, 'admin');
      
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-950">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Farm Connect Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@farmconnect.in"
            />
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-700 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
