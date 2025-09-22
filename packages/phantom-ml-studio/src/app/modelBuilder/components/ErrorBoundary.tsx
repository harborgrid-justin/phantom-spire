/**
 * Error boundary component for the Model Builder
 */

import React from 'react';
import { Container, Alert, Button } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ModelBuilderErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Model Builder Error:', error, errorInfo);
    // In production, send to error reporting service
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  this.setState({ hasError: false });
                }}
              >
                Reset Error
              </Button>
            }
          >
            Something went wrong with the model builder. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}
