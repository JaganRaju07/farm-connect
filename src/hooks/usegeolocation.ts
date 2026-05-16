// frontend/src/hooks/useGeolocation.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationState, GeolocationOptions } from '@/types';

/**
 * Custom hook to access the user's GPS location using the browser's Geolocation API.
 * 
 * WHY A CUSTOM HOOK?
 * -----------------
 * Multiple components need location data (marketplace, checkout, etc.).
 * Instead of duplicating geolocation logic everywhere, we encapsulate it
 * in a reusable hook. Any component can call useGeolocation() and get
 * the same consistent behavior.
 * 
 * HOW THE GEOLOCATION API WORKS:
 * -----------------------------
 * 1. Browser checks if geolocation is supported
 * 2. Browser prompts user: "Allow Farm Connect to access your location?"
 * 3. If allowed, browser gets coordinates from:
 *    - GPS chip (phones/tablets) - most accurate (~5-10m)
 *    - WiFi positioning (laptops) - good accuracy (~50-100m)
 *    - IP-based fallback - least accurate (~1-5km)
 * 4. Returns latitude, longitude, and accuracy in meters
 * 
 * PRIVACY NOTE:
 * Users must explicitly allow location access. The browser remembers
 * this permission per domain, so they won't be asked repeatedly.
 * 
 * @param options - Configuration for accuracy, timeout, and caching
 * @returns Location state and control functions
 */

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,  // Prefer GPS over WiFi (more accurate but slower)
  timeout: 10000,            // Give up after 10 seconds
  maximumAge: 300000,        // Accept cached position up to 5 minutes old
};

export function useGeolocation(options: GeolocationOptions = defaultOptions) {
  // State to track location data and loading/error states
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  // Ref to store the watch ID for continuous tracking (if needed)
  const watchIdRef = useRef<number | null>(null);
  
  // Ref to store merged options (prevents unnecessary re-renders)
  const optionsRef = useRef({ ...defaultOptions, ...options });

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = { ...defaultOptions, ...options };
  }, [options]);

  /**
   * Success callback when position is retrieved
   * Called by the Geolocation API when coordinates are available
   */
  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      loading: false,
      error: null,
    });
  }, []);

  /**
   * Error callback when position retrieval fails
   * Provides user-friendly error messages for different failure scenarios
   */
  const onError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Failed to get location';

    // Translate error codes to user-friendly messages
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable. Please check that your GPS is enabled.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out. Please try again.';
        break;
    }

    setState((prev) => ({
      ...prev,
      loading: false,
      error: errorMessage,
    }));
  }, []);

  /**
   * Get current position once
   * Used for initial location fetch and manual refresh
   */
  const getCurrentPosition = useCallback(() => {
    // Check browser support first
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser. Please use a modern browser.',
      }));
      return;
    }

    // Set loading state
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Request current position from browser
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      optionsRef.current
    );
  }, [onSuccess, onError]);

  /**
   * Start watching position for continuous updates
   * Useful for delivery tracking or navigation features
   */
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      onError({
        code: 2,
        message: 'Geolocation is not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      optionsRef.current
    );
  }, [onSuccess, onError]);

  /**
   * Stop watching position
   * Important for cleanup to prevent memory leaks
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Refresh location manually
   * Clears any errors and fetches fresh position
   */
  const refreshLocation = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Fetch location on component mount
  useEffect(() => {
    getCurrentPosition();

    // Cleanup: stop watching on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []); // Empty array = run once on mount

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    refreshLocation,
  };
}
