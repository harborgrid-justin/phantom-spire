/**
 * Advanced Network Analysis Business Logic
 * Competing with Anomali's network analysis and lateral movement detection
 */

export interface NetworkFlow {
  id: string;
  sourceIP: string;
  destinationIP: string;
  sourcePort: number;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SMB' | 'RDP' | 'SSH' | 'FTP';
  bytesSent: number;
  bytesReceived: number;
  packetsSent: number;
  packetsReceived: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  flags: string[];
  application: string;
  user?: string;
  device?: string;
  riskScore: number;
  anomalies: NetworkAnomaly[];
}

export interface NetworkAnomaly {
  id: string;
  type: 'traffic_spike' | 'unusual_port' | 'lateral_movement' | 'data_exfiltration' | 'reconnaissance' | 'protocol_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  timestamp: Date;
  indicators: string[];
  mitreTactics?: string[];
  mitreTechniques?: string[];
}

export interface LateralMovement {
  id: string;
  sourceHost: string;
  targetHost: string;
  technique: 'pass_the_hash' | 'pass_the_ticket' | 'remote_execution' | 'lateral_tool_transfer' | 'remote_service' | 'windows_admin_shares';
  confidence: number;
  timestamp: Date;
  indicators: string[];
  riskScore: number;
  status: 'detected' | 'confirmed' | 'mitigated';
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  segments: NetworkSegment[];
  lastUpdated: Date;
  riskAssessment: {
    overallRisk: number;
    vulnerableNodes: number;
    exposedServices: number;
    segmentationGaps: number;
  };
}

export interface NetworkNode {
  id: string;
  ip: string;
  hostname?: string;
  macAddress?: string;
  type: 'server' | 'workstation' | 'network_device' | 'iot' | 'unknown';
  os?: string;
  services: NetworkService[];
  vulnerabilities: Vulnerability[];
  riskScore: number;
  lastSeen: Date;
  tags: string[];
}

export interface NetworkService {
  port: number;
  protocol: string;
  service: string;
  version?: string;
  state: 'open' | 'closed' | 'filtered';
  banner?: string;
  riskScore: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  protocol: string;
  port: number;
  frequency: number;
  bandwidth: number;
  riskScore: number;
  lastSeen: Date;
}

export interface NetworkSegment {
  id: string;
  name: string;
  cidr: string;
  nodes: string[];
  securityLevel: 'public' | 'dmz' | 'internal' | 'restricted';
  accessPolicies: AccessPolicy[];
  riskScore: number;
}

export interface AccessPolicy {
  sourceSegment: string;
  destinationSegment: string;
  allowedPorts: number[];
  allowedProtocols: string[];
  requiresAuthentication: boolean;
  lastValidated: Date;
}

export interface Vulnerability {
  id: string;
  cve?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore: number;
  affectedService: string;
  exploitability: 'low' | 'medium' | 'high';
  remediation?: string;
}

export interface EncryptedTrafficAnalysis {
  id: string;
  sourceIP: string;
  destinationIP: string;
  protocol: string;
  tlsVersion?: string;
  cipherSuite?: string;
  certificateInfo?: {
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
    fingerprint: string;
  };
  ja3Fingerprint?: string;
  ja3sFingerprint?: string;
  anomalies: string[];
  riskScore: number;
  classification: 'legitimate' | 'suspicious' | 'malicious' | 'unknown';
}

export interface NetworkPerformance {
  timestamp: Date;
  bandwidth: {
    total: number;
    used: number;
    utilization: number;
  };
  latency: {
    average: number;
    p95: number;
    p99: number;
  };
  packetLoss: number;
  errors: number;
  connections: {
    total: number;
    active: number;
    failed: number;
  };
}

export interface ProtocolAnalysis {
  protocol: string;
  version?: string;
  packetsAnalyzed: number;
  anomalies: ProtocolAnomaly[];
  signatures: ProtocolSignature[];
  performance: {
    throughput: number;
    latency: number;
    errorRate: number;
  };
}

export interface ProtocolAnomaly {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ProtocolSignature {
  id: string;
  name: string;
  pattern: string;
  riskScore: number;
  category: 'malware' | 'exploit' | 'recon' | 'data_exfil' | 'lateral_movement';
  mitreTechnique?: string;
}

export class AdvancedNetworkAnalysis {
  private networkFlows: Map<string, NetworkFlow> = new Map();
  private networkTopology: NetworkTopology;
  private lateralMovements: Map<string, LateralMovement> = new Map();
  private encryptedTraffic: Map<string, EncryptedTrafficAnalysis> = new Map();
  private protocolAnalyzers: Map<string, ProtocolAnalysis> = new Map();
  private performanceMetrics: NetworkPerformance[] = [];
  private anomalyDetectors: Map<string, AnomalyDetector> = new Map();

  constructor() {
    this.networkTopology = {
      nodes: [],
      edges: [],
      segments: [],
      lastUpdated: new Date(),
      riskAssessment: {
        overallRisk: 0,
        vulnerableNodes: 0,
        exposedServices: 0,
        segmentationGaps: 0
      }
    };
    this.initializeDefaultDetectors();
    this.initializeProtocolAnalyzers();
  }

  // Network Flow Analysis
  async analyzeNetworkFlow(flowData: Omit<NetworkFlow, 'id' | 'anomalies' | 'riskScore'>): Promise<NetworkFlow> {
    const flowId = `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const flow: NetworkFlow = {
      ...flowData,
      id: flowId,
      anomalies: [],
      riskScore: 0
    };

    // Analyze for anomalies
    flow.anomalies = await this.detectFlowAnomalies(flow);

    // Calculate risk score
    flow.riskScore = this.calculateFlowRiskScore(flow);

    // Check for lateral movement
    await this.detectLateralMovement(flow);

    // Update topology
    await this.updateNetworkTopology(flow);

    this.networkFlows.set(flowId, flow);
    return flow;
  }

  private async detectFlowAnomalies(flow: NetworkFlow): Promise<NetworkAnomaly[]> {
    const anomalies: NetworkAnomaly[] = [];

    // Traffic volume anomaly
    if (flow.bytesSent > 1000000 || flow.bytesReceived > 1000000) {
      anomalies.push({
        id: `anomaly_${Date.now()}_traffic_spike`,
        type: 'traffic_spike',
        severity: 'medium',
        description: 'Unusual high-volume data transfer detected',
        confidence: 0.8,
        timestamp: new Date(),
        indicators: [`${flow.bytesSent + flow.bytesReceived} bytes transferred`],
        mitreTactics: ['TA0010'],
        mitreTechniques: ['T1041']
      });
    }

    // Unusual port analysis
    if (this.isUnusualPort(flow.destinationPort)) {
      anomalies.push({
        id: `anomaly_${Date.now()}_unusual_port`,
        type: 'unusual_port',
        severity: 'low',
        description: `Connection to unusual port ${flow.destinationPort}`,
        confidence: 0.6,
        timestamp: new Date(),
        indicators: [`Port ${flow.destinationPort}`, flow.protocol],
        mitreTactics: ['TA0007'],
        mitreTechniques: ['T1046']
      });
    }

    // Protocol-specific analysis
    const protocolAnomalies = await this.analyzeProtocolAnomalies(flow.protocol, flow);
    const networkAnomalies: NetworkAnomaly[] = protocolAnomalies.map(pa => ({
      id: pa.id,
      type: pa.type as any,
      severity: pa.severity,
      description: pa.description,
      confidence: 0.8, // Default confidence for protocol anomalies
      timestamp: pa.lastSeen,
      indicators: [`Protocol: ${flow.protocol}`, `Frequency: ${pa.frequency}`],
      mitreTactics: [],
      mitreTechniques: []
    }));
    anomalies.push(...networkAnomalies);

    return anomalies;
  }

  private isUnusualPort(port: number): boolean {
    const commonPorts = [80, 443, 22, 21, 25, 53, 110, 143, 993, 995, 3389, 445, 139, 137, 138];
    return !commonPorts.includes(port) && port > 1024;
  }

  // Lateral Movement Detection
  async detectLateralMovement(flow: NetworkFlow): Promise<LateralMovement | null> {
    // Check for patterns indicative of lateral movement
    const lateralIndicators = this.analyzeLateralMovementIndicators(flow);

    if (lateralIndicators.length > 0) {
      const movement: LateralMovement = {
        id: `lateral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceHost: flow.sourceIP,
        targetHost: flow.destinationIP,
        technique: this.classifyLateralMovementTechnique(flow),
        confidence: this.calculateLateralMovementConfidence(lateralIndicators),
        timestamp: new Date(),
        indicators: lateralIndicators,
        riskScore: this.calculateLateralMovementRisk(flow),
        status: 'detected'
      };

      this.lateralMovements.set(movement.id, movement);
      return movement;
    }

    return null;
  }

  private analyzeLateralMovementIndicators(flow: NetworkFlow): string[] {
    const indicators: string[] = [];

    // SMB traffic (potential pass-the-hash)
    if (flow.protocol === 'SMB' && flow.destinationPort === 445) {
      indicators.push('SMB connection to remote host');
    }

    // RDP connections
    if (flow.protocol === 'RDP' && flow.destinationPort === 3389) {
      indicators.push('RDP connection to remote host');
    }

    // SSH connections to multiple hosts
    if (flow.protocol === 'SSH' && flow.destinationPort === 22) {
      indicators.push('SSH connection to remote host');
    }

    // Administrative share access
    if (flow.protocol === 'SMB' && ['ADMIN$', 'C$', 'D$'].some(share => flow.application?.includes(share))) {
      indicators.push('Administrative share access');
    }

    return indicators;
  }

  private classifyLateralMovementTechnique(flow: NetworkFlow): LateralMovement['technique'] {
    if (flow.protocol === 'SMB' && flow.destinationPort === 445) {
      return 'pass_the_hash';
    }
    if (flow.protocol === 'RDP') {
      return 'remote_execution';
    }
    if (flow.protocol === 'SMB' && ['ADMIN$', 'C$'].some(share => flow.application?.includes(share))) {
      return 'windows_admin_shares';
    }
    return 'remote_service';
  }

  // Network Topology Management
  async updateNetworkTopology(flow: NetworkFlow): Promise<void> {
    // Update or create source node
    let sourceNode = this.networkTopology.nodes.find(n => n.ip === flow.sourceIP);
    if (!sourceNode) {
      sourceNode = {
        id: `node_${flow.sourceIP}`,
        ip: flow.sourceIP,
        type: 'unknown',
        services: [],
        vulnerabilities: [],
        riskScore: 0,
        lastSeen: new Date(),
        tags: []
      };
      this.networkTopology.nodes.push(sourceNode);
    }
    sourceNode.lastSeen = new Date();

    // Update or create destination node
    let destNode = this.networkTopology.nodes.find(n => n.ip === flow.destinationIP);
    if (!destNode) {
      destNode = {
        id: `node_${flow.destinationIP}`,
        ip: flow.destinationIP,
        type: 'unknown',
        services: [],
        vulnerabilities: [],
        riskScore: 0,
        lastSeen: new Date(),
        tags: []
      };
      this.networkTopology.nodes.push(destNode);
    }
    destNode.lastSeen = new Date();

    // Add service to destination node
    const existingService = destNode.services.find(s => s.port === flow.destinationPort);
    if (!existingService) {
      destNode.services.push({
        port: flow.destinationPort,
        protocol: flow.protocol,
        service: this.getServiceName(flow.destinationPort, flow.protocol),
        state: 'open',
        riskScore: this.calculateServiceRisk(flow.destinationPort)
      });
    }

    // Update edge
    let edge = this.networkTopology.edges.find(e =>
      e.source === flow.sourceIP &&
      e.target === flow.destinationIP &&
      e.protocol === flow.protocol &&
      e.port === flow.destinationPort
    );

    if (!edge) {
      edge = {
        source: flow.sourceIP,
        target: flow.destinationIP,
        protocol: flow.protocol,
        port: flow.destinationPort,
        frequency: 0,
        bandwidth: 0,
        riskScore: 0,
        lastSeen: new Date()
      };
      this.networkTopology.edges.push(edge);
    }

    edge.frequency++;
    edge.bandwidth += flow.bytesSent + flow.bytesReceived;
    edge.lastSeen = new Date();
    edge.riskScore = Math.max(edge.riskScore, flow.riskScore);

    this.networkTopology.lastUpdated = new Date();
    this.updateTopologyRiskAssessment();
  }

  // Encrypted Traffic Analysis
  async analyzeEncryptedTraffic(trafficData: Omit<EncryptedTrafficAnalysis, 'id' | 'anomalies' | 'riskScore' | 'classification'>): Promise<EncryptedTrafficAnalysis> {
    const trafficId = `encrypted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const analysis: EncryptedTrafficAnalysis = {
      ...trafficData,
      id: trafficId,
      anomalies: [],
      riskScore: 0,
      classification: 'unknown'
    };

    // Analyze TLS/SSL parameters
    analysis.anomalies = this.detectTLSEncryptedAnomalies(analysis);

    // JA3 fingerprint analysis
    if (analysis.ja3Fingerprint) {
      const ja3Analysis = await this.analyzeJA3Fingerprint(analysis.ja3Fingerprint);
      analysis.anomalies.push(...ja3Analysis.anomalies);
      analysis.riskScore += ja3Analysis.riskScore;
    }

    // Certificate analysis
    if (analysis.certificateInfo) {
      const certAnalysis = this.analyzeCertificate(analysis.certificateInfo);
      analysis.anomalies.push(...certAnalysis.anomalies);
      analysis.riskScore += certAnalysis.riskScore;
    }

    // Classify traffic
    analysis.classification = this.classifyEncryptedTraffic(analysis);
    analysis.riskScore = Math.min(100, analysis.riskScore);

    this.encryptedTraffic.set(trafficId, analysis);
    return analysis;
  }

  // Protocol Analysis
  async analyzeProtocolTraffic(protocol: string, packetData: any): Promise<ProtocolAnalysis> {
    let analyzer = this.protocolAnalyzers.get(protocol);
    if (!analyzer) {
      analyzer = {
        protocol,
        packetsAnalyzed: 0,
        anomalies: [],
        signatures: [],
        performance: {
          throughput: 0,
          latency: 0,
          errorRate: 0
        }
      };
      this.protocolAnalyzers.set(protocol, analyzer);
    }

    analyzer.packetsAnalyzed++;

    // Analyze packet for anomalies
    const packetAnomalies = await this.analyzeProtocolAnomalies(protocol, packetData);
    analyzer.anomalies.push(...packetAnomalies);

    // Check against signatures
    const signatureMatches = await this.checkProtocolSignatures(protocol, packetData);
    analyzer.signatures.push(...signatureMatches);

    // Update performance metrics
    this.updateProtocolPerformance(analyzer, packetData);

    return analyzer;
  }

  // Network Performance Monitoring
  async recordPerformanceMetrics(metrics: Omit<NetworkPerformance, 'timestamp'>): Promise<void> {
    const performanceData: NetworkPerformance = {
      ...metrics,
      timestamp: new Date()
    };

    this.performanceMetrics.push(performanceData);

    // Keep only last 1000 records
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Analyze for performance anomalies
    await this.analyzePerformanceAnomalies(performanceData);
  }

  // Threat Hunting in Network Data
  async huntForNetworkThreats(huntQuery: NetworkHuntQuery): Promise<NetworkHuntResult> {
    const results: NetworkHuntResult = {
      query: huntQuery,
      matches: [],
      statistics: {
        flowsAnalyzed: 0,
        anomaliesFound: 0,
        highRiskFlows: 0,
        executionTime: 0
      },
      timestamp: new Date()
    };

    const startTime = Date.now();

    // Search through network flows
    for (const flow of this.networkFlows.values()) {
      results.statistics.flowsAnalyzed++;

      if (this.flowMatchesHuntQuery(flow, huntQuery)) {
        results.matches.push({
          type: 'flow',
          data: flow,
          riskScore: flow.riskScore,
          indicators: flow.anomalies.map(a => a.description)
        });
      }
    }

    // Search through lateral movements
    for (const movement of this.lateralMovements.values()) {
      if (this.movementMatchesHuntQuery(movement, huntQuery)) {
        results.matches.push({
          type: 'lateral_movement',
          data: movement,
          riskScore: movement.riskScore,
          indicators: movement.indicators
        });
      }
    }

    // Search through encrypted traffic
    for (const traffic of this.encryptedTraffic.values()) {
      if (this.trafficMatchesHuntQuery(traffic, huntQuery)) {
        results.matches.push({
          type: 'encrypted_traffic',
          data: traffic,
          riskScore: traffic.riskScore,
          indicators: traffic.anomalies
        });
      }
    }

    results.statistics.executionTime = Date.now() - startTime;
    results.statistics.anomaliesFound = results.matches.length;
    results.statistics.highRiskFlows = results.matches.filter(m => m.riskScore > 70).length;

    return results;
  }

  // Utility Methods
  private calculateFlowRiskScore(flow: NetworkFlow): number {
    let score = 0;

    // Base score from anomalies
    score += flow.anomalies.reduce((sum, anomaly) => {
      const severityScore = { low: 10, medium: 25, high: 50, critical: 100 }[anomaly.severity] || 0;
      return sum + (severityScore * anomaly.confidence);
    }, 0);

    // Protocol risk
    const protocolRisk = {
      'SMB': 30, 'RDP': 40, 'SSH': 20, 'FTP': 35, 'TELNET': 50,
      'HTTP': 10, 'HTTPS': 5, 'DNS': 5, 'TCP': 15, 'UDP': 10, 'ICMP': 5
    }[flow.protocol] || 10;
    score += protocolRisk;

    // Unusual port bonus
    if (this.isUnusualPort(flow.destinationPort)) {
      score += 15;
    }

    // High data transfer bonus
    if (flow.bytesSent + flow.bytesReceived > 1000000) {
      score += 20;
    }

    return Math.min(100, score);
  }

  private calculateLateralMovementConfidence(indicators: string[]): number {
    const baseConfidence = indicators.length * 0.2;
    const techniqueBonus = 0.3; // Known lateral movement techniques
    return Math.min(1, baseConfidence + techniqueBonus);
  }

  private calculateLateralMovementRisk(flow: NetworkFlow): number {
    let risk = 50; // Base risk for lateral movement

    // Increase risk based on protocol and port
    if (flow.protocol === 'SMB') risk += 20;
    if (flow.protocol === 'RDP') risk += 25;
    if (flow.destinationPort === 3389) risk += 15;

    return Math.min(100, risk);
  }

  private updateTopologyRiskAssessment(): void {
    const assessment = this.networkTopology.riskAssessment;

    assessment.vulnerableNodes = this.networkTopology.nodes.filter(n =>
      n.vulnerabilities.some(v => v.severity === 'high' || v.severity === 'critical')
    ).length;

    assessment.exposedServices = this.networkTopology.nodes.reduce((sum, node) =>
      sum + node.services.filter(s => s.state === 'open' && s.riskScore > 50).length, 0
    );

    assessment.segmentationGaps = this.networkTopology.segments.filter(s =>
      s.accessPolicies.some(p => !p.requiresAuthentication)
    ).length;

    assessment.overallRisk = Math.min(100,
      (assessment.vulnerableNodes * 10) +
      (assessment.exposedServices * 5) +
      (assessment.segmentationGaps * 15)
    );
  }

  private getServiceName(port: number, protocol: string): string {
    const serviceMap: { [key: number]: string } = {
      21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
      80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 993: 'IMAPS',
      995: 'POP3S', 3389: 'RDP', 445: 'SMB'
    };
    return serviceMap[port] || `${protocol} Service`;
  }

  private calculateServiceRisk(port: number): number {
    const highRiskPorts = [23, 3389, 445, 1433, 3306, 5432]; // Telnet, RDP, SMB, MSSQL, MySQL, PostgreSQL
    if (highRiskPorts.includes(port)) return 70;

    const mediumRiskPorts = [21, 25, 110, 143]; // FTP, SMTP, POP3, IMAP
    if (mediumRiskPorts.includes(port)) return 40;

    return 10; // Low risk for other services
  }

  private detectTLSEncryptedAnomalies(traffic: EncryptedTrafficAnalysis): string[] {
    const anomalies: string[] = [];

    if (traffic.tlsVersion && traffic.tlsVersion.startsWith('1.0')) {
      anomalies.push('Deprecated TLS 1.0 usage');
    }

    if (traffic.cipherSuite && traffic.cipherSuite.includes('NULL')) {
      anomalies.push('Weak cipher suite with NULL encryption');
    }

    return anomalies;
  }

  private async analyzeJA3Fingerprint(fingerprint: string): Promise<{ anomalies: string[], riskScore: number }> {
    // Mock JA3 analysis - in real implementation, this would query a JA3 database
    const knownMaliciousJA3 = ['malicious_fingerprint_1', 'malicious_fingerprint_2'];

    if (knownMaliciousJA3.includes(fingerprint)) {
      return {
        anomalies: ['Known malicious JA3 fingerprint detected'],
        riskScore: 80
      };
    }

    return { anomalies: [], riskScore: 0 };
  }

  private analyzeCertificate(cert: EncryptedTrafficAnalysis['certificateInfo']): { anomalies: string[], riskScore: number } {
    const anomalies: string[] = [];
    let riskScore = 0;

    if (cert && new Date() > cert.validTo) {
      anomalies.push('Expired SSL certificate');
      riskScore += 30;
    }

    if (cert && cert.issuer === cert.subject) {
      anomalies.push('Self-signed certificate');
      riskScore += 20;
    }

    return { anomalies, riskScore };
  }

  private classifyEncryptedTraffic(traffic: EncryptedTrafficAnalysis): EncryptedTrafficAnalysis['classification'] {
    if (traffic.riskScore > 70) return 'malicious';
    if (traffic.riskScore > 40) return 'suspicious';
    if (traffic.anomalies.length === 0) return 'legitimate';
    return 'unknown';
  }

  private async analyzeProtocolAnomalies(protocol: string, packetData: any): Promise<ProtocolAnomaly[]> {
    // Mock protocol analysis - in real implementation, this would use protocol parsers
    const anomalies: ProtocolAnomaly[] = [];

    if (protocol === 'HTTP' && packetData.method === 'TRACE') {
      anomalies.push({
        id: `proto_anomaly_${Date.now()}`,
        type: 'http_trace_method',
        description: 'HTTP TRACE method usage (potential XST attack)',
        severity: 'medium',
        frequency: 1,
        firstSeen: new Date(),
        lastSeen: new Date()
      });
    }

    return anomalies;
  }

  private async checkProtocolSignatures(protocol: string, packetData: any): Promise<ProtocolSignature[]> {
    // Mock signature matching - in real implementation, this would use signature databases
    const signatures: ProtocolSignature[] = [];

    if (protocol === 'SMB' && packetData.command === 'tree_connect') {
      signatures.push({
        id: 'smb_tree_connect',
        name: 'SMB Tree Connect',
        pattern: 'tree_connect',
        riskScore: 10,
        category: 'recon'
      });
    }

    return signatures;
  }

  private updateProtocolPerformance(analyzer: ProtocolAnalysis, packetData: any): void {
    // Mock performance calculation
    analyzer.performance.throughput = (analyzer.performance.throughput + packetData.size) / 2;
    analyzer.performance.latency = (analyzer.performance.latency + (packetData.responseTime || 10)) / 2;
    analyzer.performance.errorRate = packetData.hasError ? analyzer.performance.errorRate + 0.01 : analyzer.performance.errorRate * 0.99;
  }

  private async analyzePerformanceAnomalies(metrics: NetworkPerformance): Promise<void> {
    if (metrics.bandwidth.utilization > 90) {
      console.log('High bandwidth utilization detected:', metrics.bandwidth.utilization);
    }

    if (metrics.latency.p99 > 1000) {
      console.log('High latency detected:', metrics.latency.p99);
    }

    if (metrics.packetLoss > 5) {
      console.log('High packet loss detected:', metrics.packetLoss);
    }
  }

  private flowMatchesHuntQuery(flow: NetworkFlow, query: NetworkHuntQuery): boolean {
    if (query.sourceIP && flow.sourceIP !== query.sourceIP) return false;
    if (query.destinationIP && flow.destinationIP !== query.destinationIP) return false;
    if (query.protocol && flow.protocol !== query.protocol) return false;
    if (query.minRiskScore && flow.riskScore < query.minRiskScore) return false;
    if (query.anomalyTypes && !flow.anomalies.some(a => query.anomalyTypes!.includes(a.type))) return false;

    return true;
  }

  private movementMatchesHuntQuery(movement: LateralMovement, query: NetworkHuntQuery): boolean {
    if (query.sourceIP && movement.sourceHost !== query.sourceIP) return false;
    if (query.destinationIP && movement.targetHost !== query.destinationIP) return false;
    if (query.minRiskScore && movement.riskScore < query.minRiskScore) return false;

    return true;
  }

  private trafficMatchesHuntQuery(traffic: EncryptedTrafficAnalysis, query: NetworkHuntQuery): boolean {
    if (query.sourceIP && traffic.sourceIP !== query.sourceIP) return false;
    if (query.destinationIP && traffic.destinationIP !== query.destinationIP) return false;
    if (query.protocol && traffic.protocol !== query.protocol) return false;
    if (query.minRiskScore && traffic.riskScore < query.minRiskScore) return false;

    return true;
  }

  private initializeDefaultDetectors(): void {
    // Initialize anomaly detectors for different network patterns
    this.anomalyDetectors.set('traffic_volume', {
      id: 'traffic_volume_detector',
      type: 'statistical',
      threshold: 2.5, // Standard deviations
      window: 3600000, // 1 hour
      baseline: [],
      lastUpdated: new Date()
    });

    this.anomalyDetectors.set('connection_frequency', {
      id: 'connection_frequency_detector',
      type: 'frequency',
      threshold: 100, // Connections per minute
      window: 60000, // 1 minute
      baseline: [],
      lastUpdated: new Date()
    });
  }

  private initializeProtocolAnalyzers(): void {
    const protocols = ['HTTP', 'HTTPS', 'SMB', 'RDP', 'SSH', 'DNS', 'FTP', 'SMTP'];

    for (const protocol of protocols) {
      this.protocolAnalyzers.set(protocol, {
        protocol,
        packetsAnalyzed: 0,
        anomalies: [],
        signatures: [],
        performance: {
          throughput: 0,
          latency: 0,
          errorRate: 0
        }
      });
    }
  }
}

// Additional interfaces
export interface AnomalyDetector {
  id: string;
  type: 'statistical' | 'frequency' | 'pattern' | 'behavioral';
  threshold: number;
  window: number; // milliseconds
  baseline: number[];
  lastUpdated: Date;
}

export interface NetworkHuntQuery {
  sourceIP?: string;
  destinationIP?: string;
  protocol?: string;
  port?: number;
  minRiskScore?: number;
  anomalyTypes?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  includeLateralMovement?: boolean;
  includeEncryptedTraffic?: boolean;
}

export interface NetworkHuntResult {
  query: NetworkHuntQuery;
  matches: Array<{
    type: 'flow' | 'lateral_movement' | 'encrypted_traffic';
    data: any;
    riskScore: number;
    indicators: string[];
  }>;
  statistics: {
    flowsAnalyzed: number;
    anomaliesFound: number;
    highRiskFlows: number;
    executionTime: number;
  };
  timestamp: Date;
}

// Export singleton instance
export const networkAnalysis = new AdvancedNetworkAnalysis();
