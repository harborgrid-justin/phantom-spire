/**
 * Business Logic Client for Next.js Frontend
 * Connects frontend pages to backend business logic services
 */

import { useEffect, useState, useCallback } from 'react';

export interface BusinessLogicRequest {
  serviceId: string;
  operation: string;
  parameters?: any;
  options?: {
    timeout?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface BusinessLogicResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
    serviceVersion: string;
  };
}

export interface ServicePageState {
  loading: boolean;
  data: any;
  error: string | null;
  lastUpdate: Date | null;
  stats: any;
  connected: boolean;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

class BusinessLogicClient {
  private baseUrl = '/api/v1/platform/services';
  private wsConnections = new Map<string, WebSocket>();
  private listeners = new Map<string, Set<(data: any) => void>>();

  async executeBusinessLogic(request: BusinessLogicRequest): Promise<BusinessLogicResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${request.serviceId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: request.operation,
          parameters: request.parameters,
          options: request.options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          requestId: `req-${Date.now()}`,
          timestamp: new Date(),
          processingTime: 0,
          serviceVersion: '1.0.0'
        }
      };
    }
  }

  async getServiceStats(serviceId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${serviceId}/stats`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  subscribeToRealTimeUpdates(serviceId: string, callback: (data: any) => void): () => void {
    // Add listener
    if (!this.listeners.has(serviceId)) {
      this.listeners.set(serviceId, new Set());
    }
    this.listeners.get(serviceId)!.add(callback);

    // Create WebSocket connection if it doesn't exist
    if (!this.wsConnections.has(serviceId)) {
      this.createWebSocketConnection(serviceId);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.get(serviceId)?.delete(callback);
      if (this.listeners.get(serviceId)?.size === 0) {
        this.wsConnections.get(serviceId)?.close();
        this.wsConnections.delete(serviceId);
        this.listeners.delete(serviceId);
      }
    };
  }

  private createWebSocketConnection(serviceId: string) {
    const wsUrl = `ws://localhost:3000/api/v1/platform/services/${serviceId}/realtime`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const listeners = this.listeners.get(serviceId);
        if (listeners) {
          listeners.forEach(callback => callback(data));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${serviceId}:`, error);
    };

    this.wsConnections.set(serviceId, ws);
  }
}

const businessLogicClient = new BusinessLogicClient();

// React hook for service page integration
export function useServicePage(serviceId: string): ServicePageState & {
  execute: (operation: string, parameters?: any) => Promise<BusinessLogicResponse>;
  refresh: () => Promise<void>;
  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  removeNotification: (id: string) => void;
} {
  const [state, setState] = useState<ServicePageState>({
    loading: true,
    data: null,
    error: null,
    lastUpdate: null,
    stats: null,
    connected: false,
    notifications: []
  });

  const execute = useCallback(async (operation: string, parameters?: any) => {
    setState(prev => ({ ...prev, loading: true }));
    
    const response = await businessLogicClient.executeBusinessLogic({
      serviceId,
      operation,
      parameters
    });

    setState(prev => ({
      ...prev,
      loading: false,
      data: response.success ? response.data : prev.data,
      error: response.success ? null : response.error || 'Operation failed',
      lastUpdate: new Date()
    }));

    return response;
  }, [serviceId]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const stats = await businessLogicClient.getServiceStats(serviceId);
      setState(prev => ({
        ...prev,
        loading: false,
        stats,
        lastUpdate: new Date(),
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data'
      }));
    }
  }, [serviceId]);

  const addNotification = useCallback((type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications.slice(0, 9)]
    }));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  // Initialize service data on mount
  useEffect(() => {
    refresh();

    // Subscribe to real-time updates
    const unsubscribe = businessLogicClient.subscribeToRealTimeUpdates(
      serviceId,
      (data) => {
        setState(prev => ({
          ...prev,
          data,
          lastUpdate: new Date(),
          connected: true
        }));
      }
    );

    return unsubscribe;
  }, [serviceId, refresh]);

  // Auto-cleanup old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(
          n => Date.now() - n.timestamp.getTime() < 300000 // 5 minutes
        )
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    execute,
    refresh,
    addNotification,
    removeNotification
  };
}

export default businessLogicClient;