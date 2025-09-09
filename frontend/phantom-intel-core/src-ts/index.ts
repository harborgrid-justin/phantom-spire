import {
  ThreatIndicator,
  ThreatActor,
  ThreatCampaign,
  IntelligenceFeed,
  ThreatReport,
  Attribution,
  TacticTechnique,
  ThreatVulnerability,
  IntelligenceSummary,
  IndicatorType,
  ThreatSeverity,
  ActorType,
  SophisticationLevel,
  Motivation,
  FeedType,
  FeedFormat,
  AuthenticationType,
  ReportType,
  EvidenceType,
  RelationshipType,
  IndicatorSearchFilters,
  ThreatActorSearchFilters,
  CampaignSearchFilters,
  FeedSearchFilters,
  ThreatLandscape,
  IntelligenceMetrics,
  ThreatIntelligenceReport,
  IndicatorEnrichment,
  IndicatorContext,
  IndicatorRelationship,
  GeolocationData,
  WhoisData,
  DnsData,
  ReputationData,
  MalwareAnalysis,
  NetworkAnalysis,
  PassiveDnsRecord,
  CertificateData,
  CampaignEvent,
  FeedAuthentication,
  ProcessingRule,
  AttributionEvidence,
  IntelligenceWorkflow,
  EnrichmentJob,
  CorrelationJob,
  ExportConfiguration,
  SharingGroup
} from './types';

/**
 * Core Threat Intelligence engine for comprehensive intelligence gathering,
 * analysis, and correlation
 */
export class IntelCore {
  private indicators: Map<string, any> = new Map();
  private threatActors: Map<string, any> = new Map();
  private campaigns: Map<string, any> = new Map();
  private intelligenceFeeds: Map<string, any> = new Map();
  private reports: Map<string, any> = new Map();
  private attributions: Map<string, any> = new Map();
  private tactics: Map<string, any> = new Map();
  private vulnerabilities: Map<string, any> = new Map();
  private workflows: Map<string, any> = new Map();
  private enrichmentJobs: Map<string, any> = new Map();
  private correlationJobs: Map<string, any> = new Map();

  constructor() {
    this.loadSampleData();
  }

  // Indicator Management
  addIndicator(indicator: any): string {
    const newIndicator = {
      ...indicator,
      id: this.generateId(),
      first_seen: new Date(),
      last_seen: new Date()
    };
    
    this.indicators.set(newIndicator.id, newIndicator);
    return newIndicator.id;
  }

  getIndicator(id: string): any {
    return this.indicators.get(id) || null;
  }

  getAllIndicators(): any[] {
    return Array.from(this.indicators.values());
  }

  searchIndicators(filters: any): any[] {
    let results = Array.from(this.indicators.values());

    if (filters.indicator_type) {
      results = results.filter((indicator: any) => indicator.indicator_type === filters.indicator_type);
    }

    if (filters.severity) {
      results = results.filter((indicator: any) => indicator.severity === filters.severity);
    }

    if (filters.confidence_min) {
      results = results.filter((indicator: any) => indicator.confidence >= filters.confidence_min);
    }

    if (filters.sources && filters.sources.length > 0) {
      results = results.filter((indicator: any) => 
        filters.sources.some((source: string) => indicator.sources.includes(source))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((indicator: any) => 
        filters.tags.some((tag: string) => indicator.tags.includes(tag))
      );
    }

    if (filters.malware_families && filters.malware_families.length > 0) {
      results = results.filter((indicator: any) => 
        filters.malware_families.some((family: string) => 
          indicator.context.malware_families.includes(family)
        )
      );
    }

    return results;
  }

  enrichIndicator(id: string, enrichment: any): boolean {
    const indicator = this.indicators.get(id);
    if (!indicator) return false;

    indicator.enrichment = { ...indicator.enrichment, ...enrichment };
    indicator.last_seen = new Date();
    this.indicators.set(id, indicator);
    return true;
  }

  correlateIndicators(indicatorId: string): string[] {
    const correlations: string[] = [];
    const indicator = this.getIndicator(indicatorId);
    
    if (!indicator) return correlations;

    // Find related campaigns
    for (const campaign of this.campaigns.values()) {
      if (campaign.indicators.includes(indicatorId)) {
        correlations.push(`Campaign: ${campaign.name}`);
      }
    }

    // Find related threat actors
    for (const actor of this.threatActors.values()) {
      if (indicator.context.threat_actors.includes(actor.name)) {
        correlations.push(`Threat Actor: ${actor.name}`);
      }
    }

    // Find related indicators through relationships
    for (const relationship of indicator.relationships || []) {
      correlations.push(`Related Indicator: ${relationship.target_indicator} (${relationship.relationship_type})`);
    }

    return correlations;
  }

  // Threat Actor Management
  addThreatActor(actor: any): string {
    const newActor = {
      ...actor,
      id: this.generateId(),
      first_observed: new Date(),
      last_activity: new Date()
    };
    
    this.threatActors.set(newActor.id, newActor);
    return newActor.id;
  }

  getThreatActor(id: string): any {
    return this.threatActors.get(id) || null;
  }

  getAllThreatActors(): any[] {
    return Array.from(this.threatActors.values());
  }

  searchThreatActors(filters: any): any[] {
    let results = Array.from(this.threatActors.values());

    if (filters.actor_type) {
      results = results.filter((actor: any) => actor.actor_type === filters.actor_type);
    }

    if (filters.sophistication) {
      results = results.filter((actor: any) => actor.sophistication === filters.sophistication);
    }

    if (filters.motivation && filters.motivation.length > 0) {
      results = results.filter((actor: any) => 
        filters.motivation.some((motivation: string) => actor.motivation.includes(motivation))
      );
    }

    if (filters.target_sectors && filters.target_sectors.length > 0) {
      results = results.filter((actor: any) => 
        filters.target_sectors.some((sector: string) => actor.target_sectors.includes(sector))
      );
    }

    if (filters.confidence_min) {
      results = results.filter((actor: any) => actor.confidence >= filters.confidence_min);
    }

    return results;
  }

  // Campaign Management
  addCampaign(campaign: any): string {
    const newCampaign = {
      ...campaign,
      id: this.generateId(),
      start_date: new Date()
    };
    
    this.campaigns.set(newCampaign.id, newCampaign);
    return newCampaign.id;
  }

  getCampaign(id: string): any {
    return this.campaigns.get(id) || null;
  }

  getAllCampaigns(): any[] {
    return Array.from(this.campaigns.values());
  }

  searchCampaigns(filters: any): any[] {
    let results = Array.from(this.campaigns.values());

    if (filters.threat_actors && filters.threat_actors.length > 0) {
      results = results.filter((campaign: any) => 
        filters.threat_actors.some((actor: string) => campaign.threat_actors.includes(actor))
      );
    }

    if (filters.target_sectors && filters.target_sectors.length > 0) {
      results = results.filter((campaign: any) => 
        filters.target_sectors.some((sector: string) => campaign.target_sectors.includes(sector))
      );
    }

    if (filters.active_only) {
      results = results.filter((campaign: any) => !campaign.end_date);
    }

    if (filters.confidence_min) {
      results = results.filter((campaign: any) => campaign.confidence >= filters.confidence_min);
    }

    return results;
  }

  // Intelligence Feed Management
  addFeed(feed: any): string {
    const newFeed = {
      ...feed,
      id: this.generateId(),
      last_updated: new Date()
    };
    
    this.intelligenceFeeds.set(newFeed.id, newFeed);
    return newFeed.id;
  }

  getFeed(id: string): any {
    return this.intelligenceFeeds.get(id) || null;
  }

  getAllFeeds(): any[] {
    return Array.from(this.intelligenceFeeds.values());
  }

  processFeed(feedId: string, data: string): { success: boolean; processed: number; error?: string } {
    const feed = this.getFeed(feedId);
    if (!feed) {
      return { success: false, processed: 0, error: 'Feed not found' };
    }

    if (!feed.enabled) {
      return { success: false, processed: 0, error: 'Feed is disabled' };
    }

    // Simulate processing feed data
    const lines = data.split('\n').filter(line => line.trim());
    const processed = lines.length;

    // Update feed last_updated timestamp
    feed.last_updated = new Date();
    this.intelligenceFeeds.set(feedId, feed);

    return { success: true, processed };
  }

  // Report Management
  addReport(report: any): string {
    const newReport = {
      ...report,
      id: this.generateId(),
      published_date: new Date()
    };
    
    this.reports.set(newReport.id, newReport);
    return newReport.id;
  }

  getReport(id: string): any {
    return this.reports.get(id) || null;
  }

  getAllReports(): any[] {
    return Array.from(this.reports.values());
  }

  // Attribution Management
  addAttribution(attribution: any): string {
    const newAttribution = {
      ...attribution,
      id: this.generateId(),
      analysis_date: new Date()
    };
    
    this.attributions.set(newAttribution.id, newAttribution);
    return newAttribution.id;
  }

  getAttribution(id: string): any {
    return this.attributions.get(id) || null;
  }

  getAllAttributions(): any[] {
    return Array.from(this.attributions.values());
  }

  // Vulnerability Management
  addVulnerability(vulnerability: any): string {
    const newVulnerability = {
      ...vulnerability,
      id: this.generateId(),
      published_date: new Date()
    };
    
    this.vulnerabilities.set(newVulnerability.id, newVulnerability);
    return newVulnerability.id;
  }

  getVulnerability(id: string): any {
    return this.vulnerabilities.get(id) || null;
  }

  getAllVulnerabilities(): any[] {
    return Array.from(this.vulnerabilities.values());
  }

  // Analytics and Reporting
  generateIntelligenceSummary(): any {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total_indicators: this.indicators.size,
      total_threat_actors: this.threatActors.size,
      total_campaigns: this.campaigns.size,
      total_feeds: this.intelligenceFeeds.size,
      active_feeds: Array.from(this.intelligenceFeeds.values()).filter((f: any) => f.enabled).length,
      high_confidence_indicators: Array.from(this.indicators.values()).filter((i: any) => i.confidence > 0.8).length,
      critical_indicators: Array.from(this.indicators.values()).filter((i: any) => i.severity === ThreatSeverity.Critical).length,
      recent_indicators: Array.from(this.indicators.values()).filter((i: any) => new Date(i.first_seen) > sevenDaysAgo).length,
      top_threat_actors: this.getTopThreatActors(5),
      active_campaigns: this.getActiveCampaigns(),
      indicator_types: this.getIndicatorTypeDistribution()
    };
  }

  generateThreatLandscape(): any {
    const actors = Array.from(this.threatActors.values());
    const campaigns = Array.from(this.campaigns.values());
    const indicators = Array.from(this.indicators.values());

    return {
      top_threat_actors: actors.slice(0, 10).map((actor: any) => ({
        actor,
        activity_score: Math.random() * 100,
        recent_campaigns: (actor.campaigns || []).slice(0, 3)
      })),
      active_campaigns: campaigns.filter((c: any) => !c.end_date).slice(0, 10).map((campaign: any) => ({
        campaign,
        threat_level: campaign.severity || ThreatSeverity.Medium,
        target_overlap: campaign.target_sectors.slice(0, 3)
      })),
      trending_indicators: indicators.slice(0, 20).map((indicator: any) => ({
        indicator,
        trend_score: Math.random() * 100,
        related_campaigns: indicator.context.campaigns.slice(0, 2)
      })),
      sector_targeting: this.generateSectorTargeting(),
      geographic_threats: this.generateGeographicThreats(),
      technique_usage: this.generateTechniqueUsage()
    };
  }

  generateIntelligenceMetrics(): any {
    const feeds = Array.from(this.intelligenceFeeds.values());
    const indicators = Array.from(this.indicators.values());

    return {
      feed_performance: feeds.map((feed: any) => ({
        feed_id: feed.id,
        feed_name: feed.name,
        indicators_processed: Math.floor(Math.random() * 1000),
        quality_score: Math.random() * 100,
        false_positive_rate: Math.random() * 20,
        last_update: feed.last_updated
      })),
      indicator_statistics: {
        total_indicators: indicators.length,
        by_type: this.getIndicatorTypeDistribution(),
        by_severity: this.getIndicatorSeverityDistribution(),
        by_confidence: this.getIndicatorConfidenceDistribution(),
        expiring_soon: indicators.filter((i: any) => i.expiration_date && new Date(i.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
        recently_added: indicators.filter((i: any) => new Date(i.first_seen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
      },
      enrichment_coverage: {
        geolocation: indicators.filter((i: any) => i.enrichment?.geolocation).length / indicators.length * 100,
        whois: indicators.filter((i: any) => i.enrichment?.whois).length / indicators.length * 100,
        dns: indicators.filter((i: any) => i.enrichment?.dns).length / indicators.length * 100,
        reputation: indicators.filter((i: any) => i.enrichment?.reputation).length / indicators.length * 100,
        malware_analysis: indicators.filter((i: any) => i.enrichment?.malware_analysis).length / indicators.length * 100,
        network_analysis: indicators.filter((i: any) => i.enrichment?.network_analysis).length / indicators.length * 100
      },
      correlation_insights: {
        total_relationships: indicators.reduce((sum: number, i: any) => sum + (i.relationships?.length || 0), 0),
        campaign_correlations: this.campaigns.size,
        actor_correlations: this.threatActors.size,
        technique_correlations: this.tactics.size
      }
    };
  }

  generateThreatIntelligenceReport(title: string, period: { start: Date; end: Date }): any {
    return {
      id: this.generateId(),
      title,
      executive_summary: 'Comprehensive threat intelligence analysis for the specified period.',
      threat_landscape: this.generateThreatLandscape(),
      key_findings: [
        'Increased activity from APT groups targeting financial sector',
        'New malware families observed with advanced evasion techniques',
        'Growing use of legitimate tools for malicious purposes'
      ],
      recommendations: [
        'Enhance monitoring for financial sector organizations',
        'Update detection rules for new malware families',
        'Implement behavioral analysis for legitimate tool abuse'
      ],
      indicators_of_compromise: Array.from(this.indicators.values()).slice(0, 50),
      attribution_analysis: Array.from(this.attributions.values()),
      campaign_analysis: Array.from(this.campaigns.values()).filter((c: any) => !c.end_date),
      technical_analysis: 'Detailed technical analysis of observed threats and attack patterns.',
      mitigation_strategies: [
        'Deploy advanced endpoint detection and response solutions',
        'Implement network segmentation and zero-trust architecture',
        'Conduct regular security awareness training'
      ],
      generated_date: new Date(),
      report_period: period,
      confidence_level: 85,
      sources: Array.from(this.intelligenceFeeds.values()).map((f: any) => f.name),
      metadata: {}
    };
  }

  // Workflow Management
  createWorkflow(workflow: any): string {
    const newWorkflow = {
      ...workflow,
      id: this.generateId(),
      created_date: new Date(),
      execution_count: 0,
      success_rate: 100
    };
    
    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow.id;
  }

  executeWorkflow(workflowId: string): { success: boolean; execution_id: string; error?: string } {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return { success: false, execution_id: '', error: 'Workflow not found' };
    }

    if (!workflow.enabled) {
      return { success: false, execution_id: '', error: 'Workflow is disabled' };
    }

    const executionId = this.generateId();
    workflow.execution_count += 1;
    workflow.last_executed = new Date();
    this.workflows.set(workflowId, workflow);

    return { success: true, execution_id: executionId };
  }

  // Enrichment Jobs
  createEnrichmentJob(indicatorIds: string[], enrichmentTypes: string[]): string {
    const jobId = this.generateId();
    const job: any = {
      id: jobId,
      indicator_ids: indicatorIds,
      enrichment_types: enrichmentTypes,
      status: 'pending',
      created_date: new Date(),
      started_date: undefined,
      completed_date: undefined,
      results: {}
    };
    
    this.enrichmentJobs.set(jobId, job);
    
    // Simulate job processing
    setTimeout(() => {
      job.status = 'running';
      job.started_date = new Date();
      this.enrichmentJobs.set(jobId, job);
      
      setTimeout(() => {
        job.status = 'completed';
        job.completed_date = new Date();
        job.results = { enriched_indicators: indicatorIds.length };
        this.enrichmentJobs.set(jobId, job);
      }, 2000);
    }, 500);
    
    return jobId;
  }

  getEnrichmentJob(jobId: string): any {
    return this.enrichmentJobs.get(jobId) || null;
  }

  // Correlation Jobs
  createCorrelationJob(indicatorIds: string[], correlationTypes: string[]): string {
    const jobId = this.generateId();
    const job: any = {
      id: jobId,
      indicator_ids: indicatorIds,
      correlation_types: correlationTypes,
      status: 'pending',
      created_date: new Date(),
      started_date: undefined,
      completed_date: undefined,
      correlations: [],
      confidence_threshold: 0.7
    };
    
    this.correlationJobs.set(jobId, job);
    
    // Simulate job processing
    setTimeout(() => {
      job.status = 'running';
      job.started_date = new Date();
      this.correlationJobs.set(jobId, job);
      
      setTimeout(() => {
        job.status = 'completed';
        job.completed_date = new Date();
        job.correlations = indicatorIds.map(id => ({
          relationship_type: RelationshipType.Related,
          target_indicator: this.generateId(),
          confidence: Math.random(),
          description: 'Automated correlation',
          first_observed: new Date()
        }));
        this.correlationJobs.set(jobId, job);
      }, 3000);
    }, 500);
    
    return jobId;
  }

  getCorrelationJob(jobId: string): any {
    return this.correlationJobs.get(jobId) || null;
  }

  // Export and Import
  exportData(format: string, filters: any = {}): { success: boolean; data?: string; error?: string } {
    try {
      const data: any = {};
      
      if (!filters.types || filters.types.includes('indicators')) {
        data.indicators = Array.from(this.indicators.values());
      }
      
      if (!filters.types || filters.types.includes('threat_actors')) {
        data.threat_actors = Array.from(this.threatActors.values());
      }
      
      if (!filters.types || filters.types.includes('campaigns')) {
        data.campaigns = Array.from(this.campaigns.values());
      }
      
      if (!filters.types || filters.types.includes('feeds')) {
        data.feeds = Array.from(this.intelligenceFeeds.values());
      }

      let exportData: string;
      switch (format.toLowerCase()) {
        case 'json':
          exportData = JSON.stringify(data, null, 2);
          break;
        case 'csv':
          exportData = this.convertToCSV(data);
          break;
        default:
          return { success: false, error: 'Unsupported format' };
      }

      return { success: true, data: exportData };
    } catch (error) {
      return { success: false, error: `Export failed: ${error}` };
    }
  }

  importData(data: string, format: string): { success: boolean; imported: number; error?: string } {
    try {
      let parsedData: any;
      
      switch (format.toLowerCase()) {
        case 'json':
          parsedData = JSON.parse(data);
          break;
        default:
          return { success: false, imported: 0, error: 'Unsupported format' };
      }

      let imported = 0;
      
      if (parsedData.indicators) {
        parsedData.indicators.forEach((indicator: any) => {
          this.addIndicator(indicator);
          imported++;
        });
      }
      
      if (parsedData.threat_actors) {
        parsedData.threat_actors.forEach((actor: any) => {
          this.addThreatActor(actor);
          imported++;
        });
      }
      
      if (parsedData.campaigns) {
        parsedData.campaigns.forEach((campaign: any) => {
          this.addCampaign(campaign);
          imported++;
        });
      }

      return { success: true, imported };
    } catch (error) {
      return { success: false, imported: 0, error: `Import failed: ${error}` };
    }
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getTopThreatActors(limit: number): string[] {
    const actors = Array.from(this.threatActors.values());
    actors.sort((a: any, b: any) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());
    return actors.slice(0, limit).map((a: any) => a.name);
  }

  private getActiveCampaigns(): string[] {
    return Array.from(this.campaigns.values())
      .filter((c: any) => !c.end_date)
      .map((c: any) => c.name);
  }

  private getIndicatorTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const indicator of this.indicators.values()) {
      const type = indicator.indicator_type || 'Unknown';
      distribution[type] = (distribution[type] || 0) + 1;
    }
    return distribution;
  }

  private getIndicatorSeverityDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    for (const indicator of this.indicators.values()) {
      const severity = indicator.severity || 'Unknown';
      distribution[severity] = (distribution[severity] || 0) + 1;
    }
    return distribution;
  }

  private getIndicatorConfidenceDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {
      'Low (0-0.3)': 0,
      'Medium (0.3-0.7)': 0,
      'High (0.7-1.0)': 0
    };
    
    for (const indicator of this.indicators.values()) {
      const confidence = indicator.confidence || 0;
      if (confidence < 0.3) {
        distribution['Low (0-0.3)']++;
      } else if (confidence < 0.7) {
        distribution['Medium (0.3-0.7)']++;
      } else {
        distribution['High (0.7-1.0)']++;
      }
    }
    
    return distribution;
  }

  private generateSectorTargeting(): Record<string, any> {
    const sectors = ['Financial', 'Healthcare', 'Government', 'Technology', 'Energy'];
    const targeting: Record<string, any> = {};
    
    sectors.forEach(sector => {
      targeting[sector] = {
        threat_count: Math.floor(Math.random() * 50) + 1,
        top_actors: this.getTopThreatActors(3),
        risk_level: Object.values(ThreatSeverity)[Math.floor(Math.random() * Object.values(ThreatSeverity).length)]
      };
    });
    
    return targeting;
  }

  private generateGeographicThreats(): Record<string, any> {
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America'];
    const threats: Record<string, any> = {};
    
    regions.forEach(region => {
      threats[region] = {
        threat_count: Math.floor(Math.random() * 30) + 1,
        top_campaigns: this.getActiveCampaigns().slice(0, 2),
        risk_level: Object.values(ThreatSeverity)[Math.floor(Math.random() * Object.values(ThreatSeverity).length)]
      };
    });
    
    return threats;
  }

  private generateTechniqueUsage(): Record<string, any> {
    const techniques = ['T1566.001', 'T1071.001', 'T1055', 'T1027', 'T1083'];
    const usage: Record<string, any> = {};
    
    techniques.forEach(technique => {
      usage[technique] = {
        usage_count: Math.floor(Math.random() * 100) + 1,
        associated_actors: this.getTopThreatActors(2),
        trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)]
      };
    });
    
    return usage;
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for indicators
    if (data.indicators && data.indicators.length > 0) {
      const headers = ['id', 'indicator_type', 'value', 'confidence', 'severity', 'first_seen'];
      const rows = data.indicators.map((indicator: any) => 
        headers.map(header => indicator[header] || '').join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
    return '';
  }

  private loadSampleData(): void {
    // Sample threat indicator
    const sampleIndicator = {
      id: 'indicator-001',
      indicator_type: IndicatorType.IpAddress,
      value: '192.168.1.100',
      confidence: 0.85,
      severity: ThreatSeverity.High,
      first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      last_seen: new Date(Date.now() - 24 * 60 * 60 * 1000),
      sources: ['ThreatFeed1', 'Internal'],
      tags: ['malware', 'c2'],
      context: {
        malware_families: ['TrickBot'],
        threat_actors: ['TA505'],
        campaigns: ['Operation Stealth'],
        attack_patterns: ['T1071'],
        targeted_sectors: ['Financial'],
        geographic_regions: ['North America'],
        description: 'Command and control server for TrickBot malware'
      },
      relationships: [],
      enrichment: {
        geolocation: {
          country: 'United States',
          country_code: 'US',
          region: 'California',
          city: 'San Francisco',
          latitude: 37.7749,
          longitude: -122.4194,
          asn: 15169,
          organization: 'Google LLC',
          isp: 'Google'
        },
        reputation: {
          overall_score: 0.2,
          vendor_scores: {},
          categories: ['malware'],
          last_updated: new Date()
        },
        passive_dns: [],
        certificates: []
      },
      kill_chain_phases: ['command-and-control'],
      false_positive_score: 0.1,
      expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {}
    };
    this.indicators.set(sampleIndicator.id, sampleIndicator);

    // Sample threat actor
    const sampleActor = {
      id: 'actor-001',
      name: 'TA505',
      aliases: ['Hive0065', 'SectorJ04'],
      description: 'Financially motivated threat group',
      actor_type: ActorType.Cybercriminal,
      sophistication: SophisticationLevel.Advanced,
      motivation: [Motivation.Financial],
      origin_country: 'Unknown',
      target_sectors: ['Financial', 'Healthcare', 'Government'],
      target_regions: ['North America', 'Europe'],
      first_observed: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      last_activity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      confidence: 0.9,
      campaigns: ['Operation Stealth', 'Campaign Alpha'],
      ttps: ['T1566.001', 'T1071.001', 'T1055'],
      tools: ['TrickBot', 'Emotet', 'Cobalt Strike'],
      infrastructure: ['192.168.1.100', 'malicious-domain.com'],
      attribution_confidence: 0.8,
      metadata: {}
    };
    this.threatActors.set(sampleActor.id, sampleActor);

    // Sample campaign
    const sampleCampaign = {
      id: 'campaign-001',
      name: 'Operation Stealth',
      description: 'Large-scale financial fraud campaign',
      threat_actors: ['TA505'],
      start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      end_date: null,
      target_sectors: ['Financial', 'Healthcare'],
      target_regions: ['North America'],
      indicators: ['indicator-001'],
      ttps: ['T1566.001', 'T1071.001'],
      confidence: 0.85,
      severity: ThreatSeverity.High,
      events: [],
      metadata: {}
    };
    this.campaigns.set(sampleCampaign.id, sampleCampaign);

    // Sample intelligence feed
    const sampleFeed = {
      id: 'feed-001',
      name: 'ThreatFeed1',
      description: 'Commercial threat intelligence feed',
      feed_type: FeedType.Commercial,
      format: FeedFormat.JSON,
      url: 'https://api.threatfeed.com/indicators',
      enabled: true,
      polling_interval: 3600,
      last_updated: new Date(Date.now() - 60 * 60 * 1000),
      authentication: {
        auth_type: AuthenticationType.ApiKey,
        credentials: {}
      },
      processing_rules: [],
      quality_score: 0.9,
      reliability_score: 0.95,
      metadata: {}
    };
    this.intelligenceFeeds.set(sampleFeed.id, sampleFeed);

    // Sample report
    const sampleReport = {
      id: 'report-001',
      title: 'Q4 Threat Intelligence Report',
      description: 'Quarterly analysis of threat landscape',
      report_type: ReportType.Strategic,
      author: 'Threat Intelligence Team',
      published_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      content: 'Comprehensive analysis of threat activities...',
      indicators: ['indicator-001'],
      threat_actors: ['TA505'],
      campaigns: ['Operation Stealth'],
      confidence: 0.9,
      classification: 'TLP:WHITE',
      sources: ['ThreatFeed1', 'Internal Analysis'],
      metadata: {}
    };
    this.reports.set(sampleReport.id, sampleReport);

    // Sample attribution
    const sampleAttribution = {
      id: 'attribution-001',
      campaign_id: 'campaign-001',
      threat_actor_id: 'actor-001',
      confidence: 0.8,
      evidence: [],
      analysis_date: new Date(),
      analyst: 'Threat Intelligence Team',
      methodology: 'Technical analysis and behavioral correlation',
      supporting_indicators: ['indicator-001'],
      contradicting_evidence: [],
      metadata: {}
    };
    this.attributions.set(sampleAttribution.id, sampleAttribution);

    // Sample vulnerability
    const sampleVulnerability = {
      id: 'vuln-001',
      cve_id: 'CVE-2023-12345',
      title: 'Remote Code Execution in Web Application',
      description: 'Critical vulnerability allowing remote code execution',
      severity: ThreatSeverity.Critical,
      cvss_score: 9.8,
      published_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      affected_products: ['WebApp v1.0', 'WebApp v1.1'],
      exploit_available: true,
      exploited_in_wild: true,
      related_indicators: ['indicator-001'],
      related_campaigns: ['campaign-001'],
      mitigation_strategies: ['Apply security patch', 'Implement WAF rules'],
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-12345'],
      metadata: {}
    };
    this.vulnerabilities.set(sampleVulnerability.id, sampleVulnerability);

    // Sample workflow
    const sampleWorkflow = {
      id: 'workflow-001',
      name: 'Indicator Enrichment Pipeline',
      description: 'Automated enrichment of new indicators',
      enabled: true,
      trigger_conditions: ['new_indicator'],
      steps: [
        { step_type: 'enrichment', parameters: { types: ['geolocation', 'reputation'] } },
        { step_type: 'correlation', parameters: { threshold: 0.7 } },
        { step_type: 'notification', parameters: { channels: ['email', 'slack'] } }
      ],
      created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      execution_count: 0,
      success_rate: 100,
      metadata: {}
    };
    this.workflows.set(sampleWorkflow.id, sampleWorkflow);
  }
}

export default IntelCore;
