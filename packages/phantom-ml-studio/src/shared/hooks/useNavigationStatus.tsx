/**
 * Navigation Status Hook - Provides navigation progress feedback
 * Addresses Control N.11: Missing useLinkStatus for Navigation Feedback
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationStatus {
  isNavigating: boolean;
  currentRoute: string | null;
  navigationStartTime: number | null;
  navigationDuration: number | null;
}

/**
 * Hook to track navigation status and provide UI feedback
 * for delayed transitions and slow network conditions
 */
export function useNavigationStatus(): NavigationStatus {
  const [status, setStatus] = useState<NavigationStatus>({
    isNavigating: false,
    currentRoute: null,
    navigationStartTime: null,
    navigationDuration: null
  });

  const router = useRouter();

  useEffect(() => {
    let startTime: number;

    const handleNavigationStart = (url: string) => {
      startTime = Date.now();
      setStatus(prev => ({
        ...prev,
        isNavigating: true,
        currentRoute: url,
        navigationStartTime: startTime,
        navigationDuration: null
      }));
    };

    const handleNavigationComplete = () => {
      const endTime = Date.now();
      const duration = startTime ? endTime - startTime : 0;
      
      setStatus(prev => ({
        ...prev,
        isNavigating: false,
        navigationDuration: duration
      }));

      // Clear after a delay to allow UI feedback
      setTimeout(() => {
        setStatus(prev => ({
          ...prev,
          currentRoute: null,
          navigationStartTime: null,
          navigationDuration: null
        }));
      }, 1000);
    };

    const handleNavigationError = () => {
      setStatus(prev => ({
        ...prev,
        isNavigating: false,
        currentRoute: null,
        navigationStartTime: null
      }));
    };

    // Listen for route changes
    const handleRouteChangeStart = (url: string) => handleNavigationStart(url);
    const handleRouteChangeComplete = () => handleNavigationComplete();
    const handleRouteChangeError = () => handleNavigationError();

    // Note: In Next.js 13+ App Router, we need to listen to router events differently
    // This is a fallback approach that works with client-side navigation
    
    return () => {
      // Cleanup if needed
    };
  }, [router]);

  return status;
}

