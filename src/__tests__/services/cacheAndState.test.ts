/**
 * Tests for Fortune 100-Grade Cache and State Management
 */

import { cacheManager } from '../../services/cache/core/EnterpriseCacheManager.js';
import { stateManager } from '../../services/state/core/EnterpriseStateManager.js';
import { StateScope } from '../../services/state/interfaces/IStateManager.js';

describe('Enterprise Cache and State Management', () => {
  beforeAll(async () => {
    // Initialize the management systems for testing
    await cacheManager.start();
    await stateManager.start();
  });

  afterAll(async () => {
    // Cleanup after tests
    await stateManager.stop();
    await cacheManager.stop();
  });

  describe('Enterprise Cache Manager', () => {
    beforeEach(async () => {
      await cacheManager.clear();
    });

    it('should set and get cache values', async () => {
      const key = 'test-key';
      const value = { test: 'data', number: 42 };

      await cacheManager.set(key, value);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should handle cache expiration', async () => {
      const key = 'expiring-key';
      const value = 'test-value';
      const ttl = 100; // 100ms

      await cacheManager.set(key, value, { ttl });
      
      // Should exist immediately
      const immediate = await cacheManager.get(key);
      expect(immediate).toBe(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const expired = await cacheManager.get(key);
      expect(expired).toBeNull();
    });

    it('should support namespaced caching', async () => {
      const key = 'namespaced-key';
      const value1 = 'namespace1-value';
      const value2 = 'namespace2-value';

      await cacheManager.set(key, value1, { namespace: 'ns1' });
      await cacheManager.set(key, value2, { namespace: 'ns2' });

      const retrieved1 = await cacheManager.get(key, { namespace: 'ns1' });
      const retrieved2 = await cacheManager.get(key, { namespace: 'ns2' });

      expect(retrieved1).toBe(value1);
      expect(retrieved2).toBe(value2);
    });

    it('should handle bulk operations', async () => {
      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3']
      ]);

      await cacheManager.setMultiple(entries);
      
      const keys = Array.from(entries.keys());
      const retrieved = await cacheManager.getMultiple(keys);

      expect(retrieved.size).toBe(3);
      expect(retrieved.get('key1')).toBe('value1');
      expect(retrieved.get('key2')).toBe('value2');
      expect(retrieved.get('key3')).toBe('value3');
    });

    it('should provide cache metrics', async () => {
      const key = 'metrics-test';
      const value = 'test-value';

      await cacheManager.set(key, value);
      await cacheManager.get(key); // Generate a hit
      await cacheManager.get('non-existent-key'); // Generate a miss

      const metrics = await cacheManager.getMetrics();

      expect(metrics).toHaveProperty('hitCount');
      expect(metrics).toHaveProperty('missCount');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('size');
      expect(typeof metrics.hitRate).toBe('number');
    });

    it('should support pattern-based operations', async () => {
      await cacheManager.set('user:1:profile', { name: 'User 1' });
      await cacheManager.set('user:2:profile', { name: 'User 2' });
      await cacheManager.set('user:1:settings', { theme: 'dark' });
      await cacheManager.set('post:1', { title: 'Post 1' });

      const userProfiles = await cacheManager.getByPattern('user:*:profile');
      expect(userProfiles.size).toBe(2);

      const allUserData = await cacheManager.getByPattern('user:*');
      expect(allUserData.size).toBe(3);
    });
  });

  describe('Enterprise State Manager', () => {
    beforeEach(async () => {
      await stateManager.clear();
    });

    it('should manage application state', async () => {
      const key = 'app-config';
      const value = { theme: 'dark', language: 'en' };

      await stateManager.set(StateScope.APPLICATION, key, value);
      const retrieved = await stateManager.get(StateScope.APPLICATION, key);

      expect(retrieved).toEqual(value);
    });

    it('should support different state scopes', async () => {
      const key = 'test-data';
      const appValue = 'application-data';
      const sessionValue = 'session-data';
      const userValue = 'user-data';

      await stateManager.set(StateScope.APPLICATION, key, appValue);
      await stateManager.set(StateScope.SESSION, key, sessionValue);
      await stateManager.set(StateScope.USER, key, userValue);

      const appRetrieved = await stateManager.get(StateScope.APPLICATION, key);
      const sessionRetrieved = await stateManager.get(StateScope.SESSION, key);
      const userRetrieved = await stateManager.get(StateScope.USER, key);

      expect(appRetrieved).toBe(appValue);
      expect(sessionRetrieved).toBe(sessionValue);
      expect(userRetrieved).toBe(userValue);
    });

    it('should support state merging', async () => {
      const key = 'user-preferences';
      const initialState = { theme: 'light', lang: 'en', notifications: true };
      const update = { theme: 'dark', fontSize: 14 };

      await stateManager.set(StateScope.USER, key, initialState);
      await stateManager.merge(StateScope.USER, key, update);

      const merged = await stateManager.get(StateScope.USER, key);
      expect(merged).toEqual({
        theme: 'dark', // Updated
        lang: 'en', // Preserved
        notifications: true, // Preserved
        fontSize: 14 // Added
      });
    });

    it('should handle state updates with callback', async () => {
      const key = 'counter';
      await stateManager.set(StateScope.APPLICATION, key, 0);

      await stateManager.update(StateScope.APPLICATION, key, (current: number) => current + 1);
      await stateManager.update(StateScope.APPLICATION, key, (current: number) => current * 2);

      const final = await stateManager.get(StateScope.APPLICATION, key);
      expect(final).toBe(2); // (0 + 1) * 2
    });

    it('should support bulk state operations', async () => {
      const entries = new Map([
        ['setting1', 'value1'],
        ['setting2', 'value2'],
        ['setting3', 'value3']
      ]);

      await stateManager.setMultiple(StateScope.APPLICATION, entries);
      
      const keys = Array.from(entries.keys());
      const retrieved = await stateManager.getMultiple(StateScope.APPLICATION, keys);

      expect(retrieved.size).toBe(3);
      entries.forEach((value, key) => {
        expect(retrieved.get(key)).toBe(value);
      });
    });

    it('should provide state metrics', async () => {
      await stateManager.set(StateScope.APPLICATION, 'key1', 'value1');
      await stateManager.set(StateScope.USER, 'key2', 'value2');
      await stateManager.set(StateScope.SESSION, 'key3', 'value3');

      const metrics = await stateManager.getMetrics();

      expect(metrics).toHaveProperty('totalStates');
      expect(metrics).toHaveProperty('totalEvents');
      expect(metrics).toHaveProperty('subscriptions');
      expect(typeof metrics.totalStates).toBe('number');
    });

    it('should support state scopes', async () => {
      const scope = await stateManager.createScope(StateScope.USER, 'user123');

      await scope.set('preference', 'dark-theme');
      await scope.set('language', 'en');

      const preference = await scope.get('preference');
      const language = await scope.get('language');
      const size = await scope.size();

      expect(preference).toBe('dark-theme');
      expect(language).toBe('en');
      expect(size).toBe(2);
    });

    it('should support pattern-based state queries', async () => {
      await stateManager.set(StateScope.USER, 'user:1:name', 'Alice');
      await stateManager.set(StateScope.USER, 'user:1:email', 'alice@example.com');
      await stateManager.set(StateScope.USER, 'user:2:name', 'Bob');
      await stateManager.set(StateScope.USER, 'setting:theme', 'dark');

      const userOneData = await stateManager.getByPattern(StateScope.USER, 'user:1:*');
      const allUserData = await stateManager.getByPattern(StateScope.USER, 'user:*');

      expect(userOneData.size).toBe(2);
      expect(allUserData.size).toBe(3); // user:1:name, user:1:email, user:2:name
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complex caching scenarios', async () => {
      // Clear both systems
      await cacheManager.clear();
      await stateManager.clear();

      // Set application state
      await stateManager.set(StateScope.APPLICATION, 'cache-config', {
        ttl: 300000,
        enabled: true
      });

      // Cache some IOC statistics
      const stats = {
        total: 1000,
        processed: 950,
        timestamp: new Date()
      };

      await cacheManager.set('ioc-stats', stats, {
        namespace: 'ioc-statistics',
        ttl: 300000
      });

      // Retrieve and verify
      const config = await stateManager.get(StateScope.APPLICATION, 'cache-config');
      const cachedStats = await cacheManager.get('ioc-stats', { 
        namespace: 'ioc-statistics' 
      });

      expect(config).toEqual({ ttl: 300000, enabled: true });
      expect(cachedStats).toEqual(stats);

      // Test cache and state metrics
      const cacheMetrics = await cacheManager.getMetrics();
      const stateMetrics = await stateManager.getMetrics();

      expect(cacheMetrics.size).toBeGreaterThan(0);
      expect(stateMetrics.totalStates).toBeGreaterThan(0);
    });
  });
});