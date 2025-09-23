/**
 * CRYPTO WALLET SEQUELIZE MODEL
 * Represents cryptocurrency wallet tracking for threat intelligence with comprehensive type safety
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
  DataType,
  Index,
  Length
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Op } from 'sequelize';

// CryptoWallet Attributes Interface
export interface CryptoWalletAttributes {
  /** Unique identifier for the crypto wallet */
  id: number;
  /** Wallet address */
  wallet_address: string;
  /** Type of cryptocurrency */
  cryptocurrency: 'BTC' | 'ETH' | 'XMR' | 'LTC' | 'BCH' | 'ADA' | 'DOT' | 'USDT' | 'USDC' | 'other';
  /** Risk level assessment */
  risk_level: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  /** Associated threat categories */
  associated_threats: string[];
  /** Total amount received by the wallet */
  total_received: number;
  /** Current balance in the wallet */
  current_balance: number;
  /** When the wallet was first detected */
  first_seen?: Date;
  /** When the wallet was last active */
  last_active?: Date;
  /** Transaction analysis data */
  transaction_analysis: Record<string, any>;
  /** Classification tags */
  tags: string[];
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// CryptoWallet Creation Attributes Interface
export interface CryptoWalletCreationAttributes extends Optional<CryptoWalletAttributes,
  'id' | 'risk_level' | 'associated_threats' | 'total_received' | 'current_balance' |
  'first_seen' | 'last_active' | 'transaction_analysis' | 'tags' | 'metadata' | 
  'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'crypto_wallets',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['wallet_address'], unique: true },
    { fields: ['cryptocurrency'] },
    { fields: ['risk_level'] },
    { fields: ['first_seen'] },
    { fields: ['last_active'] },
    { fields: ['total_received'] },
    { fields: ['current_balance'] },
    { fields: ['created_at'] }
  ]
})
export class CryptoWallet extends Model<CryptoWalletAttributes, CryptoWalletCreationAttributes> implements CryptoWalletAttributes {
  /** Unique identifier for the crypto wallet */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Wallet address */
  @AllowNull(false)
  @Index({ unique: true })
  @Length({ min: 1, max: 255 })
  @Column(DataType.STRING(255))
  declare wallet_address: string;

  /** Type of cryptocurrency */
  @AllowNull(false)
  @Index
  @Column(DataType.ENUM('BTC', 'ETH', 'XMR', 'LTC', 'BCH', 'ADA', 'DOT', 'USDT', 'USDC', 'other'))
  declare cryptocurrency: 'BTC' | 'ETH' | 'XMR' | 'LTC' | 'BCH' | 'ADA' | 'DOT' | 'USDT' | 'USDC' | 'other';

  /** Risk level assessment */
  @AllowNull(false)
  @Default('unknown')
  @Index
  @Column(DataType.ENUM('unknown', 'low', 'medium', 'high', 'critical'))
  declare risk_level: 'unknown' | 'low' | 'medium' | 'high' | 'critical';

  /** Associated threat categories */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare associated_threats: string[];

  /** Total amount received by the wallet */
  @AllowNull(false)
  @Default(0)
  @Index
  @Column(DataType.DECIMAL(20, 8))
  declare total_received: number;

  /** Current balance in the wallet */
  @AllowNull(false)
  @Default(0)
  @Index
  @Column(DataType.DECIMAL(20, 8))
  declare current_balance: number;

  /** When the wallet was first detected */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare first_seen?: Date;

  /** When the wallet was last active */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare last_active?: Date;

  /** Transaction analysis data */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare transaction_analysis: Record<string, any>;

  /** Classification tags */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare tags: string[];

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

  // Instance methods
  /**
   * Check if this is a high-risk wallet
   * @returns True if risk level is high or critical
   */
  public isHighRisk(): boolean {
    return this.risk_level === 'high' || this.risk_level === 'critical';
  }

  /**
   * Check if this is a critical-risk wallet
   * @returns True if risk level is critical
   */
  public isCriticalRisk(): boolean {
    return this.risk_level === 'critical';
  }

  /**
   * Check if this is a medium-risk wallet
   * @returns True if risk level is medium
   */
  public isMediumRisk(): boolean {
    return this.risk_level === 'medium';
  }

  /**
   * Check if this is a low-risk wallet
   * @returns True if risk level is low
   */
  public isLowRisk(): boolean {
    return this.risk_level === 'low';
  }

  /**
   * Check if risk level is unknown
   * @returns True if risk level is unknown
   */
  public isUnknownRisk(): boolean {
    return this.risk_level === 'unknown';
  }

  /**
   * Check if the wallet has been active recently
   * @param days Number of days to consider "recent" (default: 30)
   * @returns True if last active within specified days
   */
  public isRecentlyActive(days: number = 30): boolean {
    if (!this.last_active) return false;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.last_active > cutoffDate;
  }

  /**
   * Check if the wallet has a significant balance
   * @param threshold Balance threshold (default: 1.0)
   * @returns True if current balance exceeds threshold
   */
  public hasSignificantBalance(threshold: number = 1.0): boolean {
    return Number(this.current_balance) >= threshold;
  }

  /**
   * Check if the wallet has received significant amounts
   * @param threshold Received threshold (default: 10.0)
   * @returns True if total received exceeds threshold
   */
  public hasSignificantActivity(threshold: number = 10.0): boolean {
    return Number(this.total_received) >= threshold;
  }

  /**
   * Get the age of the wallet in days
   * @returns Age in days since first seen, or since creation if no first_seen
   */
  public getAge(): number {
    const referenceDate = this.first_seen || this.created_at;
    const diffTime = new Date().getTime() - referenceDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days since last activity
   * @returns Days since last active, null if never active
   */
  public getDaysSinceLastActivity(): number | null {
    if (!this.last_active) return null;
    const diffTime = new Date().getTime() - this.last_active.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate activity ratio (current balance / total received)
   * @returns Activity ratio (0-1), 0 if no received amount
   */
  public getActivityRatio(): number {
    const totalReceived = Number(this.total_received);
    const currentBalance = Number(this.current_balance);
    if (totalReceived === 0) return 0;
    return Math.min(1, currentBalance / totalReceived);
  }

  /**
   * Get transaction analysis data for a specific key
   * @param key Analysis key to retrieve
   * @returns Analysis value or undefined
   */
  public getAnalysisData(key: string): any {
    return this.transaction_analysis[key];
  }

  /**
   * Check if wallet has specific threat association
   * @param threat Threat type to check for
   * @returns True if threat is associated
   */
  public hasThreatAssociation(threat: string): boolean {
    return this.associated_threats.includes(threat);
  }

  /**
   * Check if wallet has specific tag
   * @param tag Tag to check for
   * @returns True if tag exists
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * Get cryptocurrency symbol formatted
   * @returns Cryptocurrency symbol in uppercase
   */
  public getCryptocurrencySymbol(): string {
    return this.cryptocurrency.toUpperCase();
  }

  /**
   * Get risk level color code
   * @returns Color associated with risk level
   */
  public getRiskColor(): string {
    switch (this.risk_level) {
      case 'critical': return '#FF0000';
      case 'high': return '#FF6600';
      case 'medium': return '#FFAA00';
      case 'low': return '#00AA00';
      default: return '#808080';
    }
  }

  /**
   * Update the risk level
   * @param level New risk level
   * @param reason Optional reason for the change
   * @returns Promise resolving to updated wallet
   */
  public async updateRiskLevel(level: CryptoWalletAttributes['risk_level'], reason?: string): Promise<this> {
    this.risk_level = level;
    if (reason) {
      this.metadata = {
        ...this.metadata,
        risk_update_reason: reason,
        risk_updated_at: new Date()
      };
    }
    return this.save();
  }

  /**
   * Add threat association
   * @param threat Threat type to associate
   * @returns Promise resolving to updated wallet
   */
  public async addThreatAssociation(threat: string): Promise<this> {
    if (!this.associated_threats.includes(threat)) {
      this.associated_threats = [...this.associated_threats, threat];
      return this.save();
    }
    return this;
  }

  /**
   * Remove threat association
   * @param threat Threat type to remove
   * @returns Promise resolving to updated wallet
   */
  public async removeThreatAssociation(threat: string): Promise<this> {
    this.associated_threats = this.associated_threats.filter(t => t !== threat);
    return this.save();
  }

  /**
   * Add tag to wallet
   * @param tag Tag to add
   * @returns Promise resolving to updated wallet
   */
  public async addTag(tag: string): Promise<this> {
    if (!this.tags.includes(tag)) {
      this.tags = [...this.tags, tag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove tag from wallet
   * @param tag Tag to remove
   * @returns Promise resolving to updated wallet
   */
  public async removeTag(tag: string): Promise<this> {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
  }

  /**
   * Update balance information
   * @param currentBalance New current balance
   * @param totalReceived New total received (optional)
   * @returns Promise resolving to updated wallet
   */
  public async updateBalance(currentBalance: number, totalReceived?: number): Promise<this> {
    this.current_balance = currentBalance;
    if (totalReceived !== undefined) {
      this.total_received = totalReceived;
    }
    this.last_active = new Date();
    return this.save();
  }

  /**
   * Update transaction analysis
   * @param analysisData New analysis data to merge
   * @returns Promise resolving to updated wallet
   */
  public async updateAnalysis(analysisData: Record<string, any>): Promise<this> {
    this.transaction_analysis = {
      ...this.transaction_analysis,
      ...analysisData,
      last_updated: new Date()
    };
    return this.save();
  }

  /**
   * Mark wallet as recently seen
   * @param timestamp Optional timestamp (defaults to now)
   * @returns Promise resolving to updated wallet
   */
  public async markSeen(timestamp?: Date): Promise<this> {
    const now = timestamp || new Date();
    if (!this.first_seen) {
      this.first_seen = now;
    }
    this.last_active = now;
    return this.save();
  }

  // Static methods
  /**
   * Find wallet by address
   * @param walletAddress Wallet address to search for
   * @returns Promise resolving to wallet or null
   */
  static async findByAddress(walletAddress: string): Promise<CryptoWallet | null> {
    return this.findOne({ 
      where: { wallet_address: walletAddress }
    });
  }

  /**
   * Find wallets by cryptocurrency type
   * @param crypto Cryptocurrency type
   * @returns Promise resolving to wallets of specified type
   */
  static async findByCryptocurrency(crypto: CryptoWalletAttributes['cryptocurrency']): Promise<CryptoWallet[]> {
    return this.findAll({
      where: { cryptocurrency: crypto },
      order: [['total_received', 'DESC']]
    });
  }

  /**
   * Find wallets by risk level
   * @param riskLevel Risk level to filter by
   * @returns Promise resolving to wallets with specified risk level
   */
  static async findByRiskLevel(riskLevel: CryptoWalletAttributes['risk_level']): Promise<CryptoWallet[]> {
    return this.findAll({
      where: { risk_level: riskLevel },
      order: [['total_received', 'DESC']]
    });
  }

  /**
   * Find high-risk wallets
   * @returns Promise resolving to high and critical risk wallets
   */
  static async findHighRisk(): Promise<CryptoWallet[]> {
    return this.findAll({
      where: { 
        risk_level: { [Op.in]: ['high', 'critical'] }
      },
      order: [['risk_level', 'DESC'], ['total_received', 'DESC']]
    });
  }

  /**
   * Find wallets with significant balances
   * @param threshold Balance threshold (default: 1.0)
   * @returns Promise resolving to wallets with significant balances
   */
  static async findWithSignificantBalance(threshold: number = 1.0): Promise<CryptoWallet[]> {
    return this.findAll({
      where: {
        current_balance: { [Op.gte]: threshold }
      },
      order: [['current_balance', 'DESC']]
    });
  }

  /**
   * Find recently active wallets
   * @param days Number of days to consider "recent" (default: 30)
   * @returns Promise resolving to recently active wallets
   */
  static async findRecentlyActive(days: number = 30): Promise<CryptoWallet[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        last_active: { [Op.gte]: cutoffDate }
      },
      order: [['last_active', 'DESC']]
    });
  }

  /**
   * Find wallets by threat association
   * @param threat Threat type to search for
   * @returns Promise resolving to wallets with specified threat
   */
  static async findByThreat(threat: string): Promise<CryptoWallet[]> {
    return this.findAll({
      where: {
        associated_threats: { [Op.contains]: [threat] }
      },
      order: [['risk_level', 'DESC'], ['total_received', 'DESC']]
    });
  }

  /**
   * Find wallets by tag
   * @param tag Tag to search for
   * @returns Promise resolving to wallets with specified tag
   */
  static async findByTag(tag: string): Promise<CryptoWallet[]> {
    return this.findAll({
      where: {
        tags: { [Op.contains]: [tag] }
      },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find dormant wallets (inactive for specified period)
   * @param days Number of days to consider "dormant" (default: 90)
   * @returns Promise resolving to dormant wallets
   */
  static async findDormant(days: number = 90): Promise<CryptoWallet[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { last_active: { [Op.lt]: cutoffDate } },
          { last_active: { [Op.is]: null } }
        ]
      },
      order: [['last_active', 'ASC']]
    });
  }

  /**
   * Find wallets with balance changes (potential money laundering)
   * @param activityRatioThreshold Activity ratio threshold (default: 0.1)
   * @returns Promise resolving to wallets with suspicious activity
   */
  static async findWithBalanceChanges(activityRatioThreshold: number = 0.1): Promise<CryptoWallet[]> {
    return this.findAll({
      where: {
        total_received: { [Op.gt]: 0 }
      },
      order: [['total_received', 'DESC']]
    }).then(wallets => 
      wallets.filter(wallet => wallet.getActivityRatio() < activityRatioThreshold)
    );
  }

  /**
   * Get cryptocurrency distribution statistics
   * @returns Promise resolving to crypto distribution stats
   */
  static async getCryptocurrencyStats(): Promise<Array<{
    cryptocurrency: string;
    count: number;
    total_balance: number;
    avg_balance: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'cryptocurrency',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('current_balance')), 'total_balance'],
        [this.sequelize!.fn('AVG', this.sequelize!.col('current_balance')), 'avg_balance']
      ],
      group: ['cryptocurrency'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      cryptocurrency: r.cryptocurrency,
      count: parseInt((r as any).getDataValue('count')),
      total_balance: parseFloat((r as any).getDataValue('total_balance')) || 0,
      avg_balance: parseFloat((r as any).getDataValue('avg_balance')) || 0
    }));
  }

  /**
   * Get risk level distribution statistics
   * @returns Promise resolving to risk level stats
   */
  static async getRiskLevelStats(): Promise<Array<{
    risk_level: string;
    count: number;
    total_balance: number;
  }>> {
    const results = await this.findAll({
      attributes: [
        'risk_level',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count'],
        [this.sequelize!.fn('SUM', this.sequelize!.col('current_balance')), 'total_balance']
      ],
      group: ['risk_level'],
      order: [['risk_level', 'ASC']]
    });
    
    return results.map(r => ({
      risk_level: r.risk_level,
      count: parseInt((r as any).getDataValue('count')),
      total_balance: parseFloat((r as any).getDataValue('total_balance')) || 0
    }));
  }

  /**
   * Get overall wallet statistics
   * @returns Promise resolving to overall statistics
   */
  static async getOverallStats(): Promise<{
    total_wallets: number;
    high_risk_wallets: number;
    active_wallets: number;
    total_balance_tracked: number;
    avg_balance: number;
    unique_cryptocurrencies: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Active in last 30 days
    
    const [
      totalWallets,
      highRiskWallets,
      activeWallets,
      balanceResult,
      avgBalanceResult,
      uniqueCryptosResult
    ] = await Promise.all([
      this.count(),
      this.count({ where: { risk_level: { [Op.in]: ['high', 'critical'] } } }),
      this.count({ where: { last_active: { [Op.gte]: cutoffDate } } }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('SUM', this.sequelize!.col('current_balance')), 'total_balance']
        ]
      }).then(results => results[0]),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('current_balance')), 'avg_balance']
        ]
      }).then(results => results[0]),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('COUNT', this.sequelize!.fn('DISTINCT', this.sequelize!.col('cryptocurrency'))), 'unique_cryptos']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_wallets: totalWallets,
      high_risk_wallets: highRiskWallets,
      active_wallets: activeWallets,
      total_balance_tracked: parseFloat((balanceResult as any).getDataValue('total_balance')) || 0,
      avg_balance: parseFloat((avgBalanceResult as any).getDataValue('avg_balance')) || 0,
      unique_cryptocurrencies: parseInt((uniqueCryptosResult as any).getDataValue('unique_cryptos')) || 0
    };
  }

  /**
   * Create crypto wallet with validation
   * @param data Wallet data to create
   * @returns Promise resolving to created wallet
   */
  static async createWallet(data: CryptoWalletCreationAttributes): Promise<CryptoWallet> {
    // Validate wallet address format (basic validation)
    if (!data.wallet_address || data.wallet_address.length < 10) {
      throw new Error('Invalid wallet address format');
    }

    // Check for duplicate addresses
    const existingWallet = await this.findByAddress(data.wallet_address);
    if (existingWallet) {
      throw new Error('Wallet address already exists');
    }

    // Set first seen if not provided
    if (!data.first_seen) {
      data.first_seen = new Date();
    }

    return this.create(data);
  }
}

export default CryptoWallet;
