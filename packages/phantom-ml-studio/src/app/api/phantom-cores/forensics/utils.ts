// Utility functions for Forensics API

import { ApiResponse } from './types';

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success,
    source: 'phantom-forensics-core',
    timestamp: new Date().toISOString()
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (error !== undefined) {
    response.error = error;
  }
  
  return response;
}

/**
 * Generate random case ID
 */
export function generateCaseId(): string {
  return 'CASE-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
}

/**
 * Generate random analysis ID
 */
export function generateAnalysisId(): string {
  return 'forensics-analysis-' + Date.now();
}

/**
 * Generate random timeline ID
 */
export function generateTimelineId(): string {
  return 'timeline-' + Date.now();
}

/**
 * Generate random extraction ID
 */
export function generateExtractionId(): string {
  return 'artifact-extraction-' + Date.now();
}

/**
 * Generate random report ID
 */
export function generateReportId(): string {
  return 'forensics-report-' + Date.now();
}

/**
 * Generate random number within range
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random percentage between 70-100%
 */
export function randomHighPercentage(): number {
  return Math.random() * 0.3 + 0.7;
}

/**
 * Generate random file size string
 */
export function generateRandomSize(min: number, max: number, unit: string = 'GB'): string {
  return randomInRange(min, max) + ' ' + unit;
}

/**
 * Generate random hash string
 */
export function generateHash(): string {
  const chars = '0123456789abcdef';
  let hash = 'sha256:';
  for (let i = 0; i < 12; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  hash += '...';
  return hash;
}

/**
 * Handle API errors consistently
 */
export function handleError(error: unknown): ApiResponse {
  console.error('Phantom Forensics API error:', error);
  return createApiResponse(
    false,
    undefined,
    error instanceof Error ? error.message : 'Unknown error'
  );
}

/**
 * Log operation for debugging
 */
export function logOperation(operation: string, params?: any): void {
  console.log('Forensics API - Received operation:', operation);
  if (params) {
    console.log('Forensics API - Parameters:', JSON.stringify(params, null, 2));
  }
}
