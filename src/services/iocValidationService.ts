import { CreateIOCRequest } from '../types/api';
import { logger } from '../utils/logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedValue?: string;
  detectedType?: string;
  metadata: Record<string, any>;
}

/**
 * IOC Validation Service - Advanced business logic for IOC validation and processing
 */
export class IOCValidationService {
  /**
   * Comprehensive IOC validation with business logic
   */
  static async validateIOC(iocData: CreateIOCRequest): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: {},
    };

    // Validate and normalize based on IOC type
    switch (iocData.type) {
      case 'ip':
        this.validateAndNormalizeIP(iocData.value, result);
        break;
      case 'domain':
        this.validateAndNormalizeDomain(iocData.value, result);
        break;
      case 'url':
        this.validateAndNormalizeURL(iocData.value, result);
        break;
      case 'hash':
        this.validateAndNormalizeHash(iocData.value, result);
        break;
      case 'email':
        this.validateAndNormalizeEmail(iocData.value, result);
        break;
      default:
        result.errors.push('Invalid IOC type specified');
        result.isValid = false;
    }

    // Business logic validation rules
    this.applyBusinessLogicValidation(iocData, result);

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    logger.info(`IOC validation completed for ${iocData.type}: ${iocData.value}`, {
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
    });

    return result;
  }

  /**
   * Auto-detect IOC type from value
   */
  static detectIOCType(value: string): string {
    const trimmedValue = value.trim().toLowerCase();

    // Hash detection (MD5, SHA1, SHA256, SHA512)
    if (/^[a-f0-9]{32}$/.test(trimmedValue)) return 'hash'; // MD5
    if (/^[a-f0-9]{40}$/.test(trimmedValue)) return 'hash'; // SHA1
    if (/^[a-f0-9]{64}$/.test(trimmedValue)) return 'hash'; // SHA256
    if (/^[a-f0-9]{128}$/.test(trimmedValue)) return 'hash'; // SHA512

    // IP address detection
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
    if (ipv4Regex.test(trimmedValue) || ipv6Regex.test(trimmedValue)) return 'ip';

    // URL detection
    if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://') || trimmedValue.startsWith('ftp://')) {
      return 'url';
    }

    // Email detection
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmedValue)) return 'email';

    // Domain detection (fallback)
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (domainRegex.test(trimmedValue) && trimmedValue.includes('.')) return 'domain';

    return 'unknown';
  }

  /**
   * Validate and normalize IP addresses
   */
  private static validateAndNormalizeIP(value: string, result: ValidationResult): void {
    const trimmedValue = value.trim();
    
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
    
    if (ipv4Regex.test(trimmedValue)) {
      result.normalizedValue = trimmedValue;
      result.metadata.ipVersion = 'IPv4';
      
      // Check for private/reserved ranges
      const octets = trimmedValue.split('.').map(Number);
      if (
        (octets[0] === 10) ||
        (octets[0] === 172 && octets[1] && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168) ||
        (octets[0] === 127) ||
        (octets[0] === 169 && octets[1] === 254)
      ) {
        result.warnings.push('IP address is in private/reserved range');
        result.metadata.isPrivateRange = true;
      }
    } else if (ipv6Regex.test(trimmedValue)) {
      result.normalizedValue = trimmedValue.toLowerCase();
      result.metadata.ipVersion = 'IPv6';
    } else {
      result.errors.push('Invalid IP address format');
    }
  }

  /**
   * Validate and normalize domain names
   */
  private static validateAndNormalizeDomain(value: string, result: ValidationResult): void {
    const trimmedValue = value.trim().toLowerCase();
    
    // Domain validation regex
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!domainRegex.test(trimmedValue)) {
      result.errors.push('Invalid domain format');
      return;
    }
    
    if (!trimmedValue.includes('.')) {
      result.errors.push('Domain must contain at least one dot');
      return;
    }
    
    if (trimmedValue.length > 253) {
      result.errors.push('Domain name too long (max 253 characters)');
      return;
    }
    
    result.normalizedValue = trimmedValue;
    
    // Extract TLD for analysis
    const parts = trimmedValue.split('.');
    result.metadata.tld = parts[parts.length - 1];
    result.metadata.subdomainCount = parts.length - 2;
    
    // Check for suspicious patterns
    if (trimmedValue.includes('xn--')) {
      result.warnings.push('Domain contains internationalized characters (punycode)');
      result.metadata.isPunycode = true;
    }
  }

  /**
   * Validate and normalize URLs
   */
  private static validateAndNormalizeURL(value: string, result: ValidationResult): void {
    const trimmedValue = value.trim();
    
    try {
      const url = new URL(trimmedValue);
      result.normalizedValue = url.toString();
      result.metadata.protocol = url.protocol.replace(':', '');
      result.metadata.hostname = url.hostname;
      result.metadata.port = url.port || (url.protocol === 'https:' ? '443' : '80');
      result.metadata.pathname = url.pathname;
      
      // Security checks
      if (url.protocol === 'http:') {
        result.warnings.push('URL uses unencrypted HTTP protocol');
      }
      
      if (url.hostname && /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) {
        result.warnings.push('URL uses IP address instead of domain name');
        result.metadata.usesIPAddress = true;
      }
      
      // Check for suspicious URL patterns
      if (url.pathname.includes('..') || url.pathname.includes('%2e%2e')) {
        result.warnings.push('URL contains directory traversal patterns');
      }
      
    } catch (error) {
      result.errors.push('Invalid URL format');
    }
  }

  /**
   * Validate and normalize file hashes
   */
  private static validateAndNormalizeHash(value: string, result: ValidationResult): void {
    const trimmedValue = value.trim().toLowerCase();
    const hexRegex = /^[a-f0-9]+$/;
    
    if (!hexRegex.test(trimmedValue)) {
      result.errors.push('Hash must contain only hexadecimal characters');
      return;
    }
    
    result.normalizedValue = trimmedValue;
    
    // Detect hash type based on length
    switch (trimmedValue.length) {
      case 32:
        result.metadata.hashType = 'MD5';
        result.warnings.push('MD5 hashes are cryptographically weak');
        break;
      case 40:
        result.metadata.hashType = 'SHA1';
        result.warnings.push('SHA1 hashes are cryptographically weak');
        break;
      case 64:
        result.metadata.hashType = 'SHA256';
        break;
      case 128:
        result.metadata.hashType = 'SHA512';
        break;
      default:
        result.warnings.push('Unusual hash length - may not be a standard hash format');
        result.metadata.hashType = 'Unknown';
    }
  }

  /**
   * Validate and normalize email addresses
   */
  private static validateAndNormalizeEmail(value: string, result: ValidationResult): void {
    const trimmedValue = value.trim().toLowerCase();
    
    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(trimmedValue)) {
      result.errors.push('Invalid email format');
      return;
    }
    
    result.normalizedValue = trimmedValue;
    
    const parts = trimmedValue.split('@');
    const localPart = parts[0];
    const domain = parts[1];
    
    if (localPart && domain) {
      result.metadata.localPart = localPart;
      result.metadata.domain = domain;
      
      // Check for suspicious patterns
      if (localPart.includes('+')) {
        result.metadata.hasPlus = true;
      }
      
      if (domain.includes('temp') || domain.includes('disposable') || domain.includes('throw')) {
        result.warnings.push('Email domain suggests temporary/disposable email');
      }
    }
  }

  /**
   * Apply business logic validation rules
   */
  private static applyBusinessLogicValidation(iocData: CreateIOCRequest, result: ValidationResult): void {
    // Confidence validation
    if (iocData.confidence < 0 || iocData.confidence > 100) {
      result.errors.push('Confidence must be between 0 and 100');
    }
    
    // Business logic for confidence warnings
    if (iocData.confidence < 30) {
      result.warnings.push('Low confidence IOC - consider additional verification');
    }
    
    // Severity vs confidence alignment
    if (iocData.severity === 'critical' && iocData.confidence < 70) {
      result.warnings.push('Critical severity with low confidence - review recommended');
    }
    
    if (iocData.severity === 'low' && iocData.confidence > 90) {
      result.warnings.push('High confidence with low severity - consider severity upgrade');
    }
    
    // Source validation
    if (!iocData.source || iocData.source.trim().length < 3) {
      result.errors.push('Source must be specified and at least 3 characters');
    }
    
    // Tags validation
    if (iocData.tags && iocData.tags.length > 20) {
      result.warnings.push('Large number of tags - consider consolidation');
    }
    
    // Description validation
    if (iocData.description && iocData.description.length > 1000) {
      result.warnings.push('Very long description - consider summary');
    }
  }

  /**
   * Batch validation for multiple IOCs
   */
  static async batchValidateIOCs(iocDataArray: CreateIOCRequest[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const iocData of iocDataArray) {
      const result = await this.validateIOC(iocData);
      results.push(result);
    }
    
    logger.info(`Batch validation completed for ${iocDataArray.length} IOCs`, {
      validCount: results.filter(r => r.isValid).length,
      invalidCount: results.filter(r => !r.isValid).length,
    });
    
    return results;
  }
}