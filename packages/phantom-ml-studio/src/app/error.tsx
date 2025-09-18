'use client';

/**
 * Global Error Boundary Component
 *
 * This component catches unhandled errors in the application and provides
 * a fallback UI to gracefully handle error states.
 */

import { useEffect } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { ErrorOutline, Refresh, Home } from '@mui/icons-material';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): JSX.Element {
  useEffect(() => {
    // Log error details for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
        }}
        role="alert"
        aria-live="assertive"
      >
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            maxWidth: 600,
            width: '100%'
          }}
          elevation={3}
        >
          <ErrorOutline
            sx={{
              fontSize: 64,
              color: 'error.main',
              mb: 2
            }}
            aria-hidden="true"
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'error.main' }}
          >
            Something went wrong
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            We encountered an unexpected error. Please try refreshing the page
            or contact support if the problem persists.
          </Typography>

          {process.env.NODE_ENV === 'development' && error.message && (
            <Box
              sx={{
                mb: 4,
                p: 2,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                textAlign: 'left'
              }}
            >
              <Typography variant="subtitle2" color="error" gutterBottom>
                Error Details (Development Only):
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={reset}
              size="large"
              aria-label="Try again to reload this page"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Home />}
              onClick={() => window.location.href = '/'}
              size="large"
              aria-label="Go to home page"
            >
              Go Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
