// Simple TypeScript test for phantom-attribution-core
const { AttributionCoreNapi } = require('./index.js');

console.log('🚀 Testing phantom-attribution-core TypeScript API\n');

interface TestResults {
    constructor: boolean;
    healthStatus: boolean;
    threatActors: boolean;
    attributionObject: boolean;
    attributionJSON: boolean;
}

function testAllAPIs(): TestResults {
    const results: TestResults = {
        constructor: false,
        healthStatus: false,
        threatActors: false,
        attributionObject: false,
        attributionJSON: false
    };

    try {
        // Test 1: Constructor
        console.log('1. Testing Constructor...');
        const core = new AttributionCoreNapi();
        console.log('✅ AttributionCoreNapi instance created successfully\n');
        results.constructor = true;

        // Test 2: Health Status
        console.log('2. Testing get_health_status()...');
        const healthResult: string = core.get_health_status();
        const health = JSON.parse(healthResult);
        console.log('✅ Health Status:', {
            status: health.status,
            version: health.version,
            actor_count: health.actor_count
        });
        console.log();
        results.healthStatus = true;

        // Test 3: Get Threat Actors
        console.log('3. Testing get_threat_actors()...');
        const actors = core.get_threat_actors();
        console.log('✅ Retrieved', actors.length, 'threat actors');
        actors.forEach((actor: any, index: number) => {
            console.log(`   ${index + 1}. ${actor.name} (${actor.id}) - Origin: ${actor.origin}`);
        });
        console.log();
        results.threatActors = true;

        // Test 4: Attribution Analysis (Object)
        console.log('4. Testing analyze_attribution()...');
        const indicators: string[] = ['spear_phishing', 'watering_hole'];
        const attribution = core.analyze_attribution(indicators);
        console.log('✅ Attribution Analysis:', {
            confidence_score: attribution.confidence_score,
            matches: attribution.actor_matches.length
        });
        console.log();
        results.attributionObject = true;

        // Test 5: Attribution Analysis (JSON)
        console.log('5. Testing analyze_attribution_json()...');
        const attributionJSON: string = core.analyze_attribution_json(indicators);
        const parsed = JSON.parse(attributionJSON);
        console.log('✅ Attribution JSON:', {
            confidence_score: parsed.confidence_score,
            matches: parsed.actor_matches.length
        });
        console.log();
        results.attributionJSON = true;

        console.log('🎉 All TypeScript API tests completed successfully!');
        return results;

    } catch (error) {
        console.error('❌ TypeScript test failed:', error);
        throw error;
    }
}

// Main execution
try {
    const results = testAllAPIs();

    console.log('\n📊 TypeScript Test Summary:');
    console.log(`   ✅ Constructor: ${results.constructor ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Health status API: ${results.healthStatus ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Threat actors retrieval: ${results.threatActors ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Attribution analysis (object): ${results.attributionObject ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Attribution analysis (JSON): ${results.attributionJSON ? 'PASS' : 'FAIL'}`);

    console.log('\n✨ All TypeScript tests completed successfully!');
} catch (error) {
    console.error('❌ TypeScript tests failed:', error);
    process.exit(1);
}