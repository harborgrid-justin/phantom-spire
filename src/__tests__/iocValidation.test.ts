import { IOCValidationService } from '../services/iocValidationService.js';
import { CreateIOCRequest } from '../types/api.js';

describe('IOCValidationService', () => {
  describe('validateIOC', () => {
    it('should validate valid IP address', async () => {
      const iocData: CreateIOCRequest = {
        value: '192.168.1.1',
        type: 'ip',
        confidence: 80,
        severity: 'medium',
        source: 'test-source',
        tags: ['test'],
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(true);
      expect(result.normalizedValue).toBe('192.168.1.1');
      expect(result.metadata?.ipVersion).toBe('IPv4');
      expect(result.metadata?.isPrivateRange).toBe(true);
      expect(result.warnings).toContain(
        'IP address is in private/reserved range'
      );
    });

    it('should validate valid domain', async () => {
      const iocData: CreateIOCRequest = {
        value: 'example.com',
        type: 'domain',
        confidence: 90,
        severity: 'high',
        source: 'test-source',
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(true);
      expect(result.normalizedValue).toBe('example.com');
      expect(result.metadata?.tld).toBe('com');
      expect(result.metadata?.subdomainCount).toBe(0);
    });

    it('should validate valid URL', async () => {
      const iocData: CreateIOCRequest = {
        value: 'https://evil-site.com/malware.exe',
        type: 'url',
        confidence: 95,
        severity: 'critical',
        source: 'test-source',
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(true);
      expect(result.metadata?.protocol).toBe('https');
      expect(result.metadata?.hostname).toBe('evil-site.com');
      expect(result.metadata?.pathname).toBe('/malware.exe');
    });

    it('should validate valid hash', async () => {
      const iocData: CreateIOCRequest = {
        value:
          'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        type: 'hash',
        confidence: 100,
        severity: 'critical',
        source: 'malware-analysis',
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(true);
      expect(result.metadata?.hashType).toBe('SHA256');
    });

    it('should validate valid email', async () => {
      const iocData: CreateIOCRequest = {
        value: 'attacker@evil.com',
        type: 'email',
        confidence: 75,
        severity: 'medium',
        source: 'spam-filter',
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(true);
      expect(result.normalizedValue).toBe('attacker@evil.com');
      expect(result.metadata?.localPart).toBe('attacker');
      expect(result.metadata?.domain).toBe('evil.com');
    });

    it('should reject invalid IOC data', async () => {
      const iocData: CreateIOCRequest = {
        value: 'invalid-ip',
        type: 'ip',
        confidence: 120, // Invalid confidence > 100
        severity: 'medium',
        source: '', // Empty source
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Invalid IP address format');
      expect(result.errors).toContain('Confidence must be between 0 and 100');
      expect(result.errors).toContain(
        'Source must be specified and at least 3 characters'
      );
    });

    it('should warn about confidence/severity misalignment', async () => {
      const iocData: CreateIOCRequest = {
        value: 'test.com',
        type: 'domain',
        confidence: 30, // Low confidence
        severity: 'critical', // But critical severity
        source: 'test-source',
      };

      const result = await IOCValidationService.validateIOC(iocData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        'Critical severity with low confidence - review recommended'
      );
    });
  });

  describe('detectIOCType', () => {
    it('should detect IP addresses', () => {
      expect(IOCValidationService.detectIOCType('192.168.1.1')).toBe('ip');
      expect(IOCValidationService.detectIOCType('10.0.0.1')).toBe('ip');
    });

    it('should detect domains', () => {
      expect(IOCValidationService.detectIOCType('example.com')).toBe('domain');
      expect(IOCValidationService.detectIOCType('sub.domain.org')).toBe(
        'domain'
      );
    });

    it('should detect URLs', () => {
      expect(IOCValidationService.detectIOCType('http://example.com')).toBe(
        'url'
      );
      expect(
        IOCValidationService.detectIOCType('https://malware.site/evil.exe')
      ).toBe('url');
    });

    it('should detect hashes', () => {
      expect(
        IOCValidationService.detectIOCType('d41d8cd98f00b204e9800998ecf8427e')
      ).toBe('hash'); // MD5
      expect(
        IOCValidationService.detectIOCType(
          'da39a3ee5e6b4b0d3255bfef95601890afd80709'
        )
      ).toBe('hash'); // SHA1
      expect(
        IOCValidationService.detectIOCType(
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        )
      ).toBe('hash'); // SHA256
    });

    it('should detect emails', () => {
      expect(IOCValidationService.detectIOCType('user@example.com')).toBe(
        'email'
      );
      expect(
        IOCValidationService.detectIOCType('test.email+tag@domain.org')
      ).toBe('email');
    });

    it('should return unknown for unrecognized patterns', () => {
      expect(IOCValidationService.detectIOCType('not-an-ioc')).toBe('unknown');
      expect(IOCValidationService.detectIOCType('12345')).toBe('unknown');
    });
  });

  describe('batchValidateIOCs', () => {
    it('should validate multiple IOCs', async () => {
      const iocs: CreateIOCRequest[] = [
        {
          value: '192.168.1.1',
          type: 'ip',
          confidence: 80,
          severity: 'medium',
          source: 'test-source',
        },
        {
          value: 'example.com',
          type: 'domain',
          confidence: 90,
          severity: 'high',
          source: 'test-source',
        },
        {
          value: 'invalid-data',
          type: 'ip',
          confidence: 50,
          severity: 'low',
          source: 'test-source',
        },
      ];

      const results = await IOCValidationService.batchValidateIOCs(iocs);

      expect(results).toHaveLength(3);
      expect(results[0]!.isValid).toBe(true); // Valid IP
      expect(results[1]!.isValid).toBe(true); // Valid domain
      expect(results[2]!.isValid).toBe(false); // Invalid IP
    });
  });
});
