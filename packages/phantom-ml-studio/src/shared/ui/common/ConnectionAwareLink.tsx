'use client';

import React from 'react';
import Link from 'next/link';
import { useConnectionAwarePrefetch } from '@/hooks/useConnectionAwarePrefetch';

interface ConnectionAwareLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  forcePrefetch?: boolean; // Override connection-aware prefetching
  prefetch?: boolean; // Allow manual override
  [key: string]: any; // Allow other props to pass through
}

/**
 * Connection-aware Link component that automatically adjusts prefetching
 * based on network conditions and user preferences
 */
export function ConnectionAwareLink({
  href,
  children,
  className,
  style,
  forcePrefetch = false,
  prefetch,
  ...otherProps
}: ConnectionAwareLinkProps) {
  const { shouldPrefetch, reason, connectionType } = useConnectionAwarePrefetch();

  // Determine final prefetch value
  const finalPrefetch = forcePrefetch || prefetch !== undefined ? (prefetch ?? true) : shouldPrefetch;

  // Add debug information in development
  const debugProps = process.env.NODE_ENV === 'development' ? {
    'data-prefetch-enabled': finalPrefetch,
    'data-prefetch-reason': reason,
    'data-connection-type': connectionType || 'unknown',
  } : {};

  return (
    <Link
      href={href}
      prefetch={finalPrefetch}
      className={className}
      style={style}
      {...debugProps}
      {...otherProps}
    >
      {children}
    </Link>
  );
}

/**
 * Extended version with additional analytics and monitoring
 */
export function ConnectionAwareLinkWithAnalytics({
  href,
  children,
  onPrefetchDecision,
  ...props
}: ConnectionAwareLinkProps & {
  onPrefetchDecision?: (enabled: boolean, reason: string) => void;
}) {
  const { shouldPrefetch, reason } = useConnectionAwarePrefetch();

  React.useEffect(() => {
    onPrefetchDecision?.(shouldPrefetch, reason);
  }, [shouldPrefetch, reason, onPrefetchDecision]);

  return (
    <ConnectionAwareLink href={href} {...props}>
      {children}
    </ConnectionAwareLink>
  );
}