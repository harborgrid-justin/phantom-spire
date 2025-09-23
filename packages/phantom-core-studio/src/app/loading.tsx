'use client';

/**
 * Global Loading Component
 *
 * This component displays a loading state while pages and components
 * are being rendered or data is being fetched.
 */

import { Box, CircularProgress, Typography, Container } from '@mui/material';

export default function Loading(): JSX.Element {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          py: 4,
        }}
        role="status"
        aria-live="polite"
        aria-label="Loading content"
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main',
            mb: 3
          }}
          aria-hidden="true"
        />
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          Loading Phantom ML Studio...
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          Please wait while we prepare your workspace
        </Typography>
      </Box>
    </Container>
  );
}
