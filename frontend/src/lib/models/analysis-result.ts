// Analysis Result Sequelize Model
import { DataTypes, Sequelize, Model } from 'sequelize';

export interface AnalysisResultAttributes {
  id: string;
  ioc_id: string;
  threat_actors: string[];
  campaigns: string[];
  malware_families: string[];
  attack_vectors: string[];
  impact_assessment: {
    business_impact: number;
    technical_impact: number;
    operational_impact: number;
    overall_risk: number;
  };
  recommendations: string[];
  processing_timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

export class AnalysisResult extends Model<AnalysisResultAttributes> implements AnalysisResultAttributes {
  public id!: string;
  public ioc_id!: string;
  public threat_actors!: string[];
  public campaigns!: string[];
  public malware_families!: string[];
  public attack_vectors!: string[];
  public impact_assessment!: {
    business_impact: number;
    technical_impact: number;
    operational_impact: number;
    overall_risk: number;
  };
  public recommendations!: string[];
  public processing_timestamp!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate(models: any) {
    AnalysisResult.belongsTo(models.IOC, {
      foreignKey: 'ioc_id',
      as: 'ioc'
    });
  }
}

export function AnalysisResultModel(sequelize: Sequelize) {
  AnalysisResult.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      ioc_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'iocs',
          key: 'id'
        }
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
      malware_families: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      attack_vectors: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      impact_assessment: {
        type: DataTypes.JSON,
        allowNull: false
      },
      recommendations: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      processing_timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
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
      modelName: 'AnalysisResult',
      tableName: 'analysis_results',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['ioc_id']
        },
        {
          fields: ['processing_timestamp']
        }
      ]
    }
  );

  return AnalysisResult;
}
