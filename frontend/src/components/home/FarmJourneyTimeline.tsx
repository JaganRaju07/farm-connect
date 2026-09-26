'use client';

import React, { useState } from 'react';
import { Sprout, Sun, Tag, Compass, ShoppingCart, Truck, CheckCircle2 } from 'lucide-react';

interface JourneyStep {
  id: string;
  stageNumber: string;
  name: string;
  tagline: string;
  description: string;
  realDataField: string;
  icon: React.ComponentType<{ className?: string }>;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'field',
    stageNumber: '01',
    name: 'FIELD',
    tagline: 'Living Soil & Generational Care',
    description: 'Crops are sown in organic and mineral-rich soils across regional taluks. No synthetic ripening accelerators or forced cultivation.',
    realDataField: 'farmer.farming_type & farmer.city',
    icon: Sprout,
  },
  {
    id: 'harvest',
    stageNumber: '02',
    name: 'HARVEST',
    tagline: 'Dawn Picking at Peak Hydration',
    description: 'Picked fresh when natural sugar and moisture concentrations are at their biological peak.',
    realDataField: 'product.harvestDate',
    icon: Sun,
  },
  {
    id: 'listed',
    stageNumber: '03',
    name: 'LISTED',
    tagline: 'Cultivator Pricing Sovereignty',
    description: 'The grower posts live stock directly to Farm Connect. The farmer keeps 100% of the listed price with zero intermediary deductions.',
    realDataField: 'product.price & product.stockAvailable',
    icon: Tag,
  },
  {
    id: 'discovered',
    stageNumber: '04',
    name: 'DISCOVERED',
    tagline: 'Hyperlocal Proximity Matching',
    description: 'Consumers browse harvests grown within their local perimeter for swift delivery.',
    realDataField: 'product.distance_km',
    icon: Compass,
  },
  {
    id: 'ordered',
    stageNumber: '05',
    name: 'ORDERED',
    tagline: 'Direct Demand Without Gateways',
    description: 'The consumer places an order with exact delivery address coordinates. No payment lock-in or online gateway charges.',
    realDataField: 'order.order_status ("pending")',
    icon: ShoppingCart,
  },
  {
    id: 'delivered',
    stageNumber: '06',
    name: 'DELIVERED',
    tagline: 'Doorstep Handshake & Payment',
    description: 'Dispatched in breathable, reusable farm crates. Inspected at your door before you pay the farmer directly via UPI or Cash.',
    realDataField: 'order.order_status ("delivered")',
    icon: Truck,
  },
];

export default function FarmJourneyTimeline() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = JOURNEY_STEPS[activeStepIndex];
  const CurrentIcon = currentStep.icon;

  return (
    <section className="py-20 lg:py-28 bg-background border-b border-border-default transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ── Section Header ── */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-primary-700 dark:text-primary-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4" />
            Traceable Lifecycle
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground font-display tracking-tight leading-tight">
            THE FARM CONNECT JOURNEY
          </h2>
          <p className="text-foreground-secondary text-base sm:text-lg leading-relaxed">
            Every harvest follows an unbroken, transparent path from Karnataka’s fields to your kitchen.
          </p>
        </div>

        {/* ── Horizontal Interactive Stepper ── */}
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex items-center justify-between min-w-[700px] border-b border-border-default pb-4">
            {JOURNEY_STEPS.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = idx < activeStepIndex;
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                    isActive 
                      ? 'text-primary-700 dark:text-primary-400 font-bold scale-105' 
                      : isPast 
                      ? 'text-foreground font-semibold' 
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                  aria-label={`Step ${step.stageNumber}: ${step.name}`}
                  aria-pressed={isActive}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                    isActive 
                      ? 'bg-primary-700 text-white border-primary-700 shadow-md dark:bg-primary-600 dark:border-primary-600' 
                      : isPast 
                      ? 'bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 border-primary-300' 
                      : 'bg-surface border-border-default'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs">{step.stageNumber}</span>
                  <span className="font-display text-xs tracking-wider">{step.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Active Step Deep-Dive Card ── */}
        <div className="bg-surface rounded-3xl border border-border-default p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary-700 dark:text-primary-400 uppercase">
              <CheckCircle2 className="w-4 h-4" />
              Stage {currentStep.stageNumber} of 06 · Verified Milestone
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display tracking-tight">
              {currentStep.name}: {currentStep.tagline}
            </h3>

            <p className="text-foreground-secondary text-base sm:text-lg leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          <div className="lg:col-span-4 bg-surface-muted p-5 rounded-2xl border border-border-subtle space-y-2">
            <span className="text-[11px] font-mono uppercase text-foreground-muted block">
              Application Data Backing
            </span>
            <div className="font-mono text-xs bg-surface p-2.5 rounded-lg border border-border-subtle text-foreground break-all">
              {currentStep.realDataField}
            </div>
            <p className="text-[11px] text-foreground-muted leading-tight pt-1">
              Mapped directly to live database records for full traceability.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
