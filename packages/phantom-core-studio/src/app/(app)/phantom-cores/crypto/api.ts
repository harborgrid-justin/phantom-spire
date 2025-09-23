// API functions for Crypto Management

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';
import {
  CryptoStatus,
  CryptographyAnalysisRequest,
  CipherDetectionRequest,
  EncryptionAnalysisRequest,
  CryptoVulnerabilityRequest
} from './types';

export const fetchCryptoStatus = async (): Promise<CryptoStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/crypto?operation=status');
  return response.json();
};

export const analyzeCryptography = async (analysisData: CryptographyAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/crypto', {
    operation: 'analyze-crypto',
    analysisData
  });
  return response.json();
};

export const detectCipher = async (cipherData: CipherDetectionRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/crypto', {
    operation: 'detect-cipher',
    cipherData
  });
  return response.json();
};

export const analyzeEncryption = async (encryptionData: EncryptionAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/crypto', {
    operation: 'analyze-encryption',
    encryptionData
  });
  return response.json();
};

export const assessCryptoVulnerabilities = async (vulnData: CryptoVulnerabilityRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/crypto', {
    operation: 'assess-vulnerabilities',
    vulnData
  });
  return response.json();
};
