// frontend/src/components/product/FreshnessSnapshot.tsx
'use client';

import React from 'react';
import { Calendar, Clock, Leaf, MapPin, Sprout, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getRelativeHarvestDate } from '@/lib/utils';

interface FreshnessSnapshotProps {
  harvestDate?: string;
  distanceKm?: number;
  farmerName?: string;
  farmerCity?: string;
  isOrganic?: boolean;
}

export default function FreshnessSnapshot({ 
  harvestDate, 
  distanceKm,
  farmerName,
  farmerCity,
  isOrganic = false
}: FreshnessSnapshotProps) {
  const harvest = harvestDate ? new Date(harvestDate) : null;
  const now = new Date();
  const diffDays = harvest ? Math.floor((now.getTime() - harvest.getTime()) / (1000 * 3600 * 24)) : null;

  let freshnessLevel = 'Standard Farm Harvest';
  let badgeColor = 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800';
  let dotCount = 2;

  if (diffDays !== null) {
    if (diffDays <= 1) {
      freshnessLevel = 'Peak Morning Dew (< 24h)';
      badgeColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      dotCount = 4;
    } else if (diffDays <= 3) {
      freshnessLevel = 'Fresh Field Harvest (2–3 days)';
      badgeColor = 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800';
      dotCount = 3;
    } else if (diffDays <= 7) {
      freshnessLevel = 'Harvested This Week';
      badgeColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      dotCount = 2;
    }
  }

  return (
    <div className="mt-8 space-y-4">
      {/* ── Provenance & Freshness Card ── */}
      <div className="bg-surface rounded-2xl border border-border-default overflow-hidden shadow-sm transition-colors">
        
        {/* Header */}
        <div className="bg-surface-muted border-b border-border-subtle px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              Product Origin & Traceability
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5" title={`Freshness Rating: ${dotCount}/4`}>
            {[1, 2, 3, 4].map(i => (
              <span 
                key={i} 
                className={`w-2 h-2 rounded-full ${i <= dotCount ? 'bg-primary-600 dark:bg-primary-400' : 'bg-surface border border-border-default'}`} 
              />
            ))}
          </div>
        </div>

        {/* Origin & Freshness Grid */}
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Harvest Timestamp */}
          {harvest ? (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-surface-muted text-primary-600 dark:text-primary-400 shrink-0 border border-border-subtle">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-foreground-muted uppercase block">Harvest Timing</span>
                <p className="text-xs font-bold text-foreground">
                  {harvest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {getRelativeHarvestDate(harvestDate)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-surface-muted text-foreground-muted shrink-0 border border-border-subtle">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-foreground-muted uppercase block">Harvest Protocol</span>
                <p className="text-xs font-bold text-foreground">Harvested on Order Confirmation</p>
                <p className="text-[11px] text-foreground-secondary">Direct farmgate dispatch</p>
              </div>
            </div>
          )}

          {/* Distance & Proximity */}
          {distanceKm !== undefined && distanceKm !== null && (
            <div className="flex items-start gap-3 sm:border-l border-border-subtle sm:pl-4">
              <div className="p-2.5 rounded-xl bg-surface-muted text-cyan-600 dark:text-cyan-400 shrink-0 border border-border-subtle">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-foreground-muted uppercase block">Direct Transit Distance</span>
                <p className="text-xs font-bold text-foreground">
                  {distanceKm < 1 ? '< 1 km away' : `${distanceKm.toFixed(1)} km away`}
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  {farmerCity ? `From ${farmerCity}` : 'Hyperlocal Taluk'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Section F: Subtle Harvest Timeline (Verified Milestones) ── */}
        <div className="border-t border-border-subtle bg-surface-muted/40 p-4">
          <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-wider block mb-3">
            Freshness Timeline
          </span>

          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Step 1: Harvested */}
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center mx-auto">
                ✓
              </div>
              <span className="text-[11px] font-bold text-foreground block">Harvested</span>
              <span className="text-[9px] text-foreground-muted block font-mono">
                {harvest ? harvest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Dawn'}
              </span>
            </div>

            {/* Step 2: Listed */}
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center mx-auto">
                ✓
              </div>
              <span className="text-[11px] font-bold text-foreground block">Listed</span>
              <span className="text-[9px] text-foreground-muted block font-mono">Direct Price</span>
            </div>

            {/* Step 3: Ordered */}
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 font-bold text-[10px] flex items-center justify-center mx-auto">
                3
              </div>
              <span className="text-[11px] font-bold text-foreground block">Ordered</span>
              <span className="text-[9px] text-foreground-muted block font-mono">Next Dispatch</span>
            </div>

            {/* Step 4: Delivered */}
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-surface-muted text-foreground-muted font-bold text-[10px] flex items-center justify-center mx-auto border border-border-default">
                4
              </div>
              <span className="text-[11px] font-bold text-foreground block">Delivered</span>
              <span className="text-[9px] text-foreground-muted block font-mono">At Doorstep</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
