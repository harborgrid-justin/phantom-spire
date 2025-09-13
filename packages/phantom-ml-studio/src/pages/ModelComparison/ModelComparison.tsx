import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Security as SecurityIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// H2O.ai competitive model comparison data
const modelComparisons = [
  {
    id: 'xgb_v1',
    name: 'XGBoost Threat Detector',
    algorithm: 'XGBoost',
    accuracy: 94.2,
    securityScore: 92,
    explainability: 85,
    inferenceSpeed: 0.8,
    status: 'completed',
  },
  {
    id: 'rf_v2',
    name: 'Random Forest Anomaly',
    algorithm: 'Random Forest',
    accuracy: 91.7,
    securityScore: 89,
    explainability: 92,
    inferenceSpeed: 1.2,
    status: 'completed',
  },
  {
    id: 'automl_v1',
    name: 'AutoML Ensemble',
    algorithm: 'AutoML Ensemble',
    accuracy: 97.3,
    securityScore: 97,
    explainability: 88,
    inferenceSpeed: 0.5,
    status: 'deployed',
  }
];

const ModelComparison: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'deployed': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🏆 H2O.ai Competitive Model Comparison
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🚀 Phantom ML Studio vs H2O.ai</AlertTitle>
        <strong>Key Advantages:</strong> Security-first design, threat intelligence integration, 
        Rust performance, bias detection, and cybersecurity-specific model templates.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Model Performance Metrics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Model</strong></TableCell>
                  <TableCell><strong>Algorithm</strong></TableCell>
                  <TableCell><strong>Accuracy</strong></TableCell>
                  <TableCell><strong>Security Score</strong></TableCell>
                  <TableCell><strong>Speed (ms)</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modelComparisons.map(model => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{model.name}</Typography>
                    </TableCell>
                    <TableCell>{model.algorithm}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={model.accuracy} 
                          sx={{ width: 80, mr: 1 }}
                        />
                        <Typography variant="body2"><strong>{model.accuracy}%</strong></Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SecurityIcon sx={{ mr: 1, color: '#4caf50' }} />
                        <Typography variant="body2">{model.securityScore}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${model.inferenceSpeed}ms`}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={model.status} 
                        color={getStatusColor(model.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                🔒 Security-First ML
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unlike H2O.ai, every model includes built-in security scoring 
                and threat intelligence integration.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                ⚡ Rust Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3x faster inference speed compared to H2O.ai's Java/Python stack.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="warning.main">
                🎯 Cybersecurity Focus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Purpose-built for security teams with specialized threat detection models.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Comparison Chart
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelComparisons}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#4caf50" name="Accuracy %" />
              <Bar dataKey="securityScore" fill="#2196f3" name="Security Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModelComparison;