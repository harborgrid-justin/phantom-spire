# NAPI-RS Integration Patterns & Best Practices

## 🎯 Overview

This guide provides real-world integration patterns, best practices, and common implementation scenarios for Phantom Spire NAPI-RS modules. Learn how to effectively combine multiple modules for powerful cybersecurity workflows.

## 🏗️ Architecture Patterns

### 1. Single Module Pattern
Simple integration for focused functionality.

```typescript
// Single module usage pattern
import { CveCoreNapi } from 'phantom-cve-core';

class VulnerabilityService {
  private cveCore: CveCoreNapi;
  
  constructor() {
    this.cveCore = new CveCoreNapi();
  }
  
  async processVulnerability(cveData: any) {
    try {
      // Validate health
      const health = JSON.parse(this.cveCore.getHealthStatus());
      if (health.status !== 'healthy') {
        throw new Error(`CVE module unhealthy: ${health.status}`);
      }
      
      // Process CVE
      const result = this.cveCore.processCve(JSON.stringify(cveData));
      return JSON.parse(result);
      
    } catch (error) {
      console.error('CVE processing failed:', error);
      throw error;
    }
  }
}
```

### 2. Multi-Module Orchestration Pattern
Coordinate multiple modules for comprehensive analysis.

```typescript
// Multi-module orchestration
import { CveCoreNapi } from 'phantom-cve-core';
import { IntelCoreNapi } from 'phantom-intel-core';
import { XdrCoreNapi } from 'phantom-xdr-core';
import { MitreCoreNapi } from 'phantom-mitre-core';

class ThreatAnalysisOrchestrator {
  private modules: {
    cve: CveCoreNapi;
    intel: IntelCoreNapi;
    xdr: XdrCoreNapi;
    mitre: MitreCoreNapi;
  };
  
  constructor() {
    this.modules = {
      cve: new CveCoreNapi(),
      intel: new IntelCoreNapi(),
      xdr: new XdrCoreNapi(),
      mitre: new MitreCoreNapi()
    };
  }
  
  async comprehensiveAnalysis(threatData: any) {
    const results = {
      vulnerability: null,
      intelligence: null,
      correlation: null,
      mitreMapping: null,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Step 1: Vulnerability Analysis
      if (threatData.cve) {
        console.log('Analyzing vulnerability...');
        const cveResult = this.modules.cve.processCve(JSON.stringify(threatData.cve));
        results.vulnerability = JSON.parse(cveResult);
      }
      
      // Step 2: Threat Intelligence Gathering
      if (threatData.indicators) {
        console.log('Gathering threat intelligence...');
        const intelCriteria = {
          indicators: threatData.indicators,
          timeRange: '24h',
          includeContext: true
        };
        
        try {
          const intelResult = this.modules.intel.gatherIntelligence(JSON.stringify(intelCriteria));
          results.intelligence = JSON.parse(intelResult);
        } catch (error) {
          console.warn('Intel gathering failed:', error.message);
        }
      }
      
      // Step 3: XDR Correlation
      if (results.vulnerability || results.intelligence) {
        console.log('Performing XDR correlation...');
        const events = [];
        
        if (results.vulnerability) {
          events.push({
            source: 'cve_analysis',
            type: 'vulnerability_detected',
            data: results.vulnerability,
            timestamp: new Date().toISOString()
          });
        }
        
        if (results.intelligence) {
          events.push({
            source: 'threat_intel',
            type: 'intelligence_gathered',
            data: results.intelligence,
            timestamp: new Date().toISOString()
          });
        }
        
        try {
          const xdrResult = this.modules.xdr.correlateEvents(JSON.stringify(events));
          results.correlation = JSON.parse(xdrResult);
        } catch (error) {
          console.warn('XDR correlation failed:', error.message);
        }
      }
      
      // Step 4: MITRE ATT&CK Mapping
      if (threatData.behaviors) {
        console.log('Mapping to MITRE ATT&CK...');
        try {
          const mitreResult = this.modules.mitre.mapTechniques(JSON.stringify(threatData.behaviors));
          results.mitreMapping = JSON.parse(mitreResult);
        } catch (error) {
          console.warn('MITRE mapping failed:', error.message);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      throw error;
    }
  }
  
  // Health check for all modules
  async checkSystemHealth() {
    const healthStatus = {};
    
    for (const [name, module] of Object.entries(this.modules)) {
      try {
        if (typeof module.getHealthStatus === 'function') {
          const health = JSON.parse(module.getHealthStatus());
          healthStatus[name] = health;
        } else {
          healthStatus[name] = { status: 'unknown', note: 'No health check available' };
        }
      } catch (error) {
        healthStatus[name] = { status: 'error', error: error.message };
      }
    }
    
    return healthStatus;
  }
}
```

### 3. Event-Driven Pattern
Reactive processing using events and streams.

```typescript
import { EventEmitter } from 'events';
import { CveCoreNapi } from 'phantom-cve-core';
import { IntelCoreNapi } from 'phantom-intel-core';

class EventDrivenSecurityProcessor extends EventEmitter {
  private cveCore: CveCoreNapi;
  private intelCore: IntelCoreNapi;
  private processingQueue: any[] = [];
  private isProcessing = false;
  
  constructor() {
    super();
    this.cveCore = new CveCoreNapi();
    this.intelCore = new IntelCoreNapi();
    
    // Set up event handlers
    this.on('cve_received', this.handleCveEvent.bind(this));
    this.on('intel_required', this.handleIntelEvent.bind(this));
    this.on('analysis_complete', this.handleAnalysisComplete.bind(this));
  }
  
  async handleCveEvent(cveData: any) {
    try {
      console.log(`Processing CVE: ${cveData.cveId}`);
      
      const result = this.cveCore.processCve(JSON.stringify(cveData));
      const processed = JSON.parse(result);
      
      // Emit follow-up events based on results
      if (processed.riskScore > 7.0) {
        this.emit('high_risk_detected', { cve: processed, original: cveData });
      }
      
      if (processed.indicators) {
        this.emit('intel_required', { indicators: processed.indicators, context: processed });
      }
      
      this.emit('cve_processed', processed);
      
    } catch (error) {
      this.emit('processing_error', { type: 'cve', error: error.message, data: cveData });
    }
  }
  
  async handleIntelEvent(intelRequest: any) {
    try {
      console.log('Gathering intelligence for indicators:', intelRequest.indicators);
      
      const criteria = {
        indicators: intelRequest.indicators,
        timeRange: '24h',
        sources: ['default']
      };
      
      const result = this.intelCore.gatherIntelligence(JSON.stringify(criteria));
      const intelligence = JSON.parse(result);
      
      this.emit('intelligence_gathered', { 
        intelligence, 
        context: intelRequest.context 
      });
      
    } catch (error) {
      this.emit('processing_error', { 
        type: 'intel', 
        error: error.message, 
        data: intelRequest 
      });
    }
  }
  
  handleAnalysisComplete(analysisData: any) {
    console.log('Analysis complete:', analysisData);
    // Store results, send notifications, etc.
  }
  
  // Public API
  processCve(cveData: any) {
    this.emit('cve_received', cveData);
  }
  
  requestIntelligence(indicators: string[], context?: any) {
    this.emit('intel_required', { indicators, context });
  }
}

// Usage example
const processor = new EventDrivenSecurityProcessor();

processor.on('high_risk_detected', (data) => {
  console.log('HIGH RISK ALERT:', data.cve.cveId);
  // Trigger immediate response workflow
});

processor.on('processing_error', (error) => {
  console.error('Processing error:', error);
  // Implement error handling/retry logic
});

// Process a CVE
processor.processCve({
  cveId: 'CVE-2023-12345',
  description: 'Critical vulnerability',
  cvssScore: 9.0
});
```

### 4. Pipeline Pattern
Sequential processing through multiple modules.

```typescript
interface PipelineStage {
  name: string;
  process: (data: any) => Promise<any>;
  required: boolean;
}

class SecurityAnalysisPipeline {
  private stages: PipelineStage[] = [];
  
  constructor() {
    this.initializePipeline();
  }
  
  private initializePipeline() {
    const cveCore = new CveCoreNapi();
    const intelCore = new IntelCoreNapi();
    const xdrCore = new XdrCoreNapi();
    const cryptoCore = new CryptoCoreNapi();
    
    // Define pipeline stages
    this.stages = [
      {
        name: 'input_validation',
        required: true,
        process: async (data) => {
          // Validate input data structure
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid input data');
          }
          return { ...data, validated: true, timestamp: new Date().toISOString() };
        }
      },
      
      {
        name: 'vulnerability_analysis',
        required: false,
        process: async (data) => {
          if (data.cve) {
            const result = cveCore.processCve(JSON.stringify(data.cve));
            return { ...data, vulnerability: JSON.parse(result) };
          }
          return data;
        }
      },
      
      {
        name: 'intelligence_gathering',
        required: false,
        process: async (data) => {
          if (data.indicators) {
            try {
              const criteria = {
                indicators: data.indicators,
                timeRange: '1h'
              };
              const result = intelCore.gatherIntelligence(JSON.stringify(criteria));
              return { ...data, intelligence: JSON.parse(result) };
            } catch (error) {
              console.warn('Intelligence gathering failed:', error.message);
              return data;
            }
          }
          return data;
        }
      },
      
      {
        name: 'correlation_analysis',
        required: false,
        process: async (data) => {
          if (data.vulnerability || data.intelligence) {
            try {
              const events = [];
              if (data.vulnerability) events.push({ type: 'vulnerability', data: data.vulnerability });
              if (data.intelligence) events.push({ type: 'intelligence', data: data.intelligence });
              
              const result = xdrCore.correlateEvents(JSON.stringify(events));
              return { ...data, correlation: JSON.parse(result) };
            } catch (error) {
              console.warn('Correlation failed:', error.message);
              return data;
            }
          }
          return data;
        }
      },
      
      {
        name: 'security_enhancement',
        required: false,
        process: async (data) => {
          // Add security metadata
          const secureToken = cryptoCore.generateSecureToken(16);
          const timestamp = cryptoCore.getPreciseTimestamp();
          
          return {
            ...data,
            security: {
              processId: secureToken,
              timestamp: timestamp,
              integrity: 'verified'
            }
          };
        }
      },
      
      {
        name: 'output_formatting',
        required: true,
        process: async (data) => {
          return {
            results: data,
            meta: {
              processedAt: new Date().toISOString(),
              pipelineVersion: '1.0.0',
              stagesCompleted: data.stagesCompleted || []
            }
          };
        }
      }
    ];
  }
  
  async execute(inputData: any): Promise<any> {
    let data = inputData;
    const completedStages: string[] = [];
    const errors: Array<{ stage: string; error: string }> = [];
    
    console.log('🚀 Starting security analysis pipeline...');
    
    for (const stage of this.stages) {
      try {
        console.log(`Processing stage: ${stage.name}`);
        data = await stage.process(data);
        completedStages.push(stage.name);
        console.log(`✅ Stage completed: ${stage.name}`);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Stage failed: ${stage.name} - ${errorMsg}`);
        errors.push({ stage: stage.name, error: errorMsg });
        
        if (stage.required) {
          throw new Error(`Required stage failed: ${stage.name} - ${errorMsg}`);
        }
      }
    }
    
    // Add metadata
    data.stagesCompleted = completedStages;
    if (errors.length > 0) {
      data.stageErrors = errors;
    }
    
    console.log(`🎯 Pipeline completed. Stages: ${completedStages.length}/${this.stages.length}`);
    return data;
  }
}

// Usage example
const pipeline = new SecurityAnalysisPipeline();

pipeline.execute({
  cve: {
    cveId: 'CVE-2023-12345',
    description: 'Test vulnerability',
    cvssScore: 7.5
  },
  indicators: ['suspicious-domain.com', '192.168.1.100'],
  metadata: {
    source: 'automated_scan',
    priority: 'high'
  }
}).then(result => {
  console.log('Pipeline result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Pipeline failed:', error);
});
```

## 🔄 Common Integration Patterns

### 1. Threat Intelligence Enrichment

```typescript
class ThreatIntelligenceEnricher {
  private intelCore: IntelCoreNapi;
  private iocCore: IocCoreNapi;
  private reputationCore: ReputationCoreNapi;
  
  constructor() {
    this.intelCore = new IntelCoreNapi();
    this.iocCore = new IocCoreNapi();
    this.reputationCore = new ReputationCoreNapi();
  }
  
  async enrichIndicators(indicators: string[]) {
    const enrichedData = {
      indicators: [],
      summary: {
        total: indicators.length,
        enriched: 0,
        malicious: 0,
        benign: 0,
        unknown: 0
      }
    };
    
    for (const indicator of indicators) {
      try {
        // Gather basic intelligence
        const intelData = await this.gatherBasicIntel(indicator);
        
        // Analyze as IOC
        const iocAnalysis = await this.analyzeAsIOC(indicator);
        
        // Check reputation
        const reputation = await this.checkReputation(indicator);
        
        const enriched = {
          indicator,
          intelligence: intelData,
          iocAnalysis,
          reputation,
          riskScore: this.calculateRiskScore(intelData, iocAnalysis, reputation),
          timestamp: new Date().toISOString()
        };
        
        enrichedData.indicators.push(enriched);
        enrichedData.summary.enriched++;
        
        // Update summary counts
        if (enriched.riskScore > 7) {
          enrichedData.summary.malicious++;
        } else if (enriched.riskScore < 3) {
          enrichedData.summary.benign++;
        } else {
          enrichedData.summary.unknown++;
        }
        
      } catch (error) {
        console.error(`Failed to enrich indicator ${indicator}:`, error.message);
        enrichedData.indicators.push({
          indicator,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return enrichedData;
  }
  
  private async gatherBasicIntel(indicator: string) {
    try {
      const criteria = JSON.stringify({
        indicators: [indicator],
        timeRange: '7d',
        includeContext: true
      });
      
      const result = this.intelCore.gatherIntelligence(criteria);
      return JSON.parse(result);
    } catch (error) {
      return { error: error.message, available: false };
    }
  }
  
  private async analyzeAsIOC(indicator: string) {
    try {
      const iocData = JSON.stringify({
        indicator,
        type: this.detectIndicatorType(indicator)
      });
      
      const result = this.iocCore.analyzeIOC(iocData);
      return JSON.parse(result);
    } catch (error) {
      return { error: error.message, analyzed: false };
    }
  }
  
  private async checkReputation(indicator: string) {
    try {
      const repData = JSON.stringify({
        indicator,
        sources: ['default'],
        includeHistory: true
      });
      
      const result = this.reputationCore.checkReputation(repData);
      return JSON.parse(result);
    } catch (error) {
      return { error: error.message, score: 0 };
    }
  }
  
  private detectIndicatorType(indicator: string): string {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(indicator)) return 'ip';
    if (/^[a-f0-9]{32}$/i.test(indicator)) return 'md5';
    if (/^[a-f0-9]{64}$/i.test(indicator)) return 'sha256';
    if (indicator.includes('.')) return 'domain';
    return 'unknown';
  }
  
  private calculateRiskScore(intel: any, ioc: any, reputation: any): number {
    let score = 0;
    
    if (intel && intel.threatLevel) score += intel.threatLevel * 2;
    if (ioc && ioc.maliciousProbability) score += ioc.maliciousProbability * 3;
    if (reputation && reputation.score) score += (10 - reputation.score) * 0.5;
    
    return Math.min(Math.max(score, 0), 10); // Clamp between 0-10
  }
}
```

### 2. Incident Response Workflow

```typescript
class IncidentResponseWorkflow {
  private modules: {
    incident: IncidentResponseCoreNapi;
    forensics: ForensicsCoreNapi;
    malware: MalwareCoreNapi;
    intel: IntelCoreNapi;
    mitre: MitreCoreNapi;
  };
  
  constructor() {
    this.modules = {
      incident: new IncidentResponseCoreNapi(),
      forensics: new ForensicsCoreNapi(),
      malware: new MalwareCoreNapi(),
      intel: new IntelCoreNapi(),
      mitre: new MitreCoreNapi()
    };
  }
  
  async handleSecurityIncident(incidentData: {
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedSystems: string[];
    indicators?: string[];
    artifactHashes?: string[];
  }) {
    const workflow = {
      incidentId: this.generateIncidentId(),
      status: 'initiated',
      startTime: new Date().toISOString(),
      steps: [],
      evidence: {},
      findings: {},
      recommendations: []
    };
    
    try {
      // Step 1: Create Incident
      workflow.steps.push('Creating incident record...');
      const incident = await this.createIncident(incidentData, workflow.incidentId);
      workflow.evidence.incident = incident;
      
      // Step 2: Immediate Response
      workflow.steps.push('Executing immediate response...');
      if (incidentData.severity === 'critical' || incidentData.severity === 'high') {
        const playbook = await this.executeEmergencyPlaybook(workflow.incidentId, incidentData);
        workflow.evidence.emergencyResponse = playbook;
      }
      
      // Step 3: Evidence Collection
      workflow.steps.push('Collecting digital evidence...');
      const evidence = await this.collectEvidence(incidentData.affectedSystems);
      workflow.evidence.forensics = evidence;
      
      // Step 4: Malware Analysis (if applicable)
      if (incidentData.artifactHashes) {
        workflow.steps.push('Analyzing potential malware...');
        const malwareAnalysis = await this.analyzeMalware(incidentData.artifactHashes);
        workflow.evidence.malware = malwareAnalysis;
      }
      
      // Step 5: Threat Intelligence
      if (incidentData.indicators) {
        workflow.steps.push('Gathering threat intelligence...');
        const intelligence = await this.gatherThreatIntel(incidentData.indicators);
        workflow.evidence.intelligence = intelligence;
      }
      
      // Step 6: MITRE ATT&CK Mapping
      workflow.steps.push('Mapping to MITRE ATT&CK framework...');
      const mitreMapping = await this.mapToMitre(workflow.evidence);
      workflow.findings.mitre = mitreMapping;
      
      // Step 7: Generate Recommendations
      workflow.steps.push('Generating recommendations...');
      workflow.recommendations = this.generateRecommendations(workflow.evidence, workflow.findings);
      
      workflow.status = 'completed';
      workflow.endTime = new Date().toISOString();
      
      return workflow;
      
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.endTime = new Date().toISOString();
      throw error;
    }
  }
  
  private async createIncident(data: any, incidentId: string) {
    const incidentRecord = {
      incidentId,
      title: data.title,
      severity: data.severity,
      description: data.description,
      affectedSystems: data.affectedSystems,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    const result = this.modules.incident.createIncident(JSON.stringify(incidentRecord));
    return JSON.parse(result);
  }
  
  private async executeEmergencyPlaybook(incidentId: string, data: any) {
    const playbookData = {
      playbookId: 'emergency-response-v1',
      incidentId,
      parameters: {
        isolateEndpoints: data.severity === 'critical',
        collectArtifacts: true,
        notifyStakeholders: true,
        activateSOC: data.severity === 'critical'
      }
    };
    
    try {
      const result = this.modules.incident.executePlaybook(JSON.stringify(playbookData));
      return JSON.parse(result);
    } catch (error) {
      console.warn('Emergency playbook execution failed:', error.message);
      return { error: error.message, executed: false };
    }
  }
  
  private async collectEvidence(affectedSystems: string[]) {
    const evidenceRequest = {
      sources: ['filesystem', 'memory', 'network', 'logs'],
      systems: affectedSystems,
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        end: new Date().toISOString()
      },
      preserveIntegrity: true
    };
    
    try {
      const result = this.modules.forensics.collectEvidence(JSON.stringify(evidenceRequest));
      return JSON.parse(result);
    } catch (error) {
      console.warn('Evidence collection failed:', error.message);
      return { error: error.message, collected: false };
    }
  }
  
  private async analyzeMalware(hashes: string[]) {
    const analyses = [];
    
    for (const hash of hashes) {
      try {
        const analysisRequest = {
          hash,
          analysisTypes: ['static', 'behavioral', 'family_detection'],
          timeout: 300 // 5 minutes
        };
        
        const result = this.modules.malware.analyzeSample(JSON.stringify(analysisRequest));
        analyses.push(JSON.parse(result));
      } catch (error) {
        analyses.push({ hash, error: error.message, analyzed: false });
      }
    }
    
    return analyses;
  }
  
  private async gatherThreatIntel(indicators: string[]) {
    const intelRequest = {
      indicators,
      timeRange: '30d',
      sources: ['default'],
      includeContext: true,
      enrichment: true
    };
    
    try {
      const result = this.modules.intel.gatherIntelligence(JSON.stringify(intelRequest));
      return JSON.parse(result);
    } catch (error) {
      console.warn('Threat intelligence gathering failed:', error.message);
      return { error: error.message, gathered: false };
    }
  }
  
  private async mapToMitre(evidence: any) {
    const behaviors = [];
    
    // Extract behaviors from evidence
    if (evidence.forensics && evidence.forensics.behaviors) {
      behaviors.push(...evidence.forensics.behaviors);
    }
    
    if (evidence.malware) {
      evidence.malware.forEach((analysis: any) => {
        if (analysis.behaviors) {
          behaviors.push(...analysis.behaviors);
        }
      });
    }
    
    if (behaviors.length === 0) {
      return { mapped: false, reason: 'No behaviors found for mapping' };
    }
    
    try {
      const result = this.modules.mitre.mapTechniques(JSON.stringify(behaviors));
      return JSON.parse(result);
    } catch (error) {
      console.warn('MITRE mapping failed:', error.message);
      return { error: error.message, mapped: false };
    }
  }
  
  private generateRecommendations(evidence: any, findings: any): string[] {
    const recommendations = [];
    
    // Based on severity and findings
    if (evidence.incident?.severity === 'critical') {
      recommendations.push('Immediate containment and isolation of affected systems');
      recommendations.push('Activate incident response team and stakeholder notifications');
    }
    
    if (evidence.malware && evidence.malware.some((m: any) => m.malicious)) {
      recommendations.push('Deploy anti-malware measures and update signatures');
      recommendations.push('Conduct full system scans on all potentially affected endpoints');
    }
    
    if (findings.mitre?.techniques?.length > 0) {
      recommendations.push('Review and strengthen controls for identified MITRE ATT&CK techniques');
      recommendations.push('Update detection rules based on observed techniques');
    }
    
    if (evidence.intelligence?.threatLevel > 7) {
      recommendations.push('Monitor for additional indicators related to this threat campaign');
      recommendations.push('Share threat intelligence with industry partners');
    }
    
    // Default recommendations
    recommendations.push('Document lessons learned and update incident response procedures');
    recommendations.push('Conduct post-incident review within 48 hours');
    
    return recommendations;
  }
  
  private generateIncidentId(): string {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `INC-${timestamp}-${random}`;
  }
}
```

### 3. Vulnerability Management Pipeline

```typescript
class VulnerabilityManagementPipeline {
  private modules: {
    cve: CveCoreNapi;
    vulnerability: VulnerabilityCoreNapi;
    risk: RiskCoreNapi;
    compliance: ComplianceCoreNapi;
  };
  
  constructor() {
    this.modules = {
      cve: new CveCoreNapi(),
      vulnerability: new VulnerabilityCoreNapi(),
      risk: new RiskCoreNapi(),
      compliance: new ComplianceCoreNapi()
    };
  }
  
  async processVulnerabilityFeed(vulnerabilities: any[]) {
    const pipeline = {
      totalVulnerabilities: vulnerabilities.length,
      processed: 0,
      failed: 0,
      results: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        compliant: 0,
        nonCompliant: 0
      }
    };
    
    console.log(`Processing ${vulnerabilities.length} vulnerabilities...`);
    
    for (const vuln of vulnerabilities) {
      try {
        const processedVuln = await this.processSingleVulnerability(vuln);
        pipeline.results.push(processedVuln);
        pipeline.processed++;
        
        // Update summary
        this.updateSummary(pipeline.summary, processedVuln);
        
        // Progress indicator
        if (pipeline.processed % 100 === 0) {
          console.log(`Processed ${pipeline.processed}/${pipeline.totalVulnerabilities} vulnerabilities`);
        }
        
      } catch (error) {
        pipeline.failed++;
        pipeline.results.push({
          vulnerability: vuln,
          error: error.message,
          processed: false
        });
      }
    }
    
    console.log(`Vulnerability processing completed: ${pipeline.processed} success, ${pipeline.failed} failed`);
    return pipeline;
  }
  
  private async processSingleVulnerability(vuln: any) {
    const result = {
      original: vuln,
      cveAnalysis: null,
      vulnerabilityAssessment: null,
      riskAssessment: null,
      complianceCheck: null,
      finalScore: 0,
      priority: 'low',
      recommendations: [],
      timestamp: new Date().toISOString()
    };
    
    // Step 1: CVE Analysis
    if (vuln.cveId) {
      try {
        const cveResult = this.modules.cve.processCve(JSON.stringify(vuln));
        result.cveAnalysis = JSON.parse(cveResult);
      } catch (error) {
        console.warn(`CVE analysis failed for ${vuln.cveId}:`, error.message);
      }
    }
    
    // Step 2: Vulnerability Assessment
    try {
      const vulnData = {
        ...vuln,
        context: result.cveAnalysis
      };
      const vulnResult = this.modules.vulnerability.assessVulnerability(JSON.stringify(vulnData));
      result.vulnerabilityAssessment = JSON.parse(vulnResult);
    } catch (error) {
      console.warn('Vulnerability assessment failed:', error.message);
    }
    
    // Step 3: Risk Assessment
    try {
      const riskData = {
        vulnerability: vuln,
        cveAnalysis: result.cveAnalysis,
        assessment: result.vulnerabilityAssessment,
        environment: {
          exposure: 'internal', // Could be dynamic
          criticality: 'medium'
        }
      };
      const riskResult = this.modules.risk.calculateRisk(JSON.stringify(riskData));
      result.riskAssessment = JSON.parse(riskResult);
    } catch (error) {
      console.warn('Risk assessment failed:', error.message);
    }
    
    // Step 4: Compliance Check
    try {
      const complianceData = {
        vulnerability: vuln,
        frameworks: ['PCI-DSS', 'SOX', 'GDPR'],
        assessment: result.vulnerabilityAssessment
      };
      const complianceResult = this.modules.compliance.checkCompliance(JSON.stringify(complianceData));
      result.complianceCheck = JSON.parse(complianceResult);
    } catch (error) {
      console.warn('Compliance check failed:', error.message);
    }
    
    // Step 5: Calculate Final Score and Priority
    result.finalScore = this.calculateFinalScore(result);
    result.priority = this.determinePriority(result.finalScore);
    result.recommendations = this.generateRecommendations(result);
    
    return result;
  }
  
  private calculateFinalScore(result: any): number {
    let score = 0;
    let factors = 0;
    
    if (result.cveAnalysis?.riskScore) {
      score += result.cveAnalysis.riskScore * 0.3;
      factors++;
    }
    
    if (result.vulnerabilityAssessment?.score) {
      score += result.vulnerabilityAssessment.score * 0.3;
      factors++;
    }
    
    if (result.riskAssessment?.score) {
      score += result.riskAssessment.score * 0.4;
      factors++;
    }
    
    return factors > 0 ? score / factors * 10 : result.original.cvssScore || 0;
  }
  
  private determinePriority(score: number): string {
    if (score >= 9) return 'critical';
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
  
  private generateRecommendations(result: any): string[] {
    const recommendations = [];
    
    if (result.priority === 'critical') {
      recommendations.push('Immediate patching required within 24 hours');
      recommendations.push('Consider emergency change management process');
    } else if (result.priority === 'high') {
      recommendations.push('Patch within 72 hours');
      recommendations.push('Implement compensating controls if patching delayed');
    } else if (result.priority === 'medium') {
      recommendations.push('Patch within 30 days');
      recommendations.push('Monitor for exploitation attempts');
    } else {
      recommendations.push('Patch during next maintenance window');
    }
    
    if (result.complianceCheck?.nonCompliant) {
      recommendations.push('Address compliance violations for regulatory requirements');
    }
    
    if (result.vulnerabilityAssessment?.exploitAvailable) {
      recommendations.push('Prioritize due to available exploit');
      recommendations.push('Enhance monitoring for this vulnerability');
    }
    
    return recommendations;
  }
  
  private updateSummary(summary: any, result: any) {
    // Update severity counts
    switch (result.priority) {
      case 'critical': summary.critical++; break;
      case 'high': summary.high++; break;
      case 'medium': summary.medium++; break;
      case 'low': summary.low++; break;
    }
    
    // Update compliance counts
    if (result.complianceCheck) {
      if (result.complianceCheck.compliant) {
        summary.compliant++;
      } else {
        summary.nonCompliant++;
      }
    }
  }
}
```

## 🚀 Performance Optimization Patterns

### 1. Batch Processing Pattern

```typescript
class BatchProcessor {
  private batchSize = 100;
  private maxConcurrency = 5;
  
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: { batchSize?: number; maxConcurrency?: number } = {}
  ): Promise<R[]> {
    const { batchSize = this.batchSize, maxConcurrency = this.maxConcurrency } = options;
    const results: R[] = [];
    
    // Split into batches
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    console.log(`Processing ${items.length} items in ${batches.length} batches`);
    
    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += maxConcurrency) {
      const concurrentBatches = batches.slice(i, i + maxConcurrency);
      
      const batchPromises = concurrentBatches.map(async (batch, index) => {
        const batchResults: R[] = [];
        console.log(`Processing batch ${i + index + 1}/${batches.length} (${batch.length} items)`);
        
        for (const item of batch) {
          try {
            const result = await processor(item);
            batchResults.push(result);
          } catch (error) {
            console.error('Batch item processing failed:', error);
            // Could push error result or skip
          }
        }
        
        return batchResults;
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(batch => results.push(...batch));
      
      console.log(`Completed ${results.length}/${items.length} items`);
    }
    
    return results;
  }
}

// Usage with CVE processing
const batchProcessor = new BatchProcessor();
const cveCore = new CveCoreNapi();

const largeCveDataset = [/* ... thousands of CVE records ... */];

const results = await batchProcessor.processBatch(
  largeCveDataset,
  async (cve) => {
    const result = cveCore.processCve(JSON.stringify(cve));
    return JSON.parse(result);
  },
  { batchSize: 50, maxConcurrency: 3 }
);
```

### 2. Caching Pattern

```typescript
import { LRUCache } from 'lru-cache';

class CachedNAPIService {
  private cache: LRUCache<string, any>;
  private modules: Map<string, any> = new Map();
  
  constructor() {
    this.cache = new LRUCache({
      max: 1000,
      ttl: 5 * 60 * 1000 // 5 minutes
    });
    
    // Initialize modules
    this.modules.set('cve', new CveCoreNapi());
    this.modules.set('intel', new IntelCoreNapi());
    this.modules.set('crypto', new CryptoCoreNapi());
  }
  
  async getCachedResult(
    cacheKey: string,
    moduleType: string,
    method: string,
    data: any
  ): Promise<any> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cached;
    }
    
    // Cache miss - compute result
    console.log(`Cache miss for key: ${cacheKey}`);
    const module = this.modules.get(moduleType);
    if (!module || typeof module[method] !== 'function') {
      throw new Error(`Invalid module or method: ${moduleType}.${method}`);
    }
    
    const result = module[method](JSON.stringify(data));
    const parsed = JSON.parse(result);
    
    // Store in cache
    this.cache.set(cacheKey, parsed);
    
    return parsed;
  }
  
  // Specific cached methods
  async processCveWithCache(cveData: any): Promise<any> {
    const cacheKey = `cve:${cveData.cveId || 'unknown'}:${this.hashData(cveData)}`;
    return this.getCachedResult(cacheKey, 'cve', 'processCve', cveData);
  }
  
  async gatherIntelWithCache(criteria: any): Promise<any> {
    const cacheKey = `intel:${this.hashData(criteria)}`;
    return this.getCachedResult(cacheKey, 'intel', 'gatherIntelligence', criteria);
  }
  
  private hashData(data: any): string {
    const crypto = this.modules.get('crypto');
    const serialized = JSON.stringify(data, Object.keys(data).sort());
    return crypto.generateSecureToken(8); // Simple hash replacement
  }
  
  // Cache management
  getCacheStats() {
    return {
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      keys: Array.from(this.cache.keys())
    };
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

---

## 📋 Integration Checklist

Use this checklist when implementing NAPI module integration:

### Pre-Integration
- [ ] All required modules installed and verified
- [ ] Module health checks passing
- [ ] Development environment configured
- [ ] Error handling strategy defined

### During Integration
- [ ] Input validation implemented
- [ ] Error handling for each module call
- [ ] Performance monitoring in place
- [ ] Logging and debugging enabled

### Post-Integration
- [ ] Integration tests written and passing
- [ ] Performance benchmarks established
- [ ] Documentation updated
- [ ] Production deployment tested

### Production Monitoring
- [ ] Health check endpoints configured
- [ ] Performance metrics collected
- [ ] Error rates monitored
- [ ] Resource usage tracked

---

*Integration Patterns Guide Version: 1.0.0*
*Last Updated: {{ current_date }}*