/**
 * Loading UI for Model Dynamic Route
 * Provides immediate feedback during navigation to specific model pages
 */

import { Container, Box, Skeleton, Paper, Chip } from '@mui/material';

export default function ModelLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
        {/* Breadcrumb Navigation */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 'sm', color: 'text.secondary' }}>
            <Skeleton variant="text" width={60} height={20} />
            <span>/</span>
            <Skeleton variant="text" width={100} height={20} />
            <span>/</span>
            <Skeleton variant="text" width={50} height={20} />
            <span>/</span>
            <Skeleton variant="text" width={80} height={20} />
          </Box>
        </Box>

        {/* Page Title */}
        <Skeleton variant="text" width={200} height={48} sx={{ mb: 6 }} />

        {/* Main Content Card */}
        <Paper sx={{ p: 6, borderRadius: 2, boxShadow: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, mb: 6 }}>
            {/* Model Information Section */}
            <Box>
              <Skeleton variant="text" width={150} height={32} sx={{ mb: 4 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={120} height={28} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={90} height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={140} height={28} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} />
                  <Chip
                    label={<Skeleton variant="text" width={40} />}
                    sx={{ bgcolor: 'success.light', color: 'success.dark' }}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            {/* Model Metrics Section */}
            <Box>
              <Skeleton variant="text" width={130} height={32} sx={{ mb: 4 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Skeleton variant="text" width={80} height={20} />
                    <Skeleton variant="text" width={60} height={20} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Info Panel */}
          <Box sx={{ mt: 6, p: 4, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Skeleton variant="text" width={250} height={20} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} variant="text" width={`${60 + i * 10}%`} height={16} />
              ))}
            </Box>
          </Box>

          {/* Configuration Section */}
          <Box sx={{ mt: 6 }}>
            <Skeleton variant="text" width={180} height={32} sx={{ mb: 4 }} />
            <Paper sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ fontFamily: 'monospace', fontSize: 'sm', color: 'text.secondary' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton key={i} variant="text" width={`${40 + (i % 3) * 20}%`} height={16} sx={{ mb: 0.5 }} />
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 6, display: 'flex', gap: 4 }}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
