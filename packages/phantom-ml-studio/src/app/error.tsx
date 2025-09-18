'use client';

import { Box, Button, Typography, Paper } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Something went wrong!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {error.message || 'An unexpected error occurred.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => reset()}
        >
          Try again
        </Button>
      </Paper>
    </Box>
  );
}
