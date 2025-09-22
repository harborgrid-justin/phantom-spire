// Types and interfaces for Phantom Cores verification

export interface VerificationResult {
  packageName: string;
  status: 'accessible' | 'error' | 'warning';
  importError?: string;
  availableApis: string[];
  expectedApis?: string[];
  apiCoverage: number;
  coreInstance: boolean;
  enterpriseFeatures: string[] | number;
  testResults: {
    totalTests: number;
    passed: number;
    failed?: number;
    details?: Array<{
      api: string;
      status: 'passed' | 'failed' | 'warning';
      responseTime: number;
      result?: string;
      error?: string;
      reason?: string;
    }>;
    tests?: Array<{
      api: string;
      status: 'passed' | 'failed' | 'warning';
      result?: string;
      error?: string;
      reason?: string;
    }>;
  };
}

// Enterprise method verification result
export interface EnterpriseMethodResult {
  status: 'accessible' | 'error' | 'timeout';
  responseTime: number;
  errorMessage?: string;
  testResults?: any;
}

// Enterprise methods breakdown
export interface EnterpriseMethodsVerification {
  total: number;
  accessible: number;
  errors: number;
  timeouts: number;
  successRate: string;
  results: Record<string, EnterpriseMethodResult>;
  categories: {
    modelManagement: {
      methods: string[];
      results: Record<string, EnterpriseMethodResult>;
    };
    analytics: {
      methods: string[];
      results: Record<string, EnterpriseMethodResult>;
    };
    realTimeProcessing: {
      methods: string[];
      results: Record<string, EnterpriseMethodResult>;
    };
    enterpriseFeatures: {
      methods: string[];
      results: Record<string, EnterpriseMethodResult>;
    };
    businessIntelligence: {
      methods: string[];
      results: Record<string, EnterpriseMethodResult>;
    };
  };
}

// Phantom cores verification
export interface PhantomCoresVerification {
  totalCores: number;
  accessible: number;
  errors: number;
  successRate: string;
  results: Record<string, VerificationResult>;
}

export interface VerificationResponse {
  timestamp: string;
  totalCores: number;
  verificationResults: Record<string, VerificationResult>;
  verificationDuration?: number;
  
  // New comprehensive verification data
  enterpriseMethods?: EnterpriseMethodsVerification;
  phantomCores?: PhantomCoresVerification;
  
  summary: {
    accessible: number;
    errors: number;
    warnings?: number;
    // New summary fields
    totalApiEndpoints?: number;
    accessibleEndpoints?: number;
    errorEndpoints?: number;
    timeoutEndpoints?: number;
    overallSuccessRate?: string;
  };
  
  // API error handling
  error?: {
    type: string;
    message: string;
  };
  
  message?: string;
}

export interface TestApiParams {
  coreName: string;
  apiName: string;
  parameters?: any;
}
