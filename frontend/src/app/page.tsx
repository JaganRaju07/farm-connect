'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sprout, MapPin, ShoppingCart, Tractor,
  CheckCircle2, ArrowRight, Loader2, Leaf, ShieldCheck, Heart, Users, Star, Truck
} from 'lucide-react';
import { AuroraBackground } from '@/components/reactbits/AuroraBackground';
import { BlobCursor } from '@/components/reactbits/BlobCursor';

export default function HomePage() {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (role === 'farmer') router.push('/farmer/dashboard');
      if (role === 'consumer') router.push('/marketplace');
      if (role === 'admin') router.push('/admin/dashboard');
    }
  }, [isAuthenticated, role, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <AuroraBackground className="min-h-screen font-sans overflow-y-auto overflow-x-hidden selection:bg-primary-200 selection:text-primary-900 !justify-start !items-stretch">
      <BlobCursor />
      {/* ── Nav ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 backdrop-blur-xl bg-earth-50/90 border-b border-earth-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary-50 p-2.5 rounded-xl group-hover:bg-primary-100 transition-colors border border-primary-200">
              <Sprout className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold text-earth-900 tracking-tight font-display">Farm Connect</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-semibold text-earth-600 hover:text-earth-900 transition-colors hidden sm:block">
              Log In
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero (Shadcn Storefront Style) ── */}
      <section className="relative bg-white border-b border-earth-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Copy */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-200 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Live in Karnataka
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-earth-900 mb-6 tracking-tight font-display leading-[1.1]">
                Fresh produce. <br />
                <span className="text-primary-700">Zero middlemen.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-earth-600 mb-8 leading-relaxed max-w-lg">
                Connect directly with farmers near you. Farmers earn more, you pay less, and your food arrives fresher than ever.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href="/register" className="btn-primary w-full sm:w-auto text-base px-8 h-12">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Fresh Produce
                </Link>
                <Link href="/farmer/register" className="btn-secondary w-full sm:w-auto text-base px-8 h-12">
                  <Tractor className="w-5 h-5 mr-2 text-earth-500" />
                  Sell Your Harvest
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-8 text-sm text-earth-600">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">5k+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Component (shadcn-style composition) */}
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-earth-50 rounded-3xl border border-earth-200 overflow-hidden shadow-sm flex items-center justify-center p-8">
              {/* Decorative grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Central Card */}
              <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl border border-earth-200 shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-earth-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-earth-900">Harvested Today</h3>
                    <p className="text-sm text-earth-500">Delivered within 6 hours</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-earth-100 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-earth-900">Organic Tomatoes</span>
                    </div>
                    <span className="font-bold text-primary-700">₹40/kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-earth-100 rounded-lg flex items-center justify-center">
                        <Sprout className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-medium text-earth-900">Fresh Spinach</span>
                    </div>
                    <span className="font-bold text-primary-700">₹25/bunch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works (Shadcn Timeline Style) ── */}
      <section className="bg-earth-50 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-earth-900 mb-4 font-display tracking-tight">How Farm Connect Works</h2>
            <p className="text-earth-600 text-lg">Three simple steps to a better food system.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { 
                icon: MapPin, 
                title: 'Discover Nearby Farms', 
                desc: 'We use location data to show you the closest farms, minimizing transport time and carbon footprint.'
              },
              { 
                icon: ShoppingCart, 
                title: 'Order Directly', 
                desc: 'Browse live inventory and place orders. No payment gateways required—pay the farmer on delivery with cash or UPI.'
              },
              { 
                icon: Truck, 
                title: 'Track & Receive', 
                desc: 'Follow your order from packed to delivered. Enjoy 100% transparent, untampered fresh produce.'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 bg-white p-6 md:p-8 rounded-2xl border border-earth-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-50 text-primary-700 rounded-xl flex items-center justify-center border border-primary-100">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-earth-900 mb-2">{item.title}</h3>
                  <p className="text-earth-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Farmer CTA ── */}
      <section className="py-24 px-4 bg-white border-t border-earth-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-earth-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-xl">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-400 via-earth-900 to-earth-900" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-earth-800 rounded-2xl flex items-center justify-center mb-6 border border-earth-700 shadow-inner">
                <Leaf className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Are you a farmer?</h2>
              <p className="text-earth-300 text-lg mb-10 max-w-xl text-center leading-relaxed">
                Take control of your pricing. Sell directly to consumers in your city without middlemen eating into your margins.
              </p>
              <Link href="/farmer/register" className="btn-primary text-base px-8 h-12 rounded-xl group">
                Register Your Farm <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-earth-200 pt-16 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6 text-primary-600" />
                <span className="text-xl font-bold text-earth-900 tracking-tight font-display">Farm Connect</span>
              </Link>
              <p className="text-earth-500 text-sm leading-relaxed pr-4">
                Empowering local agriculture by directly connecting farmers with consumers. Fresh food, fair prices.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-earth-900 mb-4">Consumers</h4>
              <ul className="space-y-3 text-sm text-earth-600">
                <li><Link href="/login" className="hover:text-primary-600 transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-primary-600 transition-colors">Create Account</Link></li>
                <li><Link href="/marketplace" className="hover:text-primary-600 transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-earth-900 mb-4">Farmers</h4>
              <ul className="space-y-3 text-sm text-earth-600">
                <li><Link href="/farmer/login" className="hover:text-primary-600 transition-colors">Farmer Login</Link></li>
                <li><Link href="/farmer/register" className="hover:text-primary-600 transition-colors">Sell on Farm Connect</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary-600 transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-earth-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-earth-600">
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-earth-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-earth-400 text-sm">
              © {new Date().getFullYear()} Farm Connect. All rights reserved.
            </p>
            <p className="text-earth-400 text-sm flex items-center gap-1">
              Built with <Heart className="w-4 h-4 text-accent-500 fill-accent-500 mx-1" /> for local agriculture.
            </p>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  );
}