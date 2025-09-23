/**
 * Settings Loading UI
 * Provides skeleton layout for settings page with tabs and forms
 */

import { Container, Card, CardContent, Skeleton, Box, Paper, Stack, Divider } from '@mui/material';

export default function SettingsLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Skeleton variant="text" width={120} height={40} sx={{ mb: 4 }} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" width={100} height={24} />
          ))}
        </Box>
      </Box>

      {/* Settings Sections */}
      <Stack spacing={3}>
        {/* Profile Section */}
        <Card>
          <CardContent>
            <Skeleton variant="text" width={150} height={24} sx={{ mb: 3 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, gap: 3, alignItems: 'center' }}>
              <Skeleton variant="circular" width={120} height={120} />
              <Stack spacing={2}>
                <Box>
                  <Skeleton variant="text" width={100} height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={80} height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardContent>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 3 }} />
            <Stack spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i}>
                  <Skeleton variant="text" width={150} height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 10 }} />
                    <Skeleton variant="text" width={200} height={16} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card>
          <CardContent>
            <Skeleton variant="text" width={100} height={24} sx={{ mb: 3 }} />
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Skeleton variant="text" width={120} height={20} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="60%" height={14} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={150} height={14} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardContent>
            <Skeleton variant="text" width={80} height={24} sx={{ mb: 3 }} />
            <Stack spacing={3}>
              <Box>
                <Skeleton variant="text" width={180} height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={16} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1 }} />
              </Box>
              <Divider />
              <Box>
                <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="text" width={200} height={20} />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Container>
  );
}
