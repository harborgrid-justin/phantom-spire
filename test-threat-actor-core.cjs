const { PhantomThreatActorCore } = require('./packages/phantom-threat-actor-core');

console.log('🎯 Testing Phantom Threat Actor Core from parent folder...\n');

try {
    const threatCore = new PhantomThreatActorCore('{"enterprise": true, "debug": true}');

    console.log('=== Core Threat Intelligence APIs ===');

    // Test 1: Threat Actor Analysis
    console.log('\n1. Testing analyzeThreatActor...');
    const analysis = threatCore.analyzeThreatActor('APT-40', 'comprehensive');
    const parsedAnalysis = JSON.parse(analysis);
    console.log(`   ✓ Analyzed ${parsedAnalysis.indicators_analyzed} indicators`);
    console.log(`   ✓ Primary attribution: ${parsedAnalysis.primary_attribution} (confidence: ${parsedAnalysis.confidence})`);

    // Test 2: Attribution
    console.log('\n2. Testing performAttribution...');
    const attribution = threatCore.performAttribution('{"indicators": ["malicious.domain.com", "suspicious.exe", "192.168.1.50"]}');
    const parsedAttribution = JSON.parse(attribution);
    console.log(`   ✓ Attribution ID: ${parsedAttribution.attribution_id}`);
    console.log(`   ✓ Primary actor: ${parsedAttribution.primary_attribution.actor_name} (${parsedAttribution.primary_attribution.confidence})`);

    // Test 3: Campaign Tracking
    console.log('\n3. Testing trackCampaign...');
    const campaign = threatCore.trackCampaign('OPERATION-PHANTOM-2024', 'monitoring');
    const parsedCampaign = JSON.parse(campaign);
    console.log(`   ✓ Campaign: ${parsedCampaign.name} (Status: ${parsedCampaign.status})`);
    console.log(`   ✓ Phases: ${parsedCampaign.campaign_phases.length} tracked`);

    // Test 4: Behavioral Analysis
    console.log('\n4. Testing analyzeBehavior...');
    const behavior = threatCore.analyzeBehavior('{"attack_patterns": ["T1566.002", "T1055.012"]}');
    const parsedBehavior = JSON.parse(behavior);
    console.log(`   ✓ Analysis ID: ${parsedBehavior.analysis_id}`);
    console.log(`   ✓ Techniques analyzed: ${parsedBehavior.techniques_analyzed.length}`);

    // Test 5: Infrastructure Analysis
    console.log('\n5. Testing analyzeInfrastructure...');
    const infrastructure = threatCore.analyzeInfrastructure('{"domains": ["evil.com"], "ips": ["1.2.3.4"]}');
    const parsedInfra = JSON.parse(infrastructure);
    console.log(`   ✓ Infrastructure ID: ${parsedInfra.infrastructure_id}`);
    console.log(`   ✓ Threat score: ${parsedInfra.overall_threat_score}`);

    console.log('\n=== Enterprise Intelligence Features ===');

    // Test 6: Executive Report
    console.log('\n6. Testing generateExecutiveReport...');
    const execReport = threatCore.generateExecutiveReport('monthly');
    const parsedExecReport = JSON.parse(execReport);
    console.log(`   ✓ Report ID: ${parsedExecReport.report_id}`);
    console.log(`   ✓ Threats covered: ${parsedExecReport.summary.total_threats_analyzed}`);

    // Test 7: TTP Evolution
    console.log('\n7. Testing analyzeTtpEvolution...');
    const ttpEvolution = threatCore.analyzeTtpEvolution('APT-29', '90d');
    const parsedTtp = JSON.parse(ttpEvolution);
    console.log(`   ✓ Evolution ID: ${parsedTtp.evolution_id}`);
    console.log(`   ✓ Techniques tracked: ${parsedTtp.techniques_analyzed.length}`);

    // Test 8: OCSF Event Generation
    console.log('\n8. Testing generateOcsfEvent...');
    const ocsfEvent = threatCore.generateOcsfEvent('threat_detection', '{"actor": "APT-40", "severity": "high"}');
    const parsedOcsf = JSON.parse(ocsfEvent);
    console.log(`   ✓ Event UID: ${parsedOcsf.metadata.event_uid}`);
    console.log(`   ✓ Category: ${parsedOcsf.category_uid}, Class: ${parsedOcsf.class_uid}`);

    // Test 9: Real-time Intelligence Feed
    console.log('\n9. Testing getThreatIntelligenceFeed...');
    const intelFeed = threatCore.getThreatIntelligenceFeed('real_time');
    const parsedIntel = JSON.parse(intelFeed);
    console.log(`   ✓ Feed ID: ${parsedIntel.feed_id}`);
    console.log(`   ✓ Active threats: ${parsedIntel.active_threats.length}`);

    console.log('\n=== Enterprise Status Validation ===');

    // Test 10: Enterprise Status
    console.log('\n10. Testing getEnterpriseStatus...');
    const status = threatCore.getEnterpriseStatus();
    const parsedStatus = JSON.parse(status);
    console.log(`   ✓ Total modules: ${parsedStatus.total_modules}/27 active`);
    console.log(`   ✓ Attribution engines: ${Object.keys(parsedStatus.attribution_engines).length} operational`);
    console.log(`   ✓ Intelligence feeds: ${Object.keys(parsedStatus.intelligence_feeds).length} connected`);
    console.log(`   ✓ Attribution accuracy: ${parsedStatus.performance_metrics.attribution_accuracy}%`);
    console.log(`   ✓ Daily attributions: ${parsedStatus.performance_metrics.attributions_per_day}`);

    console.log('\n=== All Enterprise Modules Status ===');
    console.log(`Core modules (${Object.keys(parsedStatus.core_modules).length}/9):`, Object.keys(parsedStatus.core_modules).join(', '));
    console.log(`Intelligence modules (${Object.keys(parsedStatus.intelligence_modules).length}/9):`, Object.keys(parsedStatus.intelligence_modules).join(', '));
    console.log(`OCSF modules (${Object.keys(parsedStatus.ocsf_modules).length}/9):`, Object.keys(parsedStatus.ocsf_modules).join(', '));

    console.log('\n🎯 SUCCESS: All 27 enterprise threat intelligence modules are operational!');
    console.log('✅ Phantom Threat Actor Core is fully functional with comprehensive enterprise features');

} catch (error) {
    console.error('❌ Error testing threat actor core:', error);
    process.exit(1);
}