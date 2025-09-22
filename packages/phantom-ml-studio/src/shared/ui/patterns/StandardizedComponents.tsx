/**
 * Enterprise Component Architecture Patterns
 * Standardized patterns for building consistent, maintainable React components
 */

import React, { ReactNode, ComponentType, ErrorInfo } from 'react';
import { 
  Alert, 
  CircularProgress, 
  Box, 
  Typography,
  Card,
  CardContent,
  Skeleton
} from '@mui/material';

// Base component props interface
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
  id?: string;
}

// Component state interface
export interface ComponentState {
  loading: boolean;
  error?: Error;
  initialized: boolean;
}

// Base component with standardized patterns
export abstract class BaseComponent<P extends BaseComponentProps = BaseComponentProps, S extends ComponentState = ComponentState> extends React.Component<P, S> {
  protected readonly displayName: string;
  
  constructor(props: P, displayName: string) {
    super(props);
    this.displayName = displayName;
    this.state = this.getInitialState() as S;
  }

  protected getInitialState(): ComponentState {
    return {
      loading: false,
      error: undefined,
      initialized: false
    };
  }

  componentDidMount() {
    this.onMount();
  }

  componentWillUnmount() {
    this.onUnmount();
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.handleError(error, errorInfo);
  }

  protected onMount(): void {
    this.setState({ initialized: true } as Partial<S>);
  }

  protected onUnmount(): void {
    // Override in subclasses for cleanup
  }

  protected handleError(error: Error, errorInfo?: ErrorInfo): void {
    console.error(`Error in ${this.displayName}:`, error, errorInfo);
    this.setState({ error, loading: false } as Partial<S>);
  }

  protected setLoading(loading: boolean): void {
    this.setState({ loading } as Partial<S>);
  }

  protected clearError(): void {
    this.setState({ error: undefined } as Partial<S>);
  }

  protected renderError(): ReactNode {
    if (!this.state.error) return null;
    
    return (
      <Alert severity="error" onClose={() => this.clearError()}>
        <Typography variant="h6">
          Something went wrong in {this.displayName}
        </Typography>
        <Typography variant="body2">
          {this.state.error.message}
        </Typography>
      </Alert>
    );
  }

  protected renderLoading(): ReactNode {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  protected getTestId(suffix?: string): string {
    const baseTestId = this.props['data-testid'] || this.displayName.toLowerCase().replace(/\s+/g, '-');
    return suffix ? `${baseTestId}-${suffix}` : baseTestId;
  }

  abstract renderContent(): ReactNode;

  render(): ReactNode {
    const { className, id } = this.props;
    
    if (this.state.error) {
      return this.renderError();
    }

    if (this.state.loading) {
      return this.renderLoading();
    }

    return (
      <div 
        className={className}
        id={id}
        data-testid={this.getTestId()}
        data-component={this.displayName}
      >
        {this.renderContent()}
      </div>
    );
  }
}

// Functional component base interface
export interface FunctionalComponentProps extends BaseComponentProps {
  loading?: boolean;
  error?: Error;
  onRetry?: () => void;
}

// Higher-order component for adding standard behavior
export function withStandardBehavior<P extends object>(
  WrappedComponent: ComponentType<P>,
  displayName: string
) {
  const WithStandardBehavior = React.forwardRef<any, P & FunctionalComponentProps>((props, ref) => {
    const { loading, error, onRetry, className, 'data-testid': testId, ...otherProps } = props;
    
    const getTestId = (suffix?: string): string => {
      const baseTestId = testId || displayName.toLowerCase().replace(/\s+/g, '-');
      return suffix ? `${baseTestId}-${suffix}` : baseTestId;
    };

    if (error) {
      return (
        <Alert 
          severity="error" 
          action={onRetry && (
            <button onClick={onRetry} data-testid={getTestId('retry-button')}>
              Retry
            </button>
          )}
          data-testid={getTestId('error')}
        >
          <Typography variant="h6">
            Something went wrong in {displayName}
          </Typography>
          <Typography variant="body2">
            {error.message}
          </Typography>
        </Alert>
      );
    }

    if (loading) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          p={3}
          data-testid={getTestId('loading')}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading...
          </Typography>
        </Box>
      );
    }

    return (
      <div 
        className={className}
        data-testid={getTestId()}
        data-component={displayName}
      >
        <WrappedComponent {...(otherProps as P)} ref={ref} />
      </div>
    );
  });

  WithStandardBehavior.displayName = `withStandardBehavior(${displayName})`;
  return WithStandardBehavior;
}

// List component pattern
export interface ListComponentProps<T> extends BaseComponentProps {
  items: T[];
  loading?: boolean;
  error?: Error;
  emptyMessage?: string;
  renderItem: (item: T, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  onRetry?: () => void;
  testIdPrefix?: string;
}

export function StandardizedList<T>({
  items,
  loading = false,
  error,
  emptyMessage = 'No items found',
  renderItem,
  renderEmpty,
  renderLoading,
  onRetry,
  testIdPrefix = 'list',
  className,
  'data-testid': testId,
  children
}: ListComponentProps<T>) {
  const getTestId = (suffix?: string): string => {
    const baseTestId = testId || testIdPrefix;
    return suffix ? `${baseTestId}-${suffix}` : baseTestId;
  };

  if (error) {
    return (
      <Alert 
        severity="error"
        action={onRetry && (
          <button onClick={onRetry} data-testid={getTestId('retry-button')}>
            Retry
          </button>
        )}
        data-testid={getTestId('error')}
      >
        <Typography variant="body1">{error.message}</Typography>
      </Alert>
    );
  }

  if (loading) {
    if (renderLoading) {
      return <div data-testid={getTestId('loading')}>{renderLoading()}</div>;
    }
    
    return (
      <Box data-testid={getTestId('loading')}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            height={60} 
            sx={{ mb: 1 }}
            data-testid={getTestId(`loading-item-${index}`)}
          />
        ))}
      </Box>
    );
  }

  if (items.length === 0) {
    if (renderEmpty) {
      return <div data-testid={getTestId('empty')}>{renderEmpty()}</div>;
    }
    
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        p={4}
        data-testid={getTestId('empty')}
      >
        <Typography variant="body1" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <div className={className} data-testid={getTestId()}>
      {items.map((item, index) => (
        <div key={index} data-testid={getTestId(`item-${index}`)}>
          {renderItem(item, index)}
        </div>
      ))}
      {children}
    </div>
  );
}

// Hook for component state management
export function useStandardComponent(displayName: string) {
  const [state, setState] = React.useState<ComponentState>({
    loading: false,
    error: undefined,
    initialized: false
  });

  const setLoading = React.useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = React.useCallback((error: Error | undefined) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const clearError = React.useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  const initialize = React.useCallback(() => {
    setState(prev => ({ ...prev, initialized: true }));
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    clearError,
    initialize
  };
}

// Export all patterns
export default {
  BaseComponent,
  withStandardBehavior,
  StandardizedList,
  useStandardComponent
};