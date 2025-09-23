/**
 * Custom Hook for Dashboard State Management
 * Manages dashboard data fetching, loading states, and refresh functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/features/dashboard/lib';
import { DashboardData } from '@/features/dashboard/types/dashboard.types';

export const useDashboardState = () => {
  // State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardService.getDashboardData(
        { 
          id: 'dash_req', 
          type: 'getDashboardData' as const,
          data: null,
          metadata: { category: 'dashboard', module: 'dashboard-page', version: '1.0.0' },
          context: { environment: 'development' },
          timestamp: new Date()
        },
        {}
      );

      if (response.success && response.data) {
        setDashboardData(response.data);
        setLastUpdated(new Date());
      } else {
        setError(response.error?.message || 'Failed to fetch dashboard data.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Dashboard fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Initial data fetch and auto-refresh setup
  useEffect(() => {
    fetchData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    // State
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    handleRefresh,
    fetchData,
    
    // Setters (for advanced use cases)
    setDashboardData,
    setIsLoading,
    setError,
    setLastUpdated
  };
};
