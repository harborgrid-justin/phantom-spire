// Phantom MITRE Core - TypeScript Implementation
// Advanced MITRE ATT&CK Framework Integration

import {
  MitreTactic,
  MitrePlatform,
  DataSource,
  DetectionDifficulty,
  DetectionRuleType,
  Severity,
  SoftwareType,
  ImplementationDifficulty,
  CostEstimate,
  GapType,
  ActivityLevel,
  DetectionRule,
  MitreTechnique,
  SubTechnique,
  MitreGroup,
  MitreSoftware,
  Mitigation,
  TechniqueMatch,
  AttackPathStep,
  DetectionGap,
  GroupActivity,
  EmergingThreat,
  ThreatLandscape,
  ThreatAnalysis,
  NavigatorLayer,
  NavigatorTechnique,
  NavigatorGradient,
  NavigatorFilters,
  NavigatorLayout,
  NavigatorMetadata,
  NavigatorLink,
  MitreSearchCriteria,
  MitreAnalysisResult,
  TacticAnalysis,
  PlatformAnalysis,
  GroupThreatProfile,
  DetectionMaturity,
  MitigationPlan,
  MitigationPhase,
  ThreatHuntingQuery,
  AttackSimulation,
  ComplianceMapping,
  ComplianceControl,
} from './types';

export class MitreCore {
  private techniques: Map<string, MitreTechnique> = new Map();
  private subTechniques: Map<string, SubTechnique> = new Map();
  private groups: Map<string, MitreGroup> = new Map();
  private software: Map<string, MitreSoftware> = new Map();
  private mitigations: Map<string, Mitigation> = new Map();
  private detectionRules: Map<string, DetectionRule> = new Map();

  constructor() {
    this.initializeWithSampleData();
  }

  /**
   * Analyze threat indicators against MITRE ATT&CK framework
   */
  async analyzeThreat(indicators: string[]): Promise<ThreatAnalysis> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    const analysisId = this.generateUuid();
    const timestamp = new Date();

    const techniquesIdentified = this.identifyTechniques(indicators);
    const tacticsCoverage = this.calculateTacticsCoverage(techniquesIdentified);
    const attackPath = this.generateAttackPath(techniquesIdentified);
    const riskScore = this.calculateRiskScore(techniquesIdentified, tacticsCoverage);
    const confidenceScore = this.calculateConfidenceScore(techniquesIdentified);
    const recommendedMitigations = this.recommendMitigations(techniquesIdentified);
    const detectionGaps = this.identifyDetectionGaps(techniquesIdentified);
    const threatLandscape = this.analyzeThreatLandscape();

    return {
      analysis_id: analysisId,
      timestamp,
      techniques_identified: techniquesIdentified,
      tactics_coverage: tacticsCoverage,
      attack_path: attackPath,
      risk_score: riskScore,
      confidence_score: confidenceScore,
      recommended_mitigations: recommendedMitigations,
      detection_gaps: detectionGaps,
      threat_landscape: threatLandscape,
    };
  }

  /**
   * Map techniques to MITRE ATT&CK framework
   */
  async mapTechniques(techniqueIds: string[]): Promise<MitreTechnique[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return techniqueIds
      .map(id => this.techniques.get(id))
      .filter((technique): technique is MitreTechnique => technique !== undefined);
  }

  /**
   * Get technique details by ID
   */
  async getTechnique(techniqueId: string): Promise<MitreTechnique | null> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    return this.techniques.get(techniqueId) || null;
  }

  /**
   * Search techniques by criteria
   */
  async searchTechniques(criteria: MitreSearchCriteria): Promise<MitreTechnique[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    const results: MitreTechnique[] = [];
    
    for (const technique of this.techniques.values()) {
      if (this.matchesCriteria(technique, criteria)) {
        results.push(technique);
      }
    }

    // Apply limit if specified
    if (criteria.limit && results.length > criteria.limit) {
      return results.slice(0, criteria.limit);
    }

    return results;
  }

  /**
   * Get group information
   */
  async getGroup(groupId: string): Promise<MitreGroup | null> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    return this.groups.get(groupId) || null;
  }

  /**
   * Get software information
   */
  async getSoftware(softwareId: string): Promise<MitreSoftware | null> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    return this.software.get(softwareId) || null;
  }

  /**
   * Generate ATT&CK Navigator layer
   */
  async generateNavigatorLayer(analysis: ThreatAnalysis): Promise<NavigatorLayer> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 250));

    const techniques: NavigatorTechnique[] = analysis.techniques_identified.map(tm => ({
      technique_id: tm.technique_id,
      tactic: this.getTechniqueTactic(tm.technique_id),
      color: this.getConfidenceColor(tm.confidence),
      comment: `Confidence: ${tm.confidence.toFixed(2)}`,
      enabled: true,
      metadata: [
        { name: 'confidence', value: tm.confidence.toString() },
        { name: 'evidence_count', value: tm.evidence.length.toString() },
      ],
      links: [],
      show_subtechniques: true,
    }));

    return {
      name: 'Threat Analysis Results',
      description: `Analysis from ${analysis.timestamp.toISOString()}`,
      domain: 'enterprise-attack',
      version: '4.0',
      techniques,
      gradient: {
        colors: ['#ff6666', '#ffe766', '#8ec843'],
        min_value: 0.0,
        max_value: 1.0,
      },
      filters: {
        platforms: ['Windows', 'Linux', 'macOS'],
        tactics: [],
        data_sources: [],
        stages: ['act'],
      },
      sorting: 0,
      layout: {
        layout: 'side',
        aggregate_function: 'average',
        show_aggregate_scores: false,
        count_unscored: false,
      },
      hide_disabled: false,
      metadata: [
        { name: 'analysis_id', value: analysis.analysis_id },
        { name: 'risk_score', value: analysis.risk_score.toString() },
      ],
    };
  }

  /**
   * Get detection coverage for techniques
   */
  async getDetectionCoverage(techniqueIds: string[]): Promise<Record<string, number>> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const coverage: Record<string, number> = {};

    for (const id of techniqueIds) {
      const technique = this.techniques.get(id);
      if (technique) {
        // Calculate coverage based on detection rules
        const maxCoverage = technique.detection_rules.reduce(
          (max, rule) => Math.max(max, rule.coverage_percentage),
          0
        );
        coverage[id] = maxCoverage;
      } else {
        coverage[id] = 0;
      }
    }

    return coverage;
  }

  /**
   * Get comprehensive MITRE analysis
   */
  async getComprehensiveAnalysis(indicators: string[]): Promise<MitreAnalysisResult> {
    const analysis = await this.analyzeThreat(indicators);
    const navigatorLayer = await this.generateNavigatorLayer(analysis);
    const detectionCoverage = await this.getDetectionCoverage(
      analysis.techniques_identified.map(t => t.technique_id)
    );

    return {
      analysis,
      navigator_layer: navigatorLayer,
      detection_coverage: detectionCoverage,
      analysis_timestamp: new Date(),
    };
  }

  /**
   * Analyze tactics coverage and effectiveness
   */
  async analyzeTactics(techniqueIds: string[]): Promise<TacticAnalysis[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    const tacticMap = new Map<MitreTactic, string[]>();

    // Group techniques by tactic
    for (const id of techniqueIds) {
      const technique = this.techniques.get(id);
      if (technique) {
        const existing = tacticMap.get(technique.tactic) || [];
        existing.push(id);
        tacticMap.set(technique.tactic, existing);
      }
    }

    const results: TacticAnalysis[] = [];

    for (const [tactic, techniques] of tacticMap.entries()) {
      const coveragePercentage = (techniques.length / techniqueIds.length) * 100;
      const riskLevel = coveragePercentage > 75 ? Severity.High : 
                       coveragePercentage > 50 ? Severity.Medium : Severity.Low;

      results.push({
        tactic,
        techniques_count: techniques.length,
        coverage_percentage: coveragePercentage,
        risk_level: riskLevel,
        common_techniques: techniques.slice(0, 5),
        detection_gaps: Math.floor(techniques.length * 0.3),
        mitigation_recommendations: this.getTacticMitigations(tactic),
      });
    }

    return results;
  }

  /**
   * Analyze platform-specific threats
   */
  async analyzePlatforms(indicators: string[]): Promise<PlatformAnalysis[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 350));

    const platformMap = new Map<MitrePlatform, string[]>();

    // Analyze techniques by platform
    for (const technique of this.techniques.values()) {
      for (const platform of technique.platforms) {
        const existing = platformMap.get(platform) || [];
        existing.push(technique.id);
        platformMap.set(platform, existing);
      }
    }

    const results: PlatformAnalysis[] = [];

    for (const [platform, techniques] of platformMap.entries()) {
      const highRiskTechniques = techniques.filter(id => {
        const technique = this.techniques.get(id);
        return technique && technique.detection_difficulty === DetectionDifficulty.Hard;
      });

      results.push({
        platform,
        techniques_applicable: techniques.length,
        high_risk_techniques: highRiskTechniques.slice(0, 10),
        detection_coverage: Math.random() * 0.4 + 0.4, // 40-80%
        recommended_data_sources: this.getPlatformDataSources(platform),
        priority_mitigations: this.getPlatformMitigations(platform),
      });
    }

    return results;
  }

  /**
   * Generate threat hunting queries
   */
  async generateHuntingQueries(techniqueIds: string[]): Promise<ThreatHuntingQuery[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    const queries: ThreatHuntingQuery[] = [];

    for (const id of techniqueIds.slice(0, 5)) {
      const technique = this.techniques.get(id);
      if (technique) {
        queries.push({
          id: this.generateUuid(),
          name: `Hunt for ${technique.name}`,
          description: `Threat hunting query to detect ${technique.name} technique`,
          technique_id: id,
          data_source: technique.data_sources[0] || DataSource.ProcessMonitoring,
          query: this.generateHuntingQuery(technique),
          query_type: DetectionRuleType.KQL,
          expected_results: [`Evidence of ${technique.name}`, 'Suspicious process activity'],
          false_positive_indicators: ['Legitimate admin activity', 'Automated system processes'],
          hunting_hypothesis: `Adversaries may use ${technique.name} to achieve their objectives`,
        });
      }
    }

    return queries;
  }

  /**
   * Simulate attack scenarios
   */
  async simulateAttack(techniqueIds: string[]): Promise<AttackSimulation> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 500));

    const analysis = await this.analyzeThreat(techniqueIds);

    return {
      simulation_id: this.generateUuid(),
      name: 'MITRE ATT&CK Simulation',
      description: 'Simulated attack based on provided techniques',
      techniques_simulated: techniqueIds,
      attack_path: analysis.attack_path,
      success_rate: 0.7 + Math.random() * 0.3,
      detection_rate: 0.4 + Math.random() * 0.4,
      mean_time_to_detection: 15 + Math.random() * 45, // minutes
      recommendations: [
        'Improve monitoring for initial access techniques',
        'Enhance detection rules for persistence mechanisms',
        'Implement behavioral analytics for lateral movement',
      ],
    };
  }

  /**
   * Generate compliance mapping
   */
  async generateComplianceMapping(framework: string, techniqueIds: string[]): Promise<ComplianceMapping> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    const controls: ComplianceControl[] = [
      {
        control_id: 'AC-2',
        name: 'Account Management',
        description: 'Manage system accounts and access',
        mapped_techniques: techniqueIds.slice(0, 3),
        implementation_status: 'Implemented',
        effectiveness: 0.8,
      },
      {
        control_id: 'SI-4',
        name: 'Information System Monitoring',
        description: 'Monitor system activities',
        mapped_techniques: techniqueIds.slice(1, 4),
        implementation_status: 'Partial',
        effectiveness: 0.6,
      },
    ];

    return {
      framework,
      controls,
      coverage_percentage: 75,
      gaps: ['Limited coverage for advanced persistent threats', 'Insufficient behavioral monitoring'],
      recommendations: [
        'Implement advanced threat detection',
        'Enhance user behavior analytics',
        'Improve incident response procedures',
      ],
    };
  }

  // Private helper methods

  private initializeWithSampleData(): void {
    this.loadSampleTechniques();
    this.loadSampleGroups();
    this.loadSampleSoftware();
    this.loadSampleMitigations();
    this.loadSampleDetectionRules();
  }

  private loadSampleTechniques(): void {
    const sampleTechniques = [
      { id: 'T1566.001', name: 'Spearphishing Attachment', tactic: MitreTactic.InitialAccess },
      { id: 'T1055', name: 'Process Injection', tactic: MitreTactic.DefenseEvasion },
      { id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: MitreTactic.CommandAndControl },
      { id: 'T1083', name: 'File and Directory Discovery', tactic: MitreTactic.Discovery },
      { id: 'T1005', name: 'Data from Local System', tactic: MitreTactic.Collection },
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: MitreTactic.Exfiltration },
    ];

    for (const { id, name, tactic } of sampleTechniques) {
      const technique: MitreTechnique = {
        id,
        name,
        description: `Sample description for ${name}`,
        tactic,
        platforms: [MitrePlatform.Windows, MitrePlatform.Linux],
        data_sources: [DataSource.ProcessMonitoring, DataSource.NetworkTraffic],
        detection_difficulty: DetectionDifficulty.Medium,
        sub_techniques: [],
        mitigations: [],
        detection_rules: [],
        kill_chain_phases: ['act'],
        permissions_required: ['User'],
        effective_permissions: ['User'],
        system_requirements: [],
        network_requirements: [],
        remote_support: true,
        impact_type: [],
        created: new Date(),
        modified: new Date(),
        version: '1.0',
        revoked: false,
        deprecated: false,
      };
      this.techniques.set(id, technique);
    }
  }

  private loadSampleGroups(): void {
    const sampleGroups = [
      { id: 'G0016', name: 'APT29', alias: 'Cozy Bear' },
      { id: 'G0028', name: 'Lazarus Group', alias: 'Hidden Cobra' },
      { id: 'G0007', name: 'APT28', alias: 'Fancy Bear' },
    ];

    for (const { id, name, alias } of sampleGroups) {
      const group: MitreGroup = {
        id,
        name,
        aliases: [alias],
        description: `Sample threat group: ${name}`,
        techniques_used: ['T1566.001', 'T1055'],
        software_used: [],
        associated_campaigns: [],
        first_seen: new Date(),
        last_seen: new Date(),
        origin_country: 'Unknown',
        motivation: ['Espionage'],
        sophistication_level: 'Advanced',
        targets: ['Government', 'Technology'],
        references: [],
      };
      this.groups.set(id, group);
    }
  }

  private loadSampleSoftware(): void {
    const sampleSoftware = [
      { id: 'S0154', name: 'Cobalt Strike', type: SoftwareType.Tool },
      { id: 'S0363', name: 'Empire', type: SoftwareType.Tool },
      { id: 'S0002', name: 'Mimikatz', type: SoftwareType.Tool },
    ];

    for (const { id, name, type } of sampleSoftware) {
      const software: MitreSoftware = {
        id,
        name,
        aliases: [],
        description: `Sample software: ${name}`,
        software_type: type,
        platforms: [MitrePlatform.Windows],
        techniques_used: ['T1055'],
        groups_using: ['G0016'],
        kill_chain_phases: ['act'],
        first_seen: new Date(),
        last_seen: new Date(),
        references: [],
      };
      this.software.set(id, software);
    }
  }

  private loadSampleMitigations(): void {
    const mitigation: Mitigation = {
      id: 'M1049',
      name: 'Antivirus/Antimalware',
      description: 'Use signatures or heuristics to detect malicious software.',
      techniques_mitigated: ['T1055'],
      implementation_difficulty: ImplementationDifficulty.Low,
      effectiveness: 0.7,
      cost_estimate: CostEstimate.Medium,
      deployment_time: '1-2 weeks',
      prerequisites: ['Endpoint management system'],
      side_effects: ['Potential performance impact'],
      references: [],
    };
    this.mitigations.set('M1049', mitigation);
  }

  private loadSampleDetectionRules(): void {
    const rule: DetectionRule = {
      id: 'DR001',
      name: 'Process Injection Detection',
      description: 'Detects process injection techniques',
      rule_type: DetectionRuleType.Sigma,
      severity: Severity.High,
      confidence: 0.85,
      data_source: DataSource.ProcessMonitoring,
      query: 'process_name:*.exe AND (CreateRemoteThread OR SetWindowsHookEx)',
      false_positive_rate: 0.05,
      coverage_percentage: 0.8,
      created: new Date(),
      updated: new Date(),
      author: 'Phantom Security',
      references: [],
    };
    this.detectionRules.set('DR001', rule);
  }

  private identifyTechniques(indicators: string[]): TechniqueMatch[] {
    const matches: TechniqueMatch[] = [];

    for (const [techniqueId, technique] of this.techniques.entries()) {
      const confidence = this.calculateTechniqueConfidence(technique, indicators);
      if (confidence > 0.3) {
        matches.push({
          technique_id: techniqueId,
          technique_name: technique.name,
          confidence,
          evidence: indicators.slice(0, 2),
          indicators: indicators.slice(0, 3),
          sub_techniques: technique.sub_techniques,
          platforms_affected: technique.platforms,
          data_sources_triggered: technique.data_sources,
        });
      }
    }

    matches.sort((a, b) => b.confidence - a.confidence);
    return matches.slice(0, 10);
  }

  private calculateTechniqueConfidence(technique: MitreTechnique, indicators: string[]): number {
    const baseConfidence = 0.4;
    const indicatorBoost = indicators.length * 0.1;
    return Math.min(1.0, baseConfidence + indicatorBoost);
  }

  private calculateTacticsCoverage(techniques: TechniqueMatch[]): Record<MitreTactic, number> {
    const coverage: Record<MitreTactic, number> = {} as Record<MitreTactic, number>;

    for (const techniqueMatch of techniques) {
      const technique = this.techniques.get(techniqueMatch.technique_id);
      if (technique) {
        const current = coverage[technique.tactic] || 0;
        coverage[technique.tactic] = Math.min(1.0, current + techniqueMatch.confidence);
      }
    }

    return coverage;
  }

  private generateAttackPath(techniques: TechniqueMatch[]): AttackPathStep[] {
    const path: AttackPathStep[] = [];
    let stepNumber = 1;

    for (const techniqueMatch of techniques.slice(0, 5)) {
      const technique = this.techniques.get(techniqueMatch.technique_id);
      if (technique) {
        path.push({
          step_number: stepNumber,
          tactic: technique.tactic,
          technique_id: technique.id,
          technique_name: technique.name,
          description: technique.description,
          prerequisites: technique.permissions_required,
          outcomes: ['System compromise'],
          detection_opportunities: ['Monitor process creation'],
          mitigation_opportunities: technique.mitigations,
        });
        stepNumber++;
      }
    }

    return path;
  }

  private calculateRiskScore(techniques: TechniqueMatch[], tacticsCoverage: Record<MitreTactic, number>): number {
    const techniqueScore = techniques.reduce((sum, t) => sum + t.confidence, 0) / Math.max(techniques.length, 1);
    const tacticScore = Object.values(tacticsCoverage).reduce((sum, coverage) => sum + coverage, 0) / 
                       Math.max(Object.keys(tacticsCoverage).length, 1);
    return Math.min(1.0, techniqueScore * 0.6 + tacticScore * 0.4);
  }

  private calculateConfidenceScore(techniques: TechniqueMatch[]): number {
    if (techniques.length === 0) return 0.0;
    return techniques.reduce((sum, t) => sum + t.confidence, 0) / techniques.length;
  }

  private recommendMitigations(techniques: TechniqueMatch[]): string[] {
    const mitigations: string[] = [];

    for (const techniqueMatch of techniques) {
      const technique = this.techniques.get(techniqueMatch.technique_id);
      if (technique) {
        mitigations.push(...technique.mitigations);
      }
    }

    return [...new Set(mitigations)].slice(0, 10);
  }

  private identifyDetectionGaps(techniques: TechniqueMatch[]): DetectionGap[] {
    return techniques
      .filter(tm => tm.confidence > 0.5)
      .map(tm => ({
        technique_id: tm.technique_id,
        technique_name: tm.technique_name,
        gap_type: GapType.LowCoverage,
        severity: Severity.Medium,
        description: 'Limited detection coverage for this technique',
        recommended_actions: ['Implement additional monitoring'],
        data_sources_needed: tm.data_sources_triggered,
        estimated_coverage_improvement: 0.3,
      }));
  }

  private analyzeThreatLandscape(): ThreatLandscape {
    const mostCommonTactics: Array<[MitreTactic, number]> = [
      [MitreTactic.InitialAccess, 45],
      [MitreTactic.DefenseEvasion, 38],
      [MitreTactic.Discovery, 32],
    ];

    const mostCommonTechniques: Array<[string, number]> = [
      ['T1566.001', 28],
      ['T1055', 24],
      ['T1083', 19],
    ];

    const trendingTechniques = ['T1071.001', 'T1005', 'T1041'];

    const platformDistribution: Record<MitrePlatform, number> = {
      [MitrePlatform.Windows]: 65,
      [MitrePlatform.Linux]: 25,
      [MitrePlatform.MacOS]: 10,
    } as Record<MitrePlatform, number>;

    const groupActivity: GroupActivity[] = [
      {
        group_id: 'G0016',
        group_name: 'APT29',
        activity_level: ActivityLevel.High,
        recent_techniques: ['T1566.001', 'T1055'],
        target_sectors: ['Government', 'Healthcare'],
        geographic_focus: ['North America', 'Europe'],
      },
    ];

    const emergingThreats: EmergingThreat[] = [
      {
        threat_id: 'ET001',
        name: 'Cloud Infrastructure Targeting',
        description: 'Increased targeting of cloud infrastructure',
        techniques_involved: ['T1078', 'T1530'],
        first_observed: new Date(),
        confidence: 0.8,
        potential_impact: Severity.High,
        affected_platforms: [MitrePlatform.Cloud, MitrePlatform.AWS],
        indicators: ['Unusual API calls'],
      },
    ];

    return {
      most_common_tactics: mostCommonTactics,
      most_common_techniques: mostCommonTechniques,
      trending_techniques: trendingTechniques,
      platform_distribution: platformDistribution,
      group_activity: groupActivity,
      emerging_threats: emergingThreats,
    };
  }

  private matchesCriteria(technique: MitreTechnique, criteria: MitreSearchCriteria): boolean {
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      if (!technique.name.toLowerCase().includes(query) &&
          !technique.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (criteria.tactics && !criteria.tactics.includes(technique.tactic)) {
      return false;
    }

    if (criteria.platforms && !technique.platforms.some(p => criteria.platforms!.includes(p))) {
      return false;
    }

    if (criteria.data_sources && !technique.data_sources.some(ds => criteria.data_sources!.includes(ds))) {
      return false;
    }

    if (criteria.detection_difficulty && technique.detection_difficulty !== criteria.detection_difficulty) {
      return false;
    }

    return true;
  }

  private getTechniqueTactic(techniqueId: string): string {
    const technique = this.techniques.get(techniqueId);
    return technique ? technique.tactic : MitreTactic.Discovery;
  }

  private getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return '#ff4444'; // High confidence - red
    if (confidence >= 0.6) return '#ff8844'; // Medium confidence - orange
    if (confidence >= 0.4) return '#ffcc44'; // Low confidence - yellow
    return '#cccccc'; // Very low confidence - gray
  }

  private getTacticMitigations(tactic: MitreTactic): string[] {
    const mitigationMap: Record<MitreTactic, string[]> = {
      [MitreTactic.InitialAccess]: ['Email security', 'User training', 'Network segmentation'],
      [MitreTactic.DefenseEvasion]: ['Endpoint protection', 'Behavioral monitoring', 'Code signing'],
      [MitreTactic.Discovery]: ['Network monitoring', 'Access controls', 'Logging'],
      [MitreTactic.Collection]: ['Data loss prevention', 'Access controls', 'Monitoring'],
      [MitreTactic.Exfiltration]: ['Network monitoring', 'Data classification', 'Encryption'],
      [MitreTactic.CommandAndControl]: ['Network filtering', 'DNS monitoring', 'Proxy controls'],
      [MitreTactic.Persistence]: ['System monitoring', 'Access controls', 'Regular audits'],
      [MitreTactic.PrivilegeEscalation]: ['Privilege management', 'System hardening', 'Monitoring'],
      [MitreTactic.CredentialAccess]: ['Multi-factor authentication', 'Credential management', 'Monitoring'],
      [MitreTactic.LateralMovement]: ['Network segmentation', 'Access controls', 'Monitoring'],
      [MitreTactic.Impact]: ['Backup systems', 'Incident response', 'Recovery procedures'],
      [MitreTactic.Execution]: ['Application controls', 'System hardening', 'Monitoring'],
      [MitreTactic.Reconnaissance]: ['Network monitoring', 'Threat intelligence', 'Deception'],
      [MitreTactic.ResourceDevelopment]: ['Threat intelligence', 'Infrastructure monitoring', 'Attribution'],
    };

    return mitigationMap[tactic] || ['General security controls'];
  }

  private getPlatformDataSources(platform: MitrePlatform): DataSource[] {
    const dataSourceMap: Record<MitrePlatform, DataSource[]> = {
      [MitrePlatform.Windows]: [DataSource.ProcessMonitoring, DataSource.Registry, DataSource.WindowsEventLogs],
      [MitrePlatform.Linux]: [DataSource.ProcessMonitoring, DataSource.FileMonitoring, DataSource.CommandLineInterface],
      [MitrePlatform.MacOS]: [DataSource.ProcessMonitoring, DataSource.FileMonitoring, DataSource.CommandLineInterface],
      [MitrePlatform.Cloud]: [DataSource.CloudLogs, DataSource.API, DataSource.Authentication],
      [MitrePlatform.Network]: [DataSource.NetworkTraffic, DataSource.DNS, DataSource.WebProxy],
      [MitrePlatform.Mobile]: [DataSource.API, DataSource.Authentication, DataSource.NetworkTraffic],
      [MitrePlatform.ICS]: [DataSource.NetworkTraffic, DataSource.ProcessMonitoring, DataSource.API],
      [MitrePlatform.Office365]: [DataSource.CloudLogs, DataSource.Email, DataSource.Authentication],
      [MitrePlatform.Azure]: [DataSource.CloudLogs, DataSource.API, DataSource.Authentication],
      [MitrePlatform.AWS]: [DataSource.CloudLogs, DataSource.API, DataSource.Authentication],
      [MitrePlatform.GCP]: [DataSource.CloudLogs, DataSource.API, DataSource.Authentication],
      [MitrePlatform.SaaS]: [DataSource.API, DataSource.Authentication, DataSource.CloudLogs],
      [MitrePlatform.PRE]: [DataSource.NetworkTraffic, DataSource.DNS, DataSource.WebProxy],
    };

    return dataSourceMap[platform] || [DataSource.ProcessMonitoring];
  }

  private getPlatformMitigations(platform: MitrePlatform): string[] {
    const mitigationMap: Record<MitrePlatform, string[]> = {
      [MitrePlatform.Windows]: ['Windows Defender', 'Group Policy', 'SCCM'],
      [MitrePlatform.Linux]: ['SELinux', 'AppArmor', 'System hardening'],
      [MitrePlatform.MacOS]: ['XProtect', 'Gatekeeper', 'System Integrity Protection'],
      [MitrePlatform.Cloud]: ['Cloud security posture', 'Identity management', 'Network controls'],
      [MitrePlatform.Network]: ['Network segmentation', 'Firewalls', 'IDS/IPS'],
      [MitrePlatform.Mobile]: ['Mobile device management', 'App store controls', 'Device encryption'],
      [MitrePlatform.ICS]: ['Network segmentation', 'Protocol filtering', 'Asset management'],
      [MitrePlatform.Office365]: ['Conditional access', 'DLP policies', 'Security defaults'],
      [MitrePlatform.Azure]: ['Azure Security Center', 'Conditional access', 'Network security groups'],
      [MitrePlatform.AWS]: ['AWS Config', 'CloudTrail', 'Security groups'],
      [MitrePlatform.GCP]: ['Security Command Center', 'Cloud IAM', 'VPC security'],
      [MitrePlatform.SaaS]: ['SSO integration', 'API security', 'Data governance'],
      [MitrePlatform.PRE]: ['Threat intelligence', 'Infrastructure monitoring', 'Attribution analysis'],
    };

    return mitigationMap[platform] || ['General security controls'];
  }

  private generateHuntingQuery(technique: MitreTechnique): string {
    const queryTemplates: Record<string, string> = {
      'T1566.001': 'DeviceEvents | where ActionType == "ProcessCreated" and FileName endswith ".exe" and ProcessCommandLine contains "attachment"',
      'T1055': 'DeviceEvents | where ActionType == "ProcessCreated" and (ProcessCommandLine contains "CreateRemoteThread" or ProcessCommandLine contains "SetWindowsHookEx")',
      'T1071.001': 'DeviceNetworkEvents | where RemotePort in (80, 443) and InitiatingProcessFileName != "browser.exe"',
      'T1083': 'DeviceEvents | where ActionType == "ProcessCreated" and (ProcessCommandLine contains "dir" or ProcessCommandLine contains "ls")',
      'T1005': 'DeviceFileEvents | where ActionType == "FileCreated" and FolderPath startswith "C:\\Users"',
      'T1041': 'DeviceNetworkEvents | where RemoteIPType == "Public" and BytesSent > 1000000',
    };

    return queryTemplates[technique.id] || `DeviceEvents | where ActionType == "ProcessCreated" and ProcessCommandLine contains "${technique.name}"`;
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export types for convenience
export * from './types';
