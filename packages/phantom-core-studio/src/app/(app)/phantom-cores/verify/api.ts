// API functions for Phantom Cores verification

import { VerificationResponse, TestApiParams } from './types';
import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';

export const fetchVerificationResults = async (): Promise<VerificationResponse> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/verify');
  if (!response.ok) {
    throw new Error('Failed to fetch verification results');
  }
  return response.json();
};

export const testSpecificApi = async (data: TestApiParams) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/verify', {
    operation: 'test-api',
    ...data
  });
  return response.json();
};
