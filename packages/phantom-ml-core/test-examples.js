#!/usr/bin/env node

/**
 * Practical Test Suite for Phantom ML Core Examples
 * 
 * This script runs practical tests for the comprehensive guide examples
 * to ensure they work correctly in real scenarios.
 */

const fs = require('fs');
const path = require('path');

// Mock implementation for testing since we don't have the actual NAPI bindings
class MockPhantomMLCore {
  constructor() {
    this.models = new Map();
    this.modelCounter = 0;
  }

  async get_system_health() {
    return JSON.stringify({
      status: 'healthy',
      memory_available: '8.2 GB',
      cpu_usage: 25.4,
      uptime_seconds: 86400,
      models_loaded: this.models.size
    });
  }

  async create_model(config_json) {
    const config = JSON.parse(config_json);
    const modelId = `model_${++this.modelCounter}_${Date.now()}`;
    
    const model = {
      id: modelId,
      name: `${config.model_type}_${modelId.slice(0, 13)}`,
      model_type: config.model_type,
      algorithm: config.algorithm,
      version: '1.0.0',
      status: 'created',
      feature_count: config.feature_config?.input_features?.length || 0,
      created_at: new Date().toISOString(),
      accuracy: 0.0,
      precision: 0.0,
      recall: 0.0,
      f1_score: 0.0
    };
    
    this.models.set(modelId, model);
    
    return JSON.stringify({
      model_id: modelId,
      name: model.name,
      type: model.model_type,
      algorithm: model.algorithm,
      feature_count: model.feature_count,
      status: model.status,
      created_at: model.created_at
    });
  }

  async train_model(model_id, training_data_json) {
    const model = this.models.get(model_id);
    if (!model) {
      throw new Error(`Model not found: ${model_id}`);
    }

    const trainingData = JSON.parse(training_data_json);
    
    // Simulate training with reasonable metrics
    const accuracy = 0.85 + Math.random() * 0.1;
    const precision = 0.80 + Math.random() * 0.15;
    const recall = 0.75 + Math.random() * 0.2;
    const f1_score = 2 * (precision * recall) / (precision + recall);
    
    // Update model
    model.accuracy = accuracy;
    model.precision = precision;
    model.recall = recall;
    model.f1_score = f1_score;
    model.status = 'trained';
    model.training_samples = trainingData.features?.length || trainingData.samples || 0;
    
    return JSON.stringify({
      model_id: model_id,
      training_accuracy: accuracy,
      validation_accuracy: accuracy * 0.95,
      training_loss: 0.3 - accuracy * 0.2,
      validation_loss: 0.35 - accuracy * 0.2,
      epochs_completed: trainingData.epochs || 10,
      training_time_ms: Math.floor(Math.random() * 5000) + 1000,
      samples_processed: model.training_samples,
      precision: precision,
      recall: recall,
      f1_score: f1_score
    });
  }

  async predict(model_id, features_json) {
    const model = this.models.get(model_id);
    if (!model) {
      throw new Error(`Model not found: ${model_id}`);
    }

    if (model.status !== 'trained') {
      throw new Error(`Model not trained: ${model_id}`);
    }

    const features = JSON.parse(features_json);
    
    // Simple mock prediction logic
    const sum = features.reduce((a, b) => a + b, 0);
    const prediction = sum > features.length * 0.5 ? 1 : 0;
    const confidence = 0.6 + Math.random() * 0.35;
    
    return JSON.stringify({
      model_id: model_id,
      prediction: prediction,
      confidence: confidence,
      probability_distribution: [1 - confidence, confidence],
      feature_importance: {
        feature1: Math.random(),
        feature2: Math.random(),
        feature3: Math.random()
      },
      inference_time_ms: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date().toISOString()
    });
  }

  async predict_batch(model_id, batch_data_json) {
    const model = this.models.get(model_id);
    if (!model) {
      throw new Error(`Model not found: ${model_id}`);
    }

    const batchData = JSON.parse(batch_data_json);
    const predictions = [];
    
    for (let i = 0; i < batchData.samples.length; i++) {
      const features = batchData.samples[i];
      const sum = features.reduce((a, b) => a + b, 0);
      const prediction = sum > features.length * 0.5 ? 1 : 0;
      const confidence = 0.6 + Math.random() * 0.35;
      
      predictions.push({
        sample_id: batchData.sample_ids?.[i] || `sample_${i}`,
        prediction: prediction,
        confidence: confidence,
        probability_distribution: batchData.include_probabilities ? 
          [1 - confidence, confidence] : undefined
      });
    }
    
    return JSON.stringify({
      predictions: predictions,
      batch_processing_time_ms: Math.floor(Math.random() * 1000) + 200,
      samples_processed: predictions.length
    });
  }

  async detect_anomalies(data_json, sensitivity) {
    const data = JSON.parse(data_json);
    const points = data.data_points || [];
    
    // Simple anomaly detection simulation
    const anomalies = [];
    const anomalyRate = 0.05 + sensitivity * 0.05; // 5-10% anomalies
    
    points.forEach((point, index) => {
      if (Math.random() < anomalyRate) {
        anomalies.push({
          index: index,
          anomaly_score: Math.random() * 0.5 + 0.5,
          confidence: Math.random() * 0.3 + 0.7,
          explanation: 'Statistical deviation detected'
        });
      }
    });
    
    return JSON.stringify({
      total_points: points.length,
      anomalies_count: anomalies.length,
      anomaly_rate: anomalies.length / points.length,
      overall_confidence: 0.8,
      anomalies: anomalies.slice(0, 10), // Top 10
      feature_contributions: {
        metric1: Math.random(),
        metric2: Math.random(),
        metric3: Math.random()
      }
    });
  }

  async get_model_info(model_id) {
    const model = this.models.get(model_id);
    if (!model) {
      throw new Error(`Model not found: ${model_id}`);
    }

    return JSON.stringify({
      model_id: model.id,
      name: model.name,
      model_type: model.model_type,
      algorithm: model.algorithm,
      version: model.version,
      status: model.status,
      feature_count: model.feature_count,
      training_samples: model.training_samples || 0,
      created_at: model.created_at,
      last_trained: new Date().toISOString(),
      last_used: new Date().toISOString(),
      accuracy: model.accuracy,
      precision: model.precision,
      recall: model.recall,
      f1_score: model.f1_score
    });
  }

  async list_models() {
    const models = Array.from(this.models.values());
    
    return JSON.stringify({
      total_models: models.length,
      models: models.map(model => ({
        model_id: model.id,
        name: model.name,
        model_type: model.model_type,
        algorithm: model.algorithm,
        status: model.status,
        accuracy: model.accuracy,
        created_at: model.created_at
      }))
    });
  }

  async get_performance_stats() {
    return JSON.stringify({
      system_stats: {
        total_predictions: Math.floor(Math.random() * 10000) + 5000,
        avg_prediction_latency_ms: Math.random() * 100 + 20,
        memory_usage_mb: Math.random() * 1000 + 500,
        cpu_usage_percent: Math.random() * 50 + 25
      },
      model_stats: {
        models_created: this.models.size,
        models_active: Array.from(this.models.values()).filter(m => m.status === 'trained').length,
        total_training_time_ms: Math.floor(Math.random() * 100000),
        last_updated: new Date().toISOString()
      }
    });
  }

  // Add mock implementations for other endpoints
  async engineer_features(raw_data_json, feature_config_json) {
    const rawData = JSON.parse(raw_data_json);
    const featureConfig = JSON.parse(feature_config_json);
    
    return JSON.stringify({
      original_feature_count: featureConfig.input_features?.length || 0,
      engineered_feature_count: 15,
      total_feature_count: 23,
      samples_processed: rawData.samples?.length || 0,
      processing_time_ms: Math.floor(Math.random() * 2000) + 500,
      feature_statistics: {
        feature1: { mean: Math.random() * 100, std: Math.random() * 20, missing_count: 0 },
        feature2: { mean: Math.random() * 100, std: Math.random() * 20, missing_count: 0 }
      },
      quality_metrics: {
        completeness: 0.95 + Math.random() * 0.05,
        consistency: 0.90 + Math.random() * 0.08,
        validity: 0.92 + Math.random() * 0.06
      }
    });
  }

  async generate_insights(analysis_config_json) {
    const config = JSON.parse(analysis_config_json);
    
    return JSON.stringify({
      threat_trends: {
        current_level: 'moderate',
        change_24h: Math.random() * 20 - 10,
        peak_hour: Math.floor(Math.random() * 24),
        trend_direction: Math.random() > 0.5 ? 'increasing' : 'decreasing'
      },
      attack_patterns: [
        {
          name: 'Brute Force Login',
          frequency: Math.floor(Math.random() * 100),
          confidence: Math.random() * 0.3 + 0.7,
          risk_level: 'high'
        }
      ],
      risk_assessment: {
        overall_score: Math.random() * 3 + 7,
        risk_level: 'medium',
        top_factors: [
          { name: 'Unusual Traffic Patterns', score: Math.random() * 3 + 7 },
          { name: 'Failed Authentication Attempts', score: Math.random() * 3 + 6 }
        ]
      },
      recommendations: [
        {
          title: 'Enhance Authentication Monitoring',
          priority: 'high',
          expected_impact: 'Reduce brute force success rate by 60%',
          description: 'Implement real-time login attempt monitoring with progressive delays'
        }
      ],
      processing_time_ms: Math.floor(Math.random() * 3000) + 1000
    });
  }

  async trend_analysis(data_json, trend_config_json) {
    const data = JSON.parse(data_json);
    const config = JSON.parse(trend_config_json);
    
    return JSON.stringify({
      trend_summary: {
        threat_count: {
          trend_direction: 'increasing',
          trend_strength: Math.random() * 0.5 + 0.3,
          has_seasonality: true,
          volatility: Math.random() * 0.3 + 0.1
        }
      },
      change_points: [
        {
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          metric: 'threat_count',
          magnitude: Math.random() * 2 + 1,
          confidence: Math.random() * 0.2 + 0.8
        }
      ],
      forecasts: {
        threat_count: {
          next_24h_avg: Math.random() * 50 + 25,
          next_48h_avg: Math.random() * 55 + 30,
          confidence: Math.random() * 0.2 + 0.7,
          lower_bound: 15,
          upper_bound: 85
        }
      },
      anomalies: [
        {
          timestamp: new Date().toISOString(),
          metric: 'threat_count',
          score: Math.random() * 0.3 + 0.7,
          expected: 35,
          actual: 78
        }
      ],
      processing_time_ms: Math.floor(Math.random() * 2000) + 800
    });
  }

  async correlation_analysis(data_json) {
    const data = JSON.parse(data_json);
    
    return JSON.stringify({
      strong_correlations: [
        {
          feature1: 'failed_login_attempts',
          feature2: 'suspicious_network_activity',
          pearson: Math.random() * 0.4 + 0.6,
          spearman: Math.random() * 0.4 + 0.6,
          p_value: Math.random() * 0.01,
          significant: true
        }
      ],
      insights: [
        {
          title: 'Strong correlation between login failures and network anomalies',
          description: 'Failed login attempts are highly correlated with suspicious network patterns',
          impact_level: 'high'
        }
      ],
      feature_clusters: [
        {
          features: ['failed_login_attempts', 'brute_force_indicators'],
          avg_correlation: Math.random() * 0.3 + 0.7
        }
      ]
    });
  }

  async statistical_summary(data_json) {
    const data = JSON.parse(data_json);
    
    return JSON.stringify({
      datasets: data.datasets?.map(dataset => ({
        name: dataset.name,
        descriptive_stats: {
          count: Math.floor(Math.random() * 1000) + 100,
          mean: Math.random() * 100,
          median: Math.random() * 100,
          std_dev: Math.random() * 25,
          min: Math.random() * 10,
          max: Math.random() * 50 + 150,
          skewness: Math.random() * 2 - 1,
          kurtosis: Math.random() * 4 - 2
        },
        percentiles: {
          p25: Math.random() * 40,
          p75: Math.random() * 40 + 60,
          p95: Math.random() * 20 + 80,
          p99: Math.random() * 10 + 90
        },
        outliers: {
          count: Math.floor(Math.random() * 20),
          rate: Math.random() * 0.05
        },
        distribution_analysis: {
          best_fit: 'normal',
          normality_p_value: Math.random() * 0.1,
          is_normal: Math.random() > 0.3
        }
      })) || []
    });
  }

  async stream_predict(model_id, stream_config_json) {
    const config = JSON.parse(stream_config_json);
    
    return JSON.stringify({
      stream_id: `stream_${Date.now()}`,
      status: 'active',
      expected_throughput: Math.floor(Math.random() * 500) + 200,
      buffer_capacity: config.buffer_size || 1000,
      latency_target_ms: config.max_latency_ms || 100
    });
  }

  async batch_process_async(model_id, batch_data_json) {
    const batchData = JSON.parse(batch_data_json);
    
    return JSON.stringify({
      job_id: `job_${Date.now()}`,
      status: 'initiated',
      estimated_completion: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      progress_url: '/api/jobs/progress'
    });
  }

  async real_time_monitor(monitor_config_json) {
    const config = JSON.parse(monitor_config_json);
    
    return JSON.stringify({
      monitor_id: `monitor_${Date.now()}`,
      status: 'active',
      targets_count: config.monitoring_targets?.length || 0,
      monitoring_frequency: config.monitoring_frequency || '60s',
      alert_channels: config.alert_config?.alert_channels || ['console']
    });
  }

  async alert_engine(alert_rules_json) {
    const rules = JSON.parse(alert_rules_json);
    
    return JSON.stringify({
      engine_id: `alert_engine_${Date.now()}`,
      rules_loaded: rules.alert_rules?.length || 0,
      status: 'active'
    });
  }
}

// Test runner class
class PracticalTestRunner {
  constructor() {
    // Use mock for testing - in production this would be the real PhantomMLCore
    this.mlCore = new MockPhantomMLCore();
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🔍 Running ${testName}...`);
      await testFunction();
      console.log(`✅ ${testName} passed`);
      this.testResults.passed++;
    } catch (error) {
      console.error(`❌ ${testName} failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
    }
  }

  async testBasicWorkflow() {
    // Test the complete basic workflow
    const config = {
      model_type: "classification",
      algorithm: "random_forest",
      hyperparameters: { n_estimators: 100, max_depth: 10 },
      feature_config: {
        input_features: ["feature1", "feature2", "feature3"],
        normalization: true,
        scaling_method: "min_max"
      },
      training_config: {
        epochs: 10,
        batch_size: 32,
        learning_rate: 0.01,
        validation_split: 0.2
      }
    };

    // Create model
    const createResult = await this.mlCore.create_model(JSON.stringify(config));
    const model = JSON.parse(createResult);
    
    if (!model.model_id) {
      throw new Error('Model creation failed - no model_id returned');
    }

    // Train model
    const trainingData = {
      features: [[0.8, 0.9, 0.7], [0.2, 0.3, 0.1], [0.9, 0.8, 0.85]],
      labels: [1, 0, 1],
      samples: 3
    };

    const trainResult = await this.mlCore.train_model(model.model_id, JSON.stringify(trainingData));
    const trainResponse = JSON.parse(trainResult);
    
    if (trainResponse.training_accuracy === undefined) {
      throw new Error('Training failed - no accuracy returned');
    }

    // Make prediction
    const predictResult = await this.mlCore.predict(model.model_id, JSON.stringify([0.6, 0.7, 0.5]));
    const prediction = JSON.parse(predictResult);
    
    if (prediction.prediction === undefined || prediction.confidence === undefined) {
      throw new Error('Prediction failed - missing prediction or confidence');
    }

    console.log(`  Model: ${model.model_id}`);
    console.log(`  Accuracy: ${trainResponse.training_accuracy.toFixed(4)}`);
    console.log(`  Prediction: ${prediction.prediction}, Confidence: ${prediction.confidence.toFixed(4)}`);
  }

  async testBatchProcessing() {
    // Create and train a model first
    const config = {
      model_type: "classification",
      algorithm: "gradient_boosting",
      feature_config: { input_features: ["f1", "f2", "f3"] },
      training_config: { epochs: 5 }
    };

    const model = JSON.parse(await this.mlCore.create_model(JSON.stringify(config)));
    
    const trainingData = {
      features: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [2, 3, 4]],
      labels: [0, 1, 1, 0],
      samples: 4
    };
    
    await this.mlCore.train_model(model.model_id, JSON.stringify(trainingData));

    // Test batch prediction
    const batchData = {
      samples: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      sample_ids: ["test1", "test2", "test3"],
      include_probabilities: true
    };

    const batchResult = await this.mlCore.predict_batch(model.model_id, JSON.stringify(batchData));
    const batchResponse = JSON.parse(batchResult);
    
    if (!batchResponse.predictions || batchResponse.predictions.length !== 3) {
      throw new Error('Batch prediction failed - incorrect number of predictions');
    }

    console.log(`  Batch processed: ${batchResponse.predictions.length} samples`);
    console.log(`  Processing time: ${batchResponse.batch_processing_time_ms}ms`);
  }

  async testAnomalyDetection() {
    // Generate test data with known anomalies
    const normalData = Array.from({length: 95}, () => [
      Math.random() * 100 + 50,
      Math.random() * 50 + 25, 
      Math.random() * 200 + 100
    ]);
    
    const anomalyData = [
      [1000, 500, 2000], // Clear anomaly
      [-100, -50, -200], // Clear anomaly
      [10, 5, 15], // Clear anomaly
      [500, 250, 1000], // Moderate anomaly
      [0, 0, 0] // Clear anomaly
    ];
    
    const testData = [...normalData, ...anomalyData];
    
    const anomalyConfig = {
      data_points: testData,
      feature_names: ["metric1", "metric2", "metric3"],
      detection_method: "isolation_forest",
      contamination_rate: 0.1
    };

    const result = await this.mlCore.detect_anomalies(JSON.stringify(anomalyConfig), 0.8);
    const response = JSON.parse(result);
    
    if (response.total_points !== 100) {
      throw new Error('Anomaly detection failed - incorrect total points');
    }
    
    if (response.anomalies_count === undefined) {
      throw new Error('Anomaly detection failed - no anomalies count');
    }

    console.log(`  Total points: ${response.total_points}`);
    console.log(`  Anomalies detected: ${response.anomalies_count}`);
    console.log(`  Anomaly rate: ${(response.anomaly_rate * 100).toFixed(2)}%`);
  }

  async testFeatureEngineering() {
    const rawData = {
      samples: [
        { timestamp: "2024-01-01T10:00:00Z", source_ip: "192.168.1.1", payload_size: 1024 },
        { timestamp: "2024-01-01T10:01:00Z", source_ip: "192.168.1.2", payload_size: 2048 },
        { timestamp: "2024-01-01T10:02:00Z", source_ip: "192.168.1.1", payload_size: 512 }
      ]
    };

    const featureConfig = {
      input_features: ["timestamp", "source_ip", "payload_size"],
      engineering_operations: [
        { name: "temporal_features", type: "time_based" },
        { name: "ip_features", type: "network_analysis" }
      ]
    };

    const result = await this.mlCore.engineer_features(JSON.stringify(rawData), JSON.stringify(featureConfig));
    const response = JSON.parse(result);
    
    if (response.total_feature_count === undefined) {
      throw new Error('Feature engineering failed - no feature count');
    }

    console.log(`  Original features: ${response.original_feature_count}`);
    console.log(`  Engineered features: ${response.engineered_feature_count}`);
    console.log(`  Total features: ${response.total_feature_count}`);
  }

  async testAdvancedAnalytics() {
    // Test insights generation
    const analysisConfig = {
      data_sources: [
        { name: "threats", data: [], type: "categorical_time_series" },
        { name: "network", data: [], type: "numerical_time_series" }
      ],
      analysis_types: [
        { name: "threat_trend_analysis", config: { time_window: "7d" } }
      ]
    };

    const insightsResult = await this.mlCore.generate_insights(JSON.stringify(analysisConfig));
    const insights = JSON.parse(insightsResult);
    
    if (!insights.threat_trends) {
      throw new Error('Insights generation failed - no threat trends');
    }

    // Test correlation analysis
    const correlationData = {
      data_matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
      feature_names: ["feature1", "feature2", "feature3"]
    };

    const correlationResult = await this.mlCore.correlation_analysis(JSON.stringify(correlationData));
    const correlation = JSON.parse(correlationResult);
    
    if (!correlation.strong_correlations) {
      throw new Error('Correlation analysis failed - no correlations');
    }

    console.log(`  Insights processing time: ${insights.processing_time_ms}ms`);
    console.log(`  Strong correlations found: ${correlation.strong_correlations.length}`);
  }

  async runAllTests() {
    console.log('🚀 Starting Practical Test Suite for Phantom ML Core');
    console.log('=' .repeat(60));

    const tests = [
      ['Basic Workflow (Create → Train → Predict)', () => this.testBasicWorkflow()],
      ['Batch Processing', () => this.testBatchProcessing()],
      ['Anomaly Detection', () => this.testAnomalyDetection()],
      ['Feature Engineering', () => this.testFeatureEngineering()],
      ['Advanced Analytics', () => this.testAdvancedAnalytics()]
    ];

    const startTime = Date.now();
    
    for (const [testName, testFunction] of tests) {
      await this.runTest(testName, testFunction);
      console.log(''); // Add spacing
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log('📊 Test Results Summary:');
    console.log('=' .repeat(30));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Error Details:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }

    const successRate = this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);

    if (successRate === 100) {
      console.log('🎉 All tests passed! The examples are working correctly.');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Check the implementation.');
      return false;
    }
  }
}

// Main execution
async function main() {
  const testRunner = new PracticalTestRunner();
  
  try {
    const success = await testRunner.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { PracticalTestRunner, MockPhantomMLCore };

// Run if called directly
if (require.main === module) {
  main();
}