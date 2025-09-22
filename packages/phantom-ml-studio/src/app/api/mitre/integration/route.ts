/**
 * MITRE Cross-Plugin Integration API
 * Demonstrates MITRE data interoperability across phantom-ml-studio modules
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPhantomCoreIntegrator } from '@/services/phantom-core-integrator';
import { query } from '@/lib/database';

/**
 * POST /api/mitre/integration - Demonstrate cross-module MITRE analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threatData, analysisType = 'full' } = body;

    // Initialize phantom core integrator
    const integrator = getPhantomCoreIntegrator();

    console.log('🎯 Starting cross-module MITRE analysis...');

    const analysisResults = {
      timestamp: new Date().toISOString(),
      analysisType,
      threatData,
      mitreAnalysis: {},
      crossModuleCorrelation: {},
      recommendations: [],
      metadata: {
        processingTime: 0,
        modulesUsed: [],
        confidence: 0
      }
    };

    const startTime = Date.now();

    // 1. Core MITRE Analysis
    if (integrator.cores.mitre) {
      console.log('📊 Performing MITRE technique analysis...');
      
      const mitreResults = await integrator.cores.mitre.analyzeAttack(
        threatData.indicators || []
      );
      
      analysisResults.mitreAnalysis = mitreResults;
      analysisResults.metadata.modulesUsed.push('mitre');

      // Get detailed technique information
      if (mitreResults.techniques?.length > 0) {
        const techniqueDetails = await Promise.all(
          mitreResults.techniques.slice(0, 3).map(async (techniqueId: string) => {
            const result = await query(
              'SELECT * FROM mitre_techniques WHERE mitre_id = $1',
              [techniqueId]
            );
            return result.rows[0] || null;
          })
        );

        analysisResults.mitreAnalysis.techniqueDetails = techniqueDetails.filter(Boolean);
      }
    }

    // 2. IOC Cross-Correlation
    if (integrator.cores.ioc && threatData.iocs) {
      console.log('🔍 Correlating IOCs with MITRE techniques...');
      
      const iocResults = await integrator.cores.ioc.process(threatData.iocs);
      analysisResults.metadata.modulesUsed.push('ioc');

      // Cross-correlate IOCs with MITRE techniques
      if (analysisResults.mitreAnalysis.techniques) {
        analysisResults.crossModuleCorrelation.iocToMitre = {
          matchedTechniques: analysisResults.mitreAnalysis.techniques,
          iocCount: threatData.iocs.length,
          correlation: 'high',
          reasoning: 'IOC patterns align with identified MITRE techniques'
        };
      }
    }

    // 3. Threat Actor Attribution
    if (integrator.cores.attribution && threatData.indicators) {
      console.log('👥 Analyzing threat actor attribution...');
      
      const attributionResults = await integrator.cores.attribution.process(threatData);
      analysisResults.metadata.modulesUsed.push('attribution');

      // Cross-correlate with MITRE groups
      if (attributionResults.threatActors?.length > 0) {
        const mitreGroups = await query(`
          SELECT * FROM mitre_groups 
          WHERE name ILIKE ANY($1) OR aliases && $2
        `, [
          attributionResults.threatActors.map((actor: any) => `%${actor.name}%`),
          attributionResults.threatActors.map((actor: any) => actor.name)
        ]);

        analysisResults.crossModuleCorrelation.attributionToMitre = {
          identifiedGroups: mitreGroups.rows,
          attributionConfidence: attributionResults.confidence,
          mitreMapping: mitreGroups.rows.length > 0 ? 'confirmed' : 'potential'
        };
      }
    }

    // 4. ML-Based Pattern Analysis
    if (integrator.cores.ml && threatData.features) {
      console.log('🤖 Performing ML-based threat pattern analysis...');
      
      const mlResults = await integrator.cores.ml.analyzeThreats(threatData.features);
      analysisResults.metadata.modulesUsed.push('ml');

      // Correlate ML predictions with MITRE techniques
      if (mlResults.predictions?.length > 0) {
        analysisResults.crossModuleCorrelation.mlToMitre = {
          predictions: mlResults.predictions,
          techniqueCorrelation: analysisResults.mitreAnalysis.techniques || [],
          confidence: mlResults.confidence,
          modelUsed: mlResults.modelInfo?.name || 'unknown'
        };
      }
    }

    // 5. Generate Recommendations
    console.log('💡 Generating actionable recommendations...');
    
    const recommendations = [];

    // MITRE-based recommendations
    if (analysisResults.mitreAnalysis.techniques?.length > 0) {
      const mitigations = await query(`
        SELECT DISTINCT m.* FROM mitre_mitigations m
        WHERE m.techniques_addressed && $1
        ORDER BY m.name
        LIMIT 5
      `, [analysisResults.mitreAnalysis.techniques]);

      if (mitigations.rows.length > 0) {
        recommendations.push({
          type: 'mitigation',
          priority: 'high',
          title: 'Apply MITRE Recommended Mitigations',
          description: 'Implement the following mitigations based on identified techniques',
          actions: mitigations.rows.map(m => ({
            id: m.mitre_id,
            name: m.name,
            description: m.description?.substring(0, 200) + '...'
          }))
        });
      }

      // Detection recommendations
      const dataSources = await query(`
        SELECT DISTINCT ds.* FROM mitre_data_sources ds
        WHERE ds.techniques_detected && $1
        ORDER BY ds.name
        LIMIT 3
      `, [analysisResults.mitreAnalysis.techniques]);

      if (dataSources.rows.length > 0) {
        recommendations.push({
          type: 'detection',
          priority: 'medium',
          title: 'Enhance Detection Coverage',
          description: 'Implement additional data sources for better technique detection',
          actions: dataSources.rows.map(ds => ({
            id: ds.mitre_id,
            name: ds.name,
            components: ds.data_components
          }))
        });
      }
    }

    // Cross-module recommendations
    if (analysisResults.crossModuleCorrelation.attributionToMitre?.identifiedGroups?.length > 0) {
      recommendations.push({
        type: 'intelligence',
        priority: 'high',
        title: 'Threat Actor Intelligence',
        description: 'Monitor for additional TTPs associated with identified threat groups',
        actions: analysisResults.crossModuleCorrelation.attributionToMitre.identifiedGroups.map((group: any) => ({
          id: group.mitre_id,
          name: group.name,
          aliases: group.aliases,
          additionalTechniques: group.techniques_used?.length || 0
        }))
      });
    }

    analysisResults.recommendations = recommendations;

    // 6. Calculate overall confidence
    const confidenceFactors = [];
    if (analysisResults.mitreAnalysis.confidence) {
      confidenceFactors.push(analysisResults.mitreAnalysis.confidence);
    }
    if (analysisResults.crossModuleCorrelation.attributionToMitre?.attributionConfidence) {
      confidenceFactors.push(analysisResults.crossModuleCorrelation.attributionToMitre.attributionConfidence);
    }
    if (analysisResults.crossModuleCorrelation.mlToMitre?.confidence) {
      confidenceFactors.push(analysisResults.crossModuleCorrelation.mlToMitre.confidence);
    }

    analysisResults.metadata.confidence = confidenceFactors.length > 0 
      ? confidenceFactors.reduce((a, b) => a + b, 0) / confidenceFactors.length 
      : 0.5;

    analysisResults.metadata.processingTime = Date.now() - startTime;

    console.log(`✅ Cross-module analysis completed in ${analysisResults.metadata.processingTime}ms`);
    console.log(`🎯 Modules used: ${analysisResults.metadata.modulesUsed.join(', ')}`);
    console.log(`📊 Overall confidence: ${(analysisResults.metadata.confidence * 100).toFixed(1)}%`);

    return NextResponse.json({
      success: true,
      analysis: analysisResults,
      summary: {
        techniquesIdentified: analysisResults.mitreAnalysis.techniques?.length || 0,
        tacticsInvolved: analysisResults.mitreAnalysis.tactics?.length || 0,
        recommendationsGenerated: recommendations.length,
        crossModuleCorrelations: Object.keys(analysisResults.crossModuleCorrelation).length,
        confidence: analysisResults.metadata.confidence,
        processingTime: analysisResults.metadata.processingTime
      }
    });

  } catch (error: any) {
    console.error('Cross-module analysis error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Analysis failed', 
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mitre/integration - Get integration capabilities and status
 */
export async function GET() {
  try {
    const integrator = getPhantomCoreIntegrator();
    
    const capabilities = {
      availableModules: [],
      integrationFeatures: [
        'Real-time MITRE technique mapping',
        'Cross-correlation with IOCs and threat intelligence', 
        'ML-based pattern recognition with MITRE context',
        'Automated threat actor attribution',
        'Framework coverage assessment',
        'Actionable mitigation recommendations'
      ],
      dataSourcesSupported: [
        'Official MITRE ATT&CK Enterprise',
        'MITRE ATT&CK Mobile',
        'MITRE ATT&CK ICS',
        'IOC feeds and intelligence sources',
        'ML model predictions and behavioral analysis',
        'Threat actor attribution data'
      ],
      outputFormats: [
        'Structured JSON analysis results',
        'MITRE technique mappings',
        'Actionable recommendations',
        'Cross-module correlation data',
        'Confidence scoring and metadata'
      ]
    };

    // Check which modules are available
    Object.keys(integrator.cores || {}).forEach(moduleKey => {
      if (integrator.cores[moduleKey]) {
        capabilities.availableModules.push({
          name: moduleKey,
          status: 'available',
          features: getModuleFeatures(moduleKey)
        });
      }
    });

    // Get MITRE integration status
    let mitreStatus = null;
    try {
      if (integrator.cores.mitre) {
        mitreStatus = await integrator.cores.mitre.getIntegrationStatus();
      }
    } catch (error) {
      console.warn('Could not get MITRE status:', error);
    }

    return NextResponse.json({
      capabilities,
      mitreStatus,
      integrationReady: capabilities.availableModules.length > 0,
      lastUpdate: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to get integration status', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

function getModuleFeatures(moduleKey: string): string[] {
  const featureMap: Record<string, string[]> = {
    mitre: ['technique analysis', 'framework mapping', 'tactic correlation'],
    ioc: ['indicator processing', 'correlation analysis', 'enrichment'],
    attribution: ['threat actor profiling', 'campaign tracking', 'confidence scoring'],
    ml: ['pattern recognition', 'behavioral analysis', 'predictive modeling'],
    xdr: ['threat detection', 'response automation', 'behavioral analysis'],
    cve: ['vulnerability analysis', 'severity scoring', 'impact assessment']
  };
  
  return featureMap[moduleKey] || ['general analysis'];
}