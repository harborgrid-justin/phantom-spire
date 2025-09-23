// Crypto Management Types and Interfaces

export interface CryptoStatus {
  success: boolean;
  data?: {
    status: string;
    components: Record<string, any>;
    metrics: {
      uptime: string;
      analyzed_samples: number;
      cipher_detection_rate: number;
      encryption_strength: number;
    };
  };
}

export interface CryptoAnalysis {
  analysis_id: string;
  cipher_profile: {
    algorithm_type: string;
    encryption_strength: string;
    cipher_family: string;
    confidence_score: number;
  };
  cryptographic_assessment: any;
  vulnerability_analysis: any;
  recommendations: string[];
}

export interface CryptographyAnalysisRequest {
  analysis_type: string;
  algorithm_family: string;
  analysis_depth: string;
  include_entropy_analysis: boolean;
  include_pattern_detection: boolean;
  sample_size: string;
}

export interface CipherDetectionRequest {
  sample_type: string;
  detection_algorithms: string[];
  confidence_threshold: number;
  include_metadata: boolean;
}

export interface EncryptionAnalysisRequest {
  analysis_type: string;
  algorithms: string[];
  test_vectors: string;
  include_performance_metrics: boolean;
}

export interface CryptoVulnerabilityRequest {
  assessment_scope: string;
  vulnerability_databases: string[];
  include_quantum_resistance: boolean;
  severity_threshold: string;
}

export type AnalysisType = 'cipher_detection' | 'encryption_analysis' | 'hash_analysis' | 'key_analysis' | 'vulnerability_assessment';

export type AlgorithmFamily = 'AES' | 'RSA' | 'DES' | 'Blowfish' | 'ChaCha20' | 'Salsa20' | 'Twofish' | 'RC4' | 'MD5' | 'SHA';
