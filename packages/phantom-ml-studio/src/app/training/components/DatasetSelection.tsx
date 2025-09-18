/**
 * Dataset Selection Step Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  DatasetLinked as DatasetIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Dataset } from '../types';

interface DatasetSelectionProps {
  selectedDataset: Dataset | null;
  onDatasetSelect: (dataset: Dataset) => void;
  onUploadDataset: () => void;
  datasets: Dataset[];
}

const getQualityColor = (quality: Dataset['quality']) => {
  switch (quality) {
    case 'high': return 'success';
    case 'medium': return 'warning';
    case 'low': return 'error';
    default: return 'default';
  }
};

const getQualityIcon = (quality: Dataset['quality']) => {
  switch (quality) {
    case 'high': return <CheckIcon color="success" />;
    case 'medium': return <WarningIcon color="warning" />;
    case 'low': return <ErrorIcon color="error" />;
    default: return <InfoIcon />;
  }
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

export default function DatasetSelection({
  selectedDataset,
  onDatasetSelect,
  onUploadDataset,
  datasets
}: DatasetSelectionProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Training Dataset
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a dataset for training your machine learning model. The dataset quality and size will affect training performance.
      </Typography>

      {/* Upload New Dataset Section */}
      <Card sx={{ mb: 3 }} data-cy="upload-dataset-card">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <UploadIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Upload New Dataset</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file to create a new training dataset. Supported formats: CSV, JSON, Parquet
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={onUploadDataset}
            data-cy="upload-dataset-button"
          >
            Upload Dataset
          </Button>
        </CardContent>
      </Card>

      {/* Available Datasets */}
      <Card data-cy="available-datasets-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Datasets
          </Typography>
          
          {datasets.length === 0 ? (
            <Alert severity="info">
              No datasets available. Upload a dataset to get started.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dataset</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Dimensions</TableCell>
                    <TableCell>Quality</TableCell>
                    <TableCell>Last Modified</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datasets.map((dataset) => (
                    <TableRow 
                      key={dataset.id}
                      hover
                      selected={selectedDataset?.id === dataset.id}
                      sx={{ 
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                          }
                        }
                      }}
                      onClick={() => onDatasetSelect(dataset)}
                      data-cy={`dataset-row-${dataset.id}`}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DatasetIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2">
                              {dataset.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dataset.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={dataset.type} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatFileSize(dataset.size)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dataset.rows.toLocaleString()} × {dataset.columns}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dataset.features.length} features
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getQualityIcon(dataset.quality)}
                          <Chip 
                            label={dataset.quality} 
                            color={getQualityColor(dataset.quality)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dataset.lastModified.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show dataset details
                            console.log('Show dataset details:', dataset.id);
                          }}
                          data-cy={`dataset-info-${dataset.id}`}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Selected Dataset Preview */}
      {selectedDataset && (
        <Card sx={{ mt: 3 }} data-cy="selected-dataset-preview">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selected Dataset: {selectedDataset.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2">
                    {selectedDataset.type}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body2">
                    {selectedDataset.rows.toLocaleString()} rows × {selectedDataset.columns} columns
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Features
                  </Typography>
                  <Typography variant="body2">
                    {selectedDataset.features.length} features available
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quality Score
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getQualityIcon(selectedDataset.quality)}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {selectedDataset.quality}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {selectedDataset.target && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Suggested target column: <strong>{selectedDataset.target}</strong>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}