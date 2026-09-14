// frontend/src/components/order/OrderTimeline.tsx
import { Check, Clock, Package, Truck, Home, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineStep {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp: string | null;
}

interface OrderTimelineProps {
  status: string;
  timestamps: {
    created_at: string;
    confirmed_at: string | null;
    packed_at: string | null;
    out_for_delivery_at: string | null;
    delivered_at: string | null;
    completed_at: string | null;
  };
}

export default function OrderTimeline({ status, timestamps }: OrderTimelineProps) {
  const steps: TimelineStep[] = [
    { key: 'pending', label: 'Order Placed', icon: Clock, timestamp: timestamps.created_at },
    { key: 'confirmed', label: 'Confirmed', icon: Check, timestamp: timestamps.confirmed_at },
    { key: 'packed', label: 'Packed', icon: Package, timestamp: timestamps.packed_at },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, timestamp: timestamps.out_for_delivery_at },
    { key: 'delivered', label: 'Delivered', icon: Home, timestamp: timestamps.delivered_at },
    { key: 'completed', label: 'Completed', icon: BadgeCheck, timestamp: timestamps.completed_at },
  ];

  const currentIdx = steps.findIndex(s => s.key === status);
  // Default to cancelled if not found (though cancelled usually isn't in this list)
  const isCancelled = status === 'cancelled';
  const effectiveIdx = isCancelled ? 0 : (currentIdx === -1 ? steps.length : currentIdx);

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="relative pt-4 pb-4">
      <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-earth-200" />
      
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const done = !isCancelled && idx <= effectiveIdx;
        const current = !isCancelled && idx === effectiveIdx;
        const isPast = !isCancelled && idx < effectiveIdx;

        return (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={step.key} 
            className="relative flex gap-6 pb-10 last:pb-0"
          >
            {/* Animated Progress Line */}
            {isPast && idx < steps.length - 1 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="absolute left-[31px] top-12 w-0.5 bg-primary-600 origin-top z-0"
              />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500
                ${done ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'bg-earth-100 text-earth-400 border-2 border-earth-200'}
                ${current ? 'ring-8 ring-primary-100 scale-110' : ''}
                ${isCancelled && idx === 0 ? 'bg-red-600 text-white ring-8 ring-red-100' : ''}
              `}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Text */}
            <div className={`flex-1 pt-3 transition-opacity duration-500 ${done || (isCancelled && idx===0) ? 'opacity-100' : 'opacity-40'}`}>
              <p className={`text-lg font-bold ${done || (isCancelled && idx===0) ? 'text-earth-900' : 'text-earth-500'}`}>
                {isCancelled && idx === 0 ? 'Order Cancelled' : step.label}
              </p>
              {step.timestamp && (
                <p className="text-sm font-medium text-earth-500 mt-1">{formatTime(step.timestamp)}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
