/**
 * Navigation Blocking Hook
 * Addresses Control N.17: No Navigation Blocking Implementation
 */

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationBlockerOptions {
  hasUnsavedChanges: boolean;
  message?: string;
  confirmNavigation?: () => Promise<boolean>;
}

/**
 * Hook to block navigation when there are unsaved changes
 * Prevents data loss in form-heavy workflows
 */
export function useNavigationBlocker({
  hasUnsavedChanges,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  confirmNavigation
}: NavigationBlockerOptions) {
  const router = useRouter();
  const pathname = usePathname();

  // Handle browser navigation (back/forward/refresh)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const shouldLeave = window.confirm(message);
        if (!shouldLeave) {
          // Prevent navigation by pushing current state back
          window.history.pushState(null, '', pathname);
          event.preventDefault();
        }
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message, pathname]);

  // Create a navigation function that checks for unsaved changes
  // N.23: Ensures programmatic navigation mirrors <Link> prop recommendations
  const navigateWithConfirmation = useCallback(async (
    href: string,
    options?: {
      replace?: boolean;
      scroll?: boolean;
      shallow?: boolean;
      // Mirror Link component props for consistency
    }
  ) => {
    if (hasUnsavedChanges) {
      let shouldNavigate = false;

      if (confirmNavigation) {
        shouldNavigate = await confirmNavigation();
      } else {
        shouldNavigate = window.confirm(message);
      }

      if (!shouldNavigate) {
        return false;
      }
    }

    // N.23: Use navigation options that match Link behavior
    if (options?.replace) {
      router.replace(href, { scroll: options.scroll });
    } else {
      router.push(href, { scroll: options.scroll });
    }

    return true;
  }, [hasUnsavedChanges, confirmNavigation, message, router]);

  return {
    navigateWithConfirmation,
    hasUnsavedChanges
  };
}