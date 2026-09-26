'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { Sprout, MapPin, Search, ArrowLeft, Tractor, ShieldCheck } from 'lucide-react';
import FarmerStorefrontCard from '@/components/marketplace/FarmerStorefrontCard';
import FarmerSpotlightCard from '@/components/marketplace/FarmerSpotlightCard';
import Input from '@/components/ui/Input';
import { EmptyState } from '@/components/common/EmptyState';
import { getButtonClasses } from '@/components/ui/button';

export default function FarmersDirectoryPage() {
  const { latitude, longitude, loading: locLoading, error: locError, refreshLocation } = useLocation();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (locLoading) return;

    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const queryParams = latitude && longitude 
          ? `?latitude=${latitude}&longitude=${longitude}`
          : '';
        const res = await axios.get(`${API}/farmers/nearby${queryParams}`);
        if (res.data?.success && res.data?.data?.farmers && res.data.data.farmers.length > 0) {
          setFarmers(res.data.data.farmers);
        } else {
          setFarmers([]);
        }
      } catch (err) {
        console.warn('Error fetching farmers:', err);
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [latitude, longitude, locLoading]);

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <Link
            href="/farmer/register"
            className="text-xs font-bold text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1.5"
          >
            <Tractor className="w-3.5 h-3.5" />
            Are you a grower? Register here
          </Link>
        </div>

        {/* ── Editorial Header ── */}
        <div className="relative bg-surface rounded-3xl border border-border-default p-8 md:p-12 overflow-hidden shadow-card">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 select-none pointer-events-none text-8xl md:text-[11rem] font-extrabold font-display text-primary-950/[0.03] dark:text-white/[0.03]">
            FARMS
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 font-mono text-xs uppercase tracking-wider font-bold">
              <Sprout className="w-4 h-4" />
              Cultivator Directory · Karnataka
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground font-display tracking-tight leading-tight">
              The Stewards of Your Food.
            </h1>

            <p className="text-foreground-secondary text-base sm:text-lg leading-relaxed">
              Every crop harvested on Farm Connect is anchored to named growers, verified land coordinates, and honest pricing. Discover who grows your food within your taluk.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface-muted px-3 py-1.5 rounded-full border border-border-subtle">
                <MapPin className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span>
                  {locLoading ? 'Detecting your coordinates...' : locError ? 'Location not enabled' : 'Sorted by proximity to you'}
                </span>
                {!locLoading && (
                  <button onClick={refreshLocation} className="text-primary-600 dark:text-primary-400 font-bold ml-1 hover:underline">
                    Refresh
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary bg-surface-muted px-3 py-1.5 rounded-full border border-border-subtle">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span>100% Verified Profiles</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search cultivators by name or taluk/city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* ── Farmer Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-surface-muted rounded-3xl animate-pulse motion-reduce:animate-none border border-border-default" />
            ))}
          </div>
        ) : filteredFarmers.length > 0 ? (
          <div className="space-y-6">
            {/* Spotlight first farmer if no search query */}
            {!searchQuery && filteredFarmers.length > 0 && (
              <FarmerSpotlightCard farmer={filteredFarmers[0]} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(!searchQuery ? filteredFarmers.slice(1) : filteredFarmers).map(farmer => (
                <FarmerStorefrontCard key={farmer.id} farmer={farmer} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No farmers match your search"
            description="Try searching for another taluk or clearing your query to discover all local cultivators."
            actionText="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        )}

      </div>
    </div>
  );
}
