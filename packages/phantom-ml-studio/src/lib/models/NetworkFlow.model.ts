/**
 * NETWORK FLOW SEQUELIZE MODEL
 * Represents network traffic flows for analysis with comprehensive type safety
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

// NetworkFlow Attributes Interface
export interface NetworkFlowAttributes {
  /** Unique identifier for the network flow */
  id: number;
  /** Source IP address */
  source_ip: string;
  /** Destination IP address */
  destination_ip: string;
  /** Source port number */
  source_port: number;
  /** Destination port number */
  destination_port: number;
  /** Network protocol (TCP, UDP, ICMP, etc.) */
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'OTHER';
  /** When the flow started */
  flow_start?: Date;
  /** When the flow ended */
  flow_end?: Date;
  /** Number of bytes sent from source */
  bytes_sent: number;
  /** Number of bytes received by source */
  bytes_received: number;
  /** Number of packets sent from source */
  packets_sent: number;
  /** Number of packets received by source */
  packets_received: number;
  /** Flow classification */
  classification: 'normal' | 'suspicious' | 'malicious' | 'blocked' | 'allowed';
  /** Anomaly detection score (0-100) */
  anomaly_score: number;
  /** Flow flags and attributes */
  flags: string[];
  /** Geolocation information */
  geolocation_data: Record<string, any>;
  /** Additional flow metadata */
  metadata: Record<string, any>;
  /** Record creation timestamp */
  created_at: Date;
  /** Record last update timestamp */
  updated_at: Date;
}

// NetworkFlow Creation Attributes Interface
export interface NetworkFlowCreationAttributes extends Optional<NetworkFlowAttributes,
  'id' | 'flow_start' | 'flow_end' | 'bytes_sent' | 'bytes_received' | 
  'packets_sent' | 'packets_received' | 'classification' | 'anomaly_score' | 
  'flags' | 'geolocation_data' | 'metadata' | 'created_at' | 'updated_at'
> {}

@Table({
  tableName: 'network_flows',
  timestamps: true,
  underscored: true,
  paranoid: false,
  indexes: [
    { fields: ['source_ip'] },
    { fields: ['destination_ip'] },
    { fields: ['source_port'] },
    { fields: ['destination_port'] },
    { fields: ['protocol'] },
    { fields: ['flow_start'] },
    { fields: ['flow_end'] },
    { fields: ['classification'] },
    { fields: ['anomaly_score'] },
    { fields: ['created_at'] },
    { fields: ['source_ip', 'destination_ip'] },
    { fields: ['source_ip', 'destination_port'] }
  ]
})
export class NetworkFlow extends Model<NetworkFlowAttributes, NetworkFlowCreationAttributes> implements NetworkFlowAttributes {
  /** Unique identifier for the network flow */
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  /** Source IP address */
  @AllowNull(false)
  @Index
  @Length({ min: 7, max: 45 }) // IPv4: min 7 chars, IPv6: max 45 chars
  @Column(DataType.STRING(45))
  declare source_ip: string;

  /** Destination IP address */
  @AllowNull(false)
  @Index
  @Length({ min: 7, max: 45 })
  @Column(DataType.STRING(45))
  declare destination_ip: string;

  /** Source port number */
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare source_port: number;

  /** Destination port number */
  @AllowNull(false)
  @Index
  @Column(DataType.INTEGER)
  declare destination_port: number;

  /** Network protocol (TCP, UDP, ICMP, etc.) */
  @AllowNull(false)
  @Index
  @Column(DataType.ENUM('TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'OTHER'))
  declare protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'OTHER';

  /** When the flow started */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare flow_start?: Date;

  /** When the flow ended */
  @AllowNull(true)
  @Index
  @Column(DataType.DATE)
  declare flow_end?: Date;

  /** Number of bytes sent from source */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.BIGINT)
  declare bytes_sent: number;

  /** Number of bytes received by source */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.BIGINT)
  declare bytes_received: number;

  /** Number of packets sent from source */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare packets_sent: number;

  /** Number of packets received by source */
  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare packets_received: number;

  /** Flow classification */
  @AllowNull(false)
  @Default('normal')
  @Index
  @Column(DataType.ENUM('normal', 'suspicious', 'malicious', 'blocked', 'allowed'))
  declare classification: 'normal' | 'suspicious' | 'malicious' | 'blocked' | 'allowed';

  /** Anomaly detection score (0-100) */
  @AllowNull(false)
  @Default(0)
  @Index
  @Column(DataType.INTEGER)
  declare anomaly_score: number;

  /** Flow flags and attributes */
  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare flags: string[];

  /** Geolocation information */
  @AllowNull(false)
  @Default('{}')
  @Column(DataType.JSONB)
  declare geolocation_data: Record<string, any>;

  /** Additional flow metadata */
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
   * Check if the flow is classified as suspicious
   * @returns True if classification is suspicious or high anomaly score
   */
  public isSuspicious(): boolean {
    return this.classification === 'suspicious' || this.anomaly_score >= 70;
  }

  /**
   * Check if the flow is classified as malicious
   * @returns True if classification is malicious or very high anomaly score
   */
  public isMalicious(): boolean {
    return this.classification === 'malicious' || this.anomaly_score >= 90;
  }

  /**
   * Check if the flow is blocked
   * @returns True if classification is blocked
   */
  public isBlocked(): boolean {
    return this.classification === 'blocked';
  }

  /**
   * Check if the flow is explicitly allowed
   * @returns True if classification is allowed
   */
  public isAllowed(): boolean {
    return this.classification === 'allowed';
  }

  /**
   * Check if the flow is normal/benign
   * @returns True if classification is normal and low anomaly score
   */
  public isNormal(): boolean {
    return this.classification === 'normal' && this.anomaly_score < 50;
  }

  /**
   * Get flow duration in seconds
   * @returns Duration in seconds, or null if timestamps unavailable
   */
  public getDuration(): number | null {
    if (!this.flow_start || !this.flow_end) return null;
    return Math.round((this.flow_end.getTime() - this.flow_start.getTime()) / 1000);
  }

  /**
   * Get total bytes transferred (sent + received)
   * @returns Total bytes in the flow
   */
  public getTotalBytes(): number {
    return this.bytes_sent + this.bytes_received;
  }

  /**
   * Get total packets transferred (sent + received)
   * @returns Total packets in the flow
   */
  public getTotalPackets(): number {
    return this.packets_sent + this.packets_received;
  }

  /**
   * Calculate average bytes per packet
   * @returns Average bytes per packet, or 0 if no packets
   */
  public getAverageBytesPerPacket(): number {
    const totalPackets = this.getTotalPackets();
    if (totalPackets === 0) return 0;
    return Math.round(this.getTotalBytes() / totalPackets);
  }

  /**
   * Calculate bits per second (throughput)
   * @returns Throughput in bits per second, or null if duration unavailable
   */
  public getThroughputBps(): number | null {
    const duration = this.getDuration();
    if (!duration || duration === 0) return null;
    return Math.round((this.getTotalBytes() * 8) / duration);
  }

  /**
   * Get packets per second rate
   * @returns Packets per second, or null if duration unavailable
   */
  public getPacketsPerSecond(): number | null {
    const duration = this.getDuration();
    if (!duration || duration === 0) return null;
    return Math.round(this.getTotalPackets() / duration);
  }

  /**
   * Check if this is a high-volume flow
   * @param threshold Byte threshold for high volume (default: 1MB)
   * @returns True if flow exceeds threshold
   */
  public isHighVolume(threshold: number = 1024 * 1024): boolean {
    return this.getTotalBytes() > threshold;
  }

  /**
   * Check if this is a long-duration flow
   * @param threshold Duration threshold in seconds (default: 300s)
   * @returns True if flow duration exceeds threshold
   */
  public isLongDuration(threshold: number = 300): boolean {
    const duration = this.getDuration();
    return duration !== null && duration > threshold;
  }

  /**
   * Get risk level based on classification and anomaly score
   * @returns Risk level classification
   */
  public getRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.classification === 'malicious' || this.anomaly_score >= 90) return 'critical';
    if (this.classification === 'suspicious' || this.anomaly_score >= 70) return 'high';
    if (this.anomaly_score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Check if flow uses a well-known port
   * @returns True if using common service ports
   */
  public usesWellKnownPort(): boolean {
    const wellKnownPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995];
    return wellKnownPorts.includes(this.destination_port);
  }

  /**
   * Check if source and destination are in the same subnet
   * @returns True if IPs appear to be in same private network
   */
  public isInternalTraffic(): boolean {
    const isPrivateIP = (ip: string): boolean => {
      return ip.startsWith('10.') || 
             ip.startsWith('192.168.') || 
             !!ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
    };
    
    return isPrivateIP(this.source_ip) && isPrivateIP(this.destination_ip);
  }

  /**
   * Check if this is external traffic (one endpoint is public)
   * @returns True if at least one IP is external/public
   */
  public isExternalTraffic(): boolean {
    return !this.isInternalTraffic();
  }

  /**
   * Get flow direction description
   * @returns Flow direction as string
   */
  public getFlowDirection(): 'internal' | 'outbound' | 'inbound' | 'external' {
    const isSourcePrivate = this.source_ip.startsWith('10.') || 
                           this.source_ip.startsWith('192.168.') || 
                           !!this.source_ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);
    const isDestPrivate = this.destination_ip.startsWith('10.') || 
                          this.destination_ip.startsWith('192.168.') || 
                          !!this.destination_ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

    if (isSourcePrivate && isDestPrivate) return 'internal';
    if (isSourcePrivate && !isDestPrivate) return 'outbound';
    if (!isSourcePrivate && isDestPrivate) return 'inbound';
    return 'external';
  }

  /**
   * Update classification and anomaly score
   * @param classification New classification
   * @param anomalyScore New anomaly score
   * @returns Promise resolving to updated flow
   */
  public async updateClassification(
    classification: NetworkFlowAttributes['classification'], 
    anomalyScore?: number
  ): Promise<this> {
    this.classification = classification;
    if (anomalyScore !== undefined) {
      this.anomaly_score = Math.max(0, Math.min(100, anomalyScore));
    }
    return this.save();
  }

  /**
   * Add a flag to the flow
   * @param flag Flag to add
   * @returns Promise resolving to updated flow
   */
  public async addFlag(flag: string): Promise<this> {
    if (!this.flags.includes(flag)) {
      this.flags = [...this.flags, flag];
      return this.save();
    }
    return this;
  }

  /**
   * Remove a flag from the flow
   * @param flag Flag to remove
   * @returns Promise resolving to updated flow
   */
  public async removeFlag(flag: string): Promise<this> {
    this.flags = this.flags.filter(f => f !== flag);
    return this.save();
  }

  // Static methods
  /**
   * Find flows by source IP address
   * @param sourceIp Source IP to search for
   * @returns Promise resolving to flows from source IP
   */
  static async findBySourceIP(sourceIp: string): Promise<NetworkFlow[]> {
    return this.findAll({
      where: { source_ip: sourceIp },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find flows by destination IP address
   * @param destinationIp Destination IP to search for
   * @returns Promise resolving to flows to destination IP
   */
  static async findByDestinationIP(destinationIp: string): Promise<NetworkFlow[]> {
    return this.findAll({
      where: { destination_ip: destinationIp },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find flows involving a specific IP (source or destination)
   * @param ip IP address to search for
   * @returns Promise resolving to flows involving the IP
   */
  static async findByIP(ip: string): Promise<NetworkFlow[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { source_ip: ip },
          { destination_ip: ip }
        ]
      },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find flows by destination port
   * @param port Port number to search for
   * @returns Promise resolving to flows to destination port
   */
  static async findByPort(port: number): Promise<NetworkFlow[]> {
    return this.findAll({
      where: { destination_port: port },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find flows by protocol
   * @param protocol Protocol to search for
   * @returns Promise resolving to flows using protocol
   */
  static async findByProtocol(protocol: NetworkFlowAttributes['protocol']): Promise<NetworkFlow[]> {
    return this.findAll({
      where: { protocol },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find suspicious flows
   * @returns Promise resolving to suspicious flows
   */
  static async findSuspicious(): Promise<NetworkFlow[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { classification: 'suspicious' },
          { anomaly_score: { [Op.gte]: 70 } }
        ]
      },
      order: [['anomaly_score', 'DESC'], ['flow_start', 'DESC']]
    });
  }

  /**
   * Find malicious flows
   * @returns Promise resolving to malicious flows
   */
  static async findMalicious(): Promise<NetworkFlow[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { classification: 'malicious' },
          { anomaly_score: { [Op.gte]: 90 } }
        ]
      },
      order: [['anomaly_score', 'DESC'], ['flow_start', 'DESC']]
    });
  }

  /**
   * Find flows by classification
   * @param classification Classification to filter by
   * @returns Promise resolving to flows with specified classification
   */
  static async findByClassification(classification: NetworkFlowAttributes['classification']): Promise<NetworkFlow[]> {
    return this.findAll({
      where: { classification },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find high-volume flows
   * @param threshold Minimum bytes threshold
   * @returns Promise resolving to high-volume flows
   */
  static async findHighVolume(threshold: number = 1024 * 1024): Promise<NetworkFlow[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { bytes_sent: { [Op.gte]: threshold } },
          { bytes_received: { [Op.gte]: threshold } },
          this.sequelize!.where(
            this.sequelize!.literal('(bytes_sent + bytes_received)'),
            { [Op.gte]: threshold }
          )
        ]
      },
      order: [[this.sequelize!.literal('(bytes_sent + bytes_received)'), 'DESC']]
    });
  }

  /**
   * Find flows within a time range
   * @param startTime Start of time range
   * @param endTime End of time range
   * @returns Promise resolving to flows in time range
   */
  static async findByTimeRange(startTime: Date, endTime: Date): Promise<NetworkFlow[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          {
            flow_start: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            flow_end: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            [Op.and]: [
              { flow_start: { [Op.lte]: startTime } },
              { flow_end: { [Op.gte]: endTime } }
            ]
          }
        ]
      },
      order: [['flow_start', 'ASC']]
    });
  }

  /**
   * Find recent flows within specified hours
   * @param hours Number of hours to look back (default: 1)
   * @returns Promise resolving to recent flows
   */
  static async findRecent(hours: number = 1): Promise<NetworkFlow[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return this.findAll({
      where: {
        [Op.or]: [
          { flow_start: { [Op.gte]: cutoffTime } },
          { created_at: { [Op.gte]: cutoffTime } }
        ]
      },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Find external flows (involving external IPs)
   * @returns Promise resolving to external flows
   */
  static async findExternal(): Promise<NetworkFlow[]> {
    return this.findAll({
      where: {
        [Op.and]: [
          {
            [Op.not]: {
              [Op.and]: [
                {
                  source_ip: {
                    [Op.or]: [
                      { [Op.like]: '10.%' },
                      { [Op.like]: '192.168.%' },
                      { [Op.regexp]: '^172\\.(1[6-9]|2[0-9]|3[0-1])\\.' }
                    ]
                  }
                },
                {
                  destination_ip: {
                    [Op.or]: [
                      { [Op.like]: '10.%' },
                      { [Op.like]: '192.168.%' },
                      { [Op.regexp]: '^172\\.(1[6-9]|2[0-9]|3[0-1])\\.' }
                    ]
                  }
                }
              ]
            }
          }
        ]
      },
      order: [['flow_start', 'DESC']]
    });
  }

  /**
   * Get protocol distribution statistics
   * @returns Promise resolving to protocol statistics
   */
  static async getProtocolStats(): Promise<Array<{ protocol: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'protocol',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['protocol'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      protocol: r.protocol,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get classification distribution statistics
   * @returns Promise resolving to classification statistics
   */
  static async getClassificationStats(): Promise<Array<{ classification: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'classification',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['classification'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']]
    });
    
    return results.map(r => ({
      classification: r.classification,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get top source IPs by flow count
   * @param limit Maximum number of IPs to return
   * @returns Promise resolving to top source IPs
   */
  static async getTopSourceIPs(limit: number = 10): Promise<Array<{ source_ip: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'source_ip',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['source_ip'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      limit
    });
    
    return results.map(r => ({
      source_ip: r.source_ip,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get top destination IPs by flow count
   * @param limit Maximum number of IPs to return
   * @returns Promise resolving to top destination IPs
   */
  static async getTopDestinationIPs(limit: number = 10): Promise<Array<{ destination_ip: string; count: number }>> {
    const results = await this.findAll({
      attributes: [
        'destination_ip',
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      group: ['destination_ip'],
      order: [[this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'DESC']],
      limit
    });
    
    return results.map(r => ({
      destination_ip: r.destination_ip,
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Get comprehensive flow statistics
   * @returns Promise resolving to flow statistics
   */
  static async getFlowStats(): Promise<{
    total_flows: number;
    suspicious_flows: number;
    malicious_flows: number;
    blocked_flows: number;
    high_volume_flows: number;
    external_flows: number;
    avg_anomaly_score: number;
  }> {
    const [
      totalFlows,
      suspiciousFlows,
      maliciousFlows,
      blockedFlows,
      highVolumeFlows,
      externalFlows,
      avgAnomalyResult
    ] = await Promise.all([
      this.count(),
      this.count({
        where: {
          [Op.or]: [
            { classification: 'suspicious' },
            { anomaly_score: { [Op.gte]: 70 } }
          ]
        }
      }),
      this.count({
        where: {
          [Op.or]: [
            { classification: 'malicious' },
            { anomaly_score: { [Op.gte]: 90 } }
          ]
        }
      }),
      this.count({ where: { classification: 'blocked' } }),
      this.count({
        where: this.sequelize!.where(
          this.sequelize!.literal('(bytes_sent + bytes_received)'),
          { [Op.gte]: 1024 * 1024 }
        )
      }),
      this.count({
        where: {
          [Op.not]: {
            [Op.and]: [
              {
                source_ip: {
                  [Op.or]: [
                    { [Op.like]: '10.%' },
                    { [Op.like]: '192.168.%' },
                    { [Op.regexp]: '^172\\.(1[6-9]|2[0-9]|3[0-1])\\.' }
                  ]
                }
              },
              {
                destination_ip: {
                  [Op.or]: [
                    { [Op.like]: '10.%' },
                    { [Op.like]: '192.168.%' },
                    { [Op.regexp]: '^172\\.(1[6-9]|2[0-9]|3[0-1])\\.' }
                  ]
                }
              }
            ]
          }
        }
      }),
      this.findAll({
        attributes: [
          [this.sequelize!.fn('AVG', this.sequelize!.col('anomaly_score')), 'avg_score']
        ]
      }).then(results => results[0])
    ]);

    return {
      total_flows: totalFlows,
      suspicious_flows: suspiciousFlows,
      malicious_flows: maliciousFlows,
      blocked_flows: blockedFlows,
      high_volume_flows: highVolumeFlows,
      external_flows: externalFlows,
      avg_anomaly_score: parseFloat((avgAnomalyResult as any).getDataValue('avg_score')) || 0
    };
  }

  /**
   * Get traffic trend data over time
   * @param hours Number of hours to analyze (default: 24)
   * @returns Promise resolving to trend data
   */
  static async getTrendStats(hours: number = 24): Promise<Array<{ hour: string; count: number }>> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    const results = await this.findAll({
      attributes: [
        [this.sequelize!.fn('DATE_TRUNC', 'hour', this.sequelize!.col('flow_start')), 'hour'],
        [this.sequelize!.fn('COUNT', this.sequelize!.col('id')), 'count']
      ],
      where: {
        flow_start: { [Op.gte]: cutoffTime }
      },
      group: [this.sequelize!.fn('DATE_TRUNC', 'hour', this.sequelize!.col('flow_start'))],
      order: [[this.sequelize!.fn('DATE_TRUNC', 'hour', this.sequelize!.col('flow_start')), 'ASC']]
    });
    
    return results.map(r => ({
      hour: (r as any).getDataValue('hour'),
      count: parseInt((r as any).getDataValue('count'))
    }));
  }

  /**
   * Create network flow with validation
   * @param data Flow data to create
   * @returns Promise resolving to created flow
   */
  static async createFlow(data: NetworkFlowCreationAttributes): Promise<NetworkFlow> {
    // Validate IP addresses format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (!ipRegex.test(data.source_ip)) {
      throw new Error('Invalid source IP address format');
    }
    if (!ipRegex.test(data.destination_ip)) {
      throw new Error('Invalid destination IP address format');
    }

    // Validate port numbers
    if (data.source_port < 0 || data.source_port > 65535) {
      throw new Error('Invalid source port number');
    }
    if (data.destination_port < 0 || data.destination_port > 65535) {
      throw new Error('Invalid destination port number');
    }

    // Set flow start time if not provided
    if (!data.flow_start) {
      data.flow_start = new Date();
    }

    return this.create(data);
  }
}

export default NetworkFlow;
