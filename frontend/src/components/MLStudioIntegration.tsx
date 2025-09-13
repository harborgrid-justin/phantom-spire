import React from 'react';
import { Card, CardContent, Typography, Button, Box, Alert, AlertTitle } from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';

const MLStudioIntegration: React.FC = () => {
  const openMLStudio = () => {
    // Open ML Studio in new tab
    window.open('http://localhost:3000', '_blank');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🧠 Phantom ML Studio
        </Typography>
        
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>H2O.ai Competitive AutoML Platform</AlertTitle>
          Security-first machine learning with threat detection models
        </Alert>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Advanced AutoML platform specifically designed for cybersecurity teams. 
          Build, train, and deploy threat detection models with no coding required.
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Key Features:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            • Automated model training for threat detection<br />
            • Real-time model comparison and benchmarking<br />
            • Security-focused model templates and metrics<br />
            • Rust-powered performance (3x faster than H2O.ai)<br />
            • Built-in bias detection and explainability
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          startIcon={<LaunchIcon />}
          onClick={openMLStudio}
          sx={{ mt: 2 }}
        >
          Launch ML Studio
        </Button>
      </CardContent>
    </Card>
  );
};

export default MLStudioIntegration;