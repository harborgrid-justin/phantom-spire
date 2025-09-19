'use client';

/**
 * Enhanced Link Components
 * Addresses Controls N.14 (Scroll Behavior) and N.15 (Replace Prop)
 */

import React from 'react';
import Link from 'next/link';

interface EnhancedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Enhanced Link component with proper scroll behavior and replace logic
 * Automatically determines optimal scroll and replace behavior
 */
export function EnhancedLink({
  href,
  children,
  className,
  prefetch,
  replace,
  scroll,
  shallow,
  ...props
}: EnhancedLinkProps) {
  // Auto-determine replace behavior for specific scenarios
  const shouldReplace = replace ?? (
    href.includes('/success') ||
    href.includes('/confirmation') ||
    href.includes('/redirect') ||
    href.startsWith('/auth/')
  );

  // Auto-determine scroll behavior
  const shouldScroll = scroll ?? (
    !href.includes('#') && // Don't scroll for anchor links
    !href.includes('?') && // Don't scroll for query params
    !href.includes('/modal') && // Don't scroll for modals
    !href.includes('/popup') // Don't scroll for popups
  );

  // Auto-determine prefetch behavior
  const shouldPrefetch = prefetch ?? (
    !href.includes('/admin') && // Don't prefetch admin routes
    !href.includes('/settings') && // Don't prefetch settings
    !href.includes('/heavy') && // Don't prefetch heavy pages
    href.length < 100 // Don't prefetch very long URLs
  );

  return (
    <Link
      href={href}
      className={className}
      prefetch={shouldPrefetch}
      replace={shouldReplace}
      scroll={shouldScroll}
      shallow={shallow}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Specialized Link for deep page navigation with controlled scroll
 */
export function DeepLink({
  href,
  children,
  className,
  scrollToTop = false,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  scrollToTop?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <Link
      href={href}
      className={className}
      scroll={scrollToTop}
      prefetch={false} // Deep links are typically not prefetched
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Specialized Link for form success/redirect scenarios
 */
export function RedirectLink({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <Link
      href={href}
      className={className}
      replace={true} // Don't add to history for redirects
      scroll={true} // Scroll to top for fresh page
      prefetch={false} // Don't prefetch redirect pages
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Specialized Link for anchor/hash navigation
 */
export function AnchorLink({
  href,
  children,
  className,
  smooth = true,
  ...props
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  smooth?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#') && smooth) {
      event.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  };

  return (
    <Link
      href={href}
      className={className}
      scroll={false} // We handle scroll manually for smooth behavior
      prefetch={false} // No need to prefetch anchor links
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}