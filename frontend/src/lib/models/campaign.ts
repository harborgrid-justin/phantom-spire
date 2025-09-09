// Campaign Sequelize Model
import { DataTypes, Sequelize, Model } from 'sequelize';

export interface CampaignAttributes {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  threat_actor_id: string;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  target_industries: string[];
  target_countries: string[];
  attack_vectors: string[];
  objectives: string[];
  created_at: Date;
  updated_at: Date;
}

export class Campaign extends Model<CampaignAttributes> implements CampaignAttributes {
  public id!: string;
  public name!: string;
  public aliases!: string[];
  public description!: string;
  public threat_actor_id!: string;
  public start_date!: Date;
  public end_date!: Date;
  public is_active!: boolean;
  public target_industries!: string[];
  public target_countries!: string[];
  public attack_vectors!: string[];
  public objectives!: string[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate(models: any) {
    Campaign.belongsTo(models.ThreatActor, {
      foreignKey: 'threat_actor_id',
      as: 'threat_actor'
    });
    Campaign.belongsToMany(models.IOC, {
      through: 'ioc_campaigns',
      foreignKey: 'campaign_id',
      otherKey: 'ioc_id',
      as: 'iocs'
    });
  }
}

export function CampaignModel(sequelize: Sequelize) {
  Campaign.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      aliases: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      threat_actor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'threat_actors',
          key: 'id'
        }
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      target_industries: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      target_countries: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      attack_vectors: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
      },
      objectives: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
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
      modelName: 'Campaign',
      tableName: 'campaigns',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['name']
        },
        {
          fields: ['threat_actor_id']
        },
        {
          fields: ['is_active']
        },
        {
          fields: ['start_date']
        }
      ]
    }
  );

  return Campaign;
}
