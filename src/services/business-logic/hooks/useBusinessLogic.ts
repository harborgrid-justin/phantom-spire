/**
 * React hooks for business logic integration
 * Provides easy-to-use hooks for all service pages
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { businessLogicManager, BusinessLogicRequest, BusinessLogicResponse } from '../core/BusinessLogicManager';
import { realTimeDataService } from '../core/RealTimeDataService';

export interface UseBusinessLogicOptions {
  serviceId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  cacheResults?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (response: BusinessLogicResponse) => void;
}

export interface BusinessLogicState {
  loading: boolean;
  data: any;
  error: string | null;
  lastUpdate: Date | null;
  stats: any;
}

/**
 * Hook for business logic operations
 */
export function useBusinessLogic(options: UseBusinessLogicOptions) {
  const [state, setState] = useState<BusinessLogicState>({
    loading: false,
    data: null,
    error: null,
    lastUpdate: null,
    stats: null
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  /**
   * Execute a business logic operation
   */
  const execute = useCallback(async (operation: string, payload?: any, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const request: BusinessLogicRequest = {
        id: uuidv4(),
        serviceId: options.serviceId,
        operation,
        payload: payload || {},
        timestamp: new Date(),
        priority
      };

      const response = await businessLogicManager.processRequest(request);

      if (response.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          data: response.data,
          error: null,
          lastUpdate: response.timestamp
        }));

        optionsRef.current.onSuccess?.(response);
      } else {
        const error = new Error(response.error || 'Operation failed');
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));

        optionsRef.current.onError?.(error);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      const err = error instanceof Error ? error : new Error(errorMessage);
      optionsRef.current.onError?.(err);
      throw err;
    }
  }, [options.serviceId]);

  /**
   * Refresh service statistics
   */
  const refreshStats = useCallback(async () => {
    try {
      const stats = businessLogicManager.getServiceStats(options.serviceId);
      setState(prev => ({ ...prev, stats }));
      return stats;
    } catch (error) {
      console.error('Error refreshing stats:', error);
      return null;
    }
  }, [options.serviceId]);

  // Auto-refresh stats
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(() => {
        refreshStats();
      }, options.refreshInterval || 30000);

      // Initial refresh
      refreshStats();

      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refreshStats]);

  // Initial stats load
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    ...state,
    execute,
    refreshStats,
    isLoading: state.loading
  };
}

export interface UseRealTimeDataOptions {
  serviceId: string;
  enabled?: boolean;
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface RealTimeDataState {
  connected: boolean;
  data: any;
  lastUpdate: Date | null;
  error: string | null;
  metrics: any;
}

/**
 * Hook for real-time data subscriptions
 */
export function useRealTimeData(options: UseRealTimeDataOptions) {
  const [state, setState] = useState<RealTimeDataState>({
    connected: false,
    data: null,
    lastUpdate: null,
    error: null,
    metrics: null
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Handle subscription
  useEffect(() => {
    if (!options.enabled || options.enabled === false) {
      return;
    }

    console.log(`📡 Subscribing to real-time data for ${options.serviceId}`);

    const unsubscribe = realTimeDataService.subscribe(
      options.serviceId,
      (data) => {
        setState(prev => ({
          ...prev,
          connected: true,
          data,
          lastUpdate: new Date(),
          error: null
        }));

        optionsRef.current.onData?.(data);
      }
    );

    unsubscribeRef.current = unsubscribe;
    setState(prev => ({ ...prev, connected: true, error: null }));

    return () => {
      console.log(`📡 Unsubscribing from real-time data for ${options.serviceId}`);
      unsubscribe();
      unsubscribeRef.current = null;
      setState(prev => ({ ...prev, connected: false }));
    };
  }, [options.serviceId, options.enabled]);

  // Get metrics
  const refreshMetrics = useCallback(async () => {
    try {
      const metrics = realTimeDataService.getMetrics(options.serviceId);
      setState(prev => ({ ...prev, metrics }));
      return metrics;
    } catch (error) {
      console.error('Error refreshing real-time metrics:', error);
      return null;
    }
  }, [options.serviceId]);

  // Trigger manual update
  const triggerUpdate = useCallback(async () => {
    try {
      await realTimeDataService.triggerUpdate(options.serviceId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      const err = error instanceof Error ? error : new Error(errorMessage);
      optionsRef.current.onError?.(err);
    }
  }, [options.serviceId]);

  // Refresh metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, 60000); // Every minute

    // Initial refresh
    refreshMetrics();

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    ...state,
    triggerUpdate,
    refreshMetrics,
    isConnected: state.connected
  };
}

/**
 * Combined hook for full service page functionality
 */
export function useServicePage(serviceId: string) {
  const businessLogic = useBusinessLogic({
    serviceId,
    autoRefresh: true,
    refreshInterval: 30000
  });

  const realTimeData = useRealTimeData({
    serviceId,
    enabled: true
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>>([]);

  // Add notification
  const addNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const notification = {
      id: uuidv4(),
      type,
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only last 10
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Enhanced execute with notifications
  const executeWithNotification = useCallback(async (
    operation: string, 
    payload?: any, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    try {
      addNotification('info', `Executing ${operation}...`);
      const result = await businessLogic.execute(operation, payload, priority);
      
      if (result.success) {
        addNotification('success', `${operation} completed successfully`);
      } else {
        addNotification('error', `${operation} failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addNotification('error', `${operation} failed: ${message}`);
      throw error;
    }
  }, [businessLogic.execute, addNotification]);

  // Auto-remove old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes ago
      setNotifications(prev => 
        prev.filter(n => n.timestamp.getTime() > cutoff)
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    // Business logic state and methods
    businessLogic: {
      ...businessLogic,
      execute: executeWithNotification
    },
    
    // Real-time data state and methods
    realTimeData,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    
    // Combined status
    isFullyLoaded: !businessLogic.loading && realTimeData.connected,
    hasErrors: !!(businessLogic.error || realTimeData.error),
    
    // Utility methods
    refresh: async () => {
      await Promise.all([
        businessLogic.refreshStats(),
        realTimeData.refreshMetrics(),
        realTimeData.triggerUpdate()
      ]);
    }
  };
}

/**
 * Hook for form validation with business rules
 */
export function useFormValidation(serviceId: string, formId: string) {
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: {} as Record<string, string[]>,
    warnings: {} as Record<string, string[]>,
    isValidating: false
  });

  const validate = useCallback(async (formData: Record<string, any>) => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const request: BusinessLogicRequest = {
        id: uuidv4(),
        serviceId,
        operation: 'validate-form',
        payload: { formId, formData },
        timestamp: new Date(),
        priority: 'medium'
      };

      const response = await businessLogicManager.processRequest(request);

      if (response.success) {
        setValidationState({
          isValid: response.data.isValid,
          errors: response.data.errors || {},
          warnings: response.data.warnings || {},
          isValidating: false
        });
      } else {
        setValidationState({
          isValid: false,
          errors: { general: [response.error || 'Validation failed'] },
          warnings: {},
          isValidating: false
        });
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error';
      setValidationState({
        isValid: false,
        errors: { general: [errorMessage] },
        warnings: {},
        isValidating: false
      });
      throw error;
    }
  }, [serviceId, formId]);

  const clearValidation = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: {},
      warnings: {},
      isValidating: false
    });
  }, []);

  return {
    ...validationState,
    validate,
    clearValidation
  };
}