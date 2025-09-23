/**
 * Loading UI for Project Dynamic Route
 * Provides immediate feedback during navigation to project pages
 */

import { Container, Paper, Skeleton, Box } from '@mui/material';

export default function ProjectLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Breadcrumb skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        
        {/* Title skeleton */}
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        
        {/* Content skeleton */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </Box>
        </Box>
        
        {/* Action buttons skeleton */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={120} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
        </Box>
      </Paper>
    </Container>
  );
}
