// External Services Configuration
export interface ExternalServicesConfig {
  threatIntel: {
    enabled: boolean;
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  malwareAnalysis: {
    enabled: boolean;
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  cveDatabase: {
    enabled: boolean;
    apiKey?: string;
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
}
