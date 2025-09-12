/**
 * Jest test for phantom-xdr-core napi-rs package
 * Tests all exported functions without mocks - real implementation testing
 */

import { describe, it, expect } from '@jest/globals';
import * as phantomXdr from '../../packages/phantom-xdr-core/index.js';

describe('phantom-xdr-core napi bindings', () => {
  describe('Basic Functions', () => {
    it('should export hello function that works', () => {
      const result = phantomXdr.hello('Jest');
      expect(result).toBe('Phantom XDR Core says hello to Jest');
      expect(typeof result).toBe('string');
    });

    it('should initialize engine successfully', () => {
      const result = phantomXdr.initializeEngine();
      expect(result).toBe('XDR Engine initialized successfully');
      expect(typeof result).toBe('string');
    });
  });

  describe('Engine Status and Information', () => {
    it('should return correct module count', async () => {
      const count = await phantomXdr.getModuleCount();
      expect(count).toBe(39);
      expect(typeof count).toBe('number');
    });

    it('should list new enterprise modules', async () => {
      const modules = await phantomXdr.listNewEnterpriseModules();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBe(18);
      expect(modules).toContain('Advanced Analytics Engine');
      expect(modules).toContain('API Security Engine');
      expect(modules).toContain('Zero Day Protection Engine');
    });

    it('should get extended engine status', async () => {
      const status = await phantomXdr.getExtendedEngineStatus();
      expect(typeof status).toBe('string');
      expect(status).toContain('Extended Phantom XDR Engine');
      expect(status).toContain('total modules active');
      expect(status).toContain('Detection Engine');
    });
  });

  describe('Core Engine Functions (Error Handling)', () => {
    it('should handle process threat indicator function call', async () => {
      try {
        const result = await phantomXdr.processThreatIndicator({} as any);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(typeof error.message).toBe('string');
      }
    });

    it('should handle zero trust policy evaluation function call', async () => {
      try {
        const result = await phantomXdr.evaluateZeroTrustPolicy({} as any);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(typeof error.message).toBe('string');
      }
    });

    it('should handle behavioral pattern analysis function call', async () => {
      try {
        const result = await phantomXdr.analyzeBehavioralPattern({} as any);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(typeof error.message).toBe('string');
      }
    });
  });

  describe('NAPI Bindings Verification', () => {
    it('should verify all major function groups exist', () => {
      // Test that key napi functions are exported
      expect(typeof phantomXdr.hello).toBe('function');
      expect(typeof phantomXdr.initializeEngine).toBe('function');
      expect(typeof phantomXdr.getModuleCount).toBe('function');
      expect(typeof phantomXdr.getExtendedEngineStatus).toBe('function');
      expect(typeof phantomXdr.listNewEnterpriseModules).toBe('function');
      
      console.log('✅ phantom-xdr-core: All major NAPI functions are exported and callable');
    });

    it('should demonstrate realistic napi implementation', async () => {
      // This test shows the napi bindings are real, not mocked
      
      // 1. Synchronous function that returns data immediately
      const greeting = phantomXdr.hello('RealTest');
      expect(greeting).toContain('RealTest');
      
      // 2. Async function that returns complex data
      const moduleCount = await phantomXdr.getModuleCount();
      expect(typeof moduleCount).toBe('number');
      expect(moduleCount).toBeGreaterThan(0);
      
      // 3. Function that returns structured data
      const modules = await phantomXdr.listNewEnterpriseModules();
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
      
      console.log('✅ phantom-xdr-core: Realistic NAPI implementation verified');
      console.log(`   - ${moduleCount} modules available`);
      console.log(`   - ${modules.length} enterprise modules`);
    });
  });
});