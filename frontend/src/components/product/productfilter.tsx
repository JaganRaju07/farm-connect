import React from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  isOrganic: boolean;
  radius: number;
}

interface ProductFilterProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply: () => void;
  onReset: () => void;
}

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Meat', 'Other'];

export function ProductFilter({ isOpen, onClose, filters, setFilters, onApply, onReset }: ProductFilterProps) {
  
  const handleCategory = (cat: string) => {
    setFilters(prev => ({ ...prev, category: cat === 'All' ? '' : cat }));
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-earth-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: '100%', x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 w-full h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-w-sm md:rounded-none md:border-l md:border-earth-200"
          >
            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-earth-50/50">
              <div className="w-12 h-1.5 bg-earth-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-earth-100 bg-earth-50/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold font-display text-earth-900">Filters</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-earth-100 flex items-center justify-center text-earth-500 hover:text-earth-900 hover:bg-earth-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Category */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-earth-900 uppercase tracking-wider">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => {
                    const isActive = (cat === 'All' && !filters.category) || filters.category === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategory(cat.toLowerCase())}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm' 
                            : 'bg-white text-earth-600 border-earth-200 hover:border-primary-300 hover:bg-earth-50'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <hr className="border-earth-100" />

              {/* Radius */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-earth-900 uppercase tracking-wider">Distance Radius</h3>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                    {filters.radius} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={filters.radius}
                  onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                  className="w-full accent-primary-600 h-2 bg-earth-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-medium text-earth-400">
                  <span>5km</span>
                  <span>100km</span>
                </div>
              </div>

              <hr className="border-earth-100" />

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-earth-900 uppercase tracking-wider">Price Range (₹)</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-earth-500 mb-1 block">Min</label>
                    <input 
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      className="input-field py-2"
                    />
                  </div>
                  <div className="text-earth-300 mt-5">-</div>
                  <div className="flex-1">
                    <label className="text-xs text-earth-500 mb-1 block">Max</label>
                    <input 
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="input-field py-2"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-earth-100" />

              {/* Organic Only */}
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-earth-900">Organic Produce Only</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={filters.isOrganic}
                    onChange={(e) => setFilters(prev => ({ ...prev, isOrganic: e.target.checked }))}
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${filters.isOrganic ? 'bg-primary-600' : 'bg-earth-200 group-hover:bg-earth-300'}`}>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.isOrganic ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </label>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-earth-100 bg-earth-50/50 flex gap-3">
              <button 
                onClick={() => {
                  onReset();
                  onClose();
                }} 
                className="btn-secondary flex-1"
              >
                Clear All
              </button>
              <button onClick={handleApply} className="btn-primary flex-1">
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
