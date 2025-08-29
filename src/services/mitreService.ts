import axios from 'axios';
import { MitreTactic } from '../models/MitreTactic';
import { MitreTechnique } from '../models/MitreTechnique';
import { MitreGroup } from '../models/MitreGroup';
import { MitreSoftware } from '../models/MitreSoftware';
import { MitreMitigation } from '../models/MitreMitigation';
import { MitreDataSource } from '../models/MitreDataSource';
import { logger } from '../utils/logger';

// MITRE ATT&CK STIX data source URL
const MITRE_ATTACK_STIX_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json';

export class MitreService {
  private systemUserId: string;

  constructor(systemUserId: string) {
    this.systemUserId = systemUserId;
  }

  /**
   * Fetch and sync all MITRE ATT&CK data from official source
   */
  async syncMitreData(): Promise<{
    tactics: number;
    techniques: number;
    groups: number;
    software: number;
    mitigations: number;
    dataSources: number;
  }> {
    try {
      logger.info('Starting MITRE ATT&CK data sync from official source...');
      
      // Fetch STIX data from MITRE's official repository
      const response = await axios.get(MITRE_ATTACK_STIX_URL);
      const stixData = response.data;

      if (!stixData.objects || !Array.isArray(stixData.objects)) {
        throw new Error('Invalid STIX data format received from MITRE');
      }

      const results = {
        tactics: 0,
        techniques: 0,
        groups: 0,
        software: 0,
        mitigations: 0,
        dataSources: 0,
      };

      // Process each STIX object
      for (const obj of stixData.objects) {
        try {
          switch (obj.type) {
            case 'x-mitre-tactic':
              await this.processTactic(obj);
              results.tactics++;
              break;
            case 'attack-pattern':
              await this.processTechnique(obj);
              results.techniques++;
              break;
            case 'intrusion-set':
              await this.processGroup(obj);
              results.groups++;
              break;
            case 'malware':
            case 'tool':
              await this.processSoftware(obj);
              results.software++;
              break;
            case 'course-of-action':
              await this.processMitigation(obj);
              results.mitigations++;
              break;
            case 'x-mitre-data-source':
              await this.processDataSource(obj);
              results.dataSources++;
              break;
          }
        } catch (error) {
          logger.warn(`Failed to process STIX object ${obj.id}:`, error);
        }
      }

      logger.info('MITRE ATT&CK data sync completed', results);
      return results;
    } catch (error) {
      logger.error('Failed to sync MITRE ATT&CK data:', error);
      throw error;
    }
  }

  /**
   * Process a MITRE tactic from STIX data
   */
  private async processTactic(stixObj: any): Promise<void> {
    const mitreId = this.extractMitreId(stixObj.external_references);
    if (!mitreId) return;

    const tacticData = {
      mitreId,
      name: stixObj.name,
      description: stixObj.description || '',
      shortName: stixObj.x_mitre_shortname || '',
      url: this.getExternalUrl(stixObj.external_references, 'mitre-attack'),
      version: stixObj.x_mitre_version || '1.0',
      created: new Date(stixObj.created),
      modified: new Date(stixObj.modified),
      platforms: stixObj.x_mitre_platforms || [],
      killChainPhases: stixObj.kill_chain_phases || [],
      externalReferences: this.processExternalReferences(stixObj.external_references),
      metadata: {
        stixId: stixObj.id,
        revoked: stixObj.revoked || false,
        deprecated: stixObj.x_mitre_deprecated || false,
      },
      createdBy: this.systemUserId,
    };

    await MitreTactic.findOneAndUpdate(
      { mitreId },
      tacticData,
      { upsert: true, new: true }
    );
  }

  /**
   * Process a MITRE technique from STIX data
   */
  private async processTechnique(stixObj: any): Promise<void> {
    const mitreId = this.extractMitreId(stixObj.external_references);
    if (!mitreId) return;

    const isSubTechnique = mitreId.includes('.');
    const parentTechnique = isSubTechnique ? mitreId.split('.')[0] : undefined;

    const techniqueData = {
      mitreId,
      name: stixObj.name,
      description: stixObj.description || '',
      url: this.getExternalUrl(stixObj.external_references, 'mitre-attack'),
      version: stixObj.x_mitre_version || '1.0',
      created: new Date(stixObj.created),
      modified: new Date(stixObj.modified),
      parentTechnique,
      isSubTechnique,
      tactics: this.extractTacticNames(stixObj.kill_chain_phases),
      platforms: stixObj.x_mitre_platforms || [],
      dataSources: stixObj.x_mitre_data_sources || [],
      defenses: stixObj.x_mitre_defense_bypassed || [],
      permissions: stixObj.x_mitre_permissions_required || [],
      systemRequirements: stixObj.x_mitre_system_requirements || [],
      networkRequirements: stixObj.x_mitre_network_requirements || [],
      remoteSupport: stixObj.x_mitre_remote_support || false,
      killChainPhases: stixObj.kill_chain_phases || [],
      detection: stixObj.x_mitre_detection || '',
      mitigations: [], // Will be populated after mitigations are processed
      externalReferences: this.processExternalReferences(stixObj.external_references),
      metadata: {
        stixId: stixObj.id,
        revoked: stixObj.revoked || false,
        deprecated: stixObj.x_mitre_deprecated || false,
        contributorId: stixObj.x_mitre_contributors || [],
        domains: stixObj.x_mitre_domains || [],
      },
      createdBy: this.systemUserId,
    };

    await MitreTechnique.findOneAndUpdate(
      { mitreId },
      techniqueData,
      { upsert: true, new: true }
    );
  }

  /**
   * Process a MITRE group from STIX data
   */
  private async processGroup(stixObj: any): Promise<void> {
    const mitreId = this.extractMitreId(stixObj.external_references);
    if (!mitreId) return;

    const groupData = {
      mitreId,
      name: stixObj.name,
      description: stixObj.description || '',
      aliases: stixObj.aliases || [],
      url: this.getExternalUrl(stixObj.external_references, 'mitre-attack'),
      version: stixObj.x_mitre_version || '1.0',
      created: new Date(stixObj.created),
      modified: new Date(stixObj.modified),
      techniques: [], // Will be populated from relationships
      software: [], // Will be populated from relationships
      externalReferences: this.processExternalReferences(stixObj.external_references),
      metadata: {
        stixId: stixObj.id,
        revoked: stixObj.revoked || false,
        deprecated: stixObj.x_mitre_deprecated || false,
        contributorId: stixObj.x_mitre_contributors || [],
      },
      createdBy: this.systemUserId,
    };

    await MitreGroup.findOneAndUpdate(
      { mitreId },
      groupData,
      { upsert: true, new: true }
    );
  }

  /**
   * Process MITRE software (malware/tools) from STIX data
   */
  private async processSoftware(stixObj: any): Promise<void> {
    const mitreId = this.extractMitreId(stixObj.external_references);
    if (!mitreId) return;

    const softwareData = {
      mitreId,
      name: stixObj.name,
      description: stixObj.description || '',
      labels: stixObj.labels || [],
      url: this.getExternalUrl(stixObj.external_references, 'mitre-attack'),
      version: stixObj.x_mitre_version || '1.0',
      created: new Date(stixObj.created),
      modified: new Date(stixObj.modified),
      platforms: stixObj.x_mitre_platforms || [],
      techniques: [], // Will be populated from relationships
      groups: [], // Will be populated from relationships
      aliases: stixObj.x_mitre_aliases || [],
      externalReferences: this.processExternalReferences(stixObj.external_references),
      metadata: {
        stixId: stixObj.id,
        type: stixObj.type,
        revoked: stixObj.revoked || false,
        deprecated: stixObj.x_mitre_deprecated || false,
        contributorId: stixObj.x_mitre_contributors || [],
      },
      createdBy: this.systemUserId,
    };

    await MitreSoftware.findOneAndUpdate(
      { mitreId },
      softwareData,
      { upsert: true, new: true }
    );
  }

  /**
   * Process a MITRE mitigation from STIX data
   */
  private async processMitigation(stixObj: any): Promise<void> {
    const mitreId = this.extractMitreId(stixObj.external_references);
    if (!mitreId) return;

    const mitigationData = {
      mitreId,
      name: stixObj.name,
      description: stixObj.description || '',
      url: this.getExternalUrl(stixObj.external_references, 'mitre-attack'),
      version: stixObj.x_mitre_version || '1.0',
      created: new Date(stixObj.created),
      modified: new Date(stixObj.modified),
      techniques: [], // Will be populated from relationships
      externalReferences: this.processExternalReferences(stixObj.external_references),
      metadata: {
        stixId: stixObj.id,
        revoked: stixObj.revoked || false,
        deprecated: stixObj.x_mitre_deprecated || false,
      },
      createdBy: this.systemUserId,
    };

    await MitreMitigation.findOneAndUpdate(
      { mitreId },
      mitigationData,
      { upsert: true, new: true }
    );
  }

  /**
   * Process a MITRE data source from STIX data
   */
  private async processDataSource(stixObj: any): Promise<void> {
    const mitreId = this.extractMitreId(stixObj.external_references);
    if (!mitreId) return;

    const dataSourceData = {
      mitreId,
      name: stixObj.name,
      description: stixObj.description || '',
      url: this.getExternalUrl(stixObj.external_references, 'mitre-attack'),
      version: stixObj.x_mitre_version || '1.0',
      created: new Date(stixObj.created),
      modified: new Date(stixObj.modified),
      platforms: stixObj.x_mitre_platforms || [],
      collection: stixObj.x_mitre_collection_layers || '',
      dataComponents: this.processDataComponents(stixObj.x_mitre_data_source_collection || []),
      externalReferences: this.processExternalReferences(stixObj.external_references),
      metadata: {
        stixId: stixObj.id,
        revoked: stixObj.revoked || false,
        deprecated: stixObj.x_mitre_deprecated || false,
      },
      createdBy: this.systemUserId,
    };

    await MitreDataSource.findOneAndUpdate(
      { mitreId },
      dataSourceData,
      { upsert: true, new: true }
    );
  }

  /**
   * Extract MITRE ID from external references
   */
  private extractMitreId(externalRefs: any[]): string | null {
    if (!externalRefs) return null;
    
    const mitreRef = externalRefs.find(ref => ref.source_name === 'mitre-attack');
    return mitreRef?.external_id || null;
  }

  /**
   * Get external URL from references
   */
  private getExternalUrl(externalRefs: any[], sourceName: string): string {
    if (!externalRefs) return '';
    
    const ref = externalRefs.find(ref => ref.source_name === sourceName);
    return ref?.url || '';
  }

  /**
   * Extract tactic names from kill chain phases
   */
  private extractTacticNames(killChainPhases: any[]): string[] {
    if (!killChainPhases) return [];
    
    return killChainPhases
      .filter(phase => phase.kill_chain_name === 'mitre-attack')
      .map(phase => phase.phase_name);
  }

  /**
   * Process external references
   */
  private processExternalReferences(externalRefs: any[]): any[] {
    if (!externalRefs) return [];
    
    return externalRefs.map(ref => ({
      sourceName: ref.source_name,
      url: ref.url,
      externalId: ref.external_id,
      description: ref.description,
    }));
  }

  /**
   * Process data components
   */
  private processDataComponents(components: any[]): any[] {
    if (!components) return [];
    
    return components.map(comp => ({
      name: comp.name || '',
      description: comp.description || '',
      detects: comp.detects || [],
    }));
  }

  /**
   * Get statistics about MITRE data in database
   */
  async getStats(): Promise<{
    tactics: number;
    techniques: number;
    subTechniques: number;
    groups: number;
    software: number;
    mitigations: number;
    dataSources: number;
    lastSync?: Date;
  }> {
    const [tactics, techniques, subTechniques, groups, software, mitigations, dataSources] = await Promise.all([
      MitreTactic.countDocuments(),
      MitreTechnique.countDocuments({ isSubTechnique: false }),
      MitreTechnique.countDocuments({ isSubTechnique: true }),
      MitreGroup.countDocuments(),
      MitreSoftware.countDocuments(),
      MitreMitigation.countDocuments(),
      MitreDataSource.countDocuments(),
    ]);

    // Get last sync date from most recently updated tactic
    const lastTactic = await MitreTactic.findOne({}, {}, { sort: { updatedAt: -1 } });

    return {
      tactics,
      techniques,
      subTechniques,
      groups,
      software,
      mitigations,
      dataSources,
      lastSync: lastTactic?.updatedAt,
    };
  }
}