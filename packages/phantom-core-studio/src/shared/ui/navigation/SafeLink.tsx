'use client';

/**
 * Safe Navigation Components
 * Addresses Control N.17: No Navigation Blocking Implementation
 */

import React, { MouseEvent } from 'react';
import Link from 'next/link';
import { useNavigationBlocker } from '../../hooks/useNavigationBlocker';

/**
 * Enhanced Link component that respects navigation blocking
 */
interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
  confirmMessage?: string;
  className?: string;
  replace?: boolean;
  onNavigationBlocked?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function SafeLink({
  href,
  children,
  hasUnsavedChanges = false,
  confirmMessage = 'You have unsaved changes. Are you sure you want to leave?',
  className,
  replace = false,
  onNavigationBlocked,
  ...props
}: SafeLinkProps) {
  const { navigateWithConfirmation } = useNavigationBlocker({
    hasUnsavedChanges,
    message: confirmMessage
  });

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    
    const success = await navigateWithConfirmation(href, { replace });
    
    if (!success && onNavigationBlocked) {
      onNavigationBlocked();
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Form wrapper that automatically detects unsaved changes
 */
interface FormWithNavigationGuardProps {
  children: React.ReactNode;
  initialValues: Record<string, unknown>;
  currentValues: Record<string, unknown>;
  confirmMessage?: string;
  className?: string;
}

export function FormWithNavigationGuard({
  children,
  initialValues,
  currentValues,
  confirmMessage = 'You have unsaved changes. Are you sure you want to leave?',
  className
}: FormWithNavigationGuardProps) {
  // Check if values have changed
  const hasUnsavedChanges = JSON.stringify(initialValues) !== JSON.stringify(currentValues);

  useNavigationBlocker({
    hasUnsavedChanges,
    message: confirmMessage
  });

  return (
    <form className={className}>
      {children}
      {hasUnsavedChanges && (
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          You have unsaved changes
        </div>
      )}
    </form>
  );
}