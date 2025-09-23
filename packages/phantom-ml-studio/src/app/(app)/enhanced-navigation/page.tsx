/**
 * Enhanced Navigation Examples
 * Demonstrates scroll, replace props and programmatic navigation
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { PATHS } from '@/config/paths';
import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Button, Card, CardContent, Stack } from '@mui/material';

export default function EnhancedNavigationPage() {
  const router = useRouter();

  const handleProgrammaticNavigation = () => {
    // Example of programmatic navigation with router.push
    router.push('/dashboard');
  };

  const handleReplaceNavigation = () => {
    // Example of replace navigation (doesn't add to history)
    router.replace('/models');
  };

  const handleScrollNavigation = () => {
    // Navigate with scroll control
    router.push('/dataExplorer');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Enhanced Navigation Examples
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates various Next.js navigation patterns including scroll behavior, 
        replace navigation, and programmatic navigation.
      </Typography>

      <Stack spacing={4} sx={{ mt: 4 }}>
        {/* Scroll Behavior Examples */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Scroll Behavior Control
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control scrolling behavior when navigating between pages.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link 
                href={PATHS.DASHBOARD} 
                scroll={true}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Navigate with Scroll (Default)
                </Button>
              </Link>
              <Link 
                href={PATHS.MODELS} 
                scroll={false}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Navigate without Scroll
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>

        {/* Replace Navigation Examples */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Replace Navigation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Replace current history entry instead of adding a new one.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link 
                href={PATHS.EXPERIMENTS} 
                replace={true}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="contained">
                  Replace Current Page
                </Button>
              </Link>
              <Link 
                href={PATHS.SETTINGS} 
                replace={false}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Add to History (Default)
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>

        {/* Programmatic Navigation */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Programmatic Navigation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Navigate programmatically using the useRouter hook.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                onClick={handleProgrammaticNavigation}
              >
                router.push('/dashboard')
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleReplaceNavigation}
              >
                router.replace('/models')
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleScrollNavigation}
              >
                Navigate with Custom Logic
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Hash Navigation */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Hash Navigation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Navigate to specific sections within pages using hash anchors.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link 
                href="#scroll-section" 
                scroll={true}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Scroll to Section
                </Button>
              </Link>
              <Link 
                href="#hash-section" 
                scroll={false}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Hash without Scroll
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>

        {/* Prefetch Control */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Prefetch Control
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Control when pages are prefetched for optimal performance.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link 
                href={PATHS.THREAT_INTELLIGENCE} 
                prefetch={true}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Force Prefetch
                </Button>
              </Link>
              <Link 
                href={PATHS.COMPLIANCE} 
                prefetch={false}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Disable Prefetch
                </Button>
              </Link>
              <Link 
                href={PATHS.MONITORING} 
                prefetch={null}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outlined">
                  Default Prefetch
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Demo Sections for Hash Navigation */}
      <Box sx={{ mt: 8 }}>
        <Box id="scroll-section" sx={{ py: 4, bgcolor: 'grey.50', borderRadius: 1, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Scroll Section
          </Typography>
          <Typography variant="body1">
            This section demonstrates hash navigation with scrolling enabled.
            When you click the "Scroll to Section" link above, the page will smoothly scroll to this section.
          </Typography>
        </Box>

        <Box id="hash-section" sx={{ py: 4, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
          <Typography variant="h4" gutterBottom>
            Hash Section
          </Typography>
          <Typography variant="body1">
            This section demonstrates hash navigation without scrolling.
            The URL will update with the hash, but the page won't scroll automatically.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
