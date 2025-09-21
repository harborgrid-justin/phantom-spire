'use client';

/**
 * Streaming Navigation Components
 * Addresses Control N.12: Streaming and suspense patterns for slow dynamic navigations
 */

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Skeleton,
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Alert,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Speed as FastIcon,
} from '@mui/icons-material';

interface StreamingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  enableStreaming?: boolean;
  fallback?: React.ReactNode;
  timeout?: number;
  [key: string]: any;
}

interface StreamingNavigationState {
  isNavigating: boolean;
  hasTimedOut: boolean;
  startTime: number | null;
  route: string | null;
}

/**
 * N.12: Link component with streaming navigation support
 * Shows progressive loading for slow dynamic route navigation
 */
export function StreamingLink({
  href,
  children,
  className,
  enableStreaming = true,
  fallback,
  timeout = 5000,
  ...props
}: StreamingLinkProps) {
  const router = useRouter();
  const [navState, setNavState] = useState<StreamingNavigationState>({
    isNavigating: false,
    hasTimedOut: false,
    startTime: null,
    route: null,
  });

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!enableStreaming) return;

    event.preventDefault();

    setNavState({
      isNavigating: true,
      hasTimedOut: false,
      startTime: Date.now(),
      route: href,
    });

    // Set timeout for slow navigation
    const timeoutId = setTimeout(() => {
      setNavState(prev => ({
        ...prev,
        hasTimedOut: true,
      }));
    }, timeout);

    // Perform navigation
    router.push(href);

    // Clean up timeout when navigation completes
    const handleComplete = () => {
      clearTimeout(timeoutId);
      setNavState({
        isNavigating: false,
        hasTimedOut: false,
        startTime: null,
        route: null,
      });
    };

    // Listen for route change completion
    setTimeout(handleComplete, 100);
  }, [href, enableStreaming, timeout, router]);

  const renderNavigationFeedback = () => {
    if (!navState.isNavigating) return null;

    const elapsed = navState.startTime ? Date.now() - navState.startTime : 0;

    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="rgba(255, 255, 255, 0.9)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
      >
        <Card sx={{ minWidth: 300, textAlign: 'center' }}>
          <CardContent>
            {!navState.hasTimedOut ? (
              <>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Loading {navState.route}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {elapsed > 0 && `${Math.round(elapsed / 1000)}s elapsed`}
                </Typography>
                {fallback}
              </>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This page is taking longer than expected to load
                </Alert>
                <Typography variant="body2" gutterBottom>
                  The navigation to {navState.route} is experiencing delays.
                  This might be due to:
                </Typography>
                <Box component="ul" textAlign="left" sx={{ mt: 1, mb: 2 }}>
                  <li>Large data sets being loaded</li>
                  <li>Network connectivity issues</li>
                  <li>Server processing time</li>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => window.location.reload()}
                  sx={{ mr: 1 }}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="text"
                  onClick={() => router.back()}
                >
                  Go Back
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <>
      <Link
        href={href}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Link>
      {renderNavigationFeedback()}
    </>
  );
}

/**
 * N.12: Suspense wrapper for dynamic content sections
 */
interface DynamicSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

export function DynamicSection({
  children,
  fallback,
  errorBoundary = true,
}: DynamicSectionProps) {
  const defaultFallback = (
    <Box p={3}>
      <Skeleton variant="text" width="60%" height={40} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
    </Box>
  );

  const content = (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );

  if (errorBoundary) {
    return (
      <StreamingErrorBoundary>
        {content}
      </StreamingErrorBoundary>
    );
  }

  return content;
}

/**
 * N.12: Error boundary for streaming navigation failures
 */
interface StreamingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class StreamingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  StreamingErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): StreamingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Streaming navigation error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => this.setState({ hasError: false })}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Navigation Error
            </Typography>
            <Typography variant="body2">
              Failed to load this section. This might be a temporary issue.
            </Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * N.12: Progressive enhancement for list-based navigation
 */
interface StreamingListProps {
  items: Array<{ id: string; href: string; title: string; description?: string }>;
  batchSize?: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function StreamingList({
  items,
  batchSize = 10,
  renderItem,
  className,
}: StreamingListProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    setIsLoading(true);
    // Simulate network delay for progressive loading
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, 300);
  }, [batchSize, items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <Box className={className}>
      {visibleItems.map((item, index) => (
        <DynamicSection key={item.id} errorBoundary={false}>
          {renderItem(item, index)}
        </DynamicSection>
      ))}

      {hasMore && (
        <Box textAlign="center" p={2}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Button
              variant="outlined"
              onClick={loadMore}
              startIcon={<FastIcon />}
            >
              Load More ({items.length - visibleCount} remaining)
            </Button>
          )}
        </Box>
      )}

      {!hasMore && items.length > batchSize && (
        <Box textAlign="center" p={2}>
          <Typography variant="body2" color="textSecondary">
            All {items.length} items loaded
          </Typography>
        </Box>
      )}
    </Box>
  );
}

/**
 * N.12: Hook for streaming navigation state
 */
export function useStreamingNavigation() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingRoute, setStreamingRoute] = useState<string | null>(null);

  const startStreaming = useCallback((route: string) => {
    setIsStreaming(true);
    setStreamingRoute(route);
  }, []);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setStreamingRoute(null);
  }, []);

  return {
    isStreaming,
    streamingRoute,
    startStreaming,
    stopStreaming,
  };
}