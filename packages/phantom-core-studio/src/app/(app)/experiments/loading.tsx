/**
 * Experiments Loading UI
 * Provides skeleton layout for experiments list and details
 */

import { Container, Card, CardContent, Skeleton, Box, Paper, Stack, Chip } from '@mui/material';

export default function ExperimentsLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Paper key={i} sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={28} />
          </Paper>
        ))}
      </Box>

      {/* Experiments List */}
      <Paper sx={{ overflow: 'hidden' }}>
        {/* Table Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="text" width={70} height={16} />
            <Skeleton variant="text" width={90} height={16} />
            <Skeleton variant="text" width={60} height={16} />
          </Box>
        </Box>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Box key={i} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 2, alignItems: 'center' }}>
              {/* Experiment Name & Description */}
              <Box>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="90%" height={14} sx={{ mt: 0.5 }} />
              </Box>
              
              {/* Status */}
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
              
              {/* Model Type */}
              <Skeleton variant="text" width="80%" height={16} />
              
              {/* Accuracy */}
              <Skeleton variant="text" width="60%" height={16} />
              
              {/* Duration */}
              <Skeleton variant="text" width="70%" height={16} />
              
              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
