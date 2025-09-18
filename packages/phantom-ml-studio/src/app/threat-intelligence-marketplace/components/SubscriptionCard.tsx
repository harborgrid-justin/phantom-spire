/**
 * SubscriptionCard Component
 * Displays subscribed threat intelligence feeds with management controls
 */

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Download as DownloadIcon } from '@mui/icons-material';
import { SubscriptionCardProps, CATEGORY_COLORS } from '../types';

export function SubscriptionCard({
  feed,
  onUnsubscribe
}: SubscriptionCardProps) {
  const getCategoryColor = (category: string) => {
    return (CATEGORY_COLORS as Record<string, string>)[category] || 'default';
  };

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" gutterBottom>
                {feed.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feed.provider}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Chip
                label={feed.category}
                color={getCategoryColor(feed.category) as 'error' | 'warning' | 'info' | 'success' | 'primary' | 'secondary'}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body2">
                Updates: {feed.updates}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="body2">
                Last Update: {feed.lastUpdate.toLocaleString()}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                >
                  Download
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  onClick={() => onUnsubscribe(feed.id)}
                >
                  Unsubscribe
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              {feed.description}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="body2">
              <strong>Format:</strong> {feed.format.toUpperCase()}
            </Typography>
            <Typography variant="body2">
              <strong>Confidence:</strong> {feed.confidence}%
            </Typography>
            <Typography variant="body2">
              <strong>Coverage:</strong> {feed.coverage.join(', ')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}