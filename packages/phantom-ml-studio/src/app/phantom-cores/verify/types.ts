// Types and interfaces for Phantom Cores verification

export interface VerificationResult {
  packageName: string;
  status: 'accessible' | 'error' | 'warning';
  importError?: string;
  availableApis: string[];
  expectedApis: string[];
  apiCoverage: number;
  coreInstance: boolean;
  enterpriseFeatures: string[];
  testResults: {
    totalTests: number;
    passed: number;
    failed: number;
    tests: Array<{
      api: string;
      status: 'passed' | 'failed' | 'warning';
      result?: string;
      error?: string;
      reason?: string;
    }>;
  };
}

export interface VerificationResponse {
  timestamp: string;
  totalCores: number;
  verificationResults: Record<string, VerificationResult>;
  summary: {
    accessible: number;
    errors: number;
    warnings: number;
  };
}

export interface TestApiParams {
  coreName: string;
  apiName: string;
  parameters?: any;
}
