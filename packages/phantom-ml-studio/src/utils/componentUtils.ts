import { ComponentType, LazyExoticComponent } from 'react';

// Type definitions
interface LazyComponentProps {
  [key: string]: unknown;
}

interface LazyLoadingOptions {
  loadingMessage?: string;
  errorMessage?: string;
  retryButton?: boolean;
}

// Preload components for better user experience
export const preloadComponent = (
  importFn: () => Promise<{ default: ComponentType<LazyComponentProps> }>
) => {
  return importFn();
};

// Component preloading utility
export const preloadCriticalComponents = async () => {
  try {
    // Preload dashboard and model builder as they're likely to be accessed first
    const criticalComponents = [
      () => import('../pages/Dashboard/Dashboard'),
      () => import('../pages/ModelBuilder/ModelBuilder'),
    ];
    
    await Promise.all(criticalComponents.map(preloadComponent));
  } catch (error) {
    console.warn('Failed to preload some critical components:', error);
  }
};

// Preload advanced features on user interaction
export const preloadAdvancedFeatures = async () => {
  try {
    const advancedComponents = [
      () => import('../pages/AutoMLPipelineVisualizer'),
      () => import('../pages/BiasDetectionEngine'),
      () => import('../pages/ExplainableAIVisualizer'),
      () => import('../pages/RealTimeMonitoring'),
    ];
    
    await Promise.all(advancedComponents.map(preloadComponent));
  } catch (error) {
    console.warn('Failed to preload some advanced features:', error);
  }
};

// Resource priority loading for performance optimization
export const scheduleComponentPreload = (
  importFn: () => Promise<{ default: ComponentType<LazyComponentProps> }>,
  priority: 'high' | 'low' = 'low'
) => {
  if (priority === 'high') {
    // Use requestIdleCallback for low priority, immediate for high priority
    preloadComponent(importFn);
  } else {
    // Schedule for when browser is idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => preloadComponent(importFn));
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => preloadComponent(importFn), 100);
    }
  }
};