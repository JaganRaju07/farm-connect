// frontend/src/context/LocationContext.tsx

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationState } from '@/types';

/**
 * Location Context for Global Access
 * 
 * WHY USE CONTEXT FOR LOCATION?
 * ----------------------------
 * Many components need the user's location:
 * - Marketplace (filter products by distance)
 * - Checkout (include delivery coordinates)
 * - Product cards (show distance to farmer)
 * 
 * Without context, we'd need to:
 * 1. Call useGeolocation() in each component (duplicated API calls)
 * 2. Pass location as props through many levels ("prop drilling")
 * 
 * With context:
 * 1. Location is fetched once at app level
 * 2. Any component can access it with useLocation()
 * 3. Consistent data across the entire app
 */

interface LocationContextType extends LocationState {
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    refreshLocation,
  } = useGeolocation();

  return (
    <LocationContext.Provider
      value={{
        latitude,
        longitude,
        accuracy,
        loading,
        error,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Custom hook to access location context
 * Throws error if used outside LocationProvider (catches bugs early)
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
