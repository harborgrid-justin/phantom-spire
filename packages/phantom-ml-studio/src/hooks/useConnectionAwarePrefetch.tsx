'use client';

import { useState, useEffect } from 'react';

interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface ConnectionAwarePrefetchConfig {
  shouldPrefetch: boolean;
  reason: string;
  connectionType?: string;
}

/**
 * Hook to determine if prefetching should be enabled based on network conditions
 * Follows Web Performance best practices for connection-aware loading
 */
export function useConnectionAwarePrefetch(): ConnectionAwarePrefetchConfig {
  const [config, setConfig] = useState<ConnectionAwarePrefetchConfig>({
    shouldPrefetch: true, // Default to true for non-supporting browsers
    reason: 'Default prefetch enabled',
  });

  useEffect(() => {
    // Check if Network Information API is available
    if (!('connection' in navigator)) {
      setConfig({
        shouldPrefetch: true,
        reason: 'Network Information API not supported, defaulting to prefetch enabled',
      });
      return;
    }

    const connection = (navigator as any).connection as ConnectionInfo;
    if (!connection) {
      setConfig({
        shouldPrefetch: true,
        reason: 'Connection information not available, defaulting to prefetch enabled',
      });
      return;
    }

    const updatePrefetchConfig = () => {
      const { effectiveType, downlink, saveData } = connection;

      // Respect user's data saver preference
      if (saveData) {
        setConfig({
          shouldPrefetch: false,
          reason: 'Data saver mode enabled',
          connectionType: effectiveType,
        });
        return;
      }

      // Disable prefetching on very slow connections
      if (effectiveType === 'slow-2g') {
        setConfig({
          shouldPrefetch: false,
          reason: 'Very slow connection detected (slow-2g)',
          connectionType: effectiveType,
        });
        return;
      }

      // Conservative prefetching on 2G
      if (effectiveType === '2g') {
        setConfig({
          shouldPrefetch: false,
          reason: 'Slow connection detected (2g)',
          connectionType: effectiveType,
        });
        return;
      }

      // Check downlink speed (if available)
      if (downlink !== undefined && downlink < 0.5) {
        setConfig({
          shouldPrefetch: false,
          reason: `Low bandwidth detected (${downlink} Mbps)`,
          connectionType: effectiveType,
        });
        return;
      }

      // Enable prefetching for faster connections
      setConfig({
        shouldPrefetch: true,
        reason: `Good connection detected (${effectiveType || 'unknown'})`,
        connectionType: effectiveType,
      });
    };

    // Initial check
    updatePrefetchConfig();

    // Listen for connection changes
    const handleConnectionChange = () => {
      updatePrefetchConfig();
    };

    connection.addEventListener?.('change', handleConnectionChange);

    return () => {
      connection.removeEventListener?.('change', handleConnectionChange);
    };
  }, []);

  return config;
}

/**
 * Higher-order component that wraps components with connection-aware prefetching
 */
export function withConnectionAwarePrefetch<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  return function ConnectionAwareComponent(props: T) {
    const { shouldPrefetch, reason } = useConnectionAwarePrefetch();

    // Add prefetch configuration to props if it's a Link-like component
    const enhancedProps = {
      ...props,
      prefetch: shouldPrefetch,
      'data-prefetch-reason': reason,
    } as T;

    return <Component {...enhancedProps} />;
  };
}

/**
 * Utility function to check if prefetching should be enabled
 * Can be used in components that need to make manual prefetch decisions
 */
export function shouldEnablePrefetch(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!('connection' in navigator)) {
      resolve(true); // Default to enabled
      return;
    }

    const connection = (navigator as any).connection as ConnectionInfo;
    if (!connection) {
      resolve(true);
      return;
    }

    const { effectiveType, downlink, saveData } = connection;

    // Respect data saver mode
    if (saveData) {
      resolve(false);
      return;
    }

    // Check connection speed
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      resolve(false);
      return;
    }

    if (downlink !== undefined && downlink < 0.5) {
      resolve(false);
      return;
    }

    resolve(true);
  });
}