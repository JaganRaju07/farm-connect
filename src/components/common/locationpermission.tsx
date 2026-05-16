'use client';

import React from 'react';
import { MapPin, AlertCircle, RefreshCw, Navigation } from 'lucide-react';
import { useLocation } from '@/context/locationcontext';

interface LocationPermissionProps {
  children: React.ReactNode;
}

export default function LocationPermission({ children }: LocationPermissionProps) {
  const location = useLocation();

  // 🔒 Safety guard (prevents destructuring undefined)
  if (!location) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        Location context not available
      </div>
    );
  }

  const { latitude, longitude, loading, error, refreshLocation } = location;

  // ============ LOADING ============
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <MapPin className="w-16 h-16 text-green-600 animate-bounce" />
        <p className="mt-4 text-gray-600">Getting your location...</p>
      </div>
    );
  }

  // ============ ERROR ============
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-3" />
        <p className="text-gray-700 mb-4 text-center">{error}</p>

        <button
          onClick={refreshLocation}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // ============ SUCCESS ============
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return <>{children}</>;
  }

  // ============ FALLBACK ============
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
      Waiting for location...
    </div>
  );
}
