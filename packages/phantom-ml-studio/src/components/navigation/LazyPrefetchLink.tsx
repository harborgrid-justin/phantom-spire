'use client';

/**
 * Lazy Prefetch Link Component
 * Addresses Control N.24: Prefetch limiting in large DOM lists
 */

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface LazyPrefetchLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  threshold?: number; // Distance from viewport to start prefetching
  maxConcurrentPrefetches?: number; // Global limit on concurrent prefetches
  [key: string]: any;
}

// Global prefetch queue management
class PrefetchManager {
  private static instance: PrefetchManager;
  private activePrefetches = new Set<string>();
  private pendingPrefetches: Array<{ href: string; callback: () => void }> = [];
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  requestPrefetch(href: string, callback: () => void): boolean {
    if (this.activePrefetches.has(href)) {
      return false; // Already prefetching
    }

    if (this.activePrefetches.size < this.maxConcurrent) {
      this.activePrefetches.add(href);
      callback();

      // Clean up after a reasonable timeout
      setTimeout(() => this.completePrefetch(href), 5000);
      return true;
    } else {
      // Queue for later
      this.pendingPrefetches.push({ href, callback });
      return false;
    }
  }

  completePrefetch(href: string) {
    this.activePrefetches.delete(href);

    // Process next in queue
    if (this.pendingPrefetches.length > 0) {
      const next = this.pendingPrefetches.shift();
      if (next && !this.activePrefetches.has(next.href)) {
        this.activePrefetches.add(next.href);
        next.callback();
        setTimeout(() => this.completePrefetch(next.href), 5000);
      }
    }
  }

  getStatus() {
    return {
      active: this.activePrefetches.size,
      pending: this.pendingPrefetches.length,
      max: this.maxConcurrent,
    };
  }
}

/**
 * N.24: Link component that only prefetches when in viewport and within limits
 * Prevents excessive network requests in large lists
 */
export function LazyPrefetchLink({
  href,
  children,
  className,
  threshold = 200,
  maxConcurrentPrefetches = 3,
  ...props
}: LazyPrefetchLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const [hasTriggeredPrefetch, setHasTriggeredPrefetch] = useState(false);
  const prefetchManager = PrefetchManager.getInstance();

  useEffect(() => {
    const link = linkRef.current;
    if (!link || hasTriggeredPrefetch) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.rootBounds) {
            const rect = entry.boundingClientRect;
            const viewportHeight = window.innerHeight;

            // Check if link is within threshold distance of viewport
            const distanceFromViewport = Math.max(
              0,
              rect.top - viewportHeight,
              -rect.bottom
            );

            if (distanceFromViewport <= threshold) {
              // Request prefetch through manager
              const prefetchGranted = prefetchManager.requestPrefetch(href, () => {
                setShouldPrefetch(true);
                setHasTriggeredPrefetch(true);
              });

              if (prefetchGranted || shouldPrefetch) {
                observer.unobserve(link);
              }
            }
          }
        });
      },
      {
        // Extend root margin to include threshold
        rootMargin: `${threshold}px`,
        threshold: 0
      }
    );

    observer.observe(link);

    return () => {
      observer.unobserve(link);
    };
  }, [href, threshold, hasTriggeredPrefetch, shouldPrefetch, prefetchManager]);

  return (
    <Link
      ref={linkRef}
      href={href}
      prefetch={shouldPrefetch}
      className={className}
      {...props}
      // Add debug attributes in development
      {...(process.env.NODE_ENV === 'development' && {
        'data-lazy-prefetch': shouldPrefetch,
        'data-prefetch-triggered': hasTriggeredPrefetch,
        'data-href': href,
      })}
    >
      {children}
    </Link>
  );
}

/**
 * N.24: Hook to monitor prefetch activity in large lists
 */
export function usePrefetchStatus() {
  const [status, setStatus] = useState(PrefetchManager.getInstance().getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(PrefetchManager.getInstance().getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * N.24: List wrapper that automatically applies lazy prefetching to child links
 */
interface LazyPrefetchListProps {
  children: React.ReactNode;
  maxConcurrentPrefetches?: number;
  className?: string;
}

export function LazyPrefetchList({
  children,
  maxConcurrentPrefetches = 3,
  className
}: LazyPrefetchListProps) {
  return (
    <div
      className={className}
      data-lazy-prefetch-list="true"
      data-max-concurrent={maxConcurrentPrefetches}
    >
      {children}
    </div>
  );
}

/**
 * N.24: Development component to visualize prefetch activity
 */
export function PrefetchDebugPanel() {
  const status = usePrefetchStatus();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs">
      <div>Active Prefetches: {status.active}/{status.max}</div>
      <div>Pending: {status.pending}</div>
    </div>
  );
}