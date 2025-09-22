/**
 * ATTRIBUTION ANALYSIS SEQUELIZE MODEL
 * Represents threat attribution analysis and scoring with comprehensive type safety
 */
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';
import { ThreatActor } from './ThreatActor.model';
import { Campaign } from './Campaign.model';
import { User } from './User.model';

// AttributionAnalysis Attributes Interface
export interface AttributionAnalysisAttributes {
  /** Unique identifier for the attribution analysis */
  id: number;
  /** Name of the attribution analysis */
  analysis_name: string;
  /** Detailed description of the analysis */
  description?: string;
  /** ID of the attributed threat actor */
  attributed_actor_id?: number;
  /** ID of the related campaign */
  campaign_id?: number;
  /** ID of the analyst who performed the analysis */
  analyst_id: number;
  /** Confidence score (0-100) */
  confidence_score: number;
  /** Confidence level classification */
  confidence_level: 'low' | 'medium' | 'high';
  /** Technical indicators used for attribution */
  technical_indicators: Record<string, any>;
  /** Behavioral patterns and indicators */
  behavioral_indicators: Record<string, any>;
  /** Linguistic analysis results */
  linguistic_analysis: Record<string, any>;
  /** Infrastructure overlap analysis */
  infrastructure_overlap: Record<string, any>;
  /** Temporal correlation data */
  temporal_correlation: Record<string, any>;
  /** Similarity scores to known actors */
  similarity_scores: Record<string, any>;
  /** Sources of evidence used */
  evidence_sources: string[];
  /** Alternative attribution hypotheses */
  alternative_hypotheses: Record<string, any>;
  /** Current status of the analysis */
  status: 'pending' | 'reviewed' | 'confirmed' | 'disputed' | 'rejected';
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// AttributionAnalysis Creation Attributes Interface
export interface AttributionAnalysisCreationAttributes extends Optional<AttributionAnalysisAttributes,
  'id' | 'description' | 'attributed_actor_id' | 'campaign_id' | 'confidence_score' | 
  'confidence_level' | 'technical_indicators' | 'behavioral_indicators' | 'linguistic_analysis' |
  'infrastructure_overlap' | 'temporal_correlation' | 'similarity_scores' | 'evidence_sources' |
  'alternative_hypotheses' | 'status' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'attribution_analyses',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['attributed_actor_id'] },
    { fields: ['campaign_id'] },
    { fields: ['analyst_id'] },
    { fields: ['confidence_score'] },
    { fields: ['confidence_level'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
})
export class AttributionAnalysis extends Model<AttributionAnalysisAttributes, AttributionAnalysisCreationAttributes> implements AttributionAnalysisAttributes {
  /** Unique identifier for the attribution analysis */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Name of the attribution analysis */
  @AllowNull(false)
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare analysis_name: string;

  /** Detailed description of the analysis */
  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description?: string;

  /** ID of the attributed threat actor */
  @ForeignKey(() => ThreatActor)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare attributed_actor_id?: number;

  /** ID of the related campaign */
  @ForeignKey(() => Campaign)
  @AllowNull(true)
  @Index
  @Column(DataType.INTEGER)
  declare campaign_id?: number;

  /** ID of the analyst who performed the analysis */
  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare analyst_id: number;

  /** Confidence score (0-100) */
  @AllowNull(false)
  @Default(0)
  @Index
  @Column(DataType.INTEGER)
  declare confidence_score: number;

  /** Confidence level classification */
  @AllowNull(false)
  @Default('low')
  @Index
  @Column(DataType.ENUM('low', 'medium', 'high'))
  declare confidence_level: 'low' | 'medium' | 'high';

  /** Technical indicators used for attribution */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare technical_indicators: Record<string, any>;

  /** Behavioral patterns and indicators */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare behavioral_indicators: Record<string, any>;

  /** Linguistic analysis results */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare linguistic_analysis: Record<string, any>;

  /** Infrastructure overlap analysis */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare infrastructure_overlap: Record<string, any>;

  /** Temporal correlation data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare temporal_correlation: Record<string, any>;

  /** Similarity scores to known actors */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare similarity_scores: Record<string, any>;

  /** Sources of evidence used */
  @AllowNull(false)
  @Default('[]')
  @Column(DataType.ARRAY(DataType.STRING))
  declare evidence_sources: string[];

  /** Alternative attribution hypotheses */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare alternative_hypotheses: Record<string, any>;

  /** Current status of the analysis */
  @AllowNull(false)
  @Default('pending')
  @Index
  @Column(DataType.ENUM('pending', 'reviewed', 'confirmed', 'disputed', 'rejected'))
  declare status: 'pending' | 'reviewed' | 'confirmed' | 'disputed' | 'rejected';

  /** Additional metadata */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare metadata: Record<string, any>;

  /** Record creation timestamp */
  @CreatedAt
  @Column(DataType.DATE)
  declare created_at: Date;

  /** Record last update timestamp */
  @UpdatedAt
  @Column(DataType.DATE)
  declare updated_at: Date;

  // Associations
  /** Attributed threat actor */
  @BelongsTo(() => ThreatActor, {
    foreignKey: 'attributed_actor_id',
    as: 'attributed_actor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare attributed_actor?: ThreatActor;

  /** Related campaign */
  @BelongsTo(() => Campaign, {
    foreignKey: 'campaign_id',
    as: 'campaign',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  })
  declare campaign?: Campaign;

  /** Analyst who performed the analysis */
  @BelongsTo(() => User, {
    foreignKey: 'analyst_id',
    as: 'analyst',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  declare analyst?: User;

  // Instance methods
  /**
   * Check if this is a high confidence attribution
   * @returns True if confidence level is high or score >= 80
   */
  public isHighConfidence(): boolean {
    return this.confidence_level === 'high' || this.confidence_score >= 80;
  }

  /**
   * Check if this is a medium confidence attribution
   * @returns True if confidence level is medium or score between 50-79
   */
  public isMediumConfidence(): boolean {
    return this.confidence_level === 'medium' || (this.confidence_score >= 50 && this.confidence_score < 80);
  }

  /**
   * Check if this is a low confidence attribution
   * @returns True if confidence level is low or score < 50
   */
  public isLowConfidence(): boolean {
    return this.confidence_level === 'low' || this.confidence_score < 50;
  }

  /**
   * Check if the analysis is pending review
   * @returns True if status is pending
   */
  public isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Check if the analysis has been reviewed
   * @returns True if status is reviewed
   */
  public isReviewed(): boolean {
    return this.status === 'reviewed';
  }

  /**
   * Check if the analysis is confirmed
   * @returns True if status is confirmed
   */
  public isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  /**
   * Check if the analysis is disputed
   * @returns True if status is disputed
   */
  public isDisputed(): boolean {
    return this.status === 'disputed';
  }

  /**
   * Check if the analysis is rejected
   * @returns True if status is rejected
   */
  public isRejected(): boolean {
    return this.status === 'rejected';
  }

  /**
   * Get the overall attribution strength
   * @returns String representation of attribution strength
   */
  public getAttributionStrength(): 'weak' | 'moderate' | 'strong' | 'very_strong' {
    if (this.confidence_score >= 90) return 'very_strong';
    if (this.confidence_score >= 70) return 'strong';
    if (this.confidence_score >= 40) return 'moderate';
    return 'weak';
  }

  /**
   * Get the number of evidence sources
   * @returns Count of evidence sources
   */
  public getEvidenceSourceCount(): number {
    return this.evidence_sources.length;
  }

  /**
   * Check if a specific evidence source is included
   * @param source Evidence source to check
   * @returns True if source is included
   */
  public hasEvidenceSource(source: string): boolean {
    return this.evidence_sources.includes(source);
  }

  /**
   * Calculate analysis age in days
   * @returns Age in days since creation
   */
  public getAnalysisAge(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get technical indicator count
   * @returns Number of technical indicators
   */
  public getTechnicalIndicatorCount(): number {
    return Object.keys(this.technical_indicators).length;
  }

  /**
   * Get behavioral indicator count
   * @returns Number of behavioral indicators
   */
  public getBehavioralIndicatorCount(): number {
    return Object.keys(this.behavioral_indicators).length;
  }

  /**
   * Check if attribution has sufficient evidence
   * @param minSources Minimum number of evidence sources (default: 3)
   * @returns True if attribution has sufficient evidence
   */
  public hasSufficientEvidence(minSources: number = 3): boolean {
    return this.getEvidenceSourceCount() >= minSources && 
           (this.getTechnicalIndicatorCount() > 0 || this.getBehavioralIndicatorCount() > 0);
  }

  /**
   * Confirm the attribution analysis
   * @param reviewerNotes Optional reviewer notes
   * @returns Promise resolving to updated analysis
   */
  public async confirm(reviewerNotes?: string): Promise<this> {
    this.status = 'confirmed';
    if (reviewerNotes) {
      this.metadata = {
        ...this.metadata,
        reviewer_notes: reviewerNotes,
        confirmed_at: new Date(),
        confirmed_by: 'system' // Would be replaced with actual user in real implementation
      };
    }
    return this.save();
  }

  /**
   * Dispute the attribution analysis
   * @param reason Reason for disputing
   * @returns Promise resolving to updated analysis
   */
  public async dispute(reason?: string): Promise<this> {
    this.status = 'disputed';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        dispute_reason: reason,
        disputed_at: new Date(),
        disputed_by: 'system' // Would be replaced with actual user in real implementation
      };
    }
    return this.save();
  }

  /**
   * Reject the attribution analysis
   * @param reason Reason for rejection
   * @returns Promise resolving to updated analysis
   */
  public async reject(reason?: string): Promise<this> {
    this.status = 'rejected';
    if (reason) {
      this.metadata = {
        ...this.metadata,
        rejection_reason: reason,
        rejected_at: new Date(),
        rejected_by: 'system' // Would be replaced with actual user in real implementation
      };
    }
    return this.save();
  }

  /**
   * Mark as reviewed
   * @param reviewer Optional reviewer identifier
   * @returns Promise resolving to updated analysis
   */
  public async markReviewed(reviewer?: string): Promise<this> {
    this.status = 'reviewed';
    this.metadata = {
      ...this.metadata,
      reviewed_at: new Date(),
      reviewed_by: reviewer || 'system'
    };
    return this.save();
  }

  /**
   * Update confidence score and level
   * @param score New confidence score (0-100)
   * @returns Promise resolving to updated analysis
   */
  public async updateConfidence(score: number): Promise<this> {
    this.confidence_score = Math.max(0, Math.min(100, score));
    
    // Automatically update confidence level based on score
    if (this.confidence_score >= 70) {
      this.confidence_level = 'high';
    } else if (this.confidence_score >= 40) {
      this.confidence_level = 'medium';
    } else {
      this.confidence_level = 'low';
    }
    
    return this.save();
  }

  /**
   * Add evidence source
   * @param source Evidence source to add
   * @returns Promise resolving to updated analysis
   */
  public async addEvidenceSource(source: string): Promise<this> {
    if (!this.evidence_sources.includes(source)) {
      this.evidence_sources = [...this.evidence_sources, source];
      return this.save();
    }
    return this;
  }

  /**
   * Remove evidence source
   * @param source Evidence source to remove
   * @returns Promise resolving to updated analysis
   */
  public async removeEvidenceSource(source: string): Promise<this> {
    this.evidence_sources = this.evidence_sources.filter(s => s !== source);
    return this.save();
  }

  /**
   * Add technical indicator
   * @param key Indicator key
   * @param value Indicator value
   * @returns Promise resolving to updated analysis
   */
  public async addTechnicalIndicator(key: string, value: any): Promise<this> {
    this.technical_indicators = {
      ...this.technical_indicators,
      [key]: value
    };
    return this.save();
  }

  /**
   * Add behavioral indicator
   * @param key Indicator key
   * @param value Indicator value
   * @returns Promise resolving to updated analysis
   */
  public async addBehavioralIndicator(key: string, value: any): Promise<this> {
    this.behavioral_indicators = {
      ...this.behavioral_indicators,
      [key]: value
    };
    return this.save();
  }

  /**
   * Add alternative hypothesis
   * @param hypothesis Hypothesis description
   * @param probability Probability assessment
   * @returns Promise resolving to updated analysis
   */
  public async addAlternativeHypothesis(hypothesis: string, probability: number): Promise<this> {
    const hypothesisId = `hypothesis_${Date.now()}`;
    this.alternative_hypotheses = {
      ...this.alternative_hypotheses,
      [hypothesisId]: {
        description: hypothesis,
        probability: Math.max(0, Math.min(100, probability)),
        added_at: new Date()
      }
    };
    return this.save();
  }

  // Static methods
  /**
   * Find attribution analyses by threat actor
   * @param actorId Threat actor ID
   * @returns Promise resolving to analyses for the actor
   */
  static async findByActor(actorId: number): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { attributed_actor_id: actorId },
      order: [['confidence_score', 'DESC']],
      include: [
        { model: User, as: 'analyst' },
        { model: Campaign, as: 'campaign' }
      ]
    });
  }

  /**
   * Find attribution analyses by campaign
   * @param campaignId Campaign ID
   * @returns Promise resolving to analyses for the campaign
   */
  static async findByCampaign(campaignId: number): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { campaign_id: campaignId },
      order: [['confidence_score', 'DESC']],
      include: [
        { model: User, as: 'analyst' },
        { model: ThreatActor, as: 'attributed_actor' }
      ]
    });
  }

  /**
   * Find attribution analyses by analyst
   * @param analystId Analyst user ID
   * @returns Promise resolving to analyses by the analyst
   */
  static async findByAnalyst(analystId: number): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { analyst_id: analystId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find high confidence attributions
   * @param threshold Confidence threshold (default: 80)
   * @returns Promise resolving to high confidence analyses
   */
  static async findHighConfidence(threshold: number = 80): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { confidence_score: { [Op.gte]: threshold } },
      order: [['confidence_score', 'DESC']],
      include: [
        { model: ThreatActor, as: 'attributed_actor' },
        { model: User, as: 'analyst' }
      ]
    });
  }

  /**
   * Find analyses by status
   * @param status Status to filter by
   * @returns Promise resolving to analyses with specified status
   */
  static async findByStatus(status: AttributionAnalysisAttributes['status']): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find pending analyses
   * @returns Promise resolving to pending analyses
   */
  static async findPending(): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { status: 'pending' },
      order: [['confidence_score', 'DESC']]
    });
  }

  /**
   * Find confirmed attributions
   * @returns Promise resolving to confirmed analyses
   */
  static async findConfirmed(): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { status: 'confirmed' },
      order: [['confidence_score', 'DESC']],
      include: [{ model: ThreatActor, as: 'attributed_actor' }]
    });
  }

  /**
   * Find disputed analyses
   * @returns Promise resolving to disputed analyses
   */
  static async findDisputed(): Promise<AttributionAnalysis[]> {
    return this.findAll({
      where: { status: 'disputed' },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find recent analyses
   * @param days Number of days to look back (default: 30)
   * @returns Promise resolving to recent analyses
   */
  static async findRecent(days: number = 30): Promise<AttributionAnalysis[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        created_at: { [Op.gte]: cutoffDate }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Get attribution statistics
   * @returns Promise resolving to attribution statistics
   */
  static async getAttributionStats(): Promise<{
    total_analyses: number;
    pending_analyses: number;
    confirmed_analyses: number;
    disputed_analyses: number;
    high_confidence_analyses: number;
    avg_confidence_score: number;
    unique_actors_attributed: number;
  }> {
    const [
      totalAnalyses,
      pendingAnalyses,
      confirmedAnalyses,
      disputedAnalyses,
      highConfidenceAnalyses,
      avgConfidenceResult,
      uniqueActorsResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'pending' } }),
      this.count({ where: { status: 'confirmed' } }),
      this.count({ where: { status: 'disputed' } }),
      this.count({ where: { confidence_score: { [Op.gte]: 80 } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('confidence_score')), 'avg_confidence']
        ]
      }).then(results => results[0]),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('COUNT', this.sequelize!.fn('DISTINCT', this.sequelize!.col('attributed_actor_id'))), 'unique_actors']
        ],
        where: this.sequelize!.literal('attributed_actor_id IS NOT NULL')
      }).then(results => results[0])
    ]);

    return {
      total_analyses: totalAnalyses,
      pending_analyses: pendingAnalyses,
      confirmed_analyses: confirmedAnalyses,
      disputed_analyses: disputedAnalyses,
      high_confidence_analyses: highConfidenceAnalyses,
      avg_confidence_score: parseFloat((avgConfidenceResult as any).getDataValue('avg_confidence')) || 0,
      unique_actors_attributed: parseInt((uniqueActorsResult as any).getDataValue('unique_actors')) || 0
    };
  }

  /**
   * Create attribution analysis with validation
   * @param data Analysis data to create
   * @returns Promise resolving to created analysis
   */
  static async createAnalysis(data: AttributionAnalysisCreationAttributes): Promise<AttributionAnalysis> {
    // Validate confidence score
    if (data.confidence_score !== undefined && (data.confidence_score < 0 || data.confidence_score > 100)) {
      throw new Error('Confidence score must be between 0 and 100');
    }

    // Auto-assign confidence level based on score if not provided
    if (data.confidence_score !== undefined && !data.confidence_level) {
      if (data.confidence_score >= 70) {
        data.confidence_level = 'high';
      } else if (data.confidence_score >= 40) {
        data.confidence_level = 'medium';
      } else {
        data.confidence_level = 'low';
      }
    }

    return this.create(data);
  }
}

export default AttributionAnalysis;
