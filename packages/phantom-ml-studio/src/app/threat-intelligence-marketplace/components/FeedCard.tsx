/**
 * FeedCard Component
 * Displays individual threat intelligence feed information with subscription controls
 */

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Rating,
  Typography
} from '@mui/material';
import {
  Info as InfoIcon,
  Security as SecurityIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { FeedCardProps, CATEGORY_COLORS } from '../types';

export function FeedCard({
  feed,
  onSubscribe,
  onUnsubscribe,
  onViewDetails
}: FeedCardProps) {
  const getCategoryColor = (category: string) => {
    return (CATEGORY_COLORS as Record<string, string>)[category] || 'default';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h6" component="h3" gutterBottom>
            {feed.name}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => onViewDetails(feed)}
            aria-label={`View details for ${feed.name}`}
          >
            <InfoIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {feed.description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip
            label={feed.category}
            color={getCategoryColor(feed.category) as 'error' | 'warning' | 'info' | 'success' | 'primary' | 'secondary'}
            size="small"
            icon={<SecurityIcon fontSize="small" />}
          />
          <Typography variant="body2" color="text.secondary">
            {feed.provider}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={feed.rating} readOnly size="small" />
            <Typography variant="body2">({feed.rating})</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {feed.subscribers.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2">
            <strong>Updates:</strong> {feed.updates}
          </Typography>
          <Typography variant="body2">
            <strong>Confidence:</strong> {feed.confidence}%
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          <strong>Coverage:</strong> {feed.coverage.join(', ')}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2">
            <strong>Format:</strong> {feed.format.toUpperCase()}
          </Typography>
          {feed.price && (
            <Typography variant="body2" fontWeight="bold">
              {feed.price}
            </Typography>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          Last Updated: {feed.lastUpdate.toLocaleDateString()}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        {feed.subscribed ? (
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => onUnsubscribe(feed.id)}
          >
            Unsubscribe
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={() => onSubscribe(feed.id)}
          >
            Subscribe
          </Button>
        )}
      </Box>
    </Card>
  );
}