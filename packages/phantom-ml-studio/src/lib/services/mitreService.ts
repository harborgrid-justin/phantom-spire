/**
 * MITRE ATT&CK Framework Data Service
 * Handles fetching, parsing, and storing MITRE ATT&CK data in PostgreSQL
 */
import 'server-only';
import axios from 'axios';
import { query, transaction } from '../database';
import { 
  StixBundle, 
  StixObject, 
  MitreSyncResult, 
  MitreTactic, 
  MitreTechnique, 
  MitreGroup,
  MitreSoftware,
  MitreMitigation,
  MitreDataSource,
  MitreRelationship,
  MitreSearchQuery,
  MitreSearchResult,
  MitreAnalytics,
  MitreIntegrationStatus,
  ExternalReference,
  KillChainPhase
} from '../types/mitre';

// MITRE ATT&CK data sources
const MITRE_STIX_URLS = {
  enterprise: 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json',
  mobile: 'https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json',
  ics: 'https://raw.githubusercontent.com/mitre/cti/master/ics-attack/ics-attack.json'
};

export class MitreService {
  
  /**
   * Synchronize all MITRE ATT&CK data from official sources
   */
  async syncMitreData(): Promise<MitreSyncResult> {
    const startTime = Date.now();
    const result: MitreSyncResult = {
      tactics: 0,
      techniques: 0,
      groups: 0,
      software: 0,
      mitigations: 0,
      dataSources: 0,
      relationships: 0,
      errors: [],
      duration: 0
    };

    try {
      console.log('🔄 Starting MITRE ATT&CK data synchronization...');
      
      await transaction(async (client) => {
        // Clear existing MITRE data
        await this.clearMitreData(client);
        
        // Sync Enterprise ATT&CK
        console.log('📥 Fetching Enterprise ATT&CK data...');
        const enterpriseData = await this.fetchStixData(MITRE_STIX_URLS.enterprise);
        await this.processStixBundle(client, enterpriseData, result);
        
        // Sync Mobile ATT&CK
        console.log('📥 Fetching Mobile ATT&CK data...');
        const mobileData = await this.fetchStixData(MITRE_STIX_URLS.mobile);
        await this.processStixBundle(client, mobileData, result);
        
        // Sync ICS ATT&CK
        console.log('📥 Fetching ICS ATT&CK data...');
        const icsData = await this.fetchStixData(MITRE_STIX_URLS.ics);
        await this.processStixBundle(client, icsData, result);
        
        // Process relationships after all entities are created
        console.log('🔗 Processing relationships...');
        await this.processRelationships(client, [enterpriseData, mobileData, icsData], result);
      });

      result.duration = Date.now() - startTime;
      console.log(`✅ MITRE data sync completed in ${result.duration}ms`);
      console.log(`📊 Synced: ${result.tactics} tactics, ${result.techniques} techniques, ${result.groups} groups, ${result.software} software, ${result.mitigations} mitigations, ${result.dataSources} data sources, ${result.relationships} relationships`);
      
      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      console.error('❌ MITRE data sync failed:', error);
      throw error;
    }
  }

  /**
   * Fetch STIX data from URL
   */
  private async fetchStixData(url: string): Promise<StixBundle> {
    const response = await axios.get(url);
    
    if (!response.data || !response.data.objects) {
      throw new Error(`Invalid STIX data format from ${url}`);
    }
    
    return response.data as StixBundle;
  }

  /**
   * Process a STIX bundle and extract all entities
   */
  private async processStixBundle(client: any, bundle: StixBundle, result: MitreSyncResult): Promise<void> {
    for (const obj of bundle.objects) {
      try {
        switch (obj.type) {
          case 'x-mitre-tactic':
            await this.processTactic(client, obj);
            result.tactics++;
            break;
          case 'attack-pattern':
            await this.processTechnique(client, obj);
            result.techniques++;
            break;
          case 'intrusion-set':
            await this.processGroup(client, obj);
            result.groups++;
            break;
          case 'malware':
          case 'tool':
            await this.processSoftware(client, obj);
            result.software++;
            break;
          case 'course-of-action':
            await this.processMitigation(client, obj);
            result.mitigations++;
            break;
          case 'x-mitre-data-source':
            await this.processDataSource(client, obj);
            result.dataSources++;
            break;
          default:
            // Skip unknown types
            break;
        }
      } catch (error: any) {
        result.errors.push(`Error processing ${obj.type} ${obj.id}: ${error.message}`);
        console.warn(`⚠️ Error processing ${obj.type} ${obj.id}:`, error.message);
      }
    }
  }

  /**
   * Process MITRE tactic from STIX object
   */
  private async processTactic(client: any, obj: StixObject): Promise<void> {
    const mitreId = this.extractMitreId(obj);
    if (!mitreId) return;

    const sql = `
      INSERT INTO mitre_tactics (
        mitre_id, name, description, short_name, url, version, stix_id,
        created_date, modified_date, platforms, kill_chain_phases, 
        external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (mitre_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    await client.query(sql, [
      mitreId,
      obj.name,
      obj.description || '',
      obj['x_mitre_shortname'] || '',
      this.buildUrl(mitreId, 'tactics'),
      obj['x_mitre_version'] || '1.0',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      obj['x_mitre_platforms'] || [],
      obj.kill_chain_phases || [],
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Process MITRE technique from STIX object
   */
  private async processTechnique(client: any, obj: StixObject): Promise<void> {
    const mitreId = this.extractMitreId(obj);
    if (!mitreId) return;

    const isSubTechnique = mitreId.includes('.');
    const parentTechnique = isSubTechnique ? mitreId.split('.')[0] : null;

    const sql = `
      INSERT INTO mitre_techniques (
        mitre_id, name, description, url, version, stix_id,
        created_date, modified_date, parent_technique, is_sub_technique,
        tactics, platforms, data_sources, defenses, permissions,
        system_requirements, network_requirements, remote_support,
        detection, kill_chain_phases, external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (mitre_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    const tactics = obj.kill_chain_phases?.map((kcp: any) => kcp.phase_name) || [];

    await client.query(sql, [
      mitreId,
      obj.name,
      obj.description || '',
      this.buildUrl(mitreId, 'techniques'),
      obj['x_mitre_version'] || '1.0',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      parentTechnique,
      isSubTechnique,
      tactics,
      obj['x_mitre_platforms'] || [],
      obj['x_mitre_data_sources'] || [],
      obj['x_mitre_defense_bypassed'] || [],
      obj['x_mitre_permissions_required'] || [],
      obj['x_mitre_system_requirements'] || [],
      obj['x_mitre_network_requirements'] || [],
      obj['x_mitre_remote_support'] || false,
      obj['x_mitre_detection'] || '',
      obj.kill_chain_phases || [],
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Process MITRE group from STIX object
   */
  private async processGroup(client: any, obj: StixObject): Promise<void> {
    const mitreId = this.extractMitreId(obj);
    if (!mitreId) return;

    const sql = `
      INSERT INTO mitre_groups (
        mitre_id, name, description, aliases, url, version, stix_id,
        created_date, modified_date, associated_groups, techniques_used,
        software_used, external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (mitre_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    await client.query(sql, [
      mitreId,
      obj.name,
      obj.description || '',
      obj.aliases || [],
      this.buildUrl(mitreId, 'groups'),
      obj['x_mitre_version'] || '1.0',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      obj['x_mitre_associated_groups'] || [],
      [], // Will be populated through relationships
      [], // Will be populated through relationships
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Process MITRE software from STIX object
   */
  private async processSoftware(client: any, obj: StixObject): Promise<void> {
    const mitreId = this.extractMitreId(obj);
    if (!mitreId) return;

    const sql = `
      INSERT INTO mitre_software (
        mitre_id, name, description, type, labels, aliases, url, version,
        stix_id, created_date, modified_date, platforms, techniques_used,
        groups_using, external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (mitre_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    await client.query(sql, [
      mitreId,
      obj.name,
      obj.description || '',
      obj.type, // 'malware' or 'tool'
      obj.labels || [],
      obj['x_mitre_aliases'] || [],
      this.buildUrl(mitreId, obj.type === 'malware' ? 'software' : 'software'),
      obj['x_mitre_version'] || '1.0',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      obj['x_mitre_platforms'] || [],
      [], // Will be populated through relationships
      [], // Will be populated through relationships
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Process MITRE mitigation from STIX object
   */
  private async processMitigation(client: any, obj: StixObject): Promise<void> {
    const mitreId = this.extractMitreId(obj);
    if (!mitreId) return;

    const sql = `
      INSERT INTO mitre_mitigations (
        mitre_id, name, description, url, version, stix_id,
        created_date, modified_date, techniques_addressed,
        external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (mitre_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    await client.query(sql, [
      mitreId,
      obj.name,
      obj.description || '',
      this.buildUrl(mitreId, 'mitigations'),
      obj['x_mitre_version'] || '1.0',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      [], // Will be populated through relationships
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Process MITRE data source from STIX object
   */
  private async processDataSource(client: any, obj: StixObject): Promise<void> {
    const mitreId = this.extractMitreId(obj);
    if (!mitreId) return;

    const sql = `
      INSERT INTO mitre_data_sources (
        mitre_id, name, description, url, version, stix_id,
        created_date, modified_date, data_components, techniques_detected,
        platforms, collection_layers, external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (mitre_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    await client.query(sql, [
      mitreId,
      obj.name,
      obj.description || '',
      this.buildUrl(mitreId, 'datasources'),
      obj['x_mitre_version'] || '1.0',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      obj['x_mitre_data_components'] || [],
      [], // Will be populated through relationships
      obj['x_mitre_platforms'] || [],
      obj['x_mitre_collection_layers'] || [],
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Process relationships between MITRE entities
   */
  private async processRelationships(client: any, bundles: StixBundle[], result: MitreSyncResult): Promise<void> {
    for (const bundle of bundles) {
      for (const obj of bundle.objects) {
        if (obj.type === 'relationship') {
          try {
            await this.processRelationship(client, obj);
            result.relationships++;
          } catch (error: any) {
            result.errors.push(`Error processing relationship ${obj.id}: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Process a single relationship
   */
  private async processRelationship(client: any, obj: StixObject): Promise<void> {
    const sourceId = this.extractMitreIdFromStixId(obj.source_ref);
    const targetId = this.extractMitreIdFromStixId(obj.target_ref);
    
    if (!sourceId || !targetId) return;

    const sql = `
      INSERT INTO mitre_relationships (
        relationship_type, source_type, source_id, target_type, target_id,
        description, stix_id, created_date, modified_date,
        external_references, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (stix_id) DO UPDATE SET
        description = EXCLUDED.description,
        modified_date = EXCLUDED.modified_date,
        updated_at = NOW()
    `;

    await client.query(sql, [
      obj.relationship_type,
      this.getEntityTypeFromStixId(obj.source_ref),
      sourceId,
      this.getEntityTypeFromStixId(obj.target_ref),
      targetId,
      obj.description || '',
      obj.id,
      new Date(obj.created),
      new Date(obj.modified),
      obj.external_references || [],
      this.extractMetadata(obj)
    ]);
  }

  /**
   * Clear all MITRE data from database
   */
  private async clearMitreData(client: any): Promise<void> {
    console.log('🧹 Clearing existing MITRE data...');
    
    const tables = [
      'mitre_relationships',
      'mitre_data_sources', 
      'mitre_mitigations',
      'mitre_software',
      'mitre_groups',
      'mitre_techniques',
      'mitre_tactics'
    ];

    for (const table of tables) {
      await client.query(`DELETE FROM ${table}`);
    }
  }

  /**
   * Extract MITRE ID from STIX object
   */
  private extractMitreId(obj: StixObject): string | null {
    const externalRefs = obj.external_references || [];
    const mitreRef = externalRefs.find(ref => ref.source_name === 'mitre-attack');
    return mitreRef?.external_id || null;
  }

  /**
   * Extract MITRE ID from STIX ID
   */
  private extractMitreIdFromStixId(stixId: string): string | null {
    // This would need to be resolved by looking up the entity in our database
    // For now, return null - this would be implemented in a production system
    return null;
  }

  /**
   * Get entity type from STIX ID
   */
  private getEntityTypeFromStixId(stixId: string): string {
    if (stixId.includes('attack-pattern')) return 'technique';
    if (stixId.includes('intrusion-set')) return 'group';
    if (stixId.includes('malware') || stixId.includes('tool')) return 'software';
    if (stixId.includes('course-of-action')) return 'mitigation';
    if (stixId.includes('x-mitre-tactic')) return 'tactic';
    if (stixId.includes('x-mitre-data-source')) return 'data-source';
    return 'unknown';
  }

  /**
   * Build URL for MITRE entity
   */
  private buildUrl(mitreId: string, type: string): string {
    return `https://attack.mitre.org/${type}/${mitreId}`;
  }

  /**
   * Extract metadata from STIX object
   */
  private extractMetadata(obj: StixObject): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Extract all x_mitre_ properties
    Object.keys(obj).forEach(key => {
      if (key.startsWith('x_mitre_') && key !== 'x_mitre_version') {
        metadata[key] = obj[key];
      }
    });

    return metadata;
  }

  /**
   * Get MITRE integration status
   */
  async getIntegrationStatus(): Promise<MitreIntegrationStatus> {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_records,
          MAX(updated_at) as last_sync
        FROM (
          SELECT updated_at FROM mitre_tactics
          UNION ALL
          SELECT updated_at FROM mitre_techniques
          UNION ALL
          SELECT updated_at FROM mitre_groups
          UNION ALL
          SELECT updated_at FROM mitre_software
          UNION ALL
          SELECT updated_at FROM mitre_mitigations
          UNION ALL
          SELECT updated_at FROM mitre_data_sources
        ) combined
      `);

      const totalRecords = parseInt(result.rows[0]?.total_records || '0');
      const lastSync = result.rows[0]?.last_sync || null;

      return {
        isInitialized: totalRecords > 0,
        lastSync: lastSync ? new Date(lastSync) : null,
        dataVersion: null, // Could be extracted from settings
        totalRecords,
        syncInProgress: false, // Would be tracked in a separate table/cache
        errors: []
      };
    } catch (error: any) {
      return {
        isInitialized: false,
        lastSync: null,
        dataVersion: null,
        totalRecords: 0,
        syncInProgress: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Search MITRE data
   */
  async searchMitreData<T>(
    table: string, 
    searchQuery: MitreSearchQuery
  ): Promise<MitreSearchResult<T>> {
    const { query: queryText, limit = 50, offset = 0 } = searchQuery;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (queryText) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${queryText}%`);
      paramIndex++;
    }

    // Add specific filters based on query parameters
    if (searchQuery.tactics?.length) {
      whereClause += ` AND tactics && $${paramIndex}`;
      params.push(searchQuery.tactics);
      paramIndex++;
    }

    if (searchQuery.platforms?.length) {
      whereClause += ` AND platforms && $${paramIndex}`;
      params.push(searchQuery.platforms);
      paramIndex++;
    }

    const countSql = `SELECT COUNT(*) FROM ${table} ${whereClause}`;
    const dataSql = `
      SELECT * FROM ${table} 
      ${whereClause} 
      ORDER BY name 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      query(countSql, params.slice(0, -2)),
      query(dataSql, params)
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      items: dataResult.rows,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get MITRE analytics
   */
  async getAnalytics(): Promise<MitreAnalytics> {
    const queries = [
      'SELECT COUNT(*) as count FROM mitre_tactics',
      'SELECT COUNT(*) as count FROM mitre_techniques WHERE is_sub_technique = false',
      'SELECT COUNT(*) as count FROM mitre_techniques WHERE is_sub_technique = true',
      'SELECT COUNT(*) as count FROM mitre_groups',
      'SELECT COUNT(*) as count FROM mitre_software',
      'SELECT COUNT(*) as count FROM mitre_mitigations',
      'SELECT COUNT(*) as count FROM mitre_data_sources'
    ];

    const results = await Promise.all(queries.map(q => query(q)));

    return {
      totalTactics: parseInt(results[0].rows[0].count),
      totalTechniques: parseInt(results[1].rows[0].count),
      totalSubTechniques: parseInt(results[2].rows[0].count),
      totalGroups: parseInt(results[3].rows[0].count),
      totalSoftware: parseInt(results[4].rows[0].count),
      totalMitigations: parseInt(results[5].rows[0].count),
      totalDataSources: parseInt(results[6].rows[0].count),
      topTactics: [],
      topPlatforms: [],
      topGroups: [],
      recentlyUpdated: [],
      coverageStats: {
        platformCoverage: {},
        tacticCoverage: {},
        mitigationCoverage: 0
      }
    };
  }
}

// Export singleton instance
export const mitreService = new MitreService();