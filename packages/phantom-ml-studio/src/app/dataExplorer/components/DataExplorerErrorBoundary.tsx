'use client';

import React from 'react';
import {
  Container,
  Alert,
  Button
} from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface DataExplorerErrorBoundaryProps {
  children: React.ReactNode;
}

class DataExplorerErrorBoundary extends React.Component<
  DataExplorerErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: DataExplorerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Data Explorer Error:', error, errorInfo);
    // In production, send to error reporting service
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            }
          >
            Something went wrong with the data explorer. Please try refreshing the page.
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default DataExplorerErrorBoundary;
