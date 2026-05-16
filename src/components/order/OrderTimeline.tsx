// frontend/src/components/order/OrderTimeline.tsx

import { Check, Clock, Package, Truck, Home, BadgeCheck } from 'lucide-react';

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

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="relative">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const done = idx <= currentIdx;
        const current = idx === currentIdx;

        return (
          <div key={step.key} className="flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute left-5 w-0.5 h-6 mt-10 ${
                  idx < currentIdx ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                style={{ top: `${idx * 64 + 40}px` }}
              />
            )}

            {/* Icon */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${done ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}
                ${current ? 'ring-4 ring-primary-200' : ''}
              `}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className={`font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-sm text-gray-500 mt-0.5">{formatTime(step.timestamp)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
