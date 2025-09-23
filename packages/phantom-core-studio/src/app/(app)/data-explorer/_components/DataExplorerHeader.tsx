/**
 * Data Explorer Header Component
 * Contains header information, title, and action buttons
 */

import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import {
  CloudUpload as UploadIcon
} from '@mui/icons-material';

interface DataExplorerHeaderProps {
  lastUpdated: Date | null;
}

export const DataExplorerHeader: React.FC<DataExplorerHeaderProps> = ({ lastUpdated }) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore, analyze, and understand your datasets before training models
        </Typography>
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        disabled
        sx={{ minWidth: 200 }}
      >
        Upload Dataset (Coming Soon)
      </Button>
    </Box>
  );
};

export default DataExplorerHeader;
