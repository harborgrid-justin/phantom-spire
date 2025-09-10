/**
 * Test for Phantom CVE Core Plugin Multi-Database Implementation
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { 
  initializePhantomCVECore, 
  getCVECoreStatus, 
  healthCheckCVECore,
  generateSetupGuide 
} from '../src/plugins/cveCore.js';
import { 
  loadCVECoreConfig, 
  validateConfiguration, 
  getConfigurationSummary 
} from '../src/config/cveDataConfig.js';

describe('Phantom CVE Core Plugin Multi-Database Support', () => {
  describe('Configuration Loading', () => {
    it('should load configuration from environment', () => {
      const config = loadCVECoreConfig();
      
      expect(config).toBeDefined();
      expect(config.databases).toBeDefined();
      expect(config.dataStrategy).toBeDefined();
      expect(config.saasFeatures).toBeDefined();
    });

    it('should validate configuration correctly', () => {
      const config = loadCVECoreConfig();
      const validation = validateConfiguration(config);
      
      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.warnings).toBeInstanceOf(Array);
      expect(validation.errors).toBeInstanceOf(Array);
      expect(validation.recommendations).toBeInstanceOf(Array);
    });

    it('should generate configuration summary', () => {
      const config = loadCVECoreConfig();
      const summary = getConfigurationSummary(config);
      
      expect(summary).toBeDefined();
      expect(summary.businessSaasReadiness).toBeDefined();
      expect(summary.databases).toBeDefined();
      expect(summary.capabilities).toBeInstanceOf(Array);
      expect(summary.businessSaasReadiness.level).toMatch(/basic|professional|enterprise/);
    });
  });

  describe('Plugin Status and Health', () => {
    it('should get CVE core status', () => {
      const status = getCVECoreStatus();
      
      expect(status).toBeDefined();
      expect(status.initialized).toBeDefined();
    });

    it('should perform health check', async () => {
      const health = await healthCheckCVECore();
      
      expect(health).toBeDefined();
      expect(health.status).toMatch(/healthy|unhealthy/);
      expect(health.timestamp).toBeDefined();
    });
  });

  describe('Setup Guide Generation', () => {
    it('should generate setup guide', () => {
      const guide = generateSetupGuide();
      
      expect(guide).toBeDefined();
      expect(guide.title).toBeDefined();
      expect(guide.steps).toBeInstanceOf(Array);
      expect(guide.examples).toBeDefined();
      expect(guide.steps.length).toBeGreaterThan(0);
    });

    it('should include all required setup steps', () => {
      const guide = generateSetupGuide();
      const stepTitles = guide.steps.map(step => step.title);
      
      expect(stepTitles).toContain('Install Dependencies');
      expect(stepTitles).toContain('Setup Database Services');
      expect(stepTitles).toContain('Configure Environment Variables');
      expect(stepTitles).toContain('Initialize Plugin');
      expect(stepTitles).toContain('Test Configuration');
    });
  });

  describe('Multi-Database Support', () => {
    it('should support MongoDB configuration', () => {
      // Set test environment variables
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      
      const config = loadCVECoreConfig();
      
      expect(config.databases.mongodb).toBeDefined();
      if (config.databases.mongodb) {
        expect(config.databases.mongodb.enabled).toBeDefined();
        expect(config.databases.mongodb.uri).toContain('mongodb://');
      }
    });

    it('should support Redis configuration', () => {
      // Set test environment variables
      process.env.REDIS_URL = 'redis://localhost:6379';
      
      const config = loadCVECoreConfig();
      
      expect(config.databases.redis).toBeDefined();
      if (config.databases.redis) {
        expect(config.databases.redis.enabled).toBeDefined();
      }
    });

    it('should support PostgreSQL configuration', () => {
      // Set test environment variables
      process.env.POSTGRESQL_URI = 'postgresql://postgres:password@localhost:5432/test';
      
      const config = loadCVECoreConfig();
      
      expect(config.databases.postgresql).toBeDefined();
      if (config.databases.postgresql) {
        expect(config.databases.postgresql.enabled).toBeDefined();
      }
    });

    it('should support Elasticsearch configuration', () => {
      // Set test environment variables
      process.env.ELASTICSEARCH_URL = 'http://localhost:9200';
      
      const config = loadCVECoreConfig();
      
      expect(config.databases.elasticsearch).toBeDefined();
      if (config.databases.elasticsearch) {
        expect(config.databases.elasticsearch.enabled).toBeDefined();
      }
    });
  });

  describe('Business SaaS Readiness Assessment', () => {
    it('should calculate SaaS readiness score', () => {
      // Configure for enterprise readiness
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      process.env.REDIS_URL = 'redis://localhost:6379';
      process.env.POSTGRESQL_URI = 'postgresql://localhost:5432/test';
      process.env.ELASTICSEARCH_URL = 'http://localhost:9200';
      process.env.CVE_MULTI_TENANCY = 'true';
      process.env.CVE_AUDIT_LOGGING = 'true';
      process.env.CVE_ENCRYPTION = 'true';
      process.env.CVE_BACKUPS = 'true';
      
      const config = loadCVECoreConfig();
      const summary = getConfigurationSummary(config);
      
      expect(summary.businessSaasReadiness.score).toBeGreaterThan(0);
      expect(summary.businessSaasReadiness.level).toBe('enterprise');
      expect(summary.businessSaasReadiness.features.multiDatabase).toBe(true);
    });

    it('should identify missing capabilities', () => {
      // Reset environment for basic configuration
      delete process.env.REDIS_URL;
      delete process.env.POSTGRESQL_URI;
      delete process.env.ELASTICSEARCH_URL;
      
      const config = loadCVECoreConfig();
      const validation = validateConfiguration(config);
      
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Data Strategy Configuration', () => {
    it('should support different read preferences', () => {
      process.env.CVE_READ_PREFERENCE = 'cache-first';
      
      const config = loadCVECoreConfig();
      
      expect(config.dataStrategy?.readPreference).toBe('cache-first');
    });

    it('should support different write strategies', () => {
      process.env.CVE_WRITE_STRATEGY = 'dual';
      
      const config = loadCVECoreConfig();
      
      expect(config.dataStrategy?.writeStrategy).toBe('dual');
    });

    it('should support consistency levels', () => {
      process.env.CVE_CONSISTENCY_LEVEL = 'eventual';
      
      const config = loadCVECoreConfig();
      
      expect(config.dataStrategy?.consistencyLevel).toBe('eventual');
    });
  });

  afterAll(() => {
    // Clean up test environment variables
    delete process.env.MONGODB_URI;
    delete process.env.REDIS_URL;
    delete process.env.POSTGRESQL_URI;
    delete process.env.ELASTICSEARCH_URL;
    delete process.env.CVE_READ_PREFERENCE;
    delete process.env.CVE_WRITE_STRATEGY;
    delete process.env.CVE_CONSISTENCY_LEVEL;
    delete process.env.CVE_MULTI_TENANCY;
    delete process.env.CVE_AUDIT_LOGGING;
    delete process.env.CVE_ENCRYPTION;
    delete process.env.CVE_BACKUPS;
  });
});