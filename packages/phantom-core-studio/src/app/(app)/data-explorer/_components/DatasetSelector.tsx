/**
 * Dataset Selector Component
 * Handles dataset selection and actions
 */

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  IconButton,
  Button
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Dataset } from '@/features/data-explorer/lib';

interface DatasetSelectorProps {
  datasets: Dataset[];
  selectedDatasetId: number;
  refreshing: boolean;
  onDatasetChange: (datasetId: number) => void;
  onRefresh: () => void;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  selectedDatasetId,
  refreshing,
  onDatasetChange,
  onRefresh
}) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel>Select Dataset</InputLabel>
        <Select
          value={selectedDatasetId}
          onChange={(e) => onDatasetChange(e.target.value as number)}
          label="Select Dataset"
        >
          {datasets.map((dataset) => (
            <MenuItem key={dataset.id} value={dataset.id}>
              <Box>
                <Typography variant="body1">{dataset.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {dataset.rows.toLocaleString()} rows × {dataset.columns} columns
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Refresh data">
          <IconButton onClick={onRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          disabled
          sx={{ flex: 1 }}
        >
          Export
        </Button>
      </Box>
    </Box>
  );
};

export default DatasetSelector;
