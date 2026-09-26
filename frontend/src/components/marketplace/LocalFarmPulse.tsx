// frontend/src/components/marketplace/LocalFarmPulse.tsx
'use client';

import React from 'react';
import { Sprout, MapPin, Package, Clock, ShieldCheck } from 'lucide-react';

interface LocalFarmPulseProps {
  products: any[];
  isLoading?: boolean;
}

export default function LocalFarmPulse({ products, isLoading }: LocalFarmPulseProps) {
  if (isLoading) {
    return (
      <div 
        className="mb-8 p-6 rounded-2xl bg-surface-muted border border-border-default h-24 animate-pulse" 
        role="status"
        aria-label="Loading local farm metrics"
      />
    );
  }
  
  if (!products || products.length === 0) return null;

  // Derive metrics safely from existing API data
  const availableProducts = products.filter(p => p.stockAvailable > 0).length;
  const uniqueFarmers = new Set(products.map(p => p.farmerId)).size;
  
  const now = new Date();
  const recentlyHarvested = products.filter(p => {
    if (!p.harvestDate) return false;
    const diff = (now.getTime() - new Date(p.harvestDate).getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 3;
  }).length;

  const distances = products
    .map(p => p.distance_km)
    .filter((d): d is number => d !== undefined && d !== null);
  const closestFarm = distances.length > 0 ? Math.min(...distances) : null;

  const pulseItems = [
    {
      label: 'Local Products',
      value: availableProducts,
      icon: Package,
      color: 'text-primary-700 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40',
    },
    {
      label: 'Nearby Growers',
      value: uniqueFarmers,
      icon: Sprout,
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40',
    },
    {
      label: 'Picked ≤ 3 Days',
      value: recentlyHarvested,
      icon: Clock,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40',
    },
    ...(closestFarm !== null ? [{
      label: 'Closest Farm',
      value: closestFarm < 1 ? '< 1 km' : `${closestFarm.toFixed(1)} km`,
      icon: MapPin,
      color: 'text-cyan-700 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40',
    }] : [])
  ];

  return (
    <div 
      className="mb-8 p-4 sm:p-5 rounded-2xl bg-surface border border-border-default shadow-sm transition-colors"
      aria-label="Local Farm Activity Metrics"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title & Live indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <div>
            <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              Local Farm Pulse
            </h2>
            <p className="text-[11px] text-foreground-muted">Verified marketplace live inventory</p>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full md:w-auto">
          {pulseItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div 
                key={i} 
                className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-muted border border-border-subtle min-w-[120px]"
              >
                <div className={`p-2 rounded-lg ${item.bg} ${item.color} shrink-0`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold text-foreground font-display leading-tight truncate">
                    {item.value}
                  </span>
                  <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-tight truncate">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
