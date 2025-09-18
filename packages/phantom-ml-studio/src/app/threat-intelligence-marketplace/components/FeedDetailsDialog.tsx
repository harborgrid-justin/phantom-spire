/**
 * FeedDetailsDialog Component
 * Modal dialog showing detailed information about a threat intelligence feed
 */

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FeedDetailsDialogProps } from '../types';

export function FeedDetailsDialog({
  feed,
  open,
  onClose,
  onSubscribe
}: FeedDetailsDialogProps) {
  if (!feed) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{feed.name}</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="body1" paragraph>
            {feed.description}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Provider:</strong> {feed.provider}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Category:</strong> {feed.category}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Updates:</strong> {feed.updates}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Format:</strong> {feed.format.toUpperCase()}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Confidence:</strong> {feed.confidence}%
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Pricing:</strong> {feed.pricing}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Coverage:</strong> {feed.coverage.join(', ')}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Subscribers:</strong> {feed.subscribers.toLocaleString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2">
                <strong>Rating:</strong> {feed.rating}/5
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Last Updated:</strong> {feed.lastUpdate.toLocaleDateString()}
              </Typography>
            </Grid>

            {feed.price && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2">
                  <strong>Price:</strong> {feed.price}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!feed.subscribed && (
          <Button
            variant="contained"
            onClick={() => {
              onSubscribe(feed.id);
              onClose();
            }}
          >
            Subscribe
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}