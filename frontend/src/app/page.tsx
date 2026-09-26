'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

import { Sprout, Loader2, ArrowRight, ShieldCheck, Users, Coins } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { getButtonClasses } from '@/components/ui/button';

// Clean, Modular Phase 4 Farm Connect Editorial Components
import HeroNarrative from '@/components/home/HeroNarrative';
import WhatsGrowingAroundYou from '@/components/home/WhatsGrowingAroundYou';
import FarmJourneyTimeline from '@/components/home/FarmJourneyTimeline';
import LocalFarmNetwork from '@/components/home/LocalFarmNetwork';
import FeaturedFarmersEditorial from '@/components/home/FeaturedFarmersEditorial';

export default function HomePage() {
  const { isAuthenticated, role, isLoading } = useAuth();

  const { latitude, longitude, loading: locLoading, error: locError } = useLocation();

  const [featuredFarmers, setFeaturedFarmers] = useState<any[]>([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);
  const [userTaluk, setUserTaluk] = useState('');
  const [closestDistance, setClosestDistance] = useState<number | null>(null);

  useEffect(() => {
    if (locLoading) return;

    const fetchFarmers = async () => {
      if (!latitude || !longitude) {
        setIsLoadingFarmers(false);
        return;
      }

      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      try {
        const queryParams = `?latitude=${latitude}&longitude=${longitude}`;
        const res = await axios.get(`${API}/farmers/nearby${queryParams}`);
        
        if (res.data?.success && res.data?.data?.farmers && res.data.data.farmers.length > 0) {
          const farmers = res.data.data.farmers;
          setFeaturedFarmers(farmers);
          if (farmers[0]?.city) {
            setUserTaluk(farmers[0].city);
          }
          if (typeof farmers[0]?.distance_km === 'number') {
            setClosestDistance(farmers[0].distance_km);
          }
        }
      } catch (err) {
        console.warn('Using default local farmers:', err);
      } finally {
        setIsLoadingFarmers(false);
      }
    };

    fetchFarmers();
  }, [latitude, longitude, locLoading]);


  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-label="Loading Farm Connect"
      >
        <Loader2 className="w-10 h-10 animate-spin text-primary-700 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
      
      {/* ── Practical & Accessible Editorial Navigation ── */}
      <nav 
        className="sticky top-0 left-0 right-0 z-50 px-4 md:px-8 py-3.5 backdrop-blur-md bg-background/95 border-b border-border-default shadow-xs transition-colors duration-200"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer" aria-label="Farm Connect Home">
            <div className="bg-primary-50 dark:bg-primary-950 p-2 rounded-xl border border-primary-200 dark:border-primary-800 transition-colors">
              <Sprout className="w-5 h-5 text-primary-700 dark:text-primary-400" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display text-foreground">
              Farm Connect
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link 
              href="/marketplace" 
              className="text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors hidden sm:block"
            >
              Marketplace
            </Link>
            
            <Link 
              href="/farmers" 
              className="text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors hidden md:block"
            >
              Cultivators
            </Link>

            <ThemeToggle />

            {!isLoading && isAuthenticated ? (
              <Link 
                href={role === 'farmer' ? '/farmer/dashboard' : role === 'admin' ? '/admin/dashboard' : '/marketplace'} 
                className={getButtonClasses('primary', 'sm', false, 'px-4 py-2 font-semibold text-xs sm:text-sm')}
              >
                Go to {role === 'farmer' ? 'Dashboard' : role === 'admin' ? 'Dashboard' : 'Marketplace'}
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className={getButtonClasses('primary', 'sm', false, 'px-4 py-2 font-semibold text-xs sm:text-sm')}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content Landmark ── */}
      <main>
        {/* A. HERO / NARRATIVE: "FROM THE FIELD TO YOUR TABLE" */}
        <HeroNarrative 
          userTaluk={userTaluk} 
          nearbyCount={featuredFarmers.length} 
        />

        {/* C. "WHAT'S GROWING AROUND YOU?" */}
        <WhatsGrowingAroundYou 
          locationName={userTaluk}
          farmerCount={featuredFarmers.length}
          closestKm={closestDistance}
        />

        {/* B. THE FARM CONNECT JOURNEY: FIELD -> HARVEST -> LISTED -> DISCOVERED -> ORDERED -> DELIVERED */}
        <FarmJourneyTimeline />

        {/* D. LOCAL FARM NETWORK: YOU -> SUPER LOCAL -> LOCAL -> REGIONAL */}
        <LocalFarmNetwork />

        {/* G. MEET THE FARMERS BEHIND YOUR FOOD */}
        <FeaturedFarmersEditorial 
          farmers={featuredFarmers} 
          isLoading={isLoadingFarmers} 
        />

        {/* ── Cultivator Pricing Sovereignty Section ── */}
        <section 
          className="py-20 lg:py-28 bg-surface-muted border-b border-border-default transition-colors duration-200"
          aria-label="Farmer Sovereignty Information"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-earth-900 dark:bg-surface-elevated rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-card text-white">
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary-400 bg-earth-800/80 px-3 py-1.5 rounded-full border border-earth-700">
                    <Sprout className="w-3.5 h-3.5" /> For Cultivators in Karnataka
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight text-white">
                    Set Your Own Price. <br />
                    <span className="text-primary-400">Keep 100% of What You Earn.</span>
                  </h2>

                  <p className="text-earth-300 dark:text-foreground-secondary text-base sm:text-lg leading-relaxed max-w-xl">
                    Eliminate middlemen deductions, mandi commission fees, and forced distress sales. List your harvests directly on Farm Connect and connect directly with neighboring consumer households.
                  </p>

                  <div className="pt-2">
                    <Link 
                      href="/farmer/register" 
                      className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm"
                    >
                      Register Your Farm Store <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-1.5">
                      <Coins className="w-5 h-5 text-primary-400" />
                      <h3 className="font-bold text-white text-base">Zero Commission Deductions</h3>
                    </div>
                    <p className="text-earth-300 dark:text-foreground-secondary text-xs leading-relaxed">
                      You list at ₹40/kg, you receive ₹40/kg. Settle directly with the consumer on delivery.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-1.5">
                      <Users className="w-5 h-5 text-primary-400" />
                      <h3 className="font-bold text-white text-base">Direct Taluk Customer Base</h3>
                    </div>
                    <p className="text-earth-300 dark:text-foreground-secondary text-xs leading-relaxed">
                      Serve families within your geographic radius who value fresh, traceable agriculture.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-1.5">
                      <ShieldCheck className="w-5 h-5 text-primary-400" />
                      <h3 className="font-bold text-white text-base">Autonomous Schedule</h3>
                    </div>
                    <p className="text-earth-300 dark:text-foreground-secondary text-xs leading-relaxed">
                      Harvest only when orders are placed. Eliminate wasteful post-harvest spoilage.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ── Semantic Accessible Footer ── */}
      <footer 
        className="bg-surface pt-16 pb-12 transition-colors duration-200"
        aria-label="Footer"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border-default">
            
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary-50 dark:bg-primary-950 p-2 rounded-xl border border-primary-200 dark:border-primary-800">
                  <Sprout className="w-5 h-5 text-primary-700 dark:text-primary-400" />
                </div>
                <span className="text-lg font-bold font-display text-foreground">Farm Connect</span>
              </Link>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Hyperlocal agricultural marketplace bridging cultivators with consumers. Fresh food, honest pricing, zero intermediaries.
              </p>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase font-bold text-foreground mb-4 tracking-wider">Marketplace</h3>
              <ul className="space-y-2.5 text-xs text-foreground-secondary">
                <li><Link href="/marketplace" className="hover:text-foreground transition-colors">Fresh Harvests</Link></li>
                <li><Link href="/farmers" className="hover:text-foreground transition-colors">Verified Cultivators</Link></li>
                <li><Link href="/cart" className="hover:text-foreground transition-colors">Cart</Link></li>
                <li className="pt-2"><Link href="/login" className="hover:text-foreground transition-colors font-semibold">Consumer Login</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors font-semibold">Create Account</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase font-bold text-foreground mb-4 tracking-wider">Cultivators</h3>
              <ul className="space-y-2.5 text-xs text-foreground-secondary">
                <li><Link href="/farmer/login" className="hover:text-foreground transition-colors">Farmer Login</Link></li>
                <li><Link href="/farmer/register" className="hover:text-foreground transition-colors">Register Farm Store</Link></li>
                <li><Link href="/admin/login" className="hover:text-foreground transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase font-bold text-foreground mb-4 tracking-wider">Principles</h3>
              <ul className="space-y-2.5 text-xs text-foreground-secondary">
                <li><span>100% Cultivator Price Retention</span></li>
                <li><span>&lt; 12h Harvest-to-Door Window</span></li>
                <li><span>Doorstep Cash / Direct UPI</span></li>
                <li><span>Verified Taluk Radii</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-muted">
            <p>© {new Date().getFullYear()} Farm Connect. Built for regional agricultural empowerment.</p>
            <p className="flex items-center gap-1">
              Cultivated for Karnataka’s agrarian communities.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}