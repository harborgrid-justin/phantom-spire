'use client';

/**
 * Documentation Loading Component
 * Displays loading state while documentation content is being fetched
 */

import { Box, Skeleton, Container, Typography } from '@mui/material';

export default function Loading(): JSX.Element {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Sidebar Navigation Loading */}
          <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
            <Skeleton variant="text" width={200} height={32} sx={{ mb: 3 }} />
            <Box sx={{ space: 1 }}>
              {[...Array(8)].map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                  <Box sx={{ ml: 2 }}>
                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="70%" height={20} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Main Content Loading */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb Loading */}
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width={300} height={20} />
            </Box>

            {/* Page Title Loading */}
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" width={400} height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>

            {/* Content Loading */}
            <Box sx={{ space: 3 }}>
              {/* Introduction Paragraph */}
              <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="85%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} />
              </Box>

              {/* Section Headers and Content */}
              {[...Array(3)].map((_, sectionIndex) => (
                <Box key={sectionIndex} sx={{ mb: 5 }}>
                  <Skeleton variant="text" width={250} height={32} sx={{ mb: 3 }} />

                  {/* Paragraphs */}
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </Box>

                  {/* Code Block Loading */}
                  <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 1, mb: 3 }}>
                    <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="70%" height={16} />
                  </Box>

                  {/* More Content */}
                  <Box>
                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="85%" height={20} />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Navigation Footer Loading */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={120} height={24} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}