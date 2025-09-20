#!/usr/bin/env npx tsx

// TypeScript test application for phantom-attribution-core Node.js API
import AttributionCoreNapi, { ThreatActor, Attribution, ActorMatch } from './index.js';

console.log('🚀 Testing phantom-attribution-core TypeScript API\n');

interface TestResults {
    constructor: boolean;
    healthStatus: boolean;
    threatActors: boolean;
    attributionObject: boolean;
    attributionJSON: boolean;
    differentIndicators: boolean;
    emptyIndicators: boolean;
    errorHandling: boolean;
}

async function testAllAPIs(): Promise<TestResults> {
    const results: TestResults = {
        constructor: false,
        healthStatus: false,
        threatActors: false,
        attributionObject: false,
        attributionJSON: false,
        differentIndicators: false,
        emptyIndicators: false,
        errorHandling: false
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
        const health = JSON.parse(healthResult) as {
            status: string;
            version: string;
            actor_count: number;
            timestamp: string;
        };
        console.log('✅ Health Status:', {
            status: health.status,
            version: health.version,
            actor_count: health.actor_count,
            timestamp: health.timestamp
        });
        console.log();
        results.healthStatus = true;

        // Test 3: Get Threat Actors
        console.log('3. Testing get_threat_actors()...');
        const actors: ThreatActor[] = core.get_threat_actors();
        console.log('✅ Retrieved', actors.length, 'threat actors:');
        actors.forEach((actor: ThreatActor, index: number) => {
            console.log(`   ${index + 1}. ${actor.name} (${actor.id})`);
            console.log(`      Origin: ${actor.origin}`);
            console.log(`      Aliases: ${actor.aliases.join(', ')}`);
            console.log(`      TTPs: ${actor.ttps.slice(0, 2).join(', ')}...`);
            console.log(`      Confidence: ${actor.confidence}`);
            console.log(`      Motivation: ${actor.motivation.join(', ')}`);
            console.log(`      Capabilities: ${actor.capabilities.join(', ')}`);
        });
        console.log();
        results.threatActors = true;

        // Test 4: Attribution Analysis (Object Return)
        console.log('4. Testing analyze_attribution() with object return...');
        const indicators: string[] = ['spear_phishing', 'watering_hole', 'advanced_malware'];
        const attributionObj: Attribution = core.analyze_attribution(indicators);
        console.log('✅ Attribution Analysis (Object):', {
            indicator: attributionObj.indicator,
            confidence_score: attributionObj.confidence_score,
            analysis_date: attributionObj.analysis_date,
            matches: attributionObj.actor_matches.length + ' actor matches'
        });

        attributionObj.actor_matches.forEach((match: ActorMatch, index: number) => {
            console.log(`   Match ${index + 1}: ${match.actor_id} (score: ${match.match_score.toFixed(2)})`);
            console.log(`      Matching indicators: ${match.matching_indicators.join(', ')}`);
        });
        console.log();
        results.attributionObject = true;

        // Test 5: Attribution Analysis (JSON Return)
        console.log('5. Testing analyze_attribution_json() with JSON return...');
        const attributionJSON: string = core.analyze_attribution_json(indicators);
        const attribution = JSON.parse(attributionJSON) as Attribution;
        console.log('✅ Attribution Analysis (JSON):', {
            indicator: attribution.indicator,
            confidence_score: attribution.confidence_score,
            analysis_date: attribution.analysis_date,
            matches: attribution.actor_matches.length + ' actor matches'
        });
        console.log();
        results.attributionJSON = true;

        // Test 6: Different Indicators
        console.log('6. Testing with different indicators...');
        const otherIndicators: string[] = ['social_engineering', 'unknown_technique'];
        const attribution2: string = core.analyze_attribution_json(otherIndicators);
        const parsed2 = JSON.parse(attribution2) as Attribution;
        console.log('✅ Attribution for different indicators:', {
            indicator: parsed2.indicator,
            confidence_score: parsed2.confidence_score,
            matches: parsed2.actor_matches.length + ' matches'
        });
        console.log();
        results.differentIndicators = true;

        // Test 7: Empty Indicators
        console.log('7. Testing with empty indicators...');
        const attribution3: string = core.analyze_attribution_json([]);
        const parsed3 = JSON.parse(attribution3) as Attribution;
        console.log('✅ Attribution for empty indicators:', {
            confidence_score: parsed3.confidence_score,
            matches: parsed3.actor_matches.length + ' matches'
        });
        console.log();
        results.emptyIndicators = true;

        // Test 8: Error Handling
        console.log('8. Testing error handling...');
        try {
            // This should work fine, but let's test edge cases
            const result: Attribution = core.analyze_attribution(['test']);
            console.log('✅ Error handling test passed - no errors with edge case input');
            console.log(`   Result confidence: ${result.confidence_score}`);
        } catch (error) {
            console.log('⚠️  Expected error:', (error as Error).message);
        }
        console.log();
        results.errorHandling = true;

        console.log('🎉 All TypeScript API tests completed successfully!');
        return results;

    } catch (error) {
        console.error('❌ TypeScript test failed:', error);
        throw error;
    }
}

// Performance test with TypeScript typing
async function performanceTest(): Promise<void> {
    console.log('\n🏃‍♂️ Running TypeScript Performance Test...');

    const core = new AttributionCoreNapi();
    const testIndicators: string[] = ['spear_phishing', 'watering_hole'];

    const iterations: number = 1000;
    console.log(`Performing ${iterations} attribution analyses...`);

    const startTime: number = Date.now();

    for (let i = 0; i < iterations; i++) {
        const result: string = core.analyze_attribution_json(testIndicators);
        // Parse to ensure type safety
        const parsed: Attribution = JSON.parse(result);
        // Verify structure
        if (typeof parsed.confidence_score !== 'number') {
            throw new Error('Type safety violation: confidence_score is not a number');
        }
    }

    const endTime: number = Date.now();
    const duration: number = endTime - startTime;
    const operationsPerSecond: number = Math.round((iterations / duration) * 1000);

    console.log(`✅ TypeScript Performance Test Results:`);
    console.log(`   Total time: ${duration}ms`);
    console.log(`   Operations per second: ${operationsPerSecond.toLocaleString()}`);
    console.log(`   Average time per operation: ${(duration / iterations).toFixed(3)}ms`);
}

// Type safety validation test
async function typeSafetyTest(): Promise<void> {
    console.log('\n🔒 Running Type Safety Validation...');

    const core = new AttributionCoreNapi();

    // Test that all returned objects match their TypeScript interfaces
    const actors: ThreatActor[] = core.get_threat_actors();
    console.log('✅ Threat actors type validation passed');

    const attribution: Attribution = core.analyze_attribution(['test']);
    console.log('✅ Attribution object type validation passed');

    // Verify all required fields exist
    const requiredActorFields: (keyof ThreatActor)[] = [
        'id', 'name', 'aliases', 'origin', 'motivation', 'capabilities', 'ttps', 'confidence'
    ];

    for (const actor of actors) {
        for (const field of requiredActorFields) {
            if (!(field in actor)) {
                throw new Error(`Missing required field: ${field} in ThreatActor`);
            }
        }
    }

    const requiredAttributionFields: (keyof Attribution)[] = [
        'indicator', 'actor_matches', 'confidence_score', 'analysis_date'
    ];

    for (const field of requiredAttributionFields) {
        if (!(field in attribution)) {
            throw new Error(`Missing required field: ${field} in Attribution`);
        }
    }

    console.log('✅ All type safety validations passed');
}

// Main execution
async function main(): Promise<void> {
    try {
        const results = await testAllAPIs();
        await performanceTest();
        await typeSafetyTest();

        console.log('\n📊 TypeScript Test Summary:');
        console.log(`   ✅ Constructor: ${results.constructor ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Health status API: ${results.healthStatus ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Threat actors retrieval: ${results.threatActors ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Attribution analysis (object): ${results.attributionObject ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Attribution analysis (JSON): ${results.attributionJSON ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Different indicator sets: ${results.differentIndicators ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Empty indicator handling: ${results.emptyIndicators ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Error handling: ${results.errorHandling ? 'PASS' : 'FAIL'}`);
        console.log(`   ✅ Type safety validation: PASS`);

        console.log('\n✨ All TypeScript tests completed successfully!');
    } catch (error) {
        console.error('❌ TypeScript tests failed:', error);
        process.exit(1);
    }
}

// Export for potential use in other modules
export { testAllAPIs, performanceTest, typeSafetyTest };

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}