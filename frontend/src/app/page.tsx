'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';


import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sprout, MapPin, ShoppingCart, Tractor,
  CheckCircle2, ArrowRight, Loader2, Leaf, ShieldCheck, Heart, Users, Star, Truck
} from 'lucide-react';
import { AuroraBackground } from '@/components/reactbits/AuroraBackground';
import { BlobCursor } from '@/components/reactbits/BlobCursor';
import { ShinyText } from '@/components/magicui/ShinyText';
import FarmerStorefrontCard from '@/components/marketplace/FarmerStorefrontCard';
import FarmerSpotlightCard from '@/components/marketplace/FarmerSpotlightCard';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { getButtonClasses } from '@/components/ui/button';

const DEFAULT_FEATURED_FARMERS = [
  {
    id: 1,
    name: "Ramesh Gowda",
    city: "Mysuru Rural",
    distance_km: 4.2,
    rating: 4.9,
    reviews_count: 128,
  },
  {
    id: 2,
    name: "Lakshmi Farms",
    city: "Mandya",
    distance_km: 12.5,
    rating: 4.7,
    reviews_count: 84,
  },
  {
    id: 3,
    name: "Green Valley Organics",
    city: "Srirangapatna",
    distance_km: 8.1,
    rating: 5.0,
    reviews_count: 32,
  }
];

export default function HomePage() {
  const { isAuthenticated, role, isLoading } = useAuth();

  const [featuredFarmers, setFeaturedFarmers] = useState(DEFAULT_FEATURED_FARMERS);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoadingFarmers(false);
      return;
    }

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`${API}/farmers/nearby?latitude=${latitude}&longitude=${longitude}`);
          
          if (res.data.success && res.data.data.farmers && res.data.data.farmers.length > 0) {
            setFeaturedFarmers(res.data.data.farmers);
          }
        } catch (err) {
          console.error('Failed to fetch nearby farmers:', err);
        } finally {
          setIsLoadingFarmers(false);
        }
      },
      (error) => {
        console.warn('Geolocation denied or failed:', error.message);
        setIsLoadingFarmers(false);
      },
      { timeout: 10000, maximumAge: 300000 } // 5 min cache
    );
  }, []);

  // Removed auto-redirect so the homepage remains accessible to authenticated users.

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <AuroraBackground className="min-h-screen font-sans overflow-y-auto overflow-x-hidden selection:bg-primary-200 selection:text-primary-900 !justify-start !items-stretch">
      <BlobCursor />
      {/* ── Nav ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 backdrop-blur-xl bg-background/90 border-b border-border-default shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary-50 dark:bg-primary-900/30 p-2.5 rounded-xl group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors border border-primary-200 dark:border-primary-800">
              <Sprout className="w-6 h-6 text-primary-600 dark:text-primary-500" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight font-display">Farm Connect</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle />
            {!isLoading && isAuthenticated ? (
              <Link href={role === 'farmer' ? '/farmer/dashboard' : role === 'admin' ? '/admin/dashboard' : '/marketplace'} className={getButtonClasses('primary', 'sm', false, 'px-5 py-2.5')}>
                Go to {role === 'farmer' ? 'Dashboard' : role === 'admin' ? 'Dashboard' : 'Marketplace'}
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors hidden sm:block">
                  Log In
                </Link>
                <Link href="/register" className={getButtonClasses('primary', 'sm', false, 'px-5 py-2.5')}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero (Shadcn Storefront Style) ── */}
      <section className="relative bg-background border-b border-border-default transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Copy */}
            <div className="flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Live in Karnataka
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight font-display leading-[1.1]">
                Fresh produce. <br />
                <ShinyText text="Zero middlemen." className="text-primary-700 dark:text-primary-500" />
              </h1>
              
              <p className="text-lg md:text-xl text-foreground-secondary mb-8 leading-relaxed max-w-lg">
                Connect directly with farmers near you. Farmers earn more, you pay less, and your food arrives fresher than ever.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href="/register" className={getButtonClasses('primary', 'md', false, 'w-full sm:w-auto text-base px-8 h-12')}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Fresh Produce
                </Link>
                <Link href="/farmer/register" className={`${getButtonClasses('secondary', 'md', false, 'w-full sm:w-auto text-base px-8 h-12')} !text-foreground-secondary !border-border-default`}>
                  <Tractor className="w-5 h-5 mr-2" />
                  Sell Your Harvest
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-8 text-sm text-foreground-secondary">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                  <span className="font-medium">5k+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Component (shadcn-style composition) */}
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-surface rounded-3xl border border-border-default overflow-hidden shadow-sm flex items-center justify-center p-8 transition-colors duration-200">
              {/* Decorative grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Central Card */}
              <div className="relative z-10 w-full max-w-sm bg-background rounded-2xl border border-border-default shadow-xl p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary-700 dark:text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Harvested Today</h3>
                    <p className="text-sm text-foreground-secondary">Delivered within 6 hours</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                      </div>
                      <span className="font-medium text-foreground">Organic Tomatoes</span>
                    </div>
                    <span className="font-bold text-primary-700 dark:text-primary-400">₹40/kg</span>
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

      {/* ── How It Works (Bento Grid) ── */}
      <section className="bg-surface-muted py-24 lg:py-32 relative z-10 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 font-display tracking-tight">How Farm Connect Works</h2>
            <p className="text-foreground-secondary text-lg">Three simple steps to a better food system.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[auto] md:auto-rows-[280px]">
            {/* Bento Box 1: Large/Wide */}
            <div className="md:col-span-2 row-span-1 bg-surface rounded-3xl p-8 md:p-10 border border-border-default shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 transition-transform group-hover:scale-125 duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-800 mb-6">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-3 font-display tracking-tight">Discover Nearby Farms</h3>
                  <p className="text-foreground-secondary text-lg leading-relaxed max-w-md">We use location data to show you the closest farms, minimizing transport time and carbon footprint for ultra-fresh produce.</p>
                </div>
              </div>
            </div>

            {/* Bento Box 2: Tall (Dark) */}
            <div className="md:col-span-1 md:row-span-2 bg-primary-900 dark:bg-primary-950 rounded-3xl p-8 md:p-10 border border-primary-800 dark:border-primary-900 shadow-[0_15px_40px_rgba(21,128,61,0.15)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-600 via-primary-900 to-primary-900 opacity-60 transition-opacity group-hover:opacity-80 duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between text-white">
                <div className="w-14 h-14 bg-primary-800 dark:bg-primary-900 text-primary-300 border-primary-700 dark:border-primary-800 rounded-2xl flex items-center justify-center border mb-6">
                  <ShoppingCart className="w-7 h-7" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-2xl font-bold mb-4 font-display tracking-tight">Order Directly</h3>
                  <p className="text-primary-100 leading-relaxed text-lg">Browse live inventory and place orders. No payment gateways required—pay the farmer directly on delivery with cash or UPI.</p>
                </div>
              </div>
            </div>

            {/* Bento Box 3: Square */}
            <div className="md:col-span-1 row-span-1 bg-surface rounded-3xl p-8 border border-border-default shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
               <div className="absolute bottom-0 right-0 opacity-5 translate-x-4 translate-y-4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
                  <Truck className="w-48 h-48" />
               </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-surface-muted text-foreground-secondary rounded-xl flex items-center justify-center mb-6">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-display tracking-tight">Track & Receive</h3>
                  <p className="text-foreground-secondary leading-relaxed">Follow your order from packed to delivered with real-time status updates.</p>
                </div>
              </div>
            </div>
            
            {/* Bento Box 4: Square */}
            <div className="md:col-span-1 row-span-1 bg-surface rounded-3xl p-8 border border-border-default shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-earth-50 dark:to-surface-muted opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-12 h-12 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 rounded-xl flex items-center justify-center mb-6 border border-accent-100 dark:border-accent-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-display tracking-tight">100% Transparent</h3>
                  <p className="text-foreground-secondary leading-relaxed">Untampered fresh produce, directly from the source to your kitchen.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Featured Local Farmers (Showcase) ── */}
      <section className="bg-background py-24 lg:py-32 relative z-10 border-t border-border-default transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400 border border-success-200 dark:border-success-800/50 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <MapPin className="w-3.5 h-3.5" /> Platform Showcase
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-display tracking-tight">Meet Your Local Farmers</h2>
              <p className="text-foreground-secondary text-lg mt-3 max-w-2xl">Discover the people growing your food. Support your local agricultural community by buying direct. (Example profiles)</p>
            </div>
            <Link href="/farmers" className="btn-secondary whitespace-nowrap">
              View All Farmers <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingFarmers ? (
              // Loading skeletons
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-earth-100 rounded-3xl animate-pulse"></div>
              ))
            ) : featuredFarmers.length > 0 ? (
              <>
                <FarmerSpotlightCard farmer={featuredFarmers[0]} />
                {featuredFarmers.slice(1).map(farmer => (
                  <FarmerStorefrontCard key={farmer.id} farmer={farmer} />
                ))}
              </>
            ) : (
              <div className="col-span-full py-12 text-center bg-surface-muted rounded-3xl border border-border-default">
                <p className="text-foreground-secondary font-medium">No nearby farmers found at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Farmer CTA ── */}
      <section className="py-24 bg-background border-t border-border-default transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-earth-900 dark:bg-surface-elevated rounded-3xl p-10 md:p-16 relative overflow-hidden shadow-xl">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary-400 via-earth-900 to-earth-900" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-earth-800 dark:bg-surface rounded-2xl flex items-center justify-center mb-6 border border-earth-700 dark:border-border-default shadow-inner">
                  <Leaf className="w-8 h-8 text-primary-400" />
                </div>
                <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Are you a farmer?</h2>
                <p className="text-earth-300 dark:text-foreground-secondary text-lg mb-8 max-w-xl leading-relaxed">
                  Take control of your pricing. Sell directly to consumers in your city without middlemen eating into your margins.
                </p>
                <Link href="/farmer/register" className={getButtonClasses('primary', 'md', false, 'text-base px-8 h-12 rounded-xl group inline-flex')}>
                  Register Your Farm <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="flex flex-col gap-6">
                <div className="bg-white/5 dark:bg-background/50 border border-white/10 dark:border-border-default rounded-2xl p-6 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400"><Heart className="w-5 h-5" /></div>
                    <h3 className="text-white font-bold text-lg">Keep 100% of your profits</h3>
                  </div>
                  <p className="text-earth-300 dark:text-foreground-secondary text-sm">No commissions or hidden fees. What you set is exactly what you earn.</p>
                </div>
                <div className="bg-white/5 dark:bg-background/50 border border-white/10 dark:border-border-default rounded-2xl p-6 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400"><Users className="w-5 h-5" /></div>
                    <h3 className="text-white font-bold text-lg">Reach local buyers directly</h3>
                  </div>
                  <p className="text-earth-300 dark:text-foreground-secondary text-sm">Connect with thousands of consumers looking for fresh, local produce in your area.</p>
                </div>
                <div className="bg-white/5 dark:bg-background/50 border border-white/10 dark:border-border-default rounded-2xl p-6 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400"><ShieldCheck className="w-5 h-5" /></div>
                    <h3 className="text-white font-bold text-lg">Complete Control</h3>
                  </div>
                  <p className="text-earth-300 dark:text-foreground-secondary text-sm">Manage your inventory, set your own prices, and decide your delivery terms seamlessly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-surface border-t border-border-default pt-16 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Sprout className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                <span className="text-xl font-bold text-foreground tracking-tight font-display">Farm Connect</span>
              </Link>
              <p className="text-foreground-secondary text-sm leading-relaxed pr-4">
                Empowering local agriculture by directly connecting farmers with consumers. Fresh food, fair prices.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Consumers</h4>
              <ul className="space-y-3 text-sm text-foreground-muted">
                <li><Link href="/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Create Account</Link></li>
                <li><Link href="/marketplace" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Farmers</h4>
              <ul className="space-y-3 text-sm text-foreground-muted">
                <li><Link href="/farmer/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Farmer Login</Link></li>
                <li><Link href="/farmer/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sell on Farm Connect</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-foreground-muted">
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border-default pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-foreground-muted text-sm">
              © {new Date().getFullYear()} Farm Connect. All rights reserved.
            </p>
            <p className="text-foreground-muted text-sm flex items-center gap-1">
              Built with <Heart className="w-4 h-4 text-accent-500 fill-accent-500 mx-1" /> for local agriculture.
            </p>
          </div>
        </div>
      </footer>
    </AuroraBackground>
  );
}