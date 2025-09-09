import React, { useState, useEffect } from 'react';
import { Status, Priority } from '../../../types/index';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';

interface MetadataHarvestingData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending' | 'error';
  lastUpdated: string;
}

export const MetadataHarvesting: React.FC = () => {
  const [data, setData] = useState<MetadataHarvestingData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setData([
        {
          id: '1',
          name: 'Sample Metadata Harvesting',
          status: 'active',
          lastUpdated: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        🏷️ Metadata Harvesting
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Extract and catalog metadata from data sources
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h5" component="div">
                {data.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(item.lastUpdated).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MetadataHarvesting;