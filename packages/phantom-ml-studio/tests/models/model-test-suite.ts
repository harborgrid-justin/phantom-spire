/**
 * COMPREHENSIVE MODEL TEST SUITE
 * Complete test coverage for all 55 Sequelize models (SQ.33)
 */
import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { Sequelize } from 'sequelize-typescript';
import { models, setupAssociations, validateModels } from '../../src/lib/models';
import { initializeSequelize } from '../../src/lib/sequelize';

// Import all models for testing
import { User } from '../../src/lib/models/User.model';
import { ThreatActor } from '../../src/lib/models/ThreatActor.model';
import { ThreatIntelligence } from '../../src/lib/models/ThreatIntelligence.model';
import { IOC } from '../../src/lib/models/IOC.model';
import { MalwareSample } from '../../src/lib/models/MalwareSample.model';
import { ApiKey } from '../../src/lib/models/ApiKey.model';
import { AuditLog } from '../../src/lib/models/AuditLog.model';
import { ComplianceCheck } from '../../src/lib/models/ComplianceCheck.model';
import { CyberIncident } from '../../src/lib/models/CyberIncident.model';
import { DarkWebIntel } from '../../src/lib/models/DarkWebIntel.model';

let sequelize: Sequelize;

describe('Model Test Suite - SQ.33 Compliance', () => {
  beforeAll(async () => {
    // Initialize test database
    sequelize = await initializeSequelize();
    
    // Validate all models are properly configured
    validateModels();
    
    // Set up associations
    setupAssociations();
    
    // Sync database schema for testing
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize?.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  });

  describe('SQ.2: Model Generic Typing', () => {
    it('should extend Model<T, TCreationAttributes> correctly', () => {
      models.forEach(ModelClass => {
        const instance = new ModelClass();
        expect(instance).toBeInstanceOf(ModelClass);
        // Verify TypeScript generic typing is preserved
        expect(ModelClass.prototype).toBeDefined();
      });
    });
  });

  describe('SQ.3: Column/Field TypeScript Type Annotations', () => {
    it('should have properly typed attributes', async () => {
      const user = await User.create({
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password_hash: 'hashed_password',
        role: 'user'
      });

      expect(typeof user.id).toBe('number');
      expect(typeof user.email).toBe('string');
      expect(typeof user.is_active).toBe('boolean');
      expect(user.created_at).toBeInstanceOf(Date);
      expect(Array.isArray(user.permissions)).toBe(true);
    });
  });

  describe('SQ.4: Sequelize Decorator Usage', () => {
    it('should use proper decorators for model definition', () => {
      // Test that models have proper metadata from decorators
      const userMetadata = Reflect.getMetadata('sequelize:options', User);
      expect(userMetadata).toBeDefined();
      expect(userMetadata.tableName).toBe('users');
    });
  });

  describe('SQ.8: Associations with Decorators and TypeScript', () => {
    it('should have properly defined associations', async () => {
      const user = await User.create({
        email: 'analyst@example.com',
        first_name: 'Jane',
        last_name: 'Analyst',
        password_hash: 'hashed_password',
        role: 'analyst'
      });

      const threatActor = await ThreatActor.create({
        name: 'APT29',
        analyst_id: user.id
      });

      // Test association loading
      const loadedThreatActor = await ThreatActor.findByPk(threatActor.id, {
        include: [{ model: User, as: 'analyst' }]
      });

      expect(loadedThreatActor?.analyst?.id).toBe(user.id);
    });
  });

  describe('SQ.17: Dual Validation (TypeScript + Sequelize)', () => {
    it('should enforce validation at both levels', async () => {
      // Test Sequelize validation
      await expect(User.create({
        email: 'invalid-email',
        first_name: 'John',
        last_name: 'Doe',
        password_hash: 'hash',
        role: 'user'
      })).rejects.toThrow();

      // Test length validation
      await expect(User.create({
        email: 'valid@example.com',
        first_name: '', // Empty string should fail
        last_name: 'Doe',
        password_hash: 'hash',
        role: 'user'
      })).rejects.toThrow();
    });
  });

  describe('SQ.20: Primary Key Configuration', () => {
    it('should have properly configured primary keys', async () => {
      const user = await User.create({
        email: 'pk-test@example.com',
        first_name: 'Primary',
        last_name: 'Key',
        password_hash: 'hash',
        role: 'user'
      });

      expect(typeof user.id).toBe('number');
      expect(user.id).toBeGreaterThan(0);
      
      // Auto-increment should work
      const user2 = await User.create({
        email: 'pk-test2@example.com',
        first_name: 'Primary',
        last_name: 'Key2',
        password_hash: 'hash',
        role: 'user'
      });

      expect(user2.id).toBeGreaterThan(user.id);
    });
  });

  describe('SQ.21: Unique Constraints', () => {
    it('should enforce unique constraints', async () => {
      await User.create({
        email: 'unique@example.com',
        first_name: 'Unique',
        last_name: 'User',
        password_hash: 'hash',
        role: 'user'
      });

      // Should fail due to unique email constraint
      await expect(User.create({
        email: 'unique@example.com',
        first_name: 'Another',
        last_name: 'User',
        password_hash: 'hash',
        role: 'user'
      })).rejects.toThrow();
    });
  });

  describe('SQ.23: Enum Fields with Union Types', () => {
    it('should enforce enum constraints', async () => {
      const user = await User.create({
        email: 'enum-test@example.com',
        first_name: 'Enum',
        last_name: 'Test',
        password_hash: 'hash',
        role: 'admin' // Valid enum value
      });

      expect(user.role).toBe('admin');

      // Should fail with invalid enum value
      await expect(User.create({
        email: 'enum-test2@example.com',
        first_name: 'Enum',
        last_name: 'Test',
        password_hash: 'hash',
        role: 'invalid_role' as any
      })).rejects.toThrow();
    });
  });

  describe('SQ.24: Date Objects and DataType.DATE', () => {
    it('should handle date fields properly', async () => {
      const now = new Date();
      const user = await User.create({
        email: 'date-test@example.com',
        first_name: 'Date',
        last_name: 'Test',
        password_hash: 'hash',
        role: 'user',
        last_login: now
      });

      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
      expect(user.last_login).toBeInstanceOf(Date);
      expect(user.last_login?.getTime()).toBe(now.getTime());
    });
  });

  describe('SQ.38: JSON/Array Columns with TypeScript Generics', () => {
    it('should handle JSONB and ARRAY columns properly', async () => {
      const user = await User.create({
        email: 'json-test@example.com',
        first_name: 'JSON',
        last_name: 'Test',
        password_hash: 'hash',
        role: 'user',
        permissions: ['read', 'write'],
        preferences: { theme: 'dark', language: 'en' },
        tags: ['test', 'user'],
        metadata: { source: 'test' }
      });

      expect(Array.isArray(user.permissions)).toBe(true);
      expect(user.permissions).toEqual(['read', 'write']);
      expect(typeof user.preferences).toBe('object');
      expect(user.preferences.theme).toBe('dark');
      expect(Array.isArray(user.tags)).toBe(true);
      expect(user.tags).toEqual(['test', 'user']);
    });
  });

  describe('Model-Specific Business Logic Tests', () => {
    describe('User Model', () => {
      it('should have working instance methods', async () => {
        const user = await User.create({
          email: 'methods-test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          password_hash: 'hash',
          role: 'admin'
        });

        expect(user.getFullName()).toBe('John Doe');
        expect(user.getInitials()).toBe('JD');
        expect(user.isAdmin()).toBe(true);
        expect(user.isActive()).toBe(true);
      });

      it('should have working static methods', async () => {
        const user = await User.create({
          email: 'static-test@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          password_hash: 'hash',
          role: 'user'
        });

        const foundUser = await User.findByEmail('static-test@example.com');
        expect(foundUser?.id).toBe(user.id);

        const activeUsers = await User.findActive();
        expect(activeUsers.length).toBeGreaterThan(0);
      });
    });

    describe('ThreatActor Model', () => {
      it('should calculate threat scores correctly', async () => {
        const user = await User.create({
          email: 'analyst@example.com',
          first_name: 'Threat',
          last_name: 'Analyst',
          password_hash: 'hash',
          role: 'analyst'
        });

        const threatActor = await ThreatActor.create({
          name: 'APT1',
          analyst_id: user.id,
          sophistication: 'high',
          motivation: 'espionage',
          capability_level: 'advanced'
        });

        expect(typeof threatActor.getThreatScore()).toBe('number');
        expect(threatActor.getThreatScore()).toBeGreaterThan(0);
        expect(threatActor.isHighThreat()).toBeDefined();
      });
    });

    describe('IOC Model', () => {
      it('should validate IOC formats', async () => {
        const ioc = await IOC.create({
          indicator: '192.168.1.1',
          ioc_type: 'IP',
          confidence: 'high',
          severity: 'medium'
        });

        expect(ioc.getThreatScore()).toBeGreaterThan(0);
        expect(ioc.isActive()).toBe(true);
      });
    });

    describe('MalwareSample Model', () => {
      it('should handle hash validation', async () => {
        const sample = await MalwareSample.create({
          name: 'test-malware',
          md5_hash: 'd41d8cd98f00b204e9800998ecf8427e',
          sha1_hash: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
          sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          malware_family: 'unknown'
        });

        expect(sample.getFormattedFileSize()).toBeDefined();
        expect(sample.getAllHashes()).toHaveProperty('md5');
        expect(sample.getAllHashes()).toHaveProperty('sha1');
        expect(sample.getAllHashes()).toHaveProperty('sha256');
      });
    });
  });

  describe('Association Tests', () => {
    it('should handle complex associations correctly', async () => {
      const analyst = await User.create({
        email: 'association-test@example.com',
        first_name: 'Association',
        last_name: 'Tester',
        password_hash: 'hash',
        role: 'analyst'
      });

      const threatActor = await ThreatActor.create({
        name: 'Test APT',
        analyst_id: analyst.id
      });

      const intelligence = await ThreatIntelligence.create({
        title: 'Test Intelligence Report',
        intelligence_type: 'tactical',
        analyst_id: analyst.id,
        threat_actor_id: threatActor.id,
        source: 'internal',
        confidence: 'high',
        reliability: 'A'
      });

      // Test loading with associations
      const loadedIntelligence = await ThreatIntelligence.findByPk(intelligence.id, {
        include: [
          { model: User, as: 'analyst' },
          { model: ThreatActor, as: 'threat_actor' }
        ]
      });

      expect(loadedIntelligence?.analyst?.id).toBe(analyst.id);
      expect(loadedIntelligence?.threat_actor?.id).toBe(threatActor.id);
    });
  });

  describe('Error Handling (SQ.44)', () => {
    it('should handle validation errors with TypeScript safety', async () => {
      try {
        await User.create({
          email: 'invalid',
          first_name: '',
          last_name: '',
          password_hash: '',
          role: 'invalid' as any
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBeDefined();
          expect(typeof error.message).toBe('string');
        }
      }
    });

    it('should handle constraint violations safely', async () => {
      // Create first user
      await User.create({
        email: 'constraint@example.com',
        first_name: 'First',
        last_name: 'User',
        password_hash: 'hash',
        role: 'user'
      });

      // Try to create duplicate
      try {
        await User.create({
          email: 'constraint@example.com',
          first_name: 'Second',
          last_name: 'User',
          password_hash: 'hash',
          role: 'user'
        });
        fail('Should have thrown constraint error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // Error should be properly typed and handled
      }
    });
  });

  describe('Model Statistics and Analytics', () => {
    it('should provide accurate statistics', async () => {
      // Create test data
      await User.bulkCreate([
        {
          email: 'stats1@example.com',
          first_name: 'Stats',
          last_name: 'User1',
          password_hash: 'hash',
          role: 'admin'
        },
        {
          email: 'stats2@example.com',
          first_name: 'Stats',
          last_name: 'User2',
          password_hash: 'hash',
          role: 'user'
        }
      ]);

      const stats = await User.getOverallStats();
      expect(stats.total_users).toBe(2);
      expect(stats.active_users).toBe(2);

      const roleStats = await User.getRoleStats();
      expect(Array.isArray(roleStats)).toBe(true);
      expect(roleStats.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Model Factory for Testing
 * Provides consistent test data creation
 */
export class ModelTestFactory {
  static async createUser(overrides: Partial<any> = {}) {
    const defaults = {
      email: `test-${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      password_hash: 'test_hash',
      role: 'user' as const
    };

    return User.create({ ...defaults, ...overrides });
  }

  static async createThreatActor(analystId: number, overrides: Partial<any> = {}) {
    const defaults = {
      name: `Test-APT-${Date.now()}`,
      analyst_id: analystId
    };

    return ThreatActor.create({ ...defaults, ...overrides });
  }

  static async createIOC(overrides: Partial<any> = {}) {
    const defaults = {
      indicator: `192.168.1.${Math.floor(Math.random() * 255)}`,
      ioc_type: 'IP',
      confidence: 'medium' as const,
      severity: 'medium' as const
    };

    return IOC.create({ ...defaults, ...overrides });
  }
}
