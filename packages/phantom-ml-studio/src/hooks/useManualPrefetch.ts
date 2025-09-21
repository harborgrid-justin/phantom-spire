'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import React from 'react';

/**
 * P.2: Manual prefetching service for off-screen or special UX routes
 * Only prefetches routes not in viewport or for specific user-triggered scenarios
 */
export function useManualPrefetch() {
  const router = useRouter();
  const prefetchedRoutes = useRef(new Set<string>());

  const prefetchRoute = useCallback((href: string, reason?: string) => {
    // Avoid duplicate prefetching
    if (prefetchedRoutes.current.has(href)) {
      return Promise.resolve();
    }

    // Only prefetch valid internal routes
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return Promise.resolve();
    }

    console.log(`[Manual Prefetch] Prefetching ${href}${reason ? ` - ${reason}` : ''}`);

    prefetchedRoutes.current.add(href);

    try {
      router.prefetch(href);
      return Promise.resolve();
    } catch (error) {
      console.error(`[Manual Prefetch] Failed to prefetch ${href}:`, error);
      prefetchedRoutes.current.delete(href);
      return Promise.reject(error);
    }
  }, [router]);

  const prefetchCriticalOffScreen = useCallback(() => {
    // P.2: Prefetch critical routes that are not in viewport
    const criticalRoutes = [
      '/settings',
      '/deployments',
      '/experiments'
    ];

    return Promise.all(
      criticalRoutes.map(route =>
        prefetchRoute(route, 'Critical off-screen route')
      )
    );
  }, [prefetchRoute]);

  const prefetchOnUserIntent = useCallback((href: string) => {
    // P.2: Prefetch on specific user intent (hover, focus, etc.)
    return prefetchRoute(href, 'User intent detected');
  }, [prefetchRoute]);

  const clearPrefetchCache = useCallback(() => {
    prefetchedRoutes.current.clear();
  }, []);

  const isPrefetched = useCallback((href: string) => {
    return prefetchedRoutes.current.has(href);
  }, []);

  return {
    prefetchRoute,
    prefetchCriticalOffScreen,
    prefetchOnUserIntent,
    clearPrefetchCache,
    isPrefetched,
    prefetchedCount: prefetchedRoutes.current.size,
  };
}

/**
 * P.2: Higher-order component that adds manual prefetching capabilities
 */
export function withManualPrefetch<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  const ManualPrefetchComponent = (props: T): JSX.Element => {
    const prefetch = useManualPrefetch();

    const enhancedProps = {
      ...props,
      manualPrefetch: prefetch,
    } as T;

    return React.createElement(Component, enhancedProps);
  };

  return ManualPrefetchComponent;
}

/**
 * P.2: Utility to prefetch routes based on user behavior patterns
 */
export class PrefetchStrategy {
  private static instance: PrefetchStrategy;
  private prefetchQueue: Array<{ href: string; priority: number; reason: string }> = [];
  private isProcessing = false;

  static getInstance(): PrefetchStrategy {
    if (!PrefetchStrategy.instance) {
      PrefetchStrategy.instance = new PrefetchStrategy();
    }
    return PrefetchStrategy.instance;
  }

  addToPrefetchQueue(href: string, priority: number = 1, reason: string = 'Queued prefetch') {
    // Higher priority = processed first
    this.prefetchQueue.push({ href, priority, reason });
    this.prefetchQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isProcessing) {
      this.processPrefetchQueue();
    }
  }

  private async processPrefetchQueue() {
    if (this.prefetchQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const { href, reason } = this.prefetchQueue.shift()!;

    try {
      // Use native router prefetch
      if (typeof window !== 'undefined' && window.next?.router) {
        await window.next.router.prefetch(href);
        console.log(`[Prefetch Queue] Completed: ${href} - ${reason}`);
      }
    } catch (error) {
      console.error(`[Prefetch Queue] Failed: ${href}`, error);
    }

    // Process next item with delay to avoid overwhelming the browser
    setTimeout(() => this.processPrefetchQueue(), 100);
  }

  clearQueue() {
    this.prefetchQueue = [];
    this.isProcessing = false;
  }

  getQueueStatus() {
    return {
      remaining: this.prefetchQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}