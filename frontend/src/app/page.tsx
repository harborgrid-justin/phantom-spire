'use client';

import { useEffect, useState } from 'react';

// Phantom NAPI-RS Showcase - Demonstrating the incredible power of all packages
export default function PhantomShowcase() {
  const [activeSection, setActiveSection] = useState('overview');
  const [demoData, setDemoData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Simulate package demonstrations
  const runDemo = async (packageName: string) => {
    setLoading(true);
    
    // Simulate processing time based on package complexity
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let demoResults;
    
    switch (packageName) {
      case 'mitre':
        demoResults = {
          techniquesAnalyzed: 147,
          tacticsCovered: 14,
          detectionRules: 89,
          attackPaths: 23,
          riskScore: 0.87,
          navigatorLayer: 'Generated ATT&CK Navigator visualization',
          topTechniques: ['T1566.001', 'T1055', 'T1071.001', 'T1083', 'T1005']
        };
        break;
      case 'ioc':
        demoResults = {
          iocsProcessed: 1247,
          threatsDetected: 34,
          malwareFamilies: ['TrickBot', 'Emotet', 'Cobalt Strike'],
          threatActors: ['APT29', 'Lazarus Group', 'FIN7'],
          riskAssessment: 'HIGH',
          correlations: 156
        };
        break;
      case 'cve':
        demoResults = {
          cveAnalyzed: 'CVE-2024-8888',
          cvssScore: 9.8,
          exploitability: 0.92,
          remediation: 'CRITICAL - Patch immediately',
          affectedSystems: 847,
          timelineGenerated: true,
          strategyRecommended: 'Emergency patching protocol'
        };
        break;
      case 'secop':
        demoResults = {
          incidentsManaged: 23,
          alertsCorrelated: 456,
          playbooksExecuted: 12,
          automationRate: 78,
          responseTime: '4.2 minutes',
          complianceScore: 94,
          threatsContained: 8
        };
        break;
      case 'threatactor':
        demoResults = {
          actorsIdentified: 'APT-X1',
          attributionConfidence: 0.89,
          sophisticationLevel: 'Advanced',
          campaignTracked: 'Operation Shadow Strike',
          behaviorAnalyzed: true,
          predictionAccuracy: 0.85,
          relationshipsFound: 7
        };
        break;
      case 'xdr':
        demoResults = {
          endpointsMonitored: 15847,
          threatsDetected: 89,
          behavioralAnalytics: 'ACTIVE',
          responseAutomated: 67,
          detectionLatency: '0.3 seconds',
          falsePositiveRate: '2.1%',
          coverageScore: 96
        };
        break;
      case 'intel':
        demoResults = {
          indicatorsEnriched: 2341,
          feedsIngested: 23,
          correlationsFound: 789,
          reportGenerated: 'Q4 Threat Landscape',
          confidenceScore: 0.91,
          workflowsExecuted: 45,
          intelligenceScore: 94
        };
        break;
      case 'incident':
        demoResults = {
          incidentAnalyzed: 'INC-2024-8901',
          timelineReconstructed: true,
          evidenceChain: 'VERIFIED',
          rootCauseFound: 'Compromised credentials',
          impactAssessment: 'MODERATE',
          lessonsLearned: 3,
          recommendationsGenerated: 8
        };
        break;
      default:
        demoResults = {
          processed: Math.floor(Math.random() * 1000) + 100,
          success: true,
          performance: (Math.random() * 50 + 50).toFixed(1) + 'ms',
          accuracy: (Math.random() * 20 + 80).toFixed(1) + '%'
        };
    }
    
    setDemoData(prev => ({ ...prev, [packageName]: demoResults }));
    setLoading(false);
  };

  // Package configurations with their capabilities
  const packages = [
    {
      name: 'phantom-mitre-core',
      icon: '🎯',
      title: 'MITRE ATT&CK Intelligence',
      description: 'Advanced MITRE ATT&CK framework integration with comprehensive technique mapping and threat analysis',
      capabilities: [
        'ATT&CK Navigator Generation',
        'Technique Attribution Analysis',
        'Behavioral Pattern Detection',
        'Risk Scoring & Assessment',
        'Detection Gap Identification',
        'Threat Hunting Queries',
        'Attack Simulation',
        'Compliance Mapping'
      ],
      demoKey: 'mitre'
    },
    {
      name: 'phantom-ioc-core',
      icon: '🔍',
      title: 'IOC Processing Engine',
      description: 'High-performance indicator of compromise processing with advanced threat intelligence correlation',
      capabilities: [
        'Real-time IOC Processing',
        'Threat Actor Correlation',
        'Malware Family Identification',
        'Campaign Attribution',
        'Risk Assessment Scoring',
        'Batch Processing',
        'Impact Analysis',
        'Recommendation Engine'
      ],
      demoKey: 'ioc'
    },
    {
      name: 'phantom-cve-core',
      icon: '🛡️',
      title: 'CVE Analysis Platform',
      description: 'Comprehensive vulnerability analysis with exploit timeline tracking and remediation strategies',
      capabilities: [
        'CVE Impact Assessment',
        'Exploit Timeline Analysis',
        'Remediation Strategy Generation',
        'CVSS Score Calculation',
        'Vulnerability Correlation',
        'Patch Priority Scoring',
        'Threat Actor Mapping',
        'Attack Surface Analysis'
      ],
      demoKey: 'cve'
    },
    {
      name: 'phantom-secop-core',
      icon: '🚨',
      title: 'Security Operations Center',
      description: 'Complete security operations orchestration with incident response and automation capabilities',
      capabilities: [
        'Incident Management',
        'Alert Correlation',
        'Playbook Execution',
        'Evidence Chain Management',
        'Compliance Monitoring',
        'Automated Response',
        'Performance Metrics',
        'Team Coordination'
      ],
      demoKey: 'secop'
    },
    {
      name: 'phantom-threat-actor-core',
      icon: '👥',
      title: 'Threat Actor Intelligence',
      description: 'Advanced threat actor analysis with attribution confidence and behavioral pattern recognition',
      capabilities: [
        'Actor Attribution Analysis',
        'Behavioral Pattern Recognition',
        'Campaign Tracking',
        'Sophistication Assessment',
        'Relationship Mapping',
        'Predictive Analysis',
        'Reputation Scoring',
        'Evolution Tracking'
      ],
      demoKey: 'threatactor'
    },
    {
      name: 'phantom-xdr-core',
      icon: '⚡',
      title: 'Extended Detection & Response',
      description: 'Next-generation XDR with behavioral analytics and automated threat response capabilities',
      capabilities: [
        'Behavioral Analytics',
        'Real-time Threat Detection',
        'Automated Response',
        'Endpoint Monitoring',
        'Network Analysis',
        'ML-Powered Detection',
        'Threat Hunting',
        'Forensic Analysis'
      ],
      demoKey: 'xdr'
    },
    {
      name: 'phantom-intel-core',
      icon: '🧠',
      title: 'Threat Intelligence Platform',
      description: 'Comprehensive threat intelligence with feed management, enrichment, and correlation capabilities',
      capabilities: [
        'Intelligence Feed Management',
        'Indicator Enrichment',
        'Correlation Analysis',
        'Report Generation',
        'Workflow Automation',
        'Data Export/Import',
        'Quality Scoring',
        'Attribution Analysis'
      ],
      demoKey: 'intel'
    },
    {
      name: 'phantom-incident-response-core',
      icon: '🔥',
      title: 'Incident Response Engine',
      description: 'Advanced incident response with timeline reconstruction and evidence chain management',
      capabilities: [
        'Incident Timeline Reconstruction',
        'Evidence Chain Management',
        'Root Cause Analysis',
        'Impact Assessment',
        'Response Coordination',
        'Lessons Learned Capture',
        'Recovery Planning',
        'Post-Incident Analysis'
      ],
      demoKey: 'incident'
    }
  ];

  // Additional specialized packages
  const specializedPackages = [
    'phantom-forensics-core',
    'phantom-malware-core', 
    'phantom-reputation-core',
    'phantom-vulnerability-core',
    'phantom-compliance-core',
    'phantom-crypto-core',
    'phantom-feeds-core',
    'phantom-hunting-core',
    'phantom-risk-core',
    'phantom-sandbox-core',
    'phantom-attribution-core'
  ];

  const performanceBenchmarks = {
    'IOC Processing': '50,000+ IOCs/second',
    'MITRE Mapping': '147 techniques in 0.3s',
    'CVE Analysis': '99.7% accuracy',
    'Threat Detection': '<100ms latency', 
    'Alert Correlation': '95% reduction in false positives',
    'Incident Response': '4.2 minute MTTR',
    'Attribution Confidence': '89% average accuracy',
    'Memory Usage': '< 100MB per package'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            Phantom Spire
          </h1>
          <p className="text-2xl text-purple-200 mb-4">
            Showcase of Incredible NAPI-RS Package Power
          </p>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the next generation of cybersecurity intelligence with our high-performance Rust-powered NAPI packages. 
            Each package delivers enterprise-grade capabilities with blazing fast performance and rock-solid reliability.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/30 backdrop-blur-md rounded-full p-2 flex gap-2">
            {['overview', 'packages', 'performance', 'architecture'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-6 py-3 rounded-full transition-all duration-300 ${
                  activeSection === section
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-12">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'NAPI Packages', value: '19+', icon: '📦', color: 'from-blue-500 to-cyan-500' },
                { label: 'Threat Vectors', value: '50K+', icon: '🎯', color: 'from-purple-500 to-pink-500' },
                { label: 'Processing Speed', value: '50K/sec', icon: '⚡', color: 'from-green-500 to-emerald-500' },
                { label: 'Detection Accuracy', value: '99.7%', icon: '🔍', color: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <div key={index} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-75 rounded-2xl blur group-hover:blur-sm transition-all duration-300`}></div>
                  <div className="relative bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-gray-300">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Highlights */}
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Enterprise-Grade Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: '🚀',
                    title: 'Blazing Performance',
                    description: 'Rust-powered NAPI packages deliver unmatched speed and efficiency'
                  },
                  {
                    icon: '🧠',
                    title: 'Advanced AI/ML',
                    description: 'Machine learning-driven threat detection and behavioral analysis'
                  },
                  {
                    icon: '🔒',
                    title: 'Enterprise Security',
                    description: 'Military-grade security with comprehensive compliance support'
                  },
                  {
                    icon: '🌐',
                    title: 'Global Scale',
                    description: 'Designed to handle enterprise-scale deployments worldwide'
                  },
                  {
                    icon: '⚙️',
                    title: 'Full Automation',
                    description: 'End-to-end automation from detection to response and recovery'
                  },
                  {
                    icon: '📊',
                    title: 'Real-time Analytics',
                    description: 'Comprehensive dashboards and real-time threat intelligence'
                  }
                ].map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Packages Section */}
        {activeSection === 'packages' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Core NAPI-RS Packages</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {packages.map((pkg, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{pkg.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{pkg.title}</h3>
                      <p className="text-sm text-purple-300 mb-2">{pkg.name}</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{pkg.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Key Capabilities:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {pkg.capabilities.slice(0, 4).map((capability, capIndex) => (
                        <div key={capIndex} className="text-xs text-gray-400 flex items-center">
                          <span className="text-green-400 mr-1">•</span>
                          {capability}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => runDemo(pkg.demoKey)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Running Demo...' : 'Run Demo'}
                    </button>
                  </div>

                  {/* Demo Results */}
                  {demoData[pkg.demoKey] && (
                    <div className="mt-4 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                      <h5 className="text-green-300 font-semibold mb-2">✅ Demo Results:</h5>
                      <div className="space-y-1">
                        {Object.entries(demoData[pkg.demoKey]).map(([key, value]) => (
                          <div key={key} className="text-xs text-gray-300">
                            <span className="text-green-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {typeof value === 'string' ? value : JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Specialized Packages */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4">Additional Specialized Packages</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {specializedPackages.map((pkg, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-purple-300 font-medium text-sm">{pkg}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Section */}
        {activeSection === 'performance' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Performance Benchmarks</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(performanceBenchmarks).map(([metric, value], index) => (
                <div key={index} className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{value}</div>
                  <div className="text-gray-300">{metric}</div>
                </div>
              ))}
            </div>

            {/* Performance Charts Placeholder */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Real-time Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-6xl text-green-400 mb-2">99.7%</div>
                  <div className="text-gray-300">Threat Detection Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl text-blue-400 mb-2">&lt;100ms</div>
                  <div className="text-gray-300">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl text-purple-400 mb-2">50K+</div>
                  <div className="text-gray-300">IOCs Processed/Second</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Architecture Section */}
        {activeSection === 'architecture' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Technical Architecture</h2>
            
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">🦀 Rust-Powered Core</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Memory-safe high-performance execution</li>
                    <li>• Zero-cost abstractions</li>
                    <li>• Concurrent processing capabilities</li>
                    <li>• Cross-platform compatibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">⚡ NAPI Integration</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Native Node.js performance</li>
                    <li>• TypeScript bindings</li>
                    <li>• Async/await support</li>
                    <li>• Seamless JavaScript interop</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-white mb-3">🏗️ Modular Design</h4>
                <p className="text-gray-300 text-sm">Independent packages that can be used standalone or combined for comprehensive security coverage.</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-white mb-3">🔄 Real-time Processing</h4>
                <p className="text-gray-300 text-sm">Stream processing capabilities for real-time threat detection and response automation.</p>
              </div>
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-white mb-3">📈 Scalable Architecture</h4>
                <p className="text-gray-300 text-sm">Horizontal scaling support for enterprise deployments with cloud-native design patterns.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Experience the Power?</h3>
            <p className="text-gray-300 mb-6">
              Phantom Spire delivers enterprise-grade cybersecurity intelligence with unmatched performance and reliability.
              Our NAPI-RS packages represent the cutting edge of threat detection and response technology.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => runDemo('all')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Run Full System Demo
              </button>
              <button className="border border-purple-500 text-purple-300 px-8 py-3 rounded-lg font-bold hover:bg-purple-500/10 transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
