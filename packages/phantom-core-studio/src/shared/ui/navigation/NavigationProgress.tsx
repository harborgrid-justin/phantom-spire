'use client';

/**
 * Navigation Progress Components
 * Addresses Control N.11: Missing useLinkStatus for Navigation Feedback
 */

import React from 'react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useNavigationStatus } from '../../hooks/useNavigationStatus';

/**
 * Navigation Progress Component
 * Shows progress indicator during navigation
 */
export function NavigationProgress() {
  const { isNavigating, navigationDuration } = useNavigationStatus();

  if (!isNavigating && !navigationDuration) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-blue-500 h-1 transition-all duration-200"
      style={{
        transform: isNavigating ? 'scaleX(0.7)' : 'scaleX(1)',
        transformOrigin: 'left',
        opacity: isNavigating || navigationDuration ? 1 : 0
      }}
      role="progressbar"
      aria-label="Navigation in progress"
      aria-hidden={!isNavigating}
    />
  );
}

/**
 * Enhanced Link component with navigation status feedback
 */
interface LinkWithStatusProps {
  href: string;
  children: ReactNode;
  className?: string;
  showProgress?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function LinkWithStatus({ 
  href, 
  children, 
  className = '', 
  showProgress = true,
  ...props 
}: LinkWithStatusProps) {
  const { isNavigating, currentRoute } = useNavigationStatus();
  const isThisLinkNavigating = isNavigating && currentRoute === href;

  return (
    <Link
      href={href}
      className={`${className} ${isThisLinkNavigating ? 'opacity-75 cursor-wait' : ''}`}
      {...props}
    >
      <span className="relative">
        {children}
        {showProgress && isThisLinkNavigating && (
          <span 
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"
            aria-hidden="true"
          />
        )}
      </span>
    </Link>
  );
}