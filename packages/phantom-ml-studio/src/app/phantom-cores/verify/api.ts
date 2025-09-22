// API functions for Phantom Cores verification

import { VerificationResponse, TestApiParams } from './types';

export const fetchVerificationResults = async (): Promise<VerificationResponse> => {
  const response = await fetch('/api/phantom-cores/verify');
  if (!response.ok) {
    throw new Error('Failed to fetch verification results');
  }
  return response.json();
};

export const testSpecificApi = async (data: TestApiParams) => {
  const response = await fetch('/api/phantom-cores/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'test-api',
      ...data
    })
  });
  return response.json();
};
