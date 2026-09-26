'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, ShieldCheck, Clock, Truck } from 'lucide-react';

interface NetworkTier {
  id: string;
  name: string;
  distanceRange: string;
  transitTime: string;
  typicalProduce: string;
  emissionReduction: string;
  description: string;
}

const NETWORK_TIERS: NetworkTier[] = [
  {
    id: 'super-local',
    name: 'SUPER LOCAL',
    distanceRange: 'Local',
    transitTime: '--',
    typicalProduce: 'Tender leafy greens, morning herbs, fresh berries',
    emissionReduction: '--',
    description: 'Farms situated within your immediate neighborhood perimeter. Harvested and delivered directly.',
  },
  {
    id: 'local',
    name: 'LOCAL AGRI-BELT',
    distanceRange: 'Nearby',
    transitTime: '--',
    typicalProduce: 'Vine tomatoes, gourds, beans, root vegetables',
    emissionReduction: '--',
    description: 'Cultivators in neighboring rural taluks. Dispatched via direct farm couriers directly to your kitchen counter.',
  },
  {
    id: 'regional',
    name: 'REGIONAL VALLEY',
    distanceRange: 'Regional',
    transitTime: '--',
    typicalProduce: 'Orchard fruits, pulses, cold-pressed oils, traditional grains',
    emissionReduction: '--',
    description: 'District-wide agro-climatic zones supplying specialized heirloom and heritage crops unavailable in urban centers.',
  },
];

export default function LocalFarmNetwork() {
  const [activeTierId, setActiveTierId] = useState('super-local');
  const activeTier = NETWORK_TIERS.find(t => t.id === activeTierId) || NETWORK_TIERS[0];

  return (
    <section className="py-20 lg:py-28 bg-surface border-b border-border-default transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-default">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              Proximity Tiers
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground font-display tracking-tight leading-tight">
              THE LOCAL FARM NETWORK
            </h2>

            <p className="text-foreground-secondary text-base sm:text-lg leading-relaxed">
              Every kilometer cut from the food chain means less handling, less fuel, and crisper produce.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-400 hover:underline"
          >
            Filter Marketplace by Radius <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Visual Proximity Flow: YOU -> SUPER LOCAL -> LOCAL -> REGIONAL ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NETWORK_TIERS.map((tier) => {
            const isSelected = activeTierId === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setActiveTierId(tier.id)}
                aria-pressed={isSelected}
                className={`text-left p-6 sm:p-8 rounded-3xl border transition-all duration-200 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                  isSelected
                    ? 'bg-surface-muted border-primary-600 dark:border-primary-500 shadow-md ring-1 ring-primary-600/20'
                    : 'bg-background hover:bg-surface-muted border-border-default'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-950 px-2.5 py-1 rounded-full">
                      {tier.distanceRange}
                    </span>
                    <span className="text-[11px] font-mono text-foreground-muted">
                      Tier {tier.id === 'super-local' ? 'I' : tier.id === 'local' ? 'II' : 'III'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-display text-foreground">{tier.name}</h3>
                    <p className="text-xs text-foreground-secondary mt-1.5 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border-subtle space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Transit:
                    </span>
                    <span className="font-semibold text-foreground">{tier.transitTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Emissions:
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tier.emissionReduction}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Active Tier Summary Strip ── */}
        <div className="bg-surface-muted rounded-2xl p-5 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-700 text-white flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{activeTier.name} Focus</p>
              <p className="text-foreground-secondary mt-0.5">Primary produce: {activeTier.typicalProduce}</p>
            </div>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 font-bold text-primary-700 dark:text-primary-400 hover:underline shrink-0"
          >
            Browse {activeTier.distanceRange} items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
