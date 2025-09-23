/**
 * Monitoring Loading UI
 * Provides skeleton layout for real-time monitoring dashboard
 */

import { Container, Card, CardContent, Skeleton, Box, Paper, Stack } from '@mui/material';

export default function MonitoringLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      {/* Real-time Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1, mx: 'auto' }} />
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1, mx: 'auto' }} />
              <Skeleton variant="text" width="50%" height={14} sx={{ mx: 'auto' }} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Main Chart */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Paper>

        {/* Side Metrics */}
        <Stack spacing={2}>
          {[1, 2].map((i) => (
            <Paper key={i} sx={{ p: 2 }}>
              <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={140} />
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* System Health */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Skeleton variant="text" width={140} height={24} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="text" width="60%" height={18} />
                <Skeleton variant="circular" width={12} height={12} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Skeleton variant="text" width="30%" height={14} />
                <Skeleton variant="text" width="25%" height={14} />
              </Box>
              <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4, mb: 1 }} />
              <Skeleton variant="text" width="40%" height={12} />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Alerts & Logs */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Recent Alerts */}
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width={120} height={24} sx={{ mb: 3 }} />
          <Stack spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 10 }} />
                </Box>
                <Skeleton variant="text" width="90%" height={14} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={12} />
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* System Logs */}
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width={100} height={24} sx={{ mb: 3 }} />
          <Box sx={{ bgcolor: 'grey.900', color: 'white', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Skeleton variant="text" width={60} height={14} sx={{ bgcolor: 'grey.700' }} />
                <Skeleton variant="text" width={`${40 + (i % 3) * 20}%`} height={14} sx={{ bgcolor: 'grey.700' }} />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
