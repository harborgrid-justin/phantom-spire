/**
 * MITRE ATT&CK Framework Types
 * TypeScript interfaces for all MITRE data models in phantom-ml-studio
 */

export interface ExternalReference {
  sourceName: string;
  url?: string;
  externalId?: string;
  description?: string;
}

export interface KillChainPhase {
  killChainName: string;
  phaseName: string;
}

/**
 * Base interface for all MITRE entities
 */
export interface BaseMitreEntity {
  id: number;
  mitreId: string;
  name: string;
  description: string;
  url: string;
  version: string;
  stixId?: string;
  createdDate: Date;
  modifiedDate: Date;
  externalReferences: ExternalReference[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MITRE Tactic interface
 */
export interface MitreTactic extends BaseMitreEntity {
  shortName: string;
  platforms: string[];
  killChainPhases: KillChainPhase[];
}

/**
 * MITRE Technique interface
 */
export interface MitreTechnique extends BaseMitreEntity {
  parentTechnique?: string;
  isSubTechnique: boolean;
  tactics: string[];
  platforms: string[];
  dataSources: string[];
  defenses: string[];
  permissions: string[];
  systemRequirements: string[];
  networkRequirements: string[];
  remoteSupport: boolean;
  detection?: string;
  killChainPhases: KillChainPhase[];
}

/**
 * MITRE Group interface
 */
export interface MitreGroup extends BaseMitreEntity {
  aliases: string[];
  associatedGroups: string[];
  techniquesUsed: string[];
  softwareUsed: string[];
}

/**
 * MITRE Software interface
 */
export interface MitreSoftware extends BaseMitreEntity {
  type: 'malware' | 'tool';
  labels: string[];
  aliases: string[];
  platforms: string[];
  techniquesUsed: string[];
  groupsUsing: string[];
}

/**
 * MITRE Mitigation interface
 */
export interface MitreMitigation extends BaseMitreEntity {
  techniquesAddressed: string[];
}

/**
 * MITRE Data Source interface
 */
export interface MitreDataSource extends BaseMitreEntity {
  dataComponents: string[];
  techniquesDetected: string[];
  platforms: string[];
  collectionLayers: string[];
}

/**
 * MITRE Relationship interface
 */
export interface MitreRelationship {
  id: number;
  relationshipType: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  description?: string;
  stixId?: string;
  createdDate: Date;
  modifiedDate: Date;
  externalReferences: ExternalReference[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * STIX Bundle interface for importing MITRE data
 */
export interface StixBundle {
  type: 'bundle';
  id: string;
  objects: StixObject[];
}

/**
 * Base STIX Object interface
 */
export interface StixObject {
  type: string;
  id: string;
  created: string;
  modified: string;
  spec_version?: string;
  object_marking_refs?: string[];
  external_references?: ExternalReference[];
  [key: string]: any;
}

/**
 * MITRE data sync result
 */
export interface MitreSyncResult {
  tactics: number;
  techniques: number;
  groups: number;
  software: number;
  mitigations: number;
  dataSources: number;
  relationships: number;
  errors: string[];
  duration: number;
}

/**
 * MITRE search/query interfaces
 */
export interface MitreSearchQuery {
  query?: string;
  tactics?: string[];
  platforms?: string[];
  techniques?: string[];
  groups?: string[];
  software?: string[];
  limit?: number;
  offset?: number;
}

export interface MitreSearchResult<T = any> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * MITRE analytics interfaces
 */
export interface MitreAnalytics {
  totalTactics: number;
  totalTechniques: number;
  totalSubTechniques: number;
  totalGroups: number;
  totalSoftware: number;
  totalMitigations: number;
  totalDataSources: number;
  topTactics: Array<{ name: string; count: number }>;
  topPlatforms: Array<{ name: string; count: number }>;
  topGroups: Array<{ name: string; techniqueCount: number }>;
  recentlyUpdated: Array<{ type: string; name: string; updated: Date }>;
  coverageStats: {
    platformCoverage: Record<string, number>;
    tacticCoverage: Record<string, number>;
    mitigationCoverage: number;
  };
}

/**
 * MITRE technique mapping interface
 */
export interface TechniqueMapping {
  techniqueId: string;
  techniqueName: string;
  tactics: string[];
  platforms: string[];
  dataSources: string[];
  mitigations: string[];
  groups: string[];
  software: string[];
  confidence: number;
  source: string;
  timestamp: Date;
}

/**
 * MITRE integration status
 */
export interface MitreIntegrationStatus {
  isInitialized: boolean;
  lastSync: Date | null;
  dataVersion: string | null;
  totalRecords: number;
  syncInProgress: boolean;
  errors: string[];
}