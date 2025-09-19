'use client';

/**
 * Model Detail Loading Component
 * Displays loading state while individual model data is being fetched
 */

import { Box, Skeleton, Container, Card, CardContent, Divider } from '@mui/material';

export default function Loading(): JSX.Element {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Breadcrumb Loading */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={350} height={24} />
        </Box>

        {/* Page Title Loading */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={250} height={40} />
        </Box>

        {/* Model Details Card Loading */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, mb: 4 }}>
              {/* Model Information Section */}
              <Box>
                <Skeleton variant="text" width={180} height={28} sx={{ mb: 3 }} />
                <Box sx={{ space: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={200} height={24} />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={90} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={180} height={24} />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </Box>
              </Box>

              {/* Model Metrics Section */}
              <Box>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 3 }} />
                <Box sx={{ space: 2 }}>
                  {['Accuracy', 'Precision', 'Recall', 'F1 Score'].map((metric, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Configuration Section Loading */}
            <Box sx={{ mt: 4 }}>
              <Skeleton variant="text" width={200} height={28} sx={{ mb: 3 }} />
              <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 1 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} />
              </Box>
            </Box>

            {/* Action Buttons Loading */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Skeleton variant="rectangular" width={120} height={40} />
              <Skeleton variant="rectangular" width={140} height={40} />
              <Skeleton variant="rectangular" width={110} height={40} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}