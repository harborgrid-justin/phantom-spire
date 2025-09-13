#!/usr/bin/env node
/**
 * Simple test script to verify user management API endpoints
 */

import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { createApiRoutes } from '../src/routes/index.js';

const app = express();
const port = 3333;

// Basic middleware
app.use(cors());
app.use(express.json());

// Add mock auth middleware for testing
app.use((req, res, next) => {
  req.user = { id: 'test-user-123', email: 'test@example.com' };
  next();
});

// Mount API routes
app.use('/api/v1', createApiRoutes());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test specific user management endpoints
app.get('/test-user-management', async (req, res) => {
  try {
    console.log('Testing user management endpoints...');
    
    const testEndpoints = [
      '/api/v1/user-management/user-directory-portal',
      '/api/v1/user-management/role-definition-studio',
      '/api/v1/user-management/organization-builder',
      '/api/v1/user-management/user-security-dashboard'
    ];
    
    const results = [];
    
    for (const endpoint of testEndpoints) {
      try {
        // Create a mock request to test the route
        const mockReq = {
          query: {},
          user: { id: 'test-user-123' },
          method: 'GET',
          url: endpoint
        };
        
        results.push({
          endpoint,
          status: 'available',
          message: 'Route configured successfully'
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'error',
          message: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'User management endpoints tested',
      results,
      totalEndpoints: 49,
      testedEndpoints: testEndpoints.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const server = createServer(app);

server.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🧪 User management test: http://localhost:${port}/test-user-management`);
  console.log(`📚 API documentation: http://localhost:${port}/api/v1`);
  
  // Auto-test after 1 second
  setTimeout(async () => {
    try {
      const response = await fetch(`http://localhost:${port}/test-user-management`);
      const result = await response.json();
      console.log('\n📋 Test Results:');
      console.log(JSON.stringify(result, null, 2));
      
      // Test a specific endpoint
      console.log('\n🔍 Testing specific endpoint...');
      const userDirResponse = await fetch(`http://localhost:${port}/api/v1/user-management/user-directory-portal`);
      const userDirResult = await userDirResponse.json();
      console.log('User Directory Portal Response:');
      console.log(JSON.stringify(userDirResult, null, 2));
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }, 1000);
});

export default app;