/**
 * Swagger UI Documentation Page
 * Interactive API documentation using Swagger UI
 */
'use client';

import React, { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Box, Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';

export default function DocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      try {
        const response = await fetch('/api/docs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch API specification: ${response.statusText}`);
        }
        
        const specData = await response.json();
        setSpec(specData);
      } catch (err) {
        console.error('Error fetching API spec:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
      } finally {
        setLoading(false);
      }
    }

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading API Documentation...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Failed to Load API Documentation
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Paper elevation={0} sx={{ mb: 3, p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Phantom ML Studio API Documentation
        </Typography>
        <Typography variant="h6" component="p">
          Comprehensive API documentation for the enterprise-grade ML platform with cybersecurity intelligence
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ overflow: 'hidden' }}>
        <Box sx={{ '& .swagger-ui': { fontFamily: 'inherit' } }}>
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={2}
            defaultModelExpandDepth={2}
            displayRequestDuration={true}
            tryItOutEnabled={true}
            requestInterceptor={(req) => {
              // Add any custom headers or authentication here
              req.headers['Content-Type'] = 'application/json';
              return req;
            }}
            responseInterceptor={(res) => {
              // Handle responses if needed
              return res;
            }}
            onComplete={() => {
              console.log('Swagger UI loaded successfully');
            }}
            plugins={[
              // Add any custom Swagger UI plugins here
            ]}
            supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
            validatorUrl={null} // Disable online validator
            layout="BaseLayout"
            deepLinking={true}
            showExtensions={true}
            showCommonExtensions={true}
            filter={true} // Enable filtering
          />
        </Box>
      </Paper>
    </Container>
  );
}
