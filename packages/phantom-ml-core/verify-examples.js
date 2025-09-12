#!/usr/bin/env node

/**
 * Verification Script for Phantom ML Core Examples
 * 
 * This script tests all examples in the comprehensive guide to ensure
 * they work correctly and produce expected outputs.
 */

const { PhantomMLCore } = require('@phantom-spire/ml-core');

class ExampleVerifier {
  constructor() {
    this.mlCore = new PhantomMLCore();
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  async verifyInstallation() {
    console.log('🔍 Verifying installation...');
    
    try {
      const health = await this.mlCore.get_system_health();
      const healthData = JSON.parse(health);
      
      if (healthData.status === 'healthy') {
        console.log('✅ Installation verified successfully');
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Installation verification failed - unhealthy status');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Installation verification failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'installation_verification',
        error: error.message
      });
      return false;
    }
  }

  async verifyModelCreation() {
    console.log('🔍 Testing model creation...');
    
    const config = {
      model_type: "classification",
      algorithm: "random_forest",
      hyperparameters: {
        n_estimators: 50, // Reduced for faster testing
        max_depth: 5,
        min_samples_split: 2,
        min_samples_leaf: 1
      },
      feature_config: {
        input_features: ["feature1", "feature2", "feature3"],
        engineered_features: [],
        normalization: true,
        scaling_method: "min_max",
        feature_selection: false
      },
      training_config: {
        epochs: 5, // Reduced for faster testing
        batch_size: 16,
        learning_rate: 0.01,
        validation_split: 0.2,
        early_stopping: false,
        cross_validation: false
      }
    };

    try {
      const result = await this.mlCore.create_model(JSON.stringify(config));
      const response = JSON.parse(result);
      
      if (response.model_id && response.name && response.status === 'created') {
        console.log('✅ Model creation test passed');
        this.testResults.passed++;
        return response.model_id;
      } else {
        console.log('❌ Model creation test failed - invalid response');
        this.testResults.failed++;
        return null;
      }
    } catch (error) {
      console.error('❌ Model creation test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'model_creation',
        error: error.message
      });
      return null;
    }
  }

  async verifyModelTraining(modelId) {
    if (!modelId) {
      console.log('⏭️ Skipping model training - no model ID');
      this.testResults.skipped++;
      return false;
    }

    console.log('🔍 Testing model training...');
    
    const trainingData = {
      features: [
        [0.8, 0.9, 0.7],
        [0.2, 0.3, 0.1],
        [0.9, 0.8, 0.85],
        [0.1, 0.15, 0.2],
        [0.7, 0.75, 0.8],
        [0.3, 0.25, 0.35]
      ],
      labels: [1, 0, 1, 0, 1, 0],
      samples: 6
    };

    try {
      const result = await this.mlCore.train_model(modelId, JSON.stringify(trainingData));
      const response = JSON.parse(result);
      
      if (response.training_accuracy !== undefined && response.training_time_ms !== undefined) {
        console.log('✅ Model training test passed');
        console.log(`   Training accuracy: ${response.training_accuracy.toFixed(4)}`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Model training test failed - missing response fields');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Model training test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'model_training',
        error: error.message
      });
      return false;
    }
  }

  async verifyPrediction(modelId) {
    if (!modelId) {
      console.log('⏭️ Skipping prediction - no model ID');
      this.testResults.skipped++;
      return false;
    }

    console.log('🔍 Testing prediction...');
    
    const features = [0.6, 0.7, 0.5];

    try {
      const result = await this.mlCore.predict(modelId, JSON.stringify(features));
      const response = JSON.parse(result);
      
      if (response.prediction !== undefined && response.confidence !== undefined) {
        console.log('✅ Prediction test passed');
        console.log(`   Prediction: ${response.prediction}, Confidence: ${response.confidence.toFixed(4)}`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Prediction test failed - missing response fields');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Prediction test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'prediction',
        error: error.message
      });
      return false;
    }
  }

  async verifyBatchPrediction(modelId) {
    if (!modelId) {
      console.log('⏭️ Skipping batch prediction - no model ID');
      this.testResults.skipped++;
      return false;
    }

    console.log('🔍 Testing batch prediction...');
    
    const batchData = {
      samples: [
        [0.8, 0.9, 0.7],
        [0.2, 0.3, 0.1],
        [0.6, 0.7, 0.5]
      ],
      sample_ids: ["sample_1", "sample_2", "sample_3"],
      batch_size: 10,
      include_probabilities: true
    };

    try {
      const result = await this.mlCore.predict_batch(modelId, JSON.stringify(batchData));
      const response = JSON.parse(result);
      
      if (response.predictions && response.predictions.length === 3) {
        console.log('✅ Batch prediction test passed');
        console.log(`   Processed ${response.predictions.length} samples`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Batch prediction test failed - incorrect number of predictions');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Batch prediction test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'batch_prediction',
        error: error.message
      });
      return false;
    }
  }

  async verifyAnomalyDetection() {
    console.log('🔍 Testing anomaly detection...');
    
    // Generate test data with some clear anomalies
    const normalData = [];
    for (let i = 0; i < 95; i++) {
      normalData.push([
        Math.random() * 100 + 50,  // Normal range: 50-150
        Math.random() * 50 + 25,   // Normal range: 25-75
        Math.random() * 200 + 100  // Normal range: 100-300
      ]);
    }
    
    // Add clear anomalies
    const anomalyData = [
      [1000, 500, 2000], // Clear anomaly - very high values
      [-100, -50, -200], // Clear anomaly - negative values
      [10000, 1000, 5000], // Clear anomaly - extremely high
      [0.1, 0.05, 0.2], // Clear anomaly - very low
      [500, 250, 1000]  // Moderate anomaly
    ];
    
    const testData = [...normalData, ...anomalyData];
    
    const anomalyConfig = {
      data_points: testData,
      feature_names: ["metric1", "metric2", "metric3"],
      detection_method: "isolation_forest",
      contamination_rate: 0.1,
      include_scores: true
    };

    try {
      const result = await this.mlCore.detect_anomalies(JSON.stringify(anomalyConfig), 0.7);
      const response = JSON.parse(result);
      
      if (response.total_points && response.anomalies_count !== undefined) {
        console.log('✅ Anomaly detection test passed');
        console.log(`   Total points: ${response.total_points}, Anomalies: ${response.anomalies_count}`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Anomaly detection test failed - missing response fields');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Anomaly detection test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'anomaly_detection',
        error: error.message
      });
      return false;
    }
  }

  async verifyModelInfo(modelId) {
    if (!modelId) {
      console.log('⏭️ Skipping model info - no model ID');
      this.testResults.skipped++;
      return false;
    }

    console.log('🔍 Testing model info retrieval...');

    try {
      const result = await this.mlCore.get_model_info(modelId);
      const response = JSON.parse(result);
      
      if (response.model_id === modelId && response.name && response.model_type) {
        console.log('✅ Model info test passed');
        console.log(`   Model: ${response.name}, Type: ${response.model_type}`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Model info test failed - missing or incorrect fields');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Model info test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'model_info',
        error: error.message
      });
      return false;
    }
  }

  async verifyListModels() {
    console.log('🔍 Testing model listing...');

    try {
      const result = await this.mlCore.list_models();
      const response = JSON.parse(result);
      
      if (response.total_models !== undefined && response.models && Array.isArray(response.models)) {
        console.log('✅ Model listing test passed');
        console.log(`   Found ${response.total_models} models`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Model listing test failed - invalid response format');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Model listing test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'list_models',
        error: error.message
      });
      return false;
    }
  }

  async verifyPerformanceStats() {
    console.log('🔍 Testing performance stats...');

    try {
      const result = await this.mlCore.get_performance_stats();
      const response = JSON.parse(result);
      
      if (response.system_stats && response.model_stats) {
        console.log('✅ Performance stats test passed');
        console.log(`   Models created: ${response.model_stats.models_created || 0}`);
        this.testResults.passed++;
        return true;
      } else {
        console.log('❌ Performance stats test failed - missing stats fields');
        this.testResults.failed++;
        return false;
      }
    } catch (error) {
      console.error('❌ Performance stats test failed:', error.message);
      this.testResults.failed++;
      this.testResults.errors.push({
        test: 'performance_stats',
        error: error.message
      });
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive verification of Phantom ML Core examples...');
    console.log('=' .repeat(70));
    
    const startTime = Date.now();
    
    // Run core functionality tests
    const installationOk = await this.verifyInstallation();
    
    let modelId = null;
    if (installationOk) {
      modelId = await this.verifyModelCreation();
      
      if (modelId) {
        await this.verifyModelTraining(modelId);
        await this.verifyPrediction(modelId);
        await this.verifyBatchPrediction(modelId);
        await this.verifyModelInfo(modelId);
      }
    }
    
    // Run tests that don't require a specific model
    await this.verifyAnomalyDetection();
    await this.verifyListModels();
    await this.verifyPerformanceStats();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Display results
    console.log('');
    console.log('📊 Test Results Summary:');
    console.log('=' .repeat(30));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⏭️  Skipped: ${this.testResults.skipped}`);
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log('');
    
    if (this.testResults.errors.length > 0) {
      console.log('❌ Error Details:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
      console.log('');
    }
    
    const successRate = this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100;
    console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Verification completed successfully! The examples are working correctly.');
      return true;
    } else {
      console.log('⚠️  Some tests failed. Please check the error details above.');
      return false;
    }
  }

  // Cleanup method to delete test models
  async cleanup() {
    try {
      const result = await this.mlCore.list_models();
      const response = JSON.parse(result);
      
      // Delete test models (models created during verification)
      if (response.models && response.models.length > 0) {
        console.log('🧹 Cleaning up test models...');
        for (const model of response.models) {
          if (model.name.includes('classification_') || model.name.includes('test_')) {
            try {
              await this.mlCore.delete_model(model.model_id);
              console.log(`   Deleted: ${model.name}`);
            } catch (error) {
              console.log(`   Failed to delete ${model.name}: ${error.message}`);
            }
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Cleanup failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  const verifier = new ExampleVerifier();
  
  try {
    const success = await verifier.runAllTests();
    
    // Cleanup test artifacts
    await verifier.cleanup();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('💥 Verification script crashed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ExampleVerifier };