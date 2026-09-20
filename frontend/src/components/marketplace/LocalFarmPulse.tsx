// frontend/src/components/marketplace/LocalFarmPulse.tsx
'use client';

import { Sprout, MapPin, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocalFarmPulseProps {
  products: any[];
  isLoading?: boolean;
}

export default function LocalFarmPulse({ products, isLoading }: LocalFarmPulseProps) {
  if (isLoading) {
    return (
      <div className="mb-8 p-1 rounded-2xl bg-surface-muted h-[88px] animate-pulse"></div>
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

  const distances = products.map(p => p.distance_km).filter(d => d !== undefined && d !== null);
  const closestFarm = distances.length > 0 ? Math.min(...distances) : null;

  const pulseItems = [
    {
      label: 'Available Products',
      value: availableProducts,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Nearby Farmers',
      value: uniqueFarmers,
      icon: Sprout,
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-900/30',
    },
    {
      label: 'Freshly Harvested',
      value: recentlyHarvested,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    ...(closestFarm !== null ? [{
      label: 'Closest Farm',
      value: closestFarm < 1 ? '< 1 km' : `${closestFarm.toFixed(1)} km`,
      icon: MapPin,
      color: 'text-foreground-secondary',
      bg: 'bg-surface-muted',
    }] : [])
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-1 rounded-2xl bg-gradient-to-br from-surface-muted to-background border border-border-default shadow-sm overflow-hidden transition-colors"
    >
      <div className="flex flex-col md:flex-row items-center md:justify-between px-6 py-4 md:py-3 bg-surface rounded-xl">
        <div className="flex items-center gap-2 mb-4 md:mb-0 shrink-0 mr-4">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Local Farm Pulse</h2>
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
          {pulseItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 min-w-[120px]">
              <div className={`p-2 rounded-lg ${item.bg} ${item.color} shrink-0`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-foreground leading-none">{item.value}</span>
                <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-widest mt-1">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
