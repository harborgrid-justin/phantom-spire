'use client';

import React from 'react';
import { Box, Container, Typography, Link, Divider, Grid } from '@mui/material';
import NextLink from 'next/link';

interface FooterProps {
  className?: string;
}

/**
 * Application Footer Component
 *
 * Note: Footer links use prefetch={false} by default since they are typically
 * off-screen and rarely accessed. This prevents unnecessary bandwidth usage
 * for links that users may never visit.
 */
export function Footer({ className }: FooterProps): JSX.Element {
  const footerLinks = {
    platform: [
      { title: 'Dashboard', href: '/', prefetch: true }, // Core nav - enable prefetch
      { title: 'Models', href: '/models', prefetch: true },
      { title: 'Experiments', href: '/experiments', prefetch: true },
      { title: 'Deployments', href: '/deployments', prefetch: false }, // Resource heavy
    ],
    resources: [
      { title: 'Documentation', href: '/docs', prefetch: false }, // Rarely visited
      { title: 'API Reference', href: '/docs/api', prefetch: false },
      { title: 'Tutorials', href: '/docs/tutorials', prefetch: false },
      { title: 'Examples', href: '/docs/examples', prefetch: false },
    ],
    support: [
      { title: 'Help Center', href: '/help', prefetch: false },
      { title: 'Contact', href: '/contact', prefetch: false },
      { title: 'Status', href: '/status', prefetch: false },
      { title: 'Security', href: '/security', prefetch: false },
    ],
    legal: [
      { title: 'Privacy Policy', href: '/privacy', prefetch: false },
      { title: 'Terms of Service', href: '/terms', prefetch: false },
      { title: 'Compliance', href: '/compliance', prefetch: false }, // Sensitive
    ],
  };

  return (
    <Box
      component="footer"
      className={className}
      sx={{
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
      }}
      role="contentinfo"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Platform Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.platform.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.title}
                  </Typography>
                </NextLink>
              ))}
            </Box>
          </Grid>

          {/* Resources Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.resources.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.title}
                  </Typography>
                </NextLink>
              ))}
            </Box>
          </Grid>

          {/* Support Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.support.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.title}
                  </Typography>
                </NextLink>
              ))}
            </Box>
          </Grid>

          {/* Legal Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.legal.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {link.title}
                  </Typography>
                </NextLink>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Footer Bottom */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2024 Phantom Spire. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Social/External Links - External so no prefetch needed */}
            <Link
              href="https://github.com/phantom-spire"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ '&:hover': { color: 'primary.main' } }}
            >
              <Typography variant="body2">GitHub</Typography>
            </Link>
            <Link
              href="https://twitter.com/phantom_spire"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ '&:hover': { color: 'primary.main' } }}
            >
              <Typography variant="body2">Twitter</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}