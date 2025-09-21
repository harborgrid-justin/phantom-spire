'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon
} from '@mui/icons-material';

interface DataPreviewProps {
  uploadedFile: File;
  uploadSuccess: boolean;
}

const DataPreview: React.FC<DataPreviewProps> = ({ uploadedFile, uploadSuccess }) => {
  if (!uploadSuccess || !uploadedFile) {
    return null;
  }

  return (
    <>
      {/* Dataset Preview */}
      <Card sx={{ mb: 4 }} elevation={2} data-cy="dataset-preview">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dataset Preview
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">File Name</Typography>
              <Typography variant="body1" data-cy="file-info-name">
                {uploadedFile.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Size</Typography>
              <Typography variant="body1" data-cy="file-info-size">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Estimated Rows</Typography>
              <Typography variant="body1" data-cy="file-info-rows">
                ~100 rows
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Columns</Typography>
              <Typography variant="body1" data-cy="file-info-columns">
                5 columns
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card sx={{ mb: 4 }} elevation={2} data-cy="data-preview-table">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Preview
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell data-cy="table-header-name">Name</TableCell>
                  <TableCell data-cy="table-header-age">Age</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Category</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow data-cy="table-row">
                  <TableCell>John Doe</TableCell>
                  <TableCell>25</TableCell>
                  <TableCell>85.5</TableCell>
                  <TableCell>A</TableCell>
                </TableRow>
                <TableRow data-cy="table-row">
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>30</TableCell>
                  <TableCell>92.1</TableCell>
                  <TableCell>B</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* Column Type Detection */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detected Column Types
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label="Name: Text"
                data-cy="column-type-name"
                size="small"
                variant="outlined"
              />
              <Chip
                label="Age: Numeric"
                data-cy="column-type-age"
                size="small"
                variant="outlined"
                icon={<EditIcon />}
                onClick={() => {/* Handle type editing */}}
              />
              <Chip
                label="Score: Numeric"
                data-cy="column-type-score"
                size="small"
                variant="outlined"
              />
              <Chip
                label="Category: Categorical"
                data-cy="column-type-category"
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default DataPreview;
