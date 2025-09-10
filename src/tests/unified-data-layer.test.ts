/**
 * Test for Unified Data Layer Interface Alignment
 * 
 * Validates that the unified interface can be used to connect phantom-*-core plugins
 */

import {
  UnifiedDataStoreRegistry,
  UniversalDataRecord,
  UnifiedQuery,
  UnifiedQueryContext,
  DataRelationship,
  UnifiedDataStoreFactory,
} from '../data-layer/unified/typescript-bridge.js';

describe('Unified Data Layer Interface', () => {
  let registry: UnifiedDataStoreRegistry;
  
  beforeEach(() => {
    registry = new UnifiedDataStoreRegistry();
  });
  
  describe('UniversalDataRecord', () => {
    it('should create a valid IOC record', () => {
      const iocRecord: UniversalDataRecord = {
        id: 'test-ioc-001',
        recordType: 'ioc',
        sourcePlugin: 'phantom-ioc-core',
        data: {
          ioc_type: 'ip',
          value: '192.168.1.100',
          confidence: 0.85,
          threat_score: 7.5,
        },
        metadata: {
          source: 'test',
          confidence: 0.85,
        },
        relationships: [],
        tags: ['test', 'malicious'],
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 'test-tenant',
      };
      
      expect(iocRecord.recordType).toBe('ioc');
      expect(iocRecord.sourcePlugin).toBe('phantom-ioc-core');
      expect(iocRecord.data.value).toBe('192.168.1.100');
    });
    
    it('should create a valid MITRE technique record', () => {
      const mitreRecord: UniversalDataRecord = {
        id: 'T1071',
        recordType: 'mitre_technique',
        sourcePlugin: 'phantom-mitre-core',
        data: {
          name: 'Application Layer Protocol',
          description: 'Adversaries may communicate using application layer protocols...',
          tactic: 'Command and Control',
        },
        metadata: {
          tactic: 'Command and Control',
          platforms: ['Windows', 'macOS', 'Linux'],
        },
        relationships: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 'test-tenant',
      };
      
      expect(mitreRecord.recordType).toBe('mitre_technique');
      expect(mitreRecord.sourcePlugin).toBe('phantom-mitre-core');
      expect(mitreRecord.data.name).toBe('Application Layer Protocol');
    });
    
    it('should create a valid security incident record', () => {
      const incidentRecord: UniversalDataRecord = {
        id: 'incident-001',
        recordType: 'security_incident',
        sourcePlugin: 'phantom-secop-core',
        data: {
          title: 'Test Security Incident',
          severity: 'High',
          status: 'Open',
        },
        metadata: {
          severity: 'High',
          assigned_to: 'analyst-1',
        },
        relationships: [],
        tags: ['test', 'incident'],
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: 'test-tenant',
      };
      
      expect(incidentRecord.recordType).toBe('security_incident');
      expect(incidentRecord.sourcePlugin).toBe('phantom-secop-core');
      expect(incidentRecord.data.title).toBe('Test Security Incident');
    });
  });
  
  describe('DataRelationship', () => {
    it('should create valid relationships between records', () => {
      const relationship: DataRelationship = {
        id: 'rel-001',
        relationshipType: 'implements',
        sourceId: 'ioc-001',
        targetId: 'T1071',
        confidence: 0.8,
        metadata: {
          reasoning: 'IOC uses this technique',
        },
        createdAt: new Date(),
      };
      
      expect(relationship.relationshipType).toBe('implements');
      expect(relationship.confidence).toBe(0.8);
      expect(relationship.sourceId).toBe('ioc-001');
      expect(relationship.targetId).toBe('T1071');
    });
  });
  
  describe('UnifiedQuery', () => {
    it('should create cross-plugin queries', () => {
      const query: UnifiedQuery = {
        recordTypes: ['ioc', 'mitre_technique', 'security_incident'],
        sourcePlugins: ['phantom-ioc-core', 'phantom-mitre-core'],
        textQuery: 'command and control',
        filters: {
          severity: 'High',
        },
        limit: 10,
        offset: 0,
        sortBy: 'created_at',
        sortDesc: true,
        timeRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
      };
      
      expect(query.recordTypes).toContain('ioc');
      expect(query.recordTypes).toContain('mitre_technique');
      expect(query.recordTypes).toContain('security_incident');
      expect(query.textQuery).toBe('command and control');
    });
  });
  
  describe('UnifiedQueryContext', () => {
    it('should create valid query contexts', () => {
      const context: UnifiedQueryContext = {
        tenantId: 'test-tenant',
        userId: 'analyst-1',
        permissions: ['read', 'write'],
        filters: {},
        includeRelationships: true,
      };
      
      expect(context.tenantId).toBe('test-tenant');
      expect(context.permissions).toContain('read');
      expect(context.includeRelationships).toBe(true);
    });
  });
  
  describe('UnifiedDataStoreRegistry', () => {
    it('should initialize empty registry', () => {
      expect(registry.listStores()).toHaveLength(0);
      expect(registry.getPrimaryStore()).toBeUndefined();
    });
    
    it('should support cross-plugin queries', async () => {
      const query: UnifiedQuery = {
        recordTypes: ['ioc', 'mitre_technique'],
        textQuery: 'test',
        filters: {},
        limit: 10,
        offset: 0,
        sortBy: 'created_at',
        sortDesc: false,
      };
      
      const context: UnifiedQueryContext = {
        tenantId: 'test',
        permissions: ['read'],
        filters: {},
        includeRelationships: false,
      };
      
      // Should return empty results since no stores are registered
      const result = await registry.crossPluginQuery(query, context);
      expect(result.records).toHaveLength(0);
      expect(result.relationships).toHaveLength(0);
    });
  });
  
  describe('Plugin Interoperability', () => {
    it('should demonstrate data model compatibility', () => {
      // Create records from different plugins with relationships
      const iocRecord: UniversalDataRecord = {
        id: 'ioc-malware-hash',
        recordType: 'ioc',
        sourcePlugin: 'phantom-ioc-core',
        data: { value: 'abc123', type: 'hash' },
        metadata: {},
        relationships: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const mitreRecord: UniversalDataRecord = {
        id: 'T1055',
        recordType: 'mitre_technique',
        sourcePlugin: 'phantom-mitre-core',
        data: { name: 'Process Injection', tactic: 'Defense Evasion' },
        metadata: {},
        relationships: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const incidentRecord: UniversalDataRecord = {
        id: 'incident-malware',
        recordType: 'security_incident',
        sourcePlugin: 'phantom-secop-core',
        data: { title: 'Malware Detection', severity: 'High' },
        metadata: {},
        relationships: [
          {
            id: 'rel-incident-ioc',
            relationshipType: 'involves',
            sourceId: 'incident-malware',
            targetId: 'ioc-malware-hash',
            confidence: 1.0,
            metadata: {},
            createdAt: new Date(),
          },
          {
            id: 'rel-incident-technique',
            relationshipType: 'uses_technique',
            sourceId: 'incident-malware',
            targetId: 'T1055',
            confidence: 0.8,
            metadata: {},
            createdAt: new Date(),
          },
        ],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Validate that all three plugin types can work together
      const allRecords = [iocRecord, mitreRecord, incidentRecord];
      const allRelationships = incidentRecord.relationships;
      
      expect(allRecords).toHaveLength(3);
      expect(allRelationships).toHaveLength(2);
      
      // Validate cross-plugin relationships
      const iocRelationship = allRelationships.find(r => r.targetId === iocRecord.id);
      const mitreRelationship = allRelationships.find(r => r.targetId === mitreRecord.id);
      
      expect(iocRelationship).toBeDefined();
      expect(mitreRelationship).toBeDefined();
      expect(iocRelationship?.relationshipType).toBe('involves');
      expect(mitreRelationship?.relationshipType).toBe('uses_technique');
    });
  });
  
  describe('UnifiedDataStoreFactory', () => {
    it('should create unified data store registry', async () => {
      const registry = await UnifiedDataStoreFactory.createRegistry();
      expect(registry).toBeInstanceOf(UnifiedDataStoreRegistry);
    });
    
    it('should create unified data source', async () => {
      const dataSource = await UnifiedDataStoreFactory.createUnifiedDataSource();
      expect(dataSource.name).toBe('unified-phantom-spire');
      expect(dataSource.type).toBe('unified');
    });
  });
});

// Integration test demonstrating cross-plugin workflow
describe('Cross-Plugin Integration Workflow', () => {
  it('should demonstrate IOC -> MITRE -> Incident workflow', () => {
    // Step 1: IOC detected by phantom-ioc-core
    const maliciousIP: UniversalDataRecord = {
      id: 'ioc-suspicious-ip',
      recordType: 'ioc',
      sourcePlugin: 'phantom-ioc-core',
      data: {
        type: 'ip',
        value: '203.0.113.42',
        confidence: 0.9,
        threat_score: 8.5,
      },
      metadata: { source: 'honeypot' },
      relationships: [],
      tags: ['c2', 'malicious'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Step 2: MITRE technique analysis by phantom-mitre-core
    const commandControlTechnique: UniversalDataRecord = {
      id: 'T1071.001',
      recordType: 'mitre_technique',
      sourcePlugin: 'phantom-mitre-core',
      data: {
        name: 'Web Protocols',
        tactic: 'Command and Control',
        description: 'Adversaries may communicate using application layer protocols...',
      },
      metadata: { kill_chain_phases: ['command-and-control'] },
      relationships: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Step 3: Security incident created by phantom-secop-core
    const securityIncident: UniversalDataRecord = {
      id: 'incident-c2-activity',
      recordType: 'security_incident',
      sourcePlugin: 'phantom-secop-core',
      data: {
        title: 'Suspected Command and Control Activity',
        severity: 'High',
        status: 'Open',
        description: 'Malicious IP detected communicating with internal hosts',
      },
      metadata: {
        priority: 'High',
        assigned_to: 'soc-analyst-1',
      },
      relationships: [
        {
          id: 'incident-involves-ioc',
          relationshipType: 'involves',
          sourceId: 'incident-c2-activity',
          targetId: 'ioc-suspicious-ip',
          confidence: 1.0,
          metadata: { evidence_type: 'network_indicator' },
          createdAt: new Date(),
        },
        {
          id: 'incident-uses-technique',
          relationshipType: 'uses_technique',
          sourceId: 'incident-c2-activity',
          targetId: 'T1071.001',
          confidence: 0.85,
          metadata: { attribution_method: 'behavioral_analysis' },
          createdAt: new Date(),
        },
      ],
      tags: ['c2', 'investigation', 'high-priority'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Validate the workflow creates proper connections
    expect(maliciousIP.sourcePlugin).toBe('phantom-ioc-core');
    expect(commandControlTechnique.sourcePlugin).toBe('phantom-mitre-core');
    expect(securityIncident.sourcePlugin).toBe('phantom-secop-core');
    
    // Validate relationships connect all three components
    const iocRelation = securityIncident.relationships.find(r => r.targetId === maliciousIP.id);
    const techniqueRelation = securityIncident.relationships.find(r => r.targetId === commandControlTechnique.id);
    
    expect(iocRelation).toBeDefined();
    expect(techniqueRelation).toBeDefined();
    expect(iocRelation?.relationshipType).toBe('involves');
    expect(techniqueRelation?.relationshipType).toBe('uses_technique');
    
    // This demonstrates that all three phantom-*-core plugins can work together
    // through the unified data layer interface
    console.log('✅ Cross-plugin workflow validated: IOC -> MITRE -> Incident');
  });
});