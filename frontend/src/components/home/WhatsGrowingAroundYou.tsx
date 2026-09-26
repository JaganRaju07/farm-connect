'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, MapPin, ArrowRight, Leaf, Apple, Wheat, Compass } from 'lucide-react';

interface WhatsGrowingProps {
  locationName?: string;
  farmerCount?: number;
  productCount?: number;
  closestKm?: number | null;
}

const SEASONAL_HARVEST_CATEGORIES = [
  {
    name: 'Leafy Greens & Herbs',
    description: 'Palak, Methi, Coriander, Mint, Amaranth',
    icon: Leaf,
    harvestWindow: 'Fresh',
    shelfLife: 'Highly Perishable',
  },
  {
    name: 'Vine & Root Vegetables',
    description: 'Native Tomatoes, Brinjal, Beans, Carrots, Potatoes',
    icon: Sprout,
    harvestWindow: 'Freshly Picked',
    shelfLife: 'Naturally Grown',
  },
  {
    name: 'Orchard Fruits',
    description: 'Nanjangud Bananas, Papayas, Guavas, Pomegranates',
    icon: Apple,
    harvestWindow: 'Naturally Ripened',
    shelfLife: 'Direct from Farm',
  },
  {
    name: 'Staples & Grains',
    description: 'Traditional Red Rice, Ragi, Foxtail Millet, Lentils',
    icon: Wheat,
    harvestWindow: 'Traditional Seeds',
    shelfLife: 'Locally Sourced',
  }
];

export default function WhatsGrowingAroundYou({
  locationName,
  farmerCount = 0,
  productCount = 0,
  closestKm = null
}: WhatsGrowingProps) {
  return (
    <section className="py-20 lg:py-28 bg-surface-muted border-b border-border-default transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── Editorial Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-default">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              Local Seasonal Inventory
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground font-display tracking-tight leading-tight">
              WHAT’S GROWING <br />
              <span className="text-primary-700 dark:text-primary-400">AROUND YOU?</span>
            </h2>

            <div className="flex items-center gap-2 text-foreground-secondary text-sm pt-1">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Current orbit: <strong className="text-foreground font-semibold">{locationName || 'Your Region'}</strong></span>
              {closestKm !== null && closestKm !== undefined && (
                <span className="font-mono text-xs bg-surface px-2 py-0.5 rounded border border-border-subtle">
                  Closest farm ~{closestKm.toFixed(1)} km
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics & Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="bg-surface px-4 py-3 rounded-2xl border border-border-default shadow-sm">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="font-black text-lg text-foreground block font-display">{farmerCount}</span>
                  <span className="text-foreground-muted font-mono uppercase text-[10px]">Active Farms</span>
                </div>
                <div className="w-px h-8 bg-border-subtle" />
                <div>
                  <span className="font-black text-lg text-primary-700 dark:text-primary-400 block font-display">{productCount}</span>
                  <span className="text-foreground-muted font-mono uppercase text-[10px]">Live Harvests</span>
                </div>
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              Explore Local Farms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ── Category Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SEASONAL_HARVEST_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div 
                key={i} 
                className="bg-surface rounded-2xl p-6 border border-border-default shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-800">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground font-display mb-1">{cat.name}</h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed">{cat.description}</p>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-border-subtle space-y-1.5 text-[11px] text-foreground-muted">
                  <div className="flex justify-between">
                    <span>Harvest Standard:</span>
                    <span className="text-foreground font-medium">{cat.harvestWindow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freshness:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{cat.shelfLife}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
