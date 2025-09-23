/**
 * Custom Hook for Business Intelligence State Management
 * Manages BI data, loading states, and data fetching logic
 */

import { useState, useEffect, useCallback } from 'react';

// Types
export interface BusinessMetric {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export interface ROIDataPoint {
  month: string;
  roi: number;
  costs: number;
  revenue: number;
  savings: number;
}

export interface PerformanceDataPoint {
  model: string;
  accuracy: number;
  efficiency: number;
  cost: number;
}

export const useBusinessIntelligenceState = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [roiData, setRoiData] = useState<ROIDataPoint[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Data generation functions
  const generateROIData = useCallback((): ROIDataPoint[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: 12 }, (_, i) => ({
      month: months[i] || 'Unknown',
      roi: Math.random() * 40 + 10,
      costs: Math.random() * 50000 + 20000,
      revenue: Math.random() * 80000 + 40000,
      savings: Math.random() * 30000 + 10000
    }));
  }, []);

  const generatePerformanceData = useCallback((): PerformanceDataPoint[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      model: `Model ${i + 1}`,
      accuracy: Math.random() * 20 + 80,
      efficiency: Math.random() * 30 + 70,
      cost: Math.random() * 5000 + 1000
    }));
  }, []);

  // Data loading function
  const loadData = useCallback(async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setRoiData(generateROIData());
    setPerformanceData(generatePerformanceData());
    setLoading(false);
  }, [generateROIData, generatePerformanceData]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Tab change handler
  const handleTabChange = useCallback((newValue: number) => {
    setActiveTab(newValue);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    loading,
    activeTab,
    roiData,
    performanceData,
    refreshing,
    
    // Actions
    handleRefresh,
    handleTabChange,
    loadData,
    
    // Setters (for advanced use cases)
    setLoading,
    setActiveTab,
    setRoiData,
    setPerformanceData,
    setRefreshing
  };
};
