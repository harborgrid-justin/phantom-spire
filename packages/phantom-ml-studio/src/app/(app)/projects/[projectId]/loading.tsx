'use client';

/**
 * Project Loading Component
 * Displays loading state while project data is being fetched
 */

import { Box, Skeleton, Container, Typography, Card, CardContent } from '@mui/material';

export default function Loading(): JSX.Element {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumb Loading */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={24} />
        </Box>

        {/* Page Title Loading */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={500} height={24} sx={{ mt: 1 }} />
        </Box>

        {/* Project Details Card Loading */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <Skeleton variant="text" width={150} />
                </Typography>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <Skeleton variant="text" width={120} />
                </Typography>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Models Grid Loading */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={32} />
                  <Skeleton variant="rectangular" width={70} height={32} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
}