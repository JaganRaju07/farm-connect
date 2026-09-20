// frontend/src/components/product/FreshnessSnapshot.tsx
'use client';

import { Calendar, Clock, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface FreshnessSnapshotProps {
  harvestDate?: string;
  distanceKm?: number;
}

export default function FreshnessSnapshot({ harvestDate, distanceKm }: FreshnessSnapshotProps) {
  if (!harvestDate) return null;

  const harvest = new Date(harvestDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - harvest.getTime()) / (1000 * 3600 * 24));

  let label = "Harvest Date Available";
  let color = "text-earth-600";
  let bg = "bg-earth-50";
  let dots = 1;

  if (diffDays >= 0 && diffDays <= 1) {
    label = "Very Fresh";
    color = "text-success-700";
    bg = "bg-success-50";
    dots = 4;
  } else if (diffDays <= 3) {
    label = "Recently Harvested";
    color = "text-primary-700";
    bg = "bg-primary-50";
    dots = 3;
  } else if (diffDays <= 7) {
    label = "Harvested This Week";
    color = "text-amber-700";
    bg = "bg-amber-50";
    dots = 2;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border border-earth-200 rounded-xl bg-white overflow-hidden shadow-sm"
    >
      <div className="bg-earth-50 border-b border-earth-100 px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-earth-600 uppercase tracking-widest flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5" /> Freshness Snapshot
        </h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= dots ? (dots >= 3 ? 'bg-success-500' : dots === 2 ? 'bg-amber-500' : 'bg-earth-400') : 'bg-earth-200'}`} />
          ))}
        </div>
      </div>
      
      <div className="p-4 flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className={`font-bold text-sm ${color}`}>{label}</p>
            <p className="text-xs text-earth-500 flex items-center gap-1.5 mt-1">
              <Calendar className="w-3 h-3" /> {harvest.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        {distanceKm !== undefined && distanceKm !== null && (
          <div className="text-right sm:border-l border-earth-100 sm:pl-5">
            <p className="text-base font-bold text-earth-900">{distanceKm < 1 ? '< 1 km' : `${distanceKm.toFixed(1)} km`}</p>
            <p className="text-[11px] font-semibold text-earth-500 uppercase tracking-widest mt-0.5">Away from you</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
