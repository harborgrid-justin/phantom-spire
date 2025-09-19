'use client';

/**
 * User Profile Loading Component
 * Displays loading state while user data is being fetched
 */

import { Box, Skeleton, Container, Card, CardContent, Avatar } from '@mui/material';

export default function Loading(): JSX.Element {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Page Title Loading */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={300} height={24} sx={{ mx: 'auto' }} />
        </Box>

        {/* User Profile Card Loading */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={150} height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={250} height={20} />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
              <Box>
                <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} />
              </Box>
              <Box>
                <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="85%" height={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Activity/Projects Section Loading */}
        <Card>
          <CardContent>
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 3 }} />
            <Box sx={{ space: 2 }}>
              {[...Array(4)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Skeleton variant="rectangular" width={60} height={60} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={20} />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}