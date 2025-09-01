/**
 * Advanced Analytics Engine for Threat Intelligence
 * Provides Palantir-like pattern recognition and predictive analytics
 */

import { logger } from '../../utils/logger.js';
import { IDataRecord, IRelationship } from '../interfaces/IDataSource.js';

export interface IAnalyticsResult {
  type: string;
  confidence: number;
  findings: Array<{
    pattern: string;
    description: string;
    evidence: IDataRecord[];
    risk: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    metadata?: Record<string, any>;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    resources?: string[];
  }>;
  metadata: {
    executionTime: number;
    algorithmsUsed: string[];
    dataPoints: number;
  };
}

export interface IPatternDefinition {
  name: string;
  type: 'temporal' | 'spatial' | 'behavioral' | 'network' | 'infrastructure';
  rules: Array<{
    condition: string;
    weight: number;
    description: string;
  }>;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IThreatModel {
  name: string;
  version: string;
  patterns: IPatternDefinition[];
  riskFactors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  created: Date;
  lastUpdated: Date;
}

export interface ITimeSeriesPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface IAnomalyDetectionResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  reason: string;
  expectedRange: {
    min: number;
    max: number;
  };
  historicalContext: {
    mean: number;
    stdDev: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export class AdvancedAnalyticsEngine {
  private patterns: Map<string, IPatternDefinition> = new Map();
  private threatModels: Map<string, IThreatModel> = new Map();
  private baselineData: Map<string, ITimeSeriesPoint[]> = new Map();

  constructor() {
    this.initializeDefaultPatterns();
  }

  /**
   * Analyze data for threat patterns and anomalies
   */
  public async analyzeThreats(
    data: IDataRecord[],
    relationships: IRelationship[] = [],
    options: {
      patterns?: string[];
      models?: string[];
      includeAnomalies?: boolean;
      timeWindow?: { start: Date; end: Date };
    } = {}
  ): Promise<IAnalyticsResult> {
    const startTime = Date.now();
    const algorithmsUsed: string[] = [];
    
    logger.info(`Starting threat analysis on ${data.length} records`);

    const findings: IAnalyticsResult['findings'] = [];
    const recommendations: IAnalyticsResult['recommendations'] = [];

    // Pattern matching analysis
    if (options.patterns || options.patterns === undefined) {
      const patternFindings = await this.detectPatterns(
        data,
        relationships,
        options.patterns
      );
      findings.push(...patternFindings);
      algorithmsUsed.push('pattern-matching');
    }

    // Behavioral analysis
    const behavioralFindings = await this.analyzeBehavior(data);
    findings.push(...behavioralFindings);
    algorithmsUsed.push('behavioral-analysis');

    // Network analysis
    if (relationships.length > 0) {
      const networkFindings = await this.analyzeNetwork(data, relationships);
      findings.push(...networkFindings);
      algorithmsUsed.push('network-analysis');
    }

    // Temporal analysis
    const temporalFindings = await this.analyzeTemporal(data, options.timeWindow);
    findings.push(...temporalFindings);
    algorithmsUsed.push('temporal-analysis');

    // Anomaly detection
    if (options.includeAnomalies !== false) {
      const anomalies = await this.detectAnomalies(data);
      findings.push(...anomalies);
      algorithmsUsed.push('anomaly-detection');
    }

    // Generate recommendations based on findings
    recommendations.push(...this.generateRecommendations(findings));

    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(findings);

    const executionTime = Date.now() - startTime;
    
    logger.info(`Threat analysis completed`, {
      findings: findings.length,
      recommendations: recommendations.length,
      confidence,
      executionTime
    });

    return {
      type: 'threat-analysis',
      confidence,
      findings: findings.sort((a, b) => b.score - a.score), // Sort by score descending
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      metadata: {
        executionTime,
        algorithmsUsed,
        dataPoints: data.length
      }
    };
  }

  /**
   * Detect anomalies in time series data
   */
  public async detectTimeSeriesAnomalies(
    series: ITimeSeriesPoint[],
    options: {
      windowSize?: number;
      threshold?: number;
      method?: 'statistical' | 'isolation-forest' | 'lstm';
    } = {}
  ): Promise<Array<{
    point: ITimeSeriesPoint;
    anomaly: IAnomalyDetectionResult;
  }>> {
    const { windowSize = 24, threshold = 2.0, method = 'statistical' } = options;
    
    if (series.length < windowSize * 2) {
      logger.warn('Insufficient data for anomaly detection');
      return [];
    }

    // Removed unused variable
    
    switch (method) {
      case 'statistical':
        return this.statisticalAnomalyDetection(series, windowSize, threshold);
      case 'isolation-forest':
        return this.isolationForestDetection(series, threshold);
      case 'lstm':
        return this.lstmAnomalyDetection(series, windowSize, threshold);
      default:
        throw new Error(`Unsupported anomaly detection method: ${method}`);
    }
  }

  /**
   * Predict future threat trends
   */
  public async predictThreatTrends(
    historicalData: IDataRecord[],
    options: {
      horizon?: number; // days to predict
      confidence?: number;
      features?: string[];
    } = {}
  ): Promise<{
    predictions: Array<{
      date: Date;
      predicted: number;
      confidence: number;
      bounds: { lower: number; upper: number };
    }>;
    model: {
      accuracy: number;
      features: string[];
      algorithm: string;
    };
    trends: Array<{
      metric: string;
      trend: 'increasing' | 'decreasing' | 'stable';
      rate: number;
      significance: number;
    }>;
  }> {
    const { horizon = 7, confidence = 0.95 } = options;
    
    logger.info(`Predicting threat trends for ${horizon} days`);

    // Simple trend analysis (in production, would use ML models)
    const timeSeries = this.extractTimeSeries(historicalData);
    const trends = this.calculateTrends(timeSeries);
    
    // Generate predictions using linear regression
    const predictions = this.generatePredictions(timeSeries, horizon, confidence);
    
    return {
      predictions,
      model: {
        accuracy: 0.85, // Placeholder - would be calculated from validation
        features: ['timestamp', 'severity', 'type', 'source'],
        algorithm: 'linear-regression'
      },
      trends
    };
  }

  /**
   * Register a custom threat pattern
   */
  public registerPattern(pattern: IPatternDefinition): void {
    this.patterns.set(pattern.name, pattern);
    logger.info(`Registered threat pattern: ${pattern.name}`);
  }

  /**
   * Register a threat model
   */
  public registerThreatModel(model: IThreatModel): void {
    this.threatModels.set(model.name, model);
    
    // Register all patterns from the model
    for (const pattern of model.patterns) {
      this.patterns.set(pattern.name, pattern);
    }
    
    logger.info(`Registered threat model: ${model.name}`);
  }

  /**
   * Update baseline data for anomaly detection
   */
  public updateBaseline(key: string, data: ITimeSeriesPoint[]): void {
    this.baselineData.set(key, data);
    logger.debug(`Updated baseline data for ${key} with ${data.length} points`);
  }

  /**
   * Detect patterns in the data
   */
  private async detectPatterns(
    data: IDataRecord[],
    relationships: IRelationship[],
    patternNames?: string[]
  ): Promise<IAnalyticsResult['findings']> {
    const findings: IAnalyticsResult['findings'] = [];
    
    const patternsToCheck = patternNames 
      ? patternNames.map(name => this.patterns.get(name)).filter(Boolean) as IPatternDefinition[]
      : Array.from(this.patterns.values());

    for (const pattern of patternsToCheck) {
      const matches = this.matchPattern(pattern, data, relationships);
      
      if (matches.length > 0) {
        findings.push({
          pattern: pattern.name,
          description: `Detected ${pattern.type} pattern: ${pattern.name}`,
          evidence: matches,
          risk: pattern.severity,
          score: this.calculatePatternScore(pattern, matches),
          metadata: {
            patternType: pattern.type,
            threshold: pattern.threshold,
            matchCount: matches.length
          }
        });
      }
    }

    return findings;
  }

  /**
   * Analyze behavioral patterns
   */
  private async analyzeBehavior(
    data: IDataRecord[]
  ): Promise<IAnalyticsResult['findings']> {
    const findings: IAnalyticsResult['findings'] = [];
    
    // Group data by entities
    const entitiesByType = this.groupByType(data);
    
    for (const [type, entities] of entitiesByType) {
      // Analyze frequency patterns
      const frequencyAnomalies = this.detectFrequencyAnomalies(entities);
      
      if (frequencyAnomalies.length > 0) {
        findings.push({
          pattern: 'frequency-anomaly',
          description: `Unusual frequency patterns detected for ${type}`,
          evidence: frequencyAnomalies,
          risk: 'medium',
          score: 65,
          metadata: {
            entityType: type,
            anomalyType: 'frequency'
          }
        });
      }

      // Analyze volume patterns
      const volumeAnomalies = this.detectVolumeAnomalies(entities);
      
      if (volumeAnomalies.length > 0) {
        findings.push({
          pattern: 'volume-anomaly',
          description: `Unusual volume patterns detected for ${type}`,
          evidence: volumeAnomalies,
          risk: 'medium',
          score: 60,
          metadata: {
            entityType: type,
            anomalyType: 'volume'
          }
        });
      }
    }

    return findings;
  }

  /**
   * Analyze network relationships
   */
  private async analyzeNetwork(
    data: IDataRecord[],
    relationships: IRelationship[]
  ): Promise<IAnalyticsResult['findings']> {
    const findings: IAnalyticsResult['findings'] = [];
    
    // Build network structure
    const network = this.buildNetwork(data, relationships);
    
    // Detect central nodes (potential command and control)
    const centralNodes = this.findCentralNodes(network);
    
    if (centralNodes.length > 0) {
      findings.push({
        pattern: 'central-nodes',
        description: 'Detected highly connected nodes (potential C2 infrastructure)',
        evidence: centralNodes.map(node => data.find(d => d.id === node.id)!).filter(Boolean),
        risk: 'high',
        score: 80,
        metadata: {
          analysisType: 'centrality',
          centralityScores: centralNodes.reduce((acc, node) => {
            acc[node.id] = node.centrality;
            return acc;
          }, {} as Record<string, number>)
        }
      });
    }

    // Detect dense clusters (potential botnets or coordinated campaigns)
    const clusters = this.findClusters(network);
    
    if (clusters.length > 0) {
      findings.push({
        pattern: 'dense-clusters',
        description: 'Detected densely connected clusters (potential coordinated activity)',
        evidence: this.getClusterEvidence(clusters, data),
        risk: 'medium',
        score: 70,
        metadata: {
          analysisType: 'clustering',
          clusterCount: clusters.length,
          averageClusterSize: clusters.reduce((sum, c) => sum + c.nodes.length, 0) / clusters.length
        }
      });
    }

    return findings;
  }

  /**
   * Analyze temporal patterns
   */
  private async analyzeTemporal(
    data: IDataRecord[],
    timeWindow?: { start: Date; end: Date }
  ): Promise<IAnalyticsResult['findings']> {
    const findings: IAnalyticsResult['findings'] = [];
    
    const filteredData = timeWindow 
      ? data.filter(d => d.timestamp >= timeWindow.start && d.timestamp <= timeWindow.end)
      : data;

    // Detect time-based bursts
    const bursts = this.detectTimeBursts(filteredData);
    
    if (bursts.length > 0) {
      findings.push({
        pattern: 'temporal-bursts',
        description: 'Detected unusual temporal activity bursts',
        evidence: bursts.flatMap(burst => burst.events),
        risk: 'medium',
        score: 65,
        metadata: {
          analysisType: 'temporal',
          burstCount: bursts.length,
          burstPeriods: bursts.map(b => ({
            start: b.startTime,
            end: b.endTime,
            intensity: b.intensity
          }))
        }
      });
    }

    // Detect periodic patterns
    const periodicPatterns = this.detectPeriodicPatterns(filteredData);
    
    if (periodicPatterns.length > 0) {
      findings.push({
        pattern: 'periodic-activity',
        description: 'Detected periodic activity patterns',
        evidence: periodicPatterns.flatMap(p => p.events),
        risk: 'low',
        score: 45,
        metadata: {
          analysisType: 'periodic',
          patterns: periodicPatterns.map(p => ({
            period: p.period,
            confidence: p.confidence
          }))
        }
      });
    }

    return findings;
  }

  /**
   * Detect general anomalies in data
   */
  private async detectAnomalies(data: IDataRecord[]): Promise<IAnalyticsResult['findings']> {
    const findings: IAnalyticsResult['findings'] = [];
    
    // Group by type for anomaly detection
    const typeGroups = this.groupByType(data);
    
    for (const [type, records] of typeGroups) {
      const anomalies = this.findOutliers(records);
      
      if (anomalies.length > 0) {
        findings.push({
          pattern: 'data-anomaly',
          description: `Detected data anomalies in ${type} records`,
          evidence: anomalies,
          risk: 'low',
          score: 40,
          metadata: {
            entityType: type,
            anomalyType: 'data-outlier',
            anomalyCount: anomalies.length
          }
        });
      }
    }

    return findings;
  }

  /**
   * Generate recommendations based on findings
   */
  private generateRecommendations(findings: IAnalyticsResult['findings']): IAnalyticsResult['recommendations'] {
    const recommendations: IAnalyticsResult['recommendations'] = [];
    
    for (const finding of findings) {
      switch (finding.risk) {
        case 'critical':
          recommendations.push({
            action: 'immediate-response',
            priority: 'critical',
            description: `Immediate investigation required for ${finding.pattern}`,
            resources: ['security-team', 'incident-response']
          });
          break;
        case 'high':
          recommendations.push({
            action: 'priority-investigation',
            priority: 'high',
            description: `High priority investigation for ${finding.pattern}`,
            resources: ['threat-analyst', 'security-tools']
          });
          break;
        case 'medium':
          recommendations.push({
            action: 'standard-investigation',
            priority: 'medium',
            description: `Standard investigation for ${finding.pattern}`,
            resources: ['analyst', 'monitoring-tools']
          });
          break;
        case 'low':
          recommendations.push({
            action: 'monitor',
            priority: 'low',
            description: `Continue monitoring ${finding.pattern}`,
            resources: ['automated-monitoring']
          });
          break;
      }
    }

    return recommendations;
  }

  /**
   * Initialize default threat patterns
   */
  private initializeDefaultPatterns(): void {
    // APT-like patterns
    this.registerPattern({
      name: 'apt-campaign',
      type: 'behavioral',
      rules: [
        {
          condition: 'multiple_techniques_same_actor',
          weight: 0.8,
          description: 'Multiple MITRE techniques from same actor'
        },
        {
          condition: 'lateral_movement',
          weight: 0.7,
          description: 'Evidence of lateral movement'
        },
        {
          condition: 'persistence_mechanisms',
          weight: 0.6,
          description: 'Multiple persistence mechanisms'
        }
      ],
      threshold: 0.7,
      severity: 'critical'
    });

    // Botnet patterns
    this.registerPattern({
      name: 'botnet-activity',
      type: 'network',
      rules: [
        {
          condition: 'central_command_control',
          weight: 0.9,
          description: 'Central command and control node'
        },
        {
          condition: 'synchronized_activity',
          weight: 0.7,
          description: 'Synchronized activity across multiple nodes'
        },
        {
          condition: 'similar_payloads',
          weight: 0.6,
          description: 'Similar payloads or signatures'
        }
      ],
      threshold: 0.75,
      severity: 'high'
    });

    // Data exfiltration patterns
    this.registerPattern({
      name: 'data-exfiltration',
      type: 'behavioral',
      rules: [
        {
          condition: 'unusual_data_volume',
          weight: 0.8,
          description: 'Unusual outbound data volume'
        },
        {
          condition: 'compressed_encrypted_data',
          weight: 0.7,
          description: 'Compressed or encrypted data transfers'
        },
        {
          condition: 'off_hours_activity',
          weight: 0.5,
          description: 'Activity during off hours'
        }
      ],
      threshold: 0.6,
      severity: 'high'
    });
  }

  // Helper methods for pattern matching and analysis
  private matchPattern(
    pattern: IPatternDefinition,
    data: IDataRecord[],
    relationships: IRelationship[]
  ): IDataRecord[] {
    // Simplified pattern matching - in production would be more sophisticated
    const matches: IDataRecord[] = [];
    let score = 0;

    for (const record of data) {
      let recordScore = 0;
      
      for (const rule of pattern.rules) {
        if (this.evaluateRule(rule, record, data, relationships)) {
          recordScore += rule.weight;
        }
      }
      
      if (recordScore >= pattern.threshold) {
        matches.push(record);
        score += recordScore;
      }
    }

    return matches;
  }

  private evaluateRule(
    rule: { condition: string; weight: number; description: string },
    record: IDataRecord,
    allData: IDataRecord[],
    relationships: IRelationship[]
  ): boolean {
    // Simplified rule evaluation - in production would be more comprehensive
    switch (rule.condition) {
      case 'multiple_techniques_same_actor':
        return this.hasMultipleTechniques(record, allData);
      case 'central_command_control':
        return this.isCentralNode(record, relationships);
      case 'unusual_data_volume':
        return this.hasUnusualVolume(record);
      default:
        return false;
    }
  }

  private hasMultipleTechniques(record: IDataRecord, allData: IDataRecord[]): boolean {
    const actorId = record.data.actor || record.data.source;
    if (!actorId) return false;
    
    const actorRecords = allData.filter(r => 
      r.data.actor === actorId || r.data.source === actorId
    );
    
    const techniques = new Set(actorRecords.map(r => r.data.technique).filter(Boolean));
    return techniques.size >= 3;
  }

  private isCentralNode(record: IDataRecord, relationships: IRelationship[]): boolean {
    const nodeId = record.id;
    const connections = relationships.filter(r => 
      r.sourceId === nodeId || r.targetId === nodeId
    );
    
    return connections.length >= 5; // Arbitrary threshold for centrality
  }

  private hasUnusualVolume(record: IDataRecord): boolean {
    const volume = record.data.dataSize || record.data.bytes || 0;
    return volume > 1000000; // 1MB threshold
  }

  private calculatePatternScore(pattern: IPatternDefinition, matches: IDataRecord[]): number {
    const baseScore = matches.length * 10;
    const severityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3
    }[pattern.severity];
    
    return Math.min(100, baseScore * severityMultiplier);
  }

  private calculateOverallConfidence(findings: IAnalyticsResult['findings']): number {
    if (findings.length === 0) return 0;
    
    const totalScore = findings.reduce((sum, finding) => sum + finding.score, 0);
    const maxPossibleScore = findings.length * 100;
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  // Placeholder implementations for complex algorithms
  private groupByType(data: IDataRecord[]): Map<string, IDataRecord[]> {
    const groups = new Map<string, IDataRecord[]>();
    
    for (const record of data) {
      const type = record.type;
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(record);
    }
    
    return groups;
  }

  private detectFrequencyAnomalies(entities: IDataRecord[]): IDataRecord[] {
    // Simplified frequency analysis
    const timestamps = entities.map(e => e.timestamp.getTime());
    const intervals = timestamps.slice(1).map((ts, i) => ts - (timestamps[i] || 0));
    
    if (intervals.length === 0) return [];
    
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const stdDev = Math.sqrt(
      intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
    );
    
    const threshold = avgInterval + 2 * stdDev;
    const anomalies: IDataRecord[] = [];
    
    intervals.forEach((interval, i) => {
      const nextEntity = entities[i + 1];
      if (interval > threshold && nextEntity) {
        anomalies.push(nextEntity);
      }
    });
    
    return anomalies;
  }

  private detectVolumeAnomalies(entities: IDataRecord[]): IDataRecord[] {
    // Simplified volume analysis
    const volumes = entities.map(e => {
      const size = e.data.size || e.data.bytes || e.data.length || 0;
      return typeof size === 'number' ? size : 0;
    });
    
    if (volumes.length === 0) return [];
    
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const stdDev = Math.sqrt(
      volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
    );
    
    const threshold = avgVolume + 2 * stdDev;
    
    return entities.filter((_, i) => volumes[i] && volumes[i] > threshold);
  }

  private buildNetwork(data: IDataRecord[], relationships: IRelationship[]): any {
    return {
      nodes: data.map(d => ({ id: d.id, data: d })),
      edges: relationships
    };
  }

  private findCentralNodes(network: any): Array<{ id: string; centrality: number }> {
    // Simplified centrality calculation
    const nodeDegrees = new Map<string, number>();
    
    for (const edge of network.edges) {
      nodeDegrees.set(edge.sourceId, (nodeDegrees.get(edge.sourceId) || 0) + 1);
      nodeDegrees.set(edge.targetId, (nodeDegrees.get(edge.targetId) || 0) + 1);
    }
    
    return Array.from(nodeDegrees.entries())
      .filter(([_, degree]) => degree >= 3)
      .map(([id, degree]) => ({ id, centrality: degree }))
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 10);
  }

  private findClusters(network: any): Array<{ nodes: string[]; density: number }> {
    // Simplified clustering - in production would use sophisticated algorithms
    const clusters: Array<{ nodes: string[]; density: number }> = [];
    
    // Group highly connected nodes
    const processed = new Set<string>();
    
    for (const node of network.nodes) {
      if (processed.has(node.id)) continue;
      
      const neighbors = this.getNeighbors(node.id, network.edges);
      if (neighbors.length >= 3) {
        const cluster = [node.id, ...neighbors];
        const density = this.calculateClusterDensity(cluster, network.edges);
        
        if (density > 0.6) {
          clusters.push({ nodes: cluster, density });
          cluster.forEach(n => processed.add(n));
        }
      }
    }
    
    return clusters;
  }

  private getNeighbors(nodeId: string, edges: any[]): string[] {
    const neighbors = new Set<string>();
    
    for (const edge of edges) {
      if (edge.sourceId === nodeId) {
        neighbors.add(edge.targetId);
      } else if (edge.targetId === nodeId) {
        neighbors.add(edge.sourceId);
      }
    }
    
    return Array.from(neighbors);
  }

  private calculateClusterDensity(nodes: string[], edges: any[]): number {
    const clusterEdges = edges.filter(e => 
      nodes.includes(e.sourceId) && nodes.includes(e.targetId)
    );
    
    const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
    return maxPossibleEdges > 0 ? clusterEdges.length / maxPossibleEdges : 0;
  }

  private getClusterEvidence(clusters: any[], data: IDataRecord[]): IDataRecord[] {
    const evidence: IDataRecord[] = [];
    
    for (const cluster of clusters) {
      for (const nodeId of cluster.nodes) {
        const record = data.find(d => d.id === nodeId);
        if (record) {
          evidence.push(record);
        }
      }
    }
    
    return evidence;
  }

  private detectTimeBursts(data: IDataRecord[]): Array<{
    startTime: Date;
    endTime: Date;
    events: IDataRecord[];
    intensity: number;
  }> {
    // Simplified burst detection
    const sortedData = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const bursts: Array<{
      startTime: Date;
      endTime: Date;
      events: IDataRecord[];
      intensity: number;
    }> = [];
    
    const windowSize = 3600000; // 1 hour window
    const threshold = 10; // minimum events for a burst
    
    for (let i = 0; i < sortedData.length; i++) {
      const currentEvent = sortedData[i];
      if (!currentEvent) continue;
      
      const windowStart = currentEvent.timestamp;
      const windowEnd = new Date(windowStart.getTime() + windowSize);
      
      const eventsInWindow = sortedData.filter(d => 
        d.timestamp >= windowStart && d.timestamp <= windowEnd
      );
      
      if (eventsInWindow.length >= threshold) {
        const intensity = eventsInWindow.length / (windowSize / 1000); // events per second
        
        bursts.push({
          startTime: windowStart,
          endTime: windowEnd,
          events: eventsInWindow,
          intensity
        });
      }
    }
    
    return bursts;
  }

  private detectPeriodicPatterns(data: IDataRecord[]): Array<{
    period: number;
    confidence: number;
    events: IDataRecord[];
  }> {
    // Simplified periodic pattern detection
    const patterns: Array<{
      period: number;
      confidence: number;
      events: IDataRecord[];
    }> = [];
    
    const sortedData = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const intervals = [3600000, 86400000, 604800000]; // 1 hour, 1 day, 1 week
    
    for (const period of intervals) {
      const buckets = new Map<number, IDataRecord[]>();
      
      for (const record of sortedData) {
        const bucket = Math.floor(record.timestamp.getTime() / period);
        if (!buckets.has(bucket)) {
          buckets.set(bucket, []);
        }
        buckets.get(bucket)!.push(record);
      }
      
      const bucketSizes = Array.from(buckets.values()).map(b => b.length);
      const avgBucketSize = bucketSizes.reduce((sum, size) => sum + size, 0) / bucketSizes.length;
      const variance = bucketSizes.reduce((sum, size) => sum + Math.pow(size - avgBucketSize, 2), 0) / bucketSizes.length;
      const stdDev = Math.sqrt(variance);
      
      const confidence = stdDev > 0 ? (avgBucketSize / stdDev) : 0;
      
      if (confidence > 2) { // Threshold for periodicity
        patterns.push({
          period,
          confidence,
          events: Array.from(buckets.values()).flat()
        });
      }
    }
    
    return patterns;
  }

  private findOutliers(records: IDataRecord[]): IDataRecord[] {
    // Simplified outlier detection using IQR method
    if (records.length < 4) return [];
    
    const values = records.map(r => {
      // Use a composite score based on available numeric fields
      const score = (r.data.confidence || 50) + 
                   (r.data.severity === 'critical' ? 100 : 
                    r.data.severity === 'high' ? 75 : 
                    r.data.severity === 'medium' ? 50 : 25);
      return score;
    });
    
    values.sort((a, b) => a - b);
    
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return records.filter((record) => {
      const value = (record.data.confidence || 50) + 
                   (record.data.severity === 'critical' ? 100 : 
                    record.data.severity === 'high' ? 75 : 
                    record.data.severity === 'medium' ? 50 : 25);
      return value < lowerBound || value > upperBound;
    });
  }

  private statisticalAnomalyDetection(
    series: ITimeSeriesPoint[],
    windowSize: number,
    threshold: number
  ): Array<{ point: ITimeSeriesPoint; anomaly: IAnomalyDetectionResult }> {
    const results: Array<{ point: ITimeSeriesPoint; anomaly: IAnomalyDetectionResult }> = [];
    
    for (let i = windowSize; i < series.length; i++) {
      const window = series.slice(i - windowSize, i);
      const mean = window.reduce((sum, p) => sum + p.value, 0) / window.length;
      const variance = window.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / window.length;
      const stdDev = Math.sqrt(variance);
      
      const currentPoint = series[i];
      if (!currentPoint) continue;
      
      const score = Math.abs(currentPoint.value - mean) / (stdDev || 1);
      const isAnomaly = score > threshold;
      
      if (isAnomaly) {
        results.push({
          point: currentPoint,
          anomaly: {
            isAnomaly,
            score,
            confidence: Math.min(1, score / threshold),
            reason: `Value ${currentPoint.value} is ${score.toFixed(2)} standard deviations from mean`,
            expectedRange: {
              min: mean - threshold * stdDev,
              max: mean + threshold * stdDev
            },
            historicalContext: {
              mean,
              stdDev,
              trend: 'stable' // Simplified
            }
          }
        });
      }
    }
    
    return results;
  }

  private isolationForestDetection(
    series: ITimeSeriesPoint[],
    threshold: number
  ): Array<{ point: ITimeSeriesPoint; anomaly: IAnomalyDetectionResult }> {
    // Simplified isolation forest - in production would use proper ML implementation
    const results: Array<{ point: ITimeSeriesPoint; anomaly: IAnomalyDetectionResult }> = [];
    
    const values = series.map(p => p.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    
    for (const point of series) {
      const isolationScore = Math.abs(point.value - mean) / (stdDev || 1);
      const isAnomaly = isolationScore > threshold;
      
      if (isAnomaly) {
        results.push({
          point,
          anomaly: {
            isAnomaly,
            score: isolationScore,
            confidence: Math.min(1, isolationScore / threshold),
            reason: `Isolated value detected with score ${isolationScore.toFixed(2)}`,
            expectedRange: {
              min: mean - threshold * stdDev,
              max: mean + threshold * stdDev
            },
            historicalContext: {
              mean,
              stdDev,
              trend: 'stable'
            }
          }
        });
      }
    }
    
    return results;
  }

  private lstmAnomalyDetection(
    series: ITimeSeriesPoint[],
    windowSize: number,
    threshold: number
  ): Array<{ point: ITimeSeriesPoint; anomaly: IAnomalyDetectionResult }> {
    // Simplified LSTM simulation - in production would use TensorFlow.js or similar
    // For now, using moving average as proxy
    return this.statisticalAnomalyDetection(series, windowSize, threshold);
  }

  private extractTimeSeries(data: IDataRecord[]): ITimeSeriesPoint[] {
    const grouped = new Map<string, number>();
    
    for (const record of data) {
      const date = new Date(record.timestamp);
      date.setHours(0, 0, 0, 0); // Group by day
      const key = date.toISOString();
      
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }
    
    return Array.from(grouped.entries()).map(([date, count]) => ({
      timestamp: new Date(date),
      value: count
    })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private calculateTrends(series: ITimeSeriesPoint[]): Array<{
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    significance: number;
  }> {
    if (series.length < 2) return [];
    
    const values = series.map(p => p.value);
    const n = values.length;
    
    // Simple linear regression for trend
    const x = Array.from({ length: n }, (_, i) => i);
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = x.reduce((sum, xi, i) => {
      const value = values[i];
      return value !== undefined ? sum + (xi - meanX) * (value - meanY) : sum;
    }, 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    // Calculate correlation coefficient for significance
    const yVariance = values.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const correlation = yVariance !== 0 ? Math.abs(numerator / Math.sqrt(denominator * yVariance)) : 0;
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.1) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
    
    return [{
      metric: 'activity',
      trend,
      rate: slope,
      significance: correlation
    }];
  }

  private generatePredictions(
    series: ITimeSeriesPoint[],
    horizon: number,
    confidence: number
  ): Array<{
    date: Date;
    predicted: number;
    confidence: number;
    bounds: { lower: number; upper: number };
  }> {
    if (series.length < 2) return [];
    
    // Simple linear extrapolation
    const trends = this.calculateTrends(series);
    const trend = trends[0];
    
    if (!trend) return [];
    
    const lastPoint = series[series.length - 1];
    if (!lastPoint) return [];
    const predictions: Array<{
      date: Date;
      predicted: number;
      confidence: number;
      bounds: { lower: number; upper: number };
    }> = [];
    
    const values = series.map(p => p.value);
    const stdDev = Math.sqrt(values.reduce((sum, v) => {
      const mean = values.reduce((s, val) => s + val, 0) / values.length;
      return sum + Math.pow(v - mean, 2);
    }, 0) / values.length);
    
    const zScore = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.58 : 1.645;
    
    for (let i = 1; i <= horizon; i++) {
      const futureDate = new Date(lastPoint.timestamp);
      futureDate.setDate(futureDate.getDate() + i);
      
      const predicted = lastPoint.value + trend.rate * i;
      const margin = zScore * stdDev * Math.sqrt(i); // Error grows with time
      
      predictions.push({
        date: futureDate,
        predicted: Math.max(0, predicted),
        confidence: trend.significance,
        bounds: {
          lower: Math.max(0, predicted - margin),
          upper: predicted + margin
        }
      });
    }
    
    return predictions;
  }
}