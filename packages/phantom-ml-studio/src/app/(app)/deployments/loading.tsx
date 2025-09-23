/**
 * Deployments Loading UI
 * Provides skeleton layout for deployments dashboard
 */

import { Container, Card, CardContent, Skeleton, Box, Paper, Stack } from '@mui/material';

export default function DeploymentsLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Skeleton variant="text" width={180} height={40} />
        <Skeleton variant="rectangular" width={130} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Status Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={16} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Deployments List */}
      <Paper sx={{ overflow: 'hidden' }}>
        {/* Table Header */}
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="text" width={90} height={16} />
            <Skeleton variant="text" width={70} height={16} />
            <Skeleton variant="text" width={60} height={16} />
          </Box>
        </Box>

        {/* Deployment Rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Box key={i} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: 2, alignItems: 'center' }}>
              {/* Model & Version */}
              <Box>
                <Skeleton variant="text" width="75%" height={20} />
                <Skeleton variant="text" width="60%" height={14} sx={{ mt: 0.5 }} />
              </Box>
              
              {/* Status */}
              <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 12 }} />
              
              {/* Environment */}
              <Skeleton variant="text" width="70%" height={16} />
              
              {/* Requests */}
              <Skeleton variant="text" width="60%" height={16} />
              
              {/* Health */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Skeleton variant="circular" width={12} height={12} />
                <Skeleton variant="text" width="50%" height={16} />
              </Box>
              
              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
                <Skeleton variant="circular" width={28} height={28} />
              </Box>
            </Box>

            {/* Metrics Row */}
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
              <Box>
                <Skeleton variant="text" width="50%" height={12} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="60%" height={14} />
              </Box>
              <Box>
                <Skeleton variant="text" width="60%" height={12} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="50%" height={14} />
              </Box>
              <Box>
                <Skeleton variant="text" width="40%" height={12} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="70%" height={14} />
              </Box>
              <Box>
                <Skeleton variant="text" width="55%" height={12} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="45%" height={14} />
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Bottom Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
        <Skeleton variant="text" width={150} height={16} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    </Container>
  );
}
