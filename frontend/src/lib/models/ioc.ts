// IOC Sequelize Model
import { DataTypes, Sequelize, Model } from 'sequelize';
import { IOCType, Severity } from 'phantom-ioc-core';

export interface IOCAttributes {
  id: string;
  indicator_type: IOCType;
  value: string;
  confidence: number;
  severity: Severity;
  source: string;
  timestamp: Date;
  tags: string[];
  context: {
    description?: string;
    metadata: Record<string, string>;
  };
  status: 'active' | 'archived' | 'false_positive';
  created_at: Date;
  updated_at: Date;
}

export class IOC extends Model<IOCAttributes> implements IOCAttributes {
  public id!: string;
  public indicator_type!: IOCType;
  public value!: string;
  public confidence!: number;
  public severity!: Severity;
  public source!: string;
  public timestamp!: Date;
  public tags!: string[];
  public context!: {
    description?: string;
    metadata: Record<string, string>;
  };
  public status!: 'active' | 'archived' | 'false_positive';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixins
  public readonly analysis_results?: any[];
  public readonly threat_actors?: any[];
  public readonly malware_families?: any[];
  public readonly campaigns?: any[];

  public static associate(models: any) {
    IOC.hasMany(models.AnalysisResult, {
      foreignKey: 'ioc_id',
      as: 'analysis_results'
    });
    IOC.belongsToMany(models.ThreatActor, {
      through: 'ioc_threat_actors',
      foreignKey: 'ioc_id',
      otherKey: 'threat_actor_id',
      as: 'threat_actors'
    });
    IOC.belongsToMany(models.MalwareFamily, {
      through: 'ioc_malware_families',
      foreignKey: 'ioc_id',
      otherKey: 'malware_family_id',
      as: 'malware_families'
    });
    IOC.belongsToMany(models.Campaign, {
      through: 'ioc_campaigns',
      foreignKey: 'ioc_id',
      otherKey: 'campaign_id',
      as: 'campaigns'
    });
  }
}

export function IOCModel(sequelize: Sequelize) {
  IOC.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      indicator_type: {
        type: DataTypes.ENUM(...Object.values(IOCType)),
        allowNull: false
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        validate: {
          min: 0.0,
          max: 1.0
        }
      },
      severity: {
        type: DataTypes.ENUM(...Object.values(Severity)),
        allowNull: false
      },
      source: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      context: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { metadata: {} }
      },
      status: {
        type: DataTypes.ENUM('active', 'archived', 'false_positive'),
        allowNull: false,
        defaultValue: 'active'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'IOC',
      tableName: 'iocs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['indicator_type']
        },
        {
          fields: ['severity']
        },
        {
          fields: ['status']
        },
        {
          fields: ['confidence']
        },
        {
          fields: ['source']
        },
        {
          fields: ['timestamp']
        },
        {
          fields: ['value']
        }
      ]
    }
  );

  return IOC;
}
