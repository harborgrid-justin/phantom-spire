import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { XDRSystemStatus } from '../types';

interface XDRSystemOverviewProps {
  status: XDRSystemStatus | undefined;
}

export const XDRSystemOverview: React.FC<XDRSystemOverviewProps> = ({ status }) => {
  if (!status?.data) {
    return (
      <Alert severity="warning">XDR system status unavailable</Alert>
    );
  }

  const { system_overview, performance_metrics, threat_landscape, enterprise_coverage } = status.data;

  // Add null checks for all objects
  if (!system_overview || !performance_metrics || !threat_landscape || !enterprise_coverage) {
    return (
      <Alert severity="info">XDR system components are currently being initialized...</Alert>
    );
  }

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Health</Typography>
            <Chip
              icon={system_overview.overall_status === 'operational' ? <CheckCircleIcon /> : <WarningIcon />}
              label={system_overview.overall_status || 'Unknown'}
              color={system_overview.overall_status === 'operational' ? 'success' : 'warning'}
            />
            <Typography variant="body2" color="textSecondary" mt={1}>
              Uptime: {system_overview.uptime || 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Load: {system_overview.current_load || 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Performance</Typography>
            <Typography variant="body2" color="textSecondary">
              Events/sec: <strong>{performance_metrics.events_per_second?.toLocaleString() || '0'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Detection: <strong>{performance_metrics.detection_latency || 'N/A'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Response: <strong>{performance_metrics.response_time || 'N/A'}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Threat Landscape</Typography>
            <Typography variant="body2" color="textSecondary">
              Active: <strong style={{ color: '#f44336' }}>{threat_landscape.active_threats || 0}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Blocked: <strong style={{ color: '#4caf50' }}>{threat_landscape.blocked_threats?.toLocaleString() || '0'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Investigated: <strong>{threat_landscape.investigated_incidents || 0}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box flex="1 1 250px" minWidth="250px">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Coverage</Typography>
            <Typography variant="body2" color="textSecondary">
              Endpoints: <strong>{enterprise_coverage.monitored_endpoints?.toLocaleString() || '0'}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Sensors: <strong>{enterprise_coverage.network_sensors || 0}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Cloud: <strong>{enterprise_coverage.cloud_integrations || 0}</strong>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
