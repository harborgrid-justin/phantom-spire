/**
 * Custom Hook for Deployments State Management
 * Manages deployments data, loading states, and deployment operations
 */

import { useState, useEffect, useCallback } from 'react';
import { deploymentsService } from '@/features/deployments/lib';
import { Deployment } from '@/features/deployments/lib';
import { ServiceContext } from '@/lib/core-logic/types/service.types';

export const useDeploymentsState = () => {
  // State
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Create service context
  const createServiceContext = useCallback((): ServiceContext => ({
    requestId: `req-${Date.now()}-${Math.random()}`,
    startTime: new Date(),
    timeout: 10000,
    permissions: [],
    metadata: {},
    trace: {
      traceId: `trace-${Date.now()}`,
      spanId: `span-${Date.now()}`,
      sampled: true,
      baggage: {},
    }
  }), []);

  // Fetch deployments function
  const fetchDeployments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const context = createServiceContext();
      const response = await deploymentsService.getDeployments(
        { id: 'get_deps_req', type: 'getDeployments' as const },
        context
      );

      if (response.success && response.data) {
        setDeployments(response.data.deployments);
        setLastUpdated(new Date());
      } else {
        setError(response.error?.message || 'Failed to fetch deployments.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Deployments fetch error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [createServiceContext]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    fetchDeployments(true);
  }, [fetchDeployments]);

  const handleErrorDismiss = useCallback(() => {
    setError(null);
  }, []);

  // Load deployments on mount and set up auto-refresh
  useEffect(() => {
    fetchDeployments();

    // Auto-refresh every 30 seconds for deployment status
    const interval = setInterval(() => fetchDeployments(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDeployments]);

  // Calculate deployment statistics
  const stats = deployments.reduce(
    (acc, deployment) => {
      acc.total++;
      if (acc[deployment.status] !== undefined) {
        acc[deployment.status]++;
      } else {
        acc[deployment.status] = 1;
      }
      return acc;
    },
    { total: 0, active: 0, inactive: 0, error: 0, deploying: 0 } as { total: number; active: number; inactive: number; error: number; deploying: number; [key: string]: number }
  );

  return {
    // State
    deployments,
    isLoading,
    refreshing,
    error,
    lastUpdated,
    stats,
    
    // Actions
    handleRefresh,
    handleErrorDismiss,
    fetchDeployments,
    
    // Setters (for advanced use cases)
    setDeployments,
    setIsLoading,
    setRefreshing,
    setError,
    setLastUpdated
  };
};
