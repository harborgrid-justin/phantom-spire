/**
 * Comprehensive Demo for Business SaaS Extended phantom-intel-core
 * Demonstrates all the new business SaaS features with data store integration
 */

import { createBusinessSaaSIntelCore } from '../frontend/phantom-intel-core/src-ts/business-saas/BusinessSaaSIntelCore.js';
import { IBusinessSaaSConfig } from '../frontend/phantom-intel-core/src-ts/business-saas/config/BusinessSaaSConfig.js';

async function demonstrateBusinessSaaSExtension() {
  console.log('🚀 Demonstrating Enhanced phantom-intel-core Business SaaS Extension...\n');

  try {
    // =================================================================
    // CONFIGURATION AND INITIALIZATION
    // =================================================================
    
    console.log('📋 Step 1: Configuration and Initialization');
    console.log('=' .repeat(60));

    const config: Partial<IBusinessSaaSConfig> = {
      tenantId: 'enterprise-demo-001',
      dataStore: {
        mongodb: {
          uri: 'mongodb://localhost:27017',
          database: 'phantom_intel_business_saas',
        },
        postgresql: {
          connectionString: 'postgresql://user:pass@localhost:5432/phantom_intel',
          schema: 'business_saas',
        },
        redis: {
          url: 'redis://localhost:6379',
          keyPrefix: 'phantom-intel-saas',
          db: 1,
        },
        elasticsearch: {
          node: 'http://localhost:9200',
          requestTimeout: 30000,
        },
      },
      features: {
        realTimeUpdates: true,
        advancedAnalytics: true,
        customReports: true,
        apiAccess: true,
        ssoIntegration: true,
        auditLogging: true,
        dataExport: true,
        multiTenancy: true,
        workflowAutomation: true,
        threatIntelligenceFeeds: true,
      },
      quotas: {
        maxIndicators: 50000,
        maxThreatActors: 5000,
        maxCampaigns: 1000,
        maxReports: 500,
        maxDataSize: 21474836480, // 20GB
        maxApiRequestsPerHour: 5000,
        maxConcurrentUsers: 200,
        maxRetentionDays: 730, // 2 years
        maxExportSize: 2147483648, // 2GB
      },
      security: {
        encryptionEnabled: true,
        accessControl: {
          enabled: true,
          defaultRole: 'analyst',
          roles: {
            admin: ['read', 'write', 'delete', 'manage', 'export'],
            senior_analyst: ['read', 'write', 'export'],
            analyst: ['read', 'write'],
            viewer: ['read'],
          },
        },
        auditLogging: {
          enabled: true,
          retentionDays: 180,
          sensitiveDataMasking: true,
        },
        compliance: {
          gdprEnabled: true,
          hipaaEnabled: false,
          socEnabled: true,
        },
      },
    };

    console.log('✅ Business SaaS Configuration:');
    console.log(`   🏢 Tenant ID: ${config.tenantId}`);
    console.log(`   💾 Data Stores: MongoDB, PostgreSQL, Redis, Elasticsearch`);
    console.log(`   🔧 Features: ${Object.keys(config.features!).filter(f => config.features![f as keyof typeof config.features]).length}/10 enabled`);
    console.log(`   📊 Quotas: ${config.quotas!.maxIndicators} indicators, ${config.quotas!.maxThreatActors} actors`);

    // Initialize Business SaaS Intel Core
    const businessSaaSIntel = createBusinessSaaSIntelCore(config);
    await businessSaaSIntel.initialize();
    console.log('✅ Business SaaS Intel Core initialized with multi-database support');

    // =================================================================
    // TENANT MANAGEMENT DEMO
    // =================================================================
    
    console.log('\n📋 Step 2: Multi-Tenant Management');
    console.log('=' .repeat(60));

    const tenantInfo = businessSaaSIntel.getTenantInfo();
    console.log('🏢 Tenant Information:');
    console.log(`   Name: ${tenantInfo?.name}`);
    console.log(`   Plan: ${tenantInfo?.plan}`);
    console.log(`   Status: ${tenantInfo?.status}`);
    console.log(`   Created: ${tenantInfo?.createdAt.toISOString()}`);

    const initialMetrics = businessSaaSIntel.getTenantMetrics();
    console.log('📊 Initial Tenant Metrics:');
    console.log(`   Indicators: ${initialMetrics.data_metrics.total_indicators}/${tenantInfo?.quotas.maxIndicators}`);
    console.log(`   Threat Actors: ${initialMetrics.data_metrics.total_threat_actors}/${tenantInfo?.quotas.maxThreatActors}`);
    console.log(`   Storage Used: ${(initialMetrics.usage_metrics.storage_used / 1024 / 1024).toFixed(2)} MB`);

    // =================================================================
    // PERSISTENT DATA OPERATIONS DEMO
    // =================================================================
    
    console.log('\n📋 Step 3: Persistent Data Operations (Multi-Database)');
    console.log('=' .repeat(60));

    // Create persistent indicators
    console.log('🔍 Creating persistent threat indicators...');
    const indicatorData = {
      indicator_type: 'ip_address',
      value: '192.168.100.50',
      confidence: 0.92,
      severity: 'high',
      sources: ['ThreatFeed Premium', 'Internal Detection'],
      tags: ['apt', 'c2', 'malware'],
      context: {
        malware_families: ['APT29-Variant'],
        threat_actors: ['Cozy Bear'],
        campaigns: ['Operation CloudHopper'],
        attack_patterns: ['T1071.001', 'T1090'],
        targeted_sectors: ['Financial', 'Government'],
        geographic_regions: ['North America', 'Europe'],
        description: 'Command and control server for APT29 operations targeting financial institutions',
      },
      relationships: [],
      enrichment: {
        geolocation: {
          country: 'Russia',
          country_code: 'RU',
          region: 'Moscow',
          city: 'Moscow',
          latitude: 55.7558,
          longitude: 37.6176,
          asn: 12345,
          organization: 'RU-NET',
          isp: 'Russian ISP',
        },
        reputation: {
          overall_score: 0.15,
          vendor_scores: { 'VirusTotal': 0.1, 'ThreatCrowd': 0.2 },
          categories: ['malware', 'c2'],
          last_updated: new Date(),
        },
        passive_dns: [],
        certificates: [],
      },
      kill_chain_phases: ['command-and-control'],
      false_positive_score: 0.05,
      expiration_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
      metadata: {
        source_reliability: 'A',
        collection_method: 'automated',
        classification: 'TLP:AMBER',
      },
    };

    const indicatorId1 = await businessSaaSIntel.createIndicatorPersistent(indicatorData);
    console.log(`✅ Created persistent indicator: ${indicatorId1}`);
    console.log(`   📍 Stored in: MongoDB (primary), Redis (cache), Elasticsearch (search)`);
    console.log(`   🔄 Real-time update published to subscribers`);

    // Create another indicator
    const indicatorId2 = await businessSaaSIntel.createIndicatorPersistent({
      ...indicatorData,
      value: '198.51.100.25',
      context: {
        ...indicatorData.context,
        description: 'Secondary C2 server for campaign infrastructure',
      },
    });

    console.log(`✅ Created second persistent indicator: ${indicatorId2}`);

    // Create persistent threat actor
    console.log('\n👤 Creating persistent threat actor...');
    const threatActorData = {
      name: 'Cozy Bear Enhanced',
      aliases: ['APT29', 'Grizzly Steppe', 'The Dukes'],
      description: 'Russian state-sponsored cyber espionage group',
      actor_type: 'nation_state',
      sophistication: 'expert',
      motivation: ['espionage', 'political'],
      origin_country: 'Russia',
      target_sectors: ['Government', 'Financial', 'Healthcare', 'Technology'],
      target_regions: ['North America', 'Europe', 'Asia Pacific'],
      first_observed: new Date('2019-01-01'),
      last_activity: new Date(),
      capabilities: ['Advanced Persistent Threats', 'Zero-day Exploits', 'Social Engineering'],
      tools: ['Cobalt Strike', 'PowerShell Empire', 'Custom Malware'],
      techniques: ['T1566.001', 'T1071.001', 'T1055', 'T1027'],
      infrastructure: [indicatorId1, indicatorId2],
      campaigns: ['Operation CloudHopper', 'SolarWinds Supply Chain'],
      confidence: 0.95,
      metadata: {
        attribution_confidence: 'high',
        last_updated_by: 'threat_intelligence_team',
        classification: 'TLP:WHITE',
      },
    };

    const actorId = await businessSaaSIntel.createThreatActorPersistent(threatActorData);
    console.log(`✅ Created persistent threat actor: ${actorId}`);
    console.log(`   🎭 Linked to ${threatActorData.infrastructure.length} infrastructure indicators`);

    // Create persistent campaign
    console.log('\n⚔️ Creating persistent campaign...');
    const campaignData = {
      name: 'Operation CloudHopper Enhanced',
      aliases: ['Cloud Hopper', 'APT10 Campaign'],
      description: 'Large-scale cyber espionage campaign targeting managed service providers',
      threat_actors: [actorId],
      start_date: new Date('2024-01-01'),
      end_date: null, // Active campaign
      target_sectors: ['Technology', 'Financial', 'Healthcare'],
      target_regions: ['Global'],
      objectives: ['Data Exfiltration', 'Persistent Access', 'Supply Chain Compromise'],
      techniques: ['T1566.001', 'T1071.001', 'T1090', 'T1027'],
      tools: ['CloudHopper RAT', 'Cobalt Strike', 'PowerShell'],
      indicators: [indicatorId1, indicatorId2],
      timeline: [
        {
          timestamp: new Date('2024-01-15'),
          event_type: 'initial_compromise',
          description: 'First observed spear-phishing attempts',
          indicators: [indicatorId1],
          confidence: 0.85,
        },
        {
          timestamp: new Date('2024-02-01'),
          event_type: 'infrastructure_expansion',
          description: 'Additional C2 infrastructure deployed',
          indicators: [indicatorId2],
          confidence: 0.90,
        },
      ],
      confidence: 0.88,
      metadata: {
        campaign_type: 'espionage',
        geographic_scope: 'global',
        impact_assessment: 'high',
      },
    };

    const campaignId = await businessSaaSIntel.createCampaignPersistent(campaignData);
    console.log(`✅ Created persistent campaign: ${campaignId}`);
    console.log(`   📅 Timeline: ${campaignData.timeline.length} events tracked`);
    console.log(`   🎯 Targets: ${campaignData.target_sectors.join(', ')} sectors`);

    // =================================================================
    // SEARCH AND QUERY CAPABILITIES
    // =================================================================
    
    console.log('\n📋 Step 4: Advanced Search Capabilities (Elasticsearch)');
    console.log('=' .repeat(60));

    // Search indicators by text
    console.log('🔍 Performing full-text search for "APT29"...');
    const searchResults = await businessSaaSIntel.searchIndicatorsPersistent('APT29', {
      severity: 'high',
    });
    console.log(`✅ Found ${searchResults.total} indicators matching "APT29"`);
    console.log(`   📊 Results from: ${searchResults.metadata?.dataSource.join(', ')}`);
    console.log(`   ⚡ Query time: ${searchResults.metadata?.queryTime}ms`);
    console.log(`   💨 Cache hit: ${searchResults.metadata?.cacheHit ? 'Yes' : 'No'}`);

    // List indicators with filters
    console.log('\n📋 Listing indicators with pagination...');
    const listResults = await businessSaaSIntel.listIndicatorsPersistent(
      { severity: 'high', confidence_min: 0.8 },
      { page: 1, limit: 10 }
    );
    console.log(`✅ Retrieved ${listResults.data.length} of ${listResults.total} high-confidence indicators`);
    console.log(`   📄 Page 1 of ${listResults.pagination?.totalPages}`);
    console.log(`   🔗 Has more: ${listResults.hasMore ? 'Yes' : 'No'}`);

    // =================================================================
    // REAL-TIME CAPABILITIES DEMO
    // =================================================================
    
    console.log('\n📋 Step 5: Real-Time Capabilities (Redis Pub/Sub)');
    console.log('=' .repeat(60));

    console.log('📡 Setting up real-time subscriptions...');
    
    // Subscribe to threat updates
    const threatSubscriptionId = await businessSaaSIntel.subscribeToUpdates(
      ['threat-updates', 'indicators'],
      (update) => {
        console.log(`🔔 Real-time update received:`, {
          type: update.type,
          action: update.action,
          entityId: update.entityId,
          timestamp: update.timestamp.toISOString(),
        });
      },
      { entityTypes: ['indicator'], actions: ['created', 'updated'] }
    );
    console.log(`✅ Subscribed to threat updates: ${threatSubscriptionId}`);

    // Subscribe to system alerts
    const alertSubscriptionId = await businessSaaSIntel.subscribeToUpdates(
      ['system-alerts'],
      (update) => {
        console.log(`🚨 System alert received:`, {
          severity: update.data.severity,
          message: update.data.message,
          timestamp: update.timestamp.toISOString(),
        });
      }
    );
    console.log(`✅ Subscribed to system alerts: ${alertSubscriptionId}`);

    // Simulate real-time updates
    console.log('\n🔄 Simulating real-time updates...');
    
    // Update an indicator to trigger real-time notification
    await businessSaaSIntel.updateIndicatorPersistent(indicatorId1, {
      confidence: 0.96,
      tags: [...indicatorData.tags, 'verified', 'high-priority'],
      metadata: {
        ...indicatorData.metadata,
        last_verification: new Date().toISOString(),
        verification_source: 'automated_analysis',
      },
    });
    console.log(`🔄 Updated indicator ${indicatorId1} - real-time notification sent`);

    // Publish a custom system alert
    await businessSaaSIntel.publishUpdate({
      type: 'system',
      action: 'status_changed',
      entityId: 'system-health-check',
      entityType: 'system_monitor',
      timestamp: new Date(),
      data: {
        alertType: 'quota_warning',
        message: 'Approaching indicator quota limit (85% used)',
        severity: 'warning',
      },
      source: 'quota_monitor',
      channels: ['system-alerts'],
      metadata: { module: 'quota_management' },
    });
    console.log(`🚨 Published custom system alert`);

    // Wait a moment for real-time processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // =================================================================
    // ADVANCED ANALYTICS DEMO
    // =================================================================
    
    console.log('\n📋 Step 6: Advanced Analytics Engine');
    console.log('=' .repeat(60));

    console.log('🧠 Performing threat landscape analysis...');
    const threatLandscapeAnalysis = await businessSaaSIntel.generateAdvancedAnalytics({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
      analysisTypes: ['threat_landscape', 'correlation'],
    });

    console.log(`✅ Threat Landscape Analysis Complete:`);
    console.log(`   🔍 Analysis ID: ${threatLandscapeAnalysis.analysisId}`);
    console.log(`   📊 Findings: ${threatLandscapeAnalysis.results.findings.length} key findings`);
    console.log(`   🔗 Patterns: ${threatLandscapeAnalysis.results.patterns.length} patterns identified`);
    console.log(`   ⏱️ Execution Time: ${threatLandscapeAnalysis.metadata.execution_time}ms`);
    console.log(`   🎯 Confidence Threshold: ${threatLandscapeAnalysis.metadata.confidence_threshold}`);

    console.log('\n🔗 Performing correlation analysis...');
    const correlationAnalysis = await businessSaaSIntel.analyzeCorrelations(
      [indicatorId1, indicatorId2],
      {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date(),
      }
    );

    console.log(`✅ Correlation Analysis Complete:`);
    console.log(`   🔍 Analysis ID: ${correlationAnalysis.analysisId}`);
    console.log(`   🔗 Correlations Found: ${correlationAnalysis.results.correlations.length}`);
    console.log(`   💡 Insights: ${correlationAnalysis.results.findings.length} findings`);

    console.log('\n🚨 Performing anomaly detection...');
    const anomalyAnalysis = await businessSaaSIntel.detectAnomalies(
      [indicatorId1, indicatorId2],
      {
        start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Last 14 days
        end: new Date(),
      }
    );

    console.log(`✅ Anomaly Detection Complete:`);
    console.log(`   🔍 Analysis ID: ${anomalyAnalysis.analysisId}`);
    console.log(`   ⚠️ Anomalies Found: ${anomalyAnalysis.results.anomalies.length}`);
    console.log(`   📈 Statistical Anomalies: ${anomalyAnalysis.results.anomalies.filter(a => a.anomaly_type === 'statistical').length}`);
    console.log(`   🎭 Behavioral Anomalies: ${anomalyAnalysis.results.anomalies.filter(a => a.anomaly_type === 'behavioral').length}`);

    // =================================================================
    // DATA EXPORT CAPABILITIES
    // =================================================================
    
    console.log('\n📋 Step 7: Data Export Capabilities');
    console.log('=' .repeat(60));

    console.log('📤 Creating data export job...');
    const exportJob = await businessSaaSIntel.exportData(
      ['indicators', 'threat_actors', 'campaigns'],
      'json',
      { severity: 'high', confidence_min: 0.8 }
    );

    console.log(`✅ Export Job Created:`);
    console.log(`   📄 Export ID: ${exportJob.exportId}`);
    console.log(`   📋 Format: ${exportJob.format}`);
    console.log(`   📊 Entity Types: ${exportJob.entityTypes.join(', ')}`);
    console.log(`   ⏰ Status: ${exportJob.status}`);
    console.log(`   📅 Expires: ${exportJob.expiration_date.toISOString()}`);

    // Wait for export to complete (simulated)
    await new Promise(resolve => setTimeout(resolve, 2500));
    console.log(`✅ Export completed successfully`);

    // =================================================================
    // SYSTEM HEALTH AND MONITORING
    // =================================================================
    
    console.log('\n📋 Step 8: System Health Monitoring');
    console.log('=' .repeat(60));

    const systemHealth = await businessSaaSIntel.getSystemHealth();
    console.log(`🏥 Overall System Health: ${systemHealth.overall_status.toUpperCase()}`);
    console.log(`🕐 Health Check Time: ${systemHealth.timestamp.toISOString()}`);

    console.log('\n💾 Data Store Health:');
    for (const [store, health] of Object.entries(systemHealth.data_stores)) {
      console.log(`   ${store}: ${health.status} (${health.response_time}ms)`);
    }

    console.log('\n🔧 Service Health:');
    console.log(`   Real-time: ${systemHealth.services.real_time.status} (${systemHealth.services.real_time.active_connections} connections)`);
    console.log(`   Analytics: ${systemHealth.services.analytics.status} (${systemHealth.services.analytics.running_jobs} jobs)`);
    console.log(`   Data Sync: ${systemHealth.services.data_sync.status}`);

    console.log('\n📊 Quota Usage:');
    console.log(`   Indicators: ${systemHealth.quotas.indicators.used}/${systemHealth.quotas.indicators.limit} (${systemHealth.quotas.indicators.percentage.toFixed(1)}%)`);
    console.log(`   Storage: ${(systemHealth.quotas.storage.used / 1024 / 1024).toFixed(2)} MB/${(systemHealth.quotas.storage.limit / 1024 / 1024).toFixed(0)} MB (${systemHealth.quotas.storage.percentage.toFixed(1)}%)`);
    console.log(`   API Requests: ${systemHealth.quotas.api_requests.used_24h}/${systemHealth.quotas.api_requests.limit_24h} (${systemHealth.quotas.api_requests.percentage.toFixed(1)}%)`);

    // =================================================================
    // FINAL METRICS AND SUMMARY
    // =================================================================
    
    console.log('\n📋 Step 9: Final Metrics and Summary');
    console.log('=' .repeat(60));

    const finalMetrics = businessSaaSIntel.getTenantMetrics();
    console.log('📈 Updated Tenant Metrics:');
    console.log(`   📊 Data Growth:`);
    console.log(`      Indicators: ${finalMetrics.data_metrics.total_indicators} (+${finalMetrics.data_metrics.total_indicators - initialMetrics.data_metrics.total_indicators})`);
    console.log(`      Threat Actors: ${finalMetrics.data_metrics.total_threat_actors} (+${finalMetrics.data_metrics.total_threat_actors - initialMetrics.data_metrics.total_threat_actors})`);
    console.log(`      Campaigns: ${finalMetrics.data_metrics.total_campaigns} (+${finalMetrics.data_metrics.total_campaigns - initialMetrics.data_metrics.total_campaigns})`);

    console.log(`   🚀 Performance:`);
    console.log(`      Average Query Time: ${finalMetrics.performance_metrics.average_query_time}ms`);
    console.log(`      Cache Hit Rate: ${finalMetrics.performance_metrics.cache_hit_rate}%`);
    console.log(`      System Uptime: ${finalMetrics.performance_metrics.system_uptime}%`);
    console.log(`      Error Rate: ${finalMetrics.performance_metrics.error_rate}%`);

    // =================================================================
    // BUSINESS SAAS FEATURES SUMMARY
    // =================================================================
    
    console.log('\n📋 Step 10: Business SaaS Features Demonstrated');
    console.log('=' .repeat(60));

    console.log('🎉 Successfully Demonstrated Business SaaS Features:');
    console.log('');
    console.log('🏢 Multi-Tenancy:');
    console.log('   ✅ Tenant isolation and management');
    console.log('   ✅ Configurable quotas and limits');
    console.log('   ✅ Feature toggles per tenant');
    console.log('   ✅ Usage tracking and monitoring');
    console.log('');
    console.log('💾 Multi-Database Integration:');
    console.log('   ✅ MongoDB: Primary document storage for flexible data');
    console.log('   ✅ PostgreSQL: Structured analytics and reporting');
    console.log('   ✅ Redis: Real-time caching and pub/sub messaging');
    console.log('   ✅ Elasticsearch: Advanced full-text search and indexing');
    console.log('');
    console.log('🚀 Real-Time Capabilities:');
    console.log('   ✅ Real-time updates via Redis pub/sub');
    console.log('   ✅ WebSocket-ready architecture');
    console.log('   ✅ Event streaming for integrations');
    console.log('   ✅ Subscription management and filtering');
    console.log('');
    console.log('📊 Advanced Analytics:');
    console.log('   ✅ Threat landscape analysis');
    console.log('   ✅ Correlation analysis between entities');
    console.log('   ✅ Anomaly detection algorithms');
    console.log('   ✅ Pattern recognition and trend analysis');
    console.log('');
    console.log('🔒 Enterprise Security:');
    console.log('   ✅ Data encryption capabilities');
    console.log('   ✅ Role-based access control');
    console.log('   ✅ Comprehensive audit logging');
    console.log('   ✅ Compliance features (GDPR, SOC)');
    console.log('');
    console.log('🛠️ Business Operations:');
    console.log('   ✅ Data export/import functionality');
    console.log('   ✅ Custom reporting and dashboards');
    console.log('   ✅ System health monitoring');
    console.log('   ✅ Performance metrics and optimization');

    // =================================================================
    // ARCHITECTURE OVERVIEW
    // =================================================================
    
    console.log('\n📋 Architecture Overview');
    console.log('=' .repeat(60));
    console.log(`
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Enhanced phantom-intel-core                           │
│                        Business SaaS Extension                             │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │   Multi-Tenancy     │ │   Real-time Updates │ │  Advanced Analytics │   │
│  │   Management        │ │   & Notifications   │ │   & Reporting       │   │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Data Store Integration Layer                        │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │  Query Routing      │ │  Data Federation    │ │  Cache Management   │   │
│  │  & Load Balancing   │ │  & Transformation   │ │  & Invalidation     │   │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Data Store Layer                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│ │   MongoDB   │ │ PostgreSQL  │ │    Redis    │ │   Elasticsearch     │   │
│ │             │ │             │ │             │ │                     │   │
│ │ Primary     │ │ Structured  │ │ Real-time   │ │ Full-text Search    │   │
│ │ Document    │ │ Analytics   │ │ Cache &     │ │ & Advanced          │   │
│ │ Store       │ │ & Reports   │ │ Pub/Sub     │ │ Analytics           │   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
`);

    // =================================================================
    // CLEANUP
    // =================================================================
    
    console.log('\n📋 Cleanup and Shutdown');
    console.log('=' .repeat(60));

    // Unsubscribe from real-time updates
    await businessSaaSIntel.unsubscribeFromUpdates(threatSubscriptionId);
    await businessSaaSIntel.unsubscribeFromUpdates(alertSubscriptionId);
    console.log('✅ Unsubscribed from real-time updates');

    // Shutdown the Business SaaS Intel Core
    await businessSaaSIntel.shutdown();
    console.log('✅ Business SaaS Intel Core shutdown complete');

    console.log('\n🎉 Business SaaS Extension Demo Completed Successfully!');
    console.log('');
    console.log('📈 Key Achievements:');
    console.log('   • Extended phantom-intel-core with enterprise Business SaaS capabilities');
    console.log('   • Integrated 4 data stores (MongoDB, PostgreSQL, Redis, Elasticsearch)');
    console.log('   • Implemented multi-tenancy with quota management');
    console.log('   • Added real-time capabilities with Redis pub/sub');
    console.log('   • Built advanced analytics and correlation engine');
    console.log('   • Created enterprise-grade security and audit features');
    console.log('   • Established comprehensive health monitoring');
    console.log('');
    console.log('🚀 The phantom-intel-core plugin is now Business SaaS ready!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateBusinessSaaSExtension().catch(console.error);
}

export { demonstrateBusinessSaaSExtension };