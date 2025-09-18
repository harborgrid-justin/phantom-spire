/**
 * ThreatDataTable Component
 * Displays threat intelligence indicators in a structured table format
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ThreatDataTableProps, SEVERITY_COLORS } from '../types';

export function ThreatDataTable({ 
  threatData, 
  loading = false 
}: ThreatDataTableProps) {
  const getSeverityColor = (severity: string) => {
    return (SEVERITY_COLORS as Record<string, string>)[severity] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading threat data...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Threat Indicators
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Indicator</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>First Seen</TableCell>
                <TableCell>Tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {threatData.map((threat) => (
                <TableRow key={threat.id}>
                  <TableCell>{threat.type}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {threat.indicator}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={threat.severity}
                      color={getSeverityColor(threat.severity) as 'error' | 'warning' | 'info' | 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{threat.confidence}%</TableCell>
                  <TableCell>{threat.source}</TableCell>
                  <TableCell>{threat.firstSeen.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box>
                      {threat.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {threatData.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No threat data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}