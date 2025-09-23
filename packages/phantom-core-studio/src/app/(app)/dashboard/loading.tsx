/**
 * Dashboard Loading UI
 * Provides skeleton layout for dashboard metrics and components
 */

import { Container, Card, CardContent, Skeleton, Box, Paper, Stack } from '@mui/material';

export default function DashboardLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Title */}
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
      
      {/* Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </Box>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="50%" height={16} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Chart Section */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Paper>

        {/* Sidebar Content */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="rectangular" width={60} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height={16} />
                  <Skeleton variant="text" width="60%" height={14} />
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
