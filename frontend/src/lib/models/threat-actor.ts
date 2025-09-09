// Threat Actor Sequelize Model
import { DataTypes, Sequelize, Model } from 'sequelize';

export interface ThreatActorAttributes {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  country: string;
  sophistication_level: 'low' | 'medium' | 'high' | 'advanced';
  primary_motivation: string;
  first_seen: Date;
  last_seen: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ThreatActor extends Model<ThreatActorAttributes> implements ThreatActorAttributes {
  public id!: string;
  public name!: string;
  public aliases!: string[];
  public description!: string;
  public country!: string;
  public sophistication_level!: 'low' | 'medium' | 'high' | 'advanced';
  public primary_motivation!: string;
  public first_seen!: Date;
  public last_seen!: Date;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate(models: any) {
    ThreatActor.belongsToMany(models.IOC, {
      through: 'ioc_threat_actors',
      foreignKey: 'threat_actor_id',
      otherKey: 'ioc_id',
      as: 'iocs'
    });
  }
}

export function ThreatActorModel(sequelize: Sequelize) {
  ThreatActor.init(
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
      country: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      sophistication_level: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'advanced'),
        allowNull: false,
        defaultValue: 'medium'
      },
      primary_motivation: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      first_seen: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_seen: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      modelName: 'ThreatActor',
      tableName: 'threat_actors',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['name']
        },
        {
          fields: ['country']
        },
        {
          fields: ['sophistication_level']
        },
        {
          fields: ['is_active']
        }
      ]
    }
  );

  return ThreatActor;
}
