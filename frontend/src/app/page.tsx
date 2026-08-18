'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sprout, Tractor, ShoppingBasket, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (role === 'farmer') router.push('/farmer/dashboard');
      else if (role === 'consumer') router.push('/marketplace');
      else if (role === 'admin') router.push('/admin/dashboard');
    }
  }, [isAuthenticated, role, isLoading, router]);

  if (isLoading || isAuthenticated) return null; // Don't flash landing page while redirecting

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
          <Sprout className="w-10 h-10 text-primary-600" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 max-w-3xl leading-tight">
          Fresh from the farm,<br className="hidden md:block"/> direct to your table.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          Farm Connect eliminates the middlemen. Farmers get better prices, and you get fresher, healthier food. Everyone wins.
        </p>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          
          {/* Consumer Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left flex flex-col">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
              <ShoppingBasket className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">I want to buy fresh food</h2>
            <p className="text-gray-600 mb-8 flex-1">
              Shop directly from local farmers in your area. Get seasonal produce delivered within 24 hours of harvest.
            </p>
            <div className="flex gap-3 mt-auto">
              <Link href="/register" className="flex-1 bg-primary-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-primary-700">
                Sign Up
              </Link>
              <Link href="/login" className="flex-1 bg-primary-50 text-primary-700 text-center py-3 rounded-xl font-semibold hover:bg-primary-100">
                Login
              </Link>
            </div>
          </div>

          {/* Farmer Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left flex flex-col">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
              <Tractor className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">I am a farmer</h2>
            <p className="text-gray-600 mb-8 flex-1">
              List your produce, set your own prices, and sell directly to consumers. Keep 100% of your profits.
            </p>
            <div className="flex gap-3 mt-auto">
              <Link href="/farmer/register" className="flex-1 bg-amber-500 text-white text-center py-3 rounded-xl font-semibold hover:bg-amber-600">
                Join as Farmer
              </Link>
              <Link href="/farmer/login" className="flex-1 bg-amber-50 text-amber-700 text-center py-3 rounded-xl font-semibold hover:bg-amber-100">
                Login
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Trust Indicators */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Verified Farmers</h3>
            <p className="text-sm text-gray-500">All our farmers are KYC verified</p>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Hyperlocal</h3>
            <p className="text-sm text-gray-500">Produce from within your district</p>
          </div>
          <div className="flex flex-col items-center">
            <Sprout className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Zero Middlemen</h3>
            <p className="text-sm text-gray-500">Fair prices for everyone</p>
          </div>
        </div>
      </footer>
    </div>
  );
}