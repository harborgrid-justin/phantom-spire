/**
 * Fortune 100-Grade Evidence Management Demonstration
 * Showcases enterprise-level evidence management capabilities
 */

import { DataLayerOrchestrator } from '../../data-layer/DataLayerOrchestrator';
import { MessageQueueManager } from '../../message-queue/core/MessageQueueManager';
import { 
  EvidenceType, 
  EvidenceSourceType, 
  ClassificationLevel,
  CustodyAction 
} from '../../data-layer/evidence/interfaces/IEvidence';
import { 
  IEvidenceContext,
  ICreateEvidenceRequest 
} from '../../data-layer/evidence/interfaces/IEvidenceManager';
import { logger } from '../../utils/logger';

class EvidenceManagementDemo {
  private orchestrator: DataLayerOrchestrator;
  private messageQueueManager: MessageQueueManager;

  constructor() {
    // Initialize with default configuration
    const config = {
      mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        database: 'phantom_spire_demo'
      },
      messageQueue: {
        enabled: true,
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      },
      evidence: {
        enabled: true,
        classification: {
          default: ClassificationLevel.TLP_WHITE,
          enforceAccess: true
        }
      }
    };

    this.messageQueueManager = new MessageQueueManager();
    this.orchestrator = new DataLayerOrchestrator(config, this.messageQueueManager);
  }

  /**
   * Run complete evidence management demonstration
   */
  async runDemo(): Promise<void> {
    console.log('🚀 Starting Fortune 100-Grade Evidence Management Demonstration');
    console.log('================================================================');

    try {
      // Initialize systems
      await this.initialize();

      // Create demonstration context
      const context = this.createAnalystContext();

      // Demo 1: Create and manage evidence
      console.log('\n📊 Demo 1: Creating and Managing Evidence');
      await this.demoCreateEvidence(context);

      // Demo 2: Chain of custody tracking
      console.log('\n🔗 Demo 2: Chain of Custody Management');
      await this.demoCustodyManagement(context);

      // Demo 3: Evidence search and analytics
      console.log('\n🔍 Demo 3: Evidence Search and Analytics');
      await this.demoSearchAnalytics(context);

      // Demo 4: Comprehensive evidence analysis
      console.log('\n🧠 Demo 4: Comprehensive Evidence Analysis');
      await this.demoComprehensiveAnalysis(context);

      // Demo 5: Classification and access control
      console.log('\n🔒 Demo 5: Classification and Access Control');
      await this.demoAccessControl();

      // Demo 6: Bulk operations
      console.log('\n⚡ Demo 6: Enterprise Bulk Operations');
      await this.demoBulkOperations(context);

      // Demo 7: Metrics and reporting
      console.log('\n📈 Demo 7: Metrics and Reporting');
      await this.demoMetricsReporting(context);

      console.log('\n✅ Evidence Management Demonstration Complete!');
      console.log('================================================================');

    } catch (error) {
      console.error('❌ Demo failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async initialize(): Promise<void> {
    console.log('Initializing Data Layer Orchestrator...');
    await this.orchestrator.initialize();
    console.log('✅ System initialized successfully');
  }

  private createAnalystContext(): IEvidenceContext {
    return {
      userId: 'demo-analyst-001',
      userRole: 'senior-analyst',
      permissions: ['evidence:read', 'evidence:write', 'evidence:analyze', 'evidence:admin'],
      classification: ClassificationLevel.TLP_AMBER,
      sessionId: 'demo-session-' + Date.now(),
      ipAddress: '192.168.1.100',
      userAgent: 'Evidence-Management-Demo/1.0'
    };
  }

  private async demoCreateEvidence(context: IEvidenceContext): Promise<string> {
    console.log('Creating IOC evidence from threat intelligence feed...');

    const request: ICreateEvidenceRequest = {
      type: EvidenceType.IOC_EVIDENCE,
      sourceType: EvidenceSourceType.THREAT_FEED,
      sourceId: 'demo-ioc-malicious-ip-001',
      sourceSystem: 'phantom-spire-demo',
      data: {
        value: '185.220.101.42',
        type: 'ip',
        confidence: 92,
        severity: 'high',
        tags: ['malware', 'c2', 'apt29', 'cozy-bear'],
        first_seen: new Date(Date.now() - 86400000), // 24 hours ago
        last_seen: new Date(),
        sources: ['virusTotal', 'alienvault', 'internal-honeypot'],
        context: {
          campaign: 'NOBELIUM-2024-Q1',
          threat_actor: 'APT29',
          infrastructure_type: 'c2_server',
          ports: [443, 8080, 8443],
          protocols: ['HTTPS', 'HTTP'],
          geolocation: {
            country: 'RU',
            asn: 'AS13335'
          }
        }
      },
      metadata: {
        title: 'APT29 Command & Control Server',
        description: 'Malicious IP address identified as APT29/Cozy Bear C2 infrastructure used in NOBELIUM campaign targeting government entities',
        severity: 'high',
        confidence: 92,
        format: 'json',
        customFields: {
          intelligence_source: 'multi-source-fusion',
          verification_status: 'verified',
          false_positive_probability: 0.08,
          operational_status: 'active'
        }
      },
      classification: ClassificationLevel.TLP_AMBER,
      tags: ['apt29', 'nobelium', 'government-targeting', 'c2-infrastructure'],
      handling: [
        {
          type: 'sharing',
          instruction: 'Share with government partners and critical infrastructure',
          authority: 'SOC-Lead',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        {
          type: 'retention',
          instruction: 'Retain for 5 years minimum due to APT campaign significance',
          authority: 'Threat Intelligence Manager'
        }
      ]
    };

    const evidence = await this.orchestrator.createEvidence(request, context);
    
    console.log(`✅ Created evidence: ${evidence.id}`);
    console.log(`   Type: ${evidence.type}`);
    console.log(`   Classification: ${evidence.classification}`);
    console.log(`   Confidence: ${evidence.metadata.confidence}%`);
    console.log(`   Chain of Custody Entries: ${evidence.chainOfCustody.length}`);
    console.log(`   Integrity Hash: ${evidence.integrity.hash.substring(0, 16)}...`);

    return evidence.id;
  }

  private async demoCustodyManagement(context: IEvidenceContext): Promise<void> {
    console.log('Demonstrating chain of custody management...');

    // Create evidence for custody demo
    const evidence = await this.orchestrator.createEvidence({
      type: EvidenceType.MALWARE_SAMPLE,
      sourceType: EvidenceSourceType.HONEYPOT,
      sourceId: 'demo-malware-sample-001',
      sourceSystem: 'enterprise-honeypot-grid',
      data: {
        filename: 'suspicious_invoice.doc',
        md5: 'a1b2c3d4e5f6789012345678901234567',
        sha256: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        file_type: 'Microsoft Word Document',
        size_bytes: 524288,
        behavior: {
          network_connections: ['192.168.1.100:443', '10.0.0.1:80'],
          file_operations: ['create', 'modify', 'delete'],
          registry_modifications: ['HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'],
          process_creation: ['cmd.exe', 'powershell.exe']
        },
        detection: {
          antivirus_hits: 15,
          sandbox_score: 95,
          yara_rules: ['APT_Generic_Dropper', 'Office_Macro_Suspicious']
        }
      },
      metadata: {
        title: 'Malicious Office Document with Macro',
        description: 'Word document containing malicious macro captured from honeypot, suspected APT campaign delivery mechanism',
        severity: 'critical',
        confidence: 95,
        format: 'binary'
      },
      classification: ClassificationLevel.TLP_RED
    }, {
      ...context,
      classification: ClassificationLevel.TLP_RED
    });

    console.log(`✅ Created malware sample evidence: ${evidence.id}`);

    // Add custody entries to demonstrate chain
    const custodyActions = [
      {
        action: CustodyAction.COLLECTED,
        details: 'Malware sample automatically collected from honeypot sensor HPS-001',
        location: 'Honeypot-Grid-East-01'
      },
      {
        action: CustodyAction.TRANSFERRED,
        details: 'Sample transferred to malware analysis lab for detailed examination',
        location: 'SOC-MalwareLab-001'
      },
      {
        action: CustodyAction.ANALYZED,
        details: 'Static and dynamic analysis completed, macro payload extracted and reverse engineered',
        location: 'SOC-MalwareLab-001',
        signature: 'analyst-digital-signature-placeholder'
      },
      {
        action: CustodyAction.ENRICHED,
        details: 'Sample enriched with YARA rules, IOCs extracted, and campaign attribution added',
        location: 'Threat-Intelligence-Platform'
      }
    ];

    const evidenceManager = this.orchestrator.getEvidenceManager();
    for (const custodyAction of custodyActions) {
      await evidenceManager.addCustodyEntry(evidence.id, custodyAction, {
        ...context,
        classification: ClassificationLevel.TLP_RED
      });
      console.log(`   ➤ Added custody entry: ${custodyAction.action}`);
      // Small delay to show temporal progression
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify custody chain integrity
    const verification = await evidenceManager.verifyCustodyChain(evidence.id, {
      ...context,
      classification: ClassificationLevel.TLP_RED
    });
    
    console.log(`✅ Custody chain verification:`);
    console.log(`   Valid: ${verification.isValid}`);
    console.log(`   Chain Length: ${verification.chainLength}`);
    console.log(`   Issues: ${verification.issues.length}`);

    // Verify data integrity
    const integrityCheck = await evidenceManager.verifyIntegrity(evidence.id, {
      ...context,
      classification: ClassificationLevel.TLP_RED
    });
    
    console.log(`✅ Data integrity verification:`);
    console.log(`   Valid: ${integrityCheck.isValid}`);
    console.log(`   Algorithm: ${integrityCheck.algorithm}`);
    console.log(`   Verified At: ${integrityCheck.verificationTimestamp}`);
  }

  private async demoSearchAnalytics(context: IEvidenceContext): Promise<string[]> {
    console.log('Demonstrating advanced evidence search and analytics...');

    // Create multiple related evidence items for search demo
    const evidenceRequests = [
      {
        type: EvidenceType.NETWORK_TRAFFIC,
        sourceType: EvidenceSourceType.SENSOR_DATA,
        sourceId: 'demo-pcap-001',
        data: { protocol: 'HTTPS', src_ip: '10.0.1.100', dst_ip: '185.220.101.42', payload_size: 2048 },
        metadata: { title: 'Suspicious HTTPS Traffic', description: 'Encrypted C2 traffic to known malicious IP', severity: 'high', confidence: 88, format: 'pcap' },
        classification: ClassificationLevel.TLP_AMBER,
        tags: ['network-traffic', 'c2-communication', 'apt29']
      },
      {
        type: EvidenceType.ATTACK_PATTERN,
        sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
        sourceId: 'demo-ttp-001',
        data: { technique: 'T1055.012', tactic: 'Defense Evasion', description: 'Process Hollowing via legitimate process injection' },
        metadata: { title: 'Process Hollowing Attack Pattern', description: 'MITRE ATT&CK T1055.012 observed in malware behavior', severity: 'medium', confidence: 85, format: 'mitre-attack' },
        classification: ClassificationLevel.TLP_GREEN,
        tags: ['mitre-attack', 'defense-evasion', 'process-injection']
      },
      {
        type: EvidenceType.CAMPAIGN_EVIDENCE,
        sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
        sourceId: 'demo-campaign-001',
        data: { campaign_name: 'NOBELIUM-2024-Q1', attribution: 'APT29', targets: ['government', 'healthcare', 'technology'] },
        metadata: { title: 'NOBELIUM Campaign Evidence', description: 'Evidence linking activities to broader NOBELIUM campaign', severity: 'critical', confidence: 93, format: 'json' },
        classification: ClassificationLevel.TLP_AMBER,
        tags: ['apt29', 'nobelium', 'campaign-evidence', 'government-targeting']
      }
    ];

    const evidenceIds = [];
    for (const request of evidenceRequests) {
      const evidence = await this.orchestrator.createEvidence(request, context);
      evidenceIds.push(evidence.id);
      console.log(`   ➤ Created ${request.type}: ${evidence.id}`);
    }

    // Demonstrate various search capabilities
    console.log('\n🔍 Searching evidence by different criteria...');

    // Search by type
    const typeSearch = await this.orchestrator.searchEvidence({
      types: [EvidenceType.IOC_EVIDENCE, EvidenceType.NETWORK_TRAFFIC],
      limit: 10
    }, context);
    console.log(`   Type search found: ${typeSearch.totalCount} items`);

    // Search by tags
    const tagSearch = await this.orchestrator.searchEvidence({
      tags: ['apt29'],
      limit: 10
    }, context);
    console.log(`   Tag search (apt29) found: ${tagSearch.totalCount} items`);

    // Search by confidence range
    const confidenceSearch = await this.orchestrator.searchEvidence({
      confidenceRange: { min: 90, max: 100 },
      limit: 10
    }, context);
    console.log(`   High-confidence search found: ${confidenceSearch.totalCount} items`);

    // Text search
    const textSearch = await this.orchestrator.searchEvidence({
      text: 'NOBELIUM',
      limit: 10
    }, context);
    console.log(`   Text search (NOBELIUM) found: ${textSearch.totalCount} items`);

    console.log('\n📊 Search facets available:');
    console.log(`   Types: ${typeSearch.facets.types.length} different types`);
    console.log(`   Source Types: ${typeSearch.facets.sourceTypes.length} different sources`);
    console.log(`   Classifications: ${typeSearch.facets.classifications.length} different classifications`);

    return evidenceIds;
  }

  private async demoComprehensiveAnalysis(context: IEvidenceContext): Promise<void> {
    console.log('Performing comprehensive multi-evidence analysis...');

    // Get all evidence for analysis
    const searchResult = await this.orchestrator.searchEvidence({ limit: 100 }, context);
    const evidenceIds = searchResult.evidence.map(e => e.id);

    if (evidenceIds.length === 0) {
      console.log('⚠️  No evidence available for analysis');
      return;
    }

    console.log(`Analyzing ${evidenceIds.length} evidence items...`);

    // Perform comprehensive analysis
    const analysis = await this.orchestrator.analyzeEvidence(
      evidenceIds,
      context,
      {
        include_correlations: true,
        include_patterns: true,
        include_risk_assessment: true,
        include_recommendations: true,
        analysis_depth: 'comprehensive'
      }
    );

    console.log(`✅ Analysis complete: ${analysis.analysisId}`);
    console.log(`   Evidence Analyzed: ${analysis.evidenceAnalyzed}`);
    console.log(`   Findings: ${analysis.findings.length}`);
    console.log(`   Correlations: ${analysis.correlations.length}`);
    console.log(`   Patterns: ${analysis.patterns.length}`);
    console.log(`   Overall Risk: ${analysis.riskAssessment.overall_risk} (${analysis.riskAssessment.risk_score}/100)`);
    console.log(`   Recommendations: ${analysis.recommendations.length}`);

    // Show detailed findings
    if (analysis.findings.length > 0) {
      console.log('\n🔍 Key Findings:');
      analysis.findings.slice(0, 3).forEach((finding, idx) => {
        console.log(`   ${idx + 1}. ${finding.title} (${finding.severity})`);
        console.log(`      Confidence: ${finding.confidence}%`);
        console.log(`      Type: ${finding.type}`);
      });
    }

    // Show patterns
    if (analysis.patterns.length > 0) {
      console.log('\n📈 Detected Patterns:');
      analysis.patterns.slice(0, 3).forEach((pattern, idx) => {
        console.log(`   ${idx + 1}. ${pattern.name}`);
        console.log(`      Type: ${pattern.type}`);
        console.log(`      Confidence: ${pattern.confidence}%`);
        console.log(`      Evidence Count: ${pattern.evidence_count}`);
      });
    }

    // Show recommendations
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.slice(0, 3).forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.title} (${rec.priority})`);
        console.log(`      Type: ${rec.type}`);
        console.log(`      Estimated Effort: ${rec.estimated_effort}`);
      });
    }

    console.log('\n📊 Analysis Quality Metrics:');
    console.log(`   Completeness: ${analysis.quality.completeness}%`);
    console.log(`   Coverage: ${analysis.quality.coverage}%`);
    console.log(`   Depth: ${analysis.quality.depth}%`);
    console.log(`   Timeliness: ${analysis.quality.timeliness}%`);
  }

  private async demoAccessControl(): Promise<void> {
    console.log('Demonstrating classification-based access control...');

    // Create high-classification evidence
    const secretContext: IEvidenceContext = {
      userId: 'demo-intel-analyst',
      userRole: 'intelligence-analyst',
      permissions: ['evidence:read', 'evidence:write', 'evidence:analyze'],
      classification: ClassificationLevel.SECRET,
      sessionId: 'secret-session-' + Date.now(),
      ipAddress: '192.168.1.200'
    };

    const secretEvidence = await this.orchestrator.createEvidence({
      type: EvidenceType.ATTRIBUTION_EVIDENCE,
      sourceType: EvidenceSourceType.HUMAN_ANALYSIS,
      sourceId: 'demo-secret-attribution',
      sourceSystem: 'classified-intelligence-system',
      data: {
        threat_actor: 'APT29',
        real_name: '[CLASSIFIED]',
        infrastructure: {
          hosting_providers: ['Provider-A', 'Provider-B'],
          payment_methods: ['Bitcoin', 'Monero'],
          operational_security: 'high'
        },
        attribution_confidence: 97
      },
      metadata: {
        title: 'APT29 Attribution Intelligence',
        description: 'Classified attribution intelligence on APT29 infrastructure and operations',
        severity: 'critical',
        confidence: 97,
        format: 'classified-json'
      },
      classification: ClassificationLevel.SECRET,
      tags: ['classified', 'apt29', 'attribution', 'infrastructure-analysis']
    }, secretContext);

    console.log(`✅ Created SECRET evidence: ${secretEvidence.id}`);

    // Attempt access with lower clearance (should fail)
    const lowClearanceContext: IEvidenceContext = {
      userId: 'demo-junior-analyst',
      userRole: 'junior-analyst',
      permissions: ['evidence:read'],
      classification: ClassificationLevel.TLP_AMBER,
      sessionId: 'low-clearance-session-' + Date.now(),
      ipAddress: '192.168.1.150'
    };

    const evidenceManager = this.orchestrator.getEvidenceManager();
    const deniedAccess = await evidenceManager.getEvidence(secretEvidence.id, lowClearanceContext);
    console.log(`❌ Access denied for low clearance user: ${deniedAccess === null}`);

    // Attempt access with proper clearance (should succeed)
    const allowedAccess = await evidenceManager.getEvidence(secretEvidence.id, secretContext);
    console.log(`✅ Access allowed for proper clearance: ${allowedAccess !== null}`);

    // Demonstrate search filtering
    const searchWithLowClearance = await this.orchestrator.searchEvidence({ limit: 100 }, lowClearanceContext);
    const searchWithHighClearance = await this.orchestrator.searchEvidence({ limit: 100 }, secretContext);

    console.log(`🔍 Search results by clearance level:`);
    console.log(`   Low clearance can see: ${searchWithLowClearance.totalCount} items`);
    console.log(`   High clearance can see: ${searchWithHighClearance.totalCount} items`);
  }

  private async demoBulkOperations(context: IEvidenceContext): Promise<void> {
    console.log('Demonstrating enterprise bulk operations...');

    // Create bulk IOC evidence from threat feed
    const bulkRequests: ICreateEvidenceRequest[] = [
      'malware-domain-001.evil.com',
      'malware-domain-002.bad.net',
      'malware-domain-003.suspicious.org',
      '203.0.113.100',
      '203.0.113.101'
    ].map((indicator, idx) => ({
      type: EvidenceType.IOC_EVIDENCE,
      sourceType: EvidenceSourceType.THREAT_FEED,
      sourceId: `bulk-demo-${idx + 1}`,
      sourceSystem: 'bulk-threat-feed-processor',
      data: {
        value: indicator,
        type: indicator.includes('.') && !indicator.match(/^\d+\.\d+\.\d+\.\d+$/) ? 'domain' : 'ip',
        confidence: 70 + Math.floor(Math.random() * 20),
        severity: ['medium', 'high'][Math.floor(Math.random() * 2)],
        feed_source: 'Automated-Threat-Feed-XYZ'
      },
      metadata: {
        title: `Bulk IOC: ${indicator}`,
        description: `IOC from automated bulk threat feed processing`,
        severity: ['medium', 'high'][Math.floor(Math.random() * 2)] as any,
        confidence: 70 + Math.floor(Math.random() * 20),
        format: 'json'
      },
      classification: ClassificationLevel.TLP_GREEN,
      tags: ['bulk-import', 'threat-feed', 'automated']
    }));

    console.log(`Processing ${bulkRequests.length} bulk evidence items...`);

    const evidenceManager = this.orchestrator.getEvidenceManager();
    const bulkResult = await evidenceManager.bulkCreateEvidence(bulkRequests, context);

    console.log(`✅ Bulk operation results:`);
    console.log(`   Successful: ${bulkResult.successful}`);
    console.log(`   Failed: ${bulkResult.failed}`);
    console.log(`   Errors: ${bulkResult.errors.length}`);

    if (bulkResult.errors.length > 0) {
      console.log('   Error details:');
      bulkResult.errors.slice(0, 3).forEach(error => {
        console.log(`     Index ${error.index}: ${error.error}`);
      });
    }

    // Demonstrate bulk updates
    const searchResult = await this.orchestrator.searchEvidence({
      tags: ['bulk-import'],
      limit: 3
    }, context);

    if (searchResult.evidence.length > 0) {
      console.log('\nDemonstrating bulk updates...');
      const bulkUpdates = searchResult.evidence.map(evidence => ({
        evidenceId: evidence.id,
        updates: {
          tags: [...evidence.tags, 'bulk-updated', 'quality-reviewed'],
          metadata: {
            ...evidence.metadata,
            confidence: Math.min(evidence.metadata.confidence + 10, 100)
          }
        }
      }));

      const updateResult = await evidenceManager.bulkUpdateEvidence(bulkUpdates, context);
      console.log(`   Bulk updates - Successful: ${updateResult.successful}, Failed: ${updateResult.failed}`);
    }
  }

  private async demoMetricsReporting(context: IEvidenceContext): Promise<void> {
    console.log('Generating comprehensive evidence metrics and reports...');

    // Get overall evidence metrics
    const metrics = await this.orchestrator.getEvidenceMetrics();

    console.log('📊 Evidence Metrics Summary:');
    console.log(`   Total Evidence: ${metrics.totalEvidence}`);
    console.log(`   Average Confidence: ${metrics.averageConfidence.toFixed(1)}%`);

    console.log('\n📈 Evidence by Type:');
    Object.entries(metrics.evidenceByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n🔒 Evidence by Classification:');
    Object.entries(metrics.evidenceByClassification).forEach(([classification, count]) => {
      console.log(`   ${classification}: ${count}`);
    });

    console.log('\n📊 Quality Metrics:');
    console.log(`   Average Completeness: ${(metrics.qualityMetrics.averageCompleteness * 100).toFixed(1)}%`);
    console.log(`   Average Accuracy: ${(metrics.qualityMetrics.averageAccuracy * 100).toFixed(1)}%`);
    console.log(`   Average Consistency: ${(metrics.qualityMetrics.averageConsistency * 100).toFixed(1)}%`);
    console.log(`   Average Timeliness: ${(metrics.qualityMetrics.averageTimeliness * 100).toFixed(1)}%`);
    console.log(`   Average Reliability: ${(metrics.qualityMetrics.averageReliability * 100).toFixed(1)}%`);

    console.log('\n🔐 Custody Metrics:');
    console.log(`   Average Chain Length: ${metrics.custodyMetrics.averageChainLength.toFixed(1)}`);
    console.log(`   Integrity Violations: ${metrics.custodyMetrics.integrityViolations}`);
    console.log(`   Total Custody Transfers: ${metrics.custodyMetrics.custodyTransfers}`);

    // Generate a sample report
    const reportQuery = {
      title: 'Fortune 100 Evidence Management Demo Report',
      filters: {
        classifications: [ClassificationLevel.TLP_AMBER, ClassificationLevel.TLP_GREEN],
        severities: ['high', 'critical'],
        limit: 100
      },
      includeChainOfCustody: true,
      includeRelationships: true,
      includeMetrics: true,
      format: 'json' as const
    };

    const evidenceManager = this.orchestrator.getEvidenceManager();
    const report = await evidenceManager.generateEvidenceReport(reportQuery, context);

    console.log('\n📋 Generated Evidence Report:');
    console.log(`   Title: ${report.title}`);
    console.log(`   Generated By: ${report.generatedBy}`);
    console.log(`   Evidence Items: ${report.evidence.length}`);
    console.log(`   Total Evidence in System: ${report.summary.totalEvidence}`);

    console.log('\n📊 Report Summary:');
    Object.entries(report.summary.byType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`   ${type}: ${count}`);
      }
    });
  }

  private async cleanup(): Promise<void> {
    console.log('\nCleaning up demo resources...');
    try {
      await this.orchestrator.shutdown();
      console.log('✅ Cleanup complete');
    } catch (error) {
      console.error('⚠️  Cleanup error:', error);
    }
  }
}

// Main execution
async function runDemo() {
  const demo = new EvidenceManagementDemo();
  try {
    await demo.runDemo();
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

// Export for use as module or run directly
export { EvidenceManagementDemo };

// Run demo if executed directly
if (require.main === module) {
  console.log('Starting Evidence Management Demo...');
  runDemo().catch(console.error);
}