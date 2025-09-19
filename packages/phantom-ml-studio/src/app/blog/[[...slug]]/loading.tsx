'use client';

/**
 * Blog Loading Component
 * Displays loading state while blog content is being fetched
 */

import { Box, Skeleton, Container, Card, CardContent, Chip } from '@mui/material';

export default function Loading(): JSX.Element {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Loading */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Skeleton variant="text" width={300} height={48} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={500} height={24} sx={{ mx: 'auto' }} />
        </Box>

        {/* Featured Article Loading */}
        <Card sx={{ mb: 6 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Skeleton variant="rectangular" width={200} height={120} sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={60} height={24} />
                </Box>
                <Skeleton variant="text" width="90%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="text" width={120} height={16} />
                  <Skeleton variant="text" width={80} height={16} />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Blog Posts Grid Loading */}
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <Skeleton variant="rectangular" width="100%" height={200} />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Skeleton variant="rounded" width={70} height={20} />
                  <Skeleton variant="rounded" width={50} height={20} />
                </Box>
                <Skeleton variant="text" width="100%" height={28} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={16} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={80} height={14} />
                  </Box>
                  <Skeleton variant="text" width={60} height={14} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Pagination Loading */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="circular" width={40} height={40} />
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}