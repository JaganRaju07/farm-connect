'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Tractor, MapPin, ShieldCheck, Clock, Sprout, ArrowRight } from 'lucide-react';
import { getButtonClasses } from '@/components/ui/button';

interface HeroNarrativeProps {
  userTaluk?: string;
  nearbyCount?: number;
}

export default function HeroNarrative({ userTaluk, nearbyCount = 0 }: HeroNarrativeProps) {
  return (
    <section className="relative bg-background border-b border-border-default transition-colors duration-200 overflow-hidden">
      {/* Subtle Agricultural Field Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── Left Column: Editorial Headline & Purpose ── */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Location & Status Tag */}
            <div className="inline-flex items-center gap-2 bg-surface-muted text-foreground-secondary border border-border-default text-xs font-mono px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              <span>HYPERLOCAL AGRI-CORRIDOR · {(userTaluk || 'REGION').toUpperCase()}</span>
            </div>

            {/* Main Editorial Statement */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight font-display leading-[1.08]">
                FROM THE FIELD <br />
                <span className="text-primary-700 dark:text-primary-400">TO YOUR TABLE.</span>
              </h1>
              
              <p className="text-xl sm:text-2xl font-display font-medium text-foreground-secondary">
                Fresh produce. Real farmers. A shorter journey.
              </p>
            </div>

            {/* Grounded narrative copy */}
            <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-xl">
              Eliminate multi-day mandi storage and broker markups. Buy vegetables and fruits picked at dawn directly from cultivators in your taluk, delivered straight to your door with zero prepayment risk.
            </p>

            {/* Core Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-2">
              <Link 
                href="/marketplace" 
                className={getButtonClasses('primary', 'md', false, 'px-8 h-12 shadow-sm font-semibold text-base')}
              >
                <ShoppingCart className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
                Explore Local Harvest
              </Link>
              
              <Link 
                href="/farmer/register" 
                className={`${getButtonClasses('secondary', 'md', false, 'px-7 h-12 font-semibold text-base')} !text-foreground-secondary !border-border-default hover:!text-foreground`}
              >
                <Tractor className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
                Sell Your Harvest
              </Link>
            </div>

            {/* 4 Practical Trust Anchors */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border-subtle w-full text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-foreground-muted block uppercase">Cultivator Pricing</span>
                <span className="font-bold text-foreground block">Direct to Farmer</span>
              </div>
              
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-foreground-muted block uppercase">Transit Window</span>
                <span className="font-bold text-foreground block">Swift Delivery</span>
              </div>
              
              <div className="space-y-1">
                <span className="font-mono text-[11px] text-foreground-muted block uppercase">Transit Radius</span>
                <span className="font-bold text-foreground block">Local Taluk</span>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[11px] text-foreground-muted block uppercase">Payment Method</span>
                <span className="font-bold text-foreground block">Cash / UPI on Doorstep</span>
              </div>
            </div>

          </div>

          {/* ── Right Column: Editorial Agricultural Visual Composition ── */}
          <div className="lg:col-span-5 relative w-full">
            <div className="bg-surface rounded-3xl border border-border-default shadow-card p-6 sm:p-8 space-y-6">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 flex items-center justify-center">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Verified Farm Origin</h3>
                    <p className="text-[11px] text-foreground-muted font-mono">Real growers · Direct harvest</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                  Active Taluk
                </span>
              </div>

              {/* Harvest Provenance Card */}
              <div className="bg-surface-muted rounded-2xl p-4 border border-border-subtle space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted font-mono uppercase">Typical Morning Harvest</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Freshly Picked
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-foreground">Local Produce</span>
                    <span className="font-black text-primary-700 dark:text-primary-400">Direct Pricing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <MapPin className="w-3.5 h-3.5 text-foreground-muted shrink-0" />
                    <span>Direct from local farms</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-foreground-muted">
                  <span>Chemical Waxing: <strong className="text-foreground font-semibold">None</strong></span>
                  <span>Intermediary Cut: <strong className="text-foreground font-semibold">None</strong></span>
                </div>
              </div>

              {/* Delivery Promise */}
              <div className="p-3.5 bg-primary-50 dark:bg-primary-950/30 rounded-xl border border-primary-200 dark:border-primary-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-primary-900 dark:text-primary-200 font-semibold">
                    Inspect at door before paying
                  </span>
                </div>
                <Link href="/marketplace" className="text-primary-700 dark:text-primary-400 font-bold hover:underline inline-flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
