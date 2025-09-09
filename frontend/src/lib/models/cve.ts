// Database models for CVE management

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// CVE Model
interface CVEAttributes {
  id: string;
  cve_id: string;
  description: string;
  published_date: Date;
  last_modified_date: Date;
  cvss_version?: string;
  cvss_base_score?: number;
  cvss_severity?: string;
  cvss_attack_vector?: string;
  cvss_attack_complexity?: string;
  cvss_privileges_required?: string;
  cvss_user_interaction?: string;
  cvss_scope?: string;
  cvss_confidentiality_impact?: string;
  cvss_integrity_impact?: string;
  cvss_availability_impact?: string;
  cwe_id?: string;
  cwe_name?: string;
  cwe_description?: string;
  status: string;
  assigner: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

interface CVECreationAttributes extends Optional<CVEAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CVE extends Model<CVEAttributes, CVECreationAttributes> implements CVEAttributes {
  public id!: string;
  public cve_id!: string;
  public description!: string;
  public published_date!: Date;
  public last_modified_date!: Date;
  public cvss_version?: string;
  public cvss_base_score?: number;
  public cvss_severity?: string;
  public cvss_attack_vector?: string;
  public cvss_attack_complexity?: string;
  public cvss_privileges_required?: string;
  public cvss_user_interaction?: string;
  public cvss_scope?: string;
  public cvss_confidentiality_impact?: string;
  public cvss_integrity_impact?: string;
  public cvss_availability_impact?: string;
  public cwe_id?: string;
  public cwe_name?: string;
  public cwe_description?: string;
  public status!: string;
  public assigner!: string;
  public tags!: string[];
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public analysis?: CVEAnalysisResult;
  public affected_products?: AffectedProduct[];
  public references?: CVEReference[];
}

CVE.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cve_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^CVE-\d{4}-\d{4,}$/
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  published_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_modified_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cvss_version: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cvss_base_score: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 10
    }
  },
  cvss_severity: {
    type: DataTypes.ENUM('none', 'low', 'medium', 'high', 'critical'),
    allowNull: true
  },
  cvss_attack_vector: {
    type: DataTypes.ENUM('network', 'adjacent', 'local', 'physical'),
    allowNull: true
  },
  cvss_attack_complexity: {
    type: DataTypes.ENUM('low', 'high'),
    allowNull: true
  },
  cvss_privileges_required: {
    type: DataTypes.ENUM('none', 'low', 'high'),
    allowNull: true
  },
  cvss_user_interaction: {
    type: DataTypes.ENUM('none', 'required'),
    allowNull: true
  },
  cvss_scope: {
    type: DataTypes.ENUM('unchanged', 'changed'),
    allowNull: true
  },
  cvss_confidentiality_impact: {
    type: DataTypes.ENUM('none', 'low', 'high'),
    allowNull: true
  },
  cvss_integrity_impact: {
    type: DataTypes.ENUM('none', 'low', 'high'),
    allowNull: true
  },
  cvss_availability_impact: {
    type: DataTypes.ENUM('none', 'low', 'high'),
    allowNull: true
  },
  cwe_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cwe_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cwe_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('reserved', 'published', 'rejected'),
    allowNull: false,
    defaultValue: 'published'
  },
  assigner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'cves',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['cve_id'] },
    { fields: ['cvss_severity'] },
    { fields: ['cvss_base_score'] },
    { fields: ['published_date'] },
    { fields: ['status'] },
    { fields: ['assigner'] }
  ]
});

// CVE Analysis Result Model
interface CVEAnalysisAttributes {
  id: string;
  cve_id: string;
  exploitability: number;
  impact_score: number;
  risk_level: string;
  affected_systems: string[];
  remediation_priority: number;
  exploit_available: boolean;
  public_exploits: boolean;
  in_the_wild: boolean;
  recommendations: string[];
  mitigation_steps: string[];
  related_cves: string[];
  threat_actors: string[];
  campaigns: string[];
  processing_timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

interface CVEAnalysisCreationAttributes extends Optional<CVEAnalysisAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CVEAnalysisResult extends Model<CVEAnalysisAttributes, CVEAnalysisCreationAttributes> implements CVEAnalysisAttributes {
  public id!: string;
  public cve_id!: string;
  public exploitability!: number;
  public impact_score!: number;
  public risk_level!: string;
  public affected_systems!: string[];
  public remediation_priority!: number;
  public exploit_available!: boolean;
  public public_exploits!: boolean;
  public in_the_wild!: boolean;
  public recommendations!: string[];
  public mitigation_steps!: string[];
  public related_cves!: string[];
  public threat_actors!: string[];
  public campaigns!: string[];
  public processing_timestamp!: Date;
  public created_at!: Date;
  public updated_at!: Date;
}

CVEAnalysisResult.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cve_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: CVE,
      key: 'id'
    }
  },
  exploitability: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 1
    }
  },
  impact_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 1
    }
  },
  risk_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  affected_systems: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  remediation_priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  exploit_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  public_exploits: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  in_the_wild: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  recommendations: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  mitigation_steps: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  related_cves: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  threat_actors: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  campaigns: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  processing_timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'cve_analysis_results',
  timestamps: true,
  underscored: true
});

// Affected Product Model
interface AffectedProductAttributes {
  id: string;
  cve_id: string;
  vendor: string;
  product: string;
  version: string;
  version_start_including?: string;
  version_end_including?: string;
  version_start_excluding?: string;
  version_end_excluding?: string;
  created_at: Date;
  updated_at: Date;
}

interface AffectedProductCreationAttributes extends Optional<AffectedProductAttributes, 'id' | 'created_at' | 'updated_at'> {}

class AffectedProduct extends Model<AffectedProductAttributes, AffectedProductCreationAttributes> implements AffectedProductAttributes {
  public id!: string;
  public cve_id!: string;
  public vendor!: string;
  public product!: string;
  public version!: string;
  public version_start_including?: string;
  public version_end_including?: string;
  public version_start_excluding?: string;
  public version_end_excluding?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

AffectedProduct.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cve_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: CVE,
      key: 'id'
    }
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  product: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version_start_including: {
    type: DataTypes.STRING,
    allowNull: true
  },
  version_end_including: {
    type: DataTypes.STRING,
    allowNull: true
  },
  version_start_excluding: {
    type: DataTypes.STRING,
    allowNull: true
  },
  version_end_excluding: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'affected_products',
  timestamps: true,
  underscored: true
});

// CVE Reference Model
interface CVEReferenceAttributes {
  id: string;
  cve_id: string;
  url: string;
  source: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

interface CVEReferenceCreationAttributes extends Optional<CVEReferenceAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CVEReference extends Model<CVEReferenceAttributes, CVEReferenceCreationAttributes> implements CVEReferenceAttributes {
  public id!: string;
  public cve_id!: string;
  public url!: string;
  public source!: string;
  public tags!: string[];
  public created_at!: Date;
  public updated_at!: Date;
}

CVEReference.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cve_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: CVE,
      key: 'id'
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'cve_references',
  timestamps: true,
  underscored: true
});

// Define associations
CVE.hasOne(CVEAnalysisResult, { foreignKey: 'cve_id', as: 'analysis' });
CVE.hasMany(AffectedProduct, { foreignKey: 'cve_id', as: 'affected_products' });
CVE.hasMany(CVEReference, { foreignKey: 'cve_id', as: 'references' });

CVEAnalysisResult.belongsTo(CVE, { foreignKey: 'cve_id' });
AffectedProduct.belongsTo(CVE, { foreignKey: 'cve_id' });
CVEReference.belongsTo(CVE, { foreignKey: 'cve_id' });

export { CVE, CVEAnalysisResult, AffectedProduct, CVEReference };
