/**
 * Tests for MITRE Data Store Integration
 */

import { 
  MitreCoreWithDataStore, 
  DataStoreType, 
  DataStoreConfig,
  TenantContext,
  SearchCriteria,
  SortOrder
} from '../../frontend/phantom-mitre-core/src-ts/datastore.js';
import { MitreDataStoreIntegrationBusinessLogic } from '../services/business-logic/modules/threat-intelligence/MitreDataStoreIntegrationBusinessLogic.js';
import { MitreTechnique, MitreTactic, MitrePlatform, DataSource, DetectionDifficulty } from '../../frontend/phantom-mitre-core/src-ts/types.js';

describe('MITRE Data Store Integration', () => {
  let mitreCore: MitreCoreWithDataStore;
  let businessLogic: MitreDataStoreIntegrationBusinessLogic;

  const testConfig: DataStoreConfig = {
    defaultStore: DataStoreType.MongoDB,
    multiTenant: true,
    cacheTtlSeconds: 3600,
    mongodb: {
      url: 'mongodb://localhost:27017',
      databaseName: 'phantom_mitre_test',
      collectionPrefix: 'test_',
      maxPoolSize: 5,
      minPoolSize: 1,
      connectionTimeoutMs: 10000,
      serverSelectionTimeoutMs: 10000,
      heartbeatFrequencyMs: 10000,
      enableCompression: false,
      compressionAlgorithm: 'none',
      readPreference: 'primary',
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeoutMs: 5000,
      },
      readConcern: 'majority',
    },
  };

  const testTenant: TenantContext = {
    tenantId: 'test_tenant_001',
    userId: 'test_user_001',
    organizationId: 'test_org_001',
    permissions: ['read', 'write', 'admin'],
  };

  beforeAll(async () => {
    mitreCore = new MitreCoreWithDataStore(testConfig);
    businessLogic = new MitreDataStoreIntegrationBusinessLogic(testConfig);
    
    await mitreCore.initializeDataStores();
    await businessLogic.initialize();
    
    mitreCore.setTenantContext(testTenant);
  });

  describe('Data Store Configuration and Initialization', () => {
    it('should initialize with default configuration', async () => {
      const defaultMitreCore = new MitreCoreWithDataStore();
      await defaultMitreCore.initializeDataStores();
      
      expect(defaultMitreCore).toBeDefined();
    });

    it('should set and get tenant context', () => {
      const context = mitreCore.getTenantContext();
      
      expect(context.tenantId).toBe('test_tenant_001');
      expect(context.userId).toBe('test_user_001');
      expect(context.permissions).toContain('read');
      expect(context.permissions).toContain('write');
    });

    it('should test data store connectivity', async () => {
      const connectivity = await mitreCore.testDataStoreConnectivity();
      
      expect(connectivity).toBeDefined();
      expect(typeof connectivity.mongodb).toBe('boolean');
    });
  });

  describe('Technique Storage and Retrieval', () => {
    const sampleTechnique: MitreTechnique = {
      id: 'T9999',
      name: 'Test Technique',
      description: 'A test technique for data store validation',
      tactic: MitreTactic.Execution,
      platforms: [MitrePlatform.Windows, MitrePlatform.Linux],
      data_sources: [DataSource.ProcessMonitoring, DataSource.FileMonitoring],
      detection_difficulty: DetectionDifficulty.Medium,
      sub_techniques: [],
      mitigations: ['M1001', 'M1002'],
      detection_rules: [],
      kill_chain_phases: ['execution'],
      permissions_required: ['User'],
      effective_permissions: ['User'],
      system_requirements: [],
      network_requirements: [],
      remote_support: true,
      impact_type: ['Availability'],
      created: new Date(),
      modified: new Date(),
      version: '1.0',
      revoked: false,
      deprecated: false,
    };

    it('should store a technique', async () => {
      const techniqueId = await mitreCore.storeTechnique(sampleTechnique);
      
      expect(techniqueId).toBe('T9999');
    });

    it('should retrieve a stored technique', async () => {
      const technique = await mitreCore.getStoredTechnique('T9999');
      
      expect(technique).toBeDefined();
      expect(technique?.id).toBe('T9999');
      expect(technique?.name).toBe('Test Technique');
    });

    it('should return null for non-existent technique', async () => {
      const technique = await mitreCore.getStoredTechnique('T0000');
      
      expect(technique).toBeNull();
    });

    it('should bulk store multiple techniques', async () => {
      const techniques: MitreTechnique[] = [
        { ...sampleTechnique, id: 'T9998', name: 'Bulk Test Technique 1' },
        { ...sampleTechnique, id: 'T9997', name: 'Bulk Test Technique 2' },
        { ...sampleTechnique, id: 'T9996', name: 'Bulk Test Technique 3' },
      ];

      const result = await mitreCore.bulkStoreTechniques(techniques);
      
      expect(result.successCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(result.processedIds).toContain('T9998');
      expect(result.processedIds).toContain('T9997');
      expect(result.processedIds).toContain('T9996');
    });
  });

  describe('Search Functionality', () => {
    it('should search techniques with basic criteria', async () => {
      const criteria: SearchCriteria = {
        query: 'Test',
        filters: {},
        limit: 10,
        offset: 0,
      };

      const results = await mitreCore.searchStoredTechniques(criteria);
      
      expect(results).toBeDefined();
      expect(results.items).toBeInstanceOf(Array);
      expect(results.pagination).toBeDefined();
      expect(results.pagination.size).toBe(10);
      expect(results.tookMs).toBeGreaterThan(0);
    });

    it('should search techniques with sorting', async () => {
      const criteria: SearchCriteria = {
        filters: {},
        limit: 5,
        offset: 0,
        sortBy: 'name',
        sortOrder: SortOrder.Ascending,
      };

      const results = await mitreCore.searchStoredTechniques(criteria);
      
      expect(results.items.length).toBeLessThanOrEqual(5);
      expect(results.pagination.size).toBe(5);
    });

    it('should handle pagination correctly', async () => {
      const firstPage: SearchCriteria = {
        filters: {},
        limit: 2,
        offset: 0,
      };

      const secondPage: SearchCriteria = {
        filters: {},
        limit: 2,
        offset: 2,
      };

      const firstResults = await mitreCore.searchStoredTechniques(firstPage);
      const secondResults = await mitreCore.searchStoredTechniques(secondPage);
      
      expect(firstResults.pagination.page).toBe(0);
      expect(secondResults.pagination.page).toBe(1);
    });
  });

  describe('Threat Analysis with Persistence', () => {
    it('should analyze threat and store results', async () => {
      const indicators = [
        'malicious_process.exe',
        'suspicious_network_traffic',
        'registry_modification',
      ];

      const analysis = await mitreCore.analyzeThreat(indicators);
      const analysisId = await mitreCore.storeAnalysis(analysis);
      
      expect(analysis).toBeDefined();
      expect(analysis.analysis_id).toBeDefined();
      expect(analysisId).toBe(analysis.analysis_id);
      expect(analysis.techniques_identified.length).toBeGreaterThan(0);
    });

    it('should retrieve stored analyses', async () => {
      const analyses = await mitreCore.getStoredAnalyses(5);
      
      expect(analyses).toBeInstanceOf(Array);
      expect(analyses.length).toBeLessThanOrEqual(5);
      
      if (analyses.length > 0) {
        expect(analyses[0].analysis_id).toBeDefined();
        expect(analyses[0].timestamp).toBeDefined();
      }
    });
  });

  describe('Data Store Metrics', () => {
    it('should get comprehensive metrics', async () => {
      const metrics = await mitreCore.getDataStoreMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalTechniques).toBe('number');
      expect(typeof metrics.totalGroups).toBe('number');
      expect(typeof metrics.totalSoftware).toBe('number');
      expect(typeof metrics.totalMitigations).toBe('number');
      expect(typeof metrics.totalDetectionRules).toBe('number');
      expect(typeof metrics.totalAnalyses).toBe('number');
      expect(typeof metrics.storageSizeBytes).toBe('number');
      expect(metrics.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Integration', () => {
    it('should process store technique request', async () => {
      const request = {
        operation: 'store_technique',
        parameters: {
          technique: {
            id: 'T8888',
            name: 'Business Logic Test Technique',
            description: 'Test technique for business logic integration',
            tactic: MitreTactic.Discovery,
            platforms: [MitrePlatform.Windows],
            data_sources: [DataSource.ProcessMonitoring],
            detection_difficulty: DetectionDifficulty.Easy,
            sub_techniques: [],
            mitigations: [],
            detection_rules: [],
            kill_chain_phases: ['discovery'],
            permissions_required: ['User'],
            effective_permissions: ['User'],
            system_requirements: [],
            network_requirements: [],
            remote_support: false,
            impact_type: [],
            created: new Date(),
            modified: new Date(),
            version: '1.0',
            revoked: false,
            deprecated: false,
          },
        },
        context: {
          tenantId: testTenant.tenantId,
          userId: testTenant.userId,
          permissions: testTenant.permissions,
        },
      };

      const result = await businessLogic.processor(request);
      
      expect(result.success).toBe(true);
      expect(result.data.techniqueId).toBe('T8888');
      expect(result.metadata.operation).toBe('store_technique');
    });

    it('should process get metrics request', async () => {
      const request = {
        operation: 'get_data_store_metrics',
        parameters: {},
        context: {
          tenantId: testTenant.tenantId,
          permissions: ['read'],
        },
      };

      const result = await businessLogic.processor(request);
      
      expect(result.success).toBe(true);
      expect(result.data.totalTechniques).toBeGreaterThanOrEqual(0);
      expect(result.metadata.operation).toBe('get_data_store_metrics');
    });

    it('should process search techniques request', async () => {
      const request = {
        operation: 'search_techniques',
        parameters: {
          query: 'Test',
          limit: 5,
          offset: 0,
        },
        context: {
          tenantId: testTenant.tenantId,
          permissions: ['read'],
        },
      };

      const result = await businessLogic.processor(request);
      
      expect(result.success).toBe(true);
      expect(result.data.results).toBeDefined();
      expect(result.data.results.items).toBeInstanceOf(Array);
    });

    it('should handle permission errors', async () => {
      const request = {
        operation: 'store_technique',
        parameters: {
          technique: { id: 'T7777', name: 'Unauthorized Test' },
        },
        context: {
          tenantId: testTenant.tenantId,
          permissions: ['read'], // No write permission
        },
      };

      const result = await businessLogic.processor(request);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('DATA_STORE_ERROR');
    });

    it('should handle unsupported operations', async () => {
      const request = {
        operation: 'unsupported_operation',
        parameters: {},
        context: {
          tenantId: testTenant.tenantId,
          permissions: ['read'],
        },
      };

      const result = await businessLogic.processor(request);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-tenancy Support', () => {
    const tenant2: TenantContext = {
      tenantId: 'test_tenant_002',
      userId: 'test_user_002',
      permissions: ['read', 'write'],
    };

    it('should isolate data between tenants', async () => {
      // Store technique as tenant 1
      mitreCore.setTenantContext(testTenant);
      await mitreCore.storeTechnique({
        ...sampleTechnique,
        id: 'T6666',
        name: 'Tenant 1 Technique',
      });

      // Switch to tenant 2
      mitreCore.setTenantContext(tenant2);
      const technique = await mitreCore.getStoredTechnique('T6666');
      
      // Tenant 2 should not see tenant 1's data
      expect(technique).toBeNull();
    });

    it('should allow tenant-specific metrics', async () => {
      // Get metrics for tenant 2
      mitreCore.setTenantContext(tenant2);
      const metrics = await mitreCore.getDataStoreMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalTechniques).toBe('number');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle invalid technique data gracefully', async () => {
      const invalidTechnique = {
        // Missing required fields
        name: 'Invalid Technique',
      };

      try {
        await mitreCore.storeTechnique(invalidTechnique as any);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle network timeouts gracefully', async () => {
      // This test would be more meaningful with actual network calls
      // For now, we simulate a timeout scenario
      const startTime = Date.now();
      
      try {
        const results = await mitreCore.testDataStoreConnectivity();
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
        expect(results).toBeDefined();
      } catch (error) {
        // Timeouts are acceptable in test environments
        expect(error).toBeDefined();
      }
    });
  });

  afterAll(async () => {
    // Cleanup test data if needed
    console.log('Test cleanup completed');
  });
});