# Phantom ML Core

Enterprise machine learning services for threat detection and security analytics.

## Overview

`phantom-ml-core` is a high-performance NAPI-rs package that provides comprehensive ML capabilities for the Phantom Spire security platform. It offers enterprise-grade machine learning services including model management, training, inference, feature engineering, and anomaly detection.

## Features

### 🤖 Model Management
- Create, train, and manage ML models
- Version control and model lifecycle management
- Performance monitoring and metrics tracking
- Model serialization and persistence

### 🔍 Advanced Analytics
- Real-time threat classification
- Behavioral anomaly detection
- Statistical analysis and pattern recognition
- Batch processing for high-throughput scenarios

### ⚡ High Performance
- NAPI-rs bindings for maximum performance
- Parallel processing with Rayon
- Memory-efficient implementations
- Asynchronous operations with Tokio

### 🛡️ Enterprise Ready
- Multi-tenant support
- Comprehensive logging and monitoring
- Configurable storage backends
- Production-grade error handling

## API Reference

### Core Services

#### `PhantomMLCore`
The main service class providing all ML functionality.

```javascript
const { PhantomMLCore } = require('@phantom-spire/ml-core');
const mlCore = new PhantomMLCore();
```

### Model Management

#### `create_model(config_json: string): Promise<string>`
Creates a new ML model with specified configuration.

```javascript
const config = {
  model_type: "classification",
  algorithm: "random_forest",
  hyperparameters: {},
  feature_config: {
    input_features: ["feature1", "feature2"],
    engineered_features: [],
    normalization: true,
    scaling_method: "min_max",
    feature_selection: false
  },
  training_config: {
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.01,
    validation_split: 0.2,
    early_stopping: false,
    cross_validation: false
  }
};

const result = await mlCore.create_model(JSON.stringify(config));
const response = JSON.parse(result);
console.log("Model created:", response.model_id);
```

#### `train_model(model_id: string, training_data_json: string): Promise<string>`
Trains a model with provided training data.

```javascript
const trainingData = {
  features: [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]],
  labels: [0, 1, 1],
  samples: 1000,
  epochs: 10
};

const result = await mlCore.train_model(modelId, JSON.stringify(trainingData));
const trainingResult = JSON.parse(result);
console.log("Training accuracy:", trainingResult.training_accuracy);
```

### Inference and Prediction

#### `predict(model_id: string, features_json: string): Promise<string>`
Performs inference using a trained model.

```javascript
const features = [1.5, 2.3, 4.1, 0.8];
const result = await mlCore.predict(modelId, JSON.stringify(features));
const prediction = JSON.parse(result);

console.log("Prediction:", prediction.prediction);
console.log("Confidence:", prediction.confidence);
```

#### `predict_batch(model_id: string, batch_features_json: string): Promise<string>`
Performs batch inference for high-throughput processing.

```javascript
const batchFeatures = [
  [1.0, 2.0, 3.0],
  [4.0, 5.0, 6.0],
  [7.0, 8.0, 9.0]
];

const result = await mlCore.predict_batch(modelId, JSON.stringify(batchFeatures));
const batchResult = JSON.parse(result);

console.log("Total predictions:", batchResult.total_predictions);
console.log("Throughput:", batchResult.throughput_per_second, "predictions/sec");
```

### Anomaly Detection

#### `detect_anomalies(data_json: string, sensitivity: number): Promise<string>`
Advanced anomaly detection using statistical and ML approaches.

```javascript
const data = [1.0, 2.0, 3.0, 2.5, 2.8, 3.2, 100.0, 2.1, 2.9]; // 100.0 is anomaly
const sensitivity = 1.0; // Higher = more sensitive

const result = await mlCore.detect_anomalies(JSON.stringify(data), sensitivity);
const analysis = JSON.parse(result);

console.log("Anomalies detected:", analysis.anomalies_detected);
console.log("Risk level:", analysis.risk_level);
console.log("Anomaly details:", analysis.anomalies);
```

### Feature Engineering

#### `engineer_features(raw_data_json: string, feature_config_json: string): Promise<string>`
Advanced feature engineering and extraction.

```javascript
const rawData = {
  text: "This is a suspicious message with MALWARE and 192.168.1.1",
  numeric: [1.0, 2.0, 3.0, 4.0, 5.0],
  ip: "192.168.1.100"
};

const featureConfig = {
  input_features: ["text", "numeric", "ip"],
  engineered_features: [],
  normalization: true,
  scaling_method: "min_max",
  feature_selection: false
};

const result = await mlCore.engineer_features(
  JSON.stringify(rawData),
  JSON.stringify(featureConfig)
);

const features = JSON.parse(result);
console.log("Engineered features:", features.engineered_features);
console.log("Feature count:", features.feature_count);
```

### System Management

#### `list_models(): Promise<string>`
List all available models.

```javascript
const result = await mlCore.list_models();
const models = JSON.parse(result);
console.log("Total models:", models.total_models);
console.log("Active models:", models.active_models);
```

#### `get_performance_stats(): Promise<string>`
Get comprehensive performance statistics.

```javascript
const result = await mlCore.get_performance_stats();
const stats = JSON.parse(result);
console.log("Total inferences:", stats.total_inferences);
console.log("Average inference time:", stats.average_inference_time_ms, "ms");
```

#### `get_system_health(): Promise<string>`
Get system health and status information.

```javascript
const result = await mlCore.get_system_health();
const health = JSON.parse(result);
console.log("System health:", health.system_health);
console.log("Models loaded:", health.models_loaded);
```

## Configuration

### Model Types
- `classification` - Binary or multi-class classification
- `regression` - Continuous value prediction
- `anomaly_detection` - Outlier and anomaly detection
- `clustering` - Unsupervised grouping

### Algorithms
- `random_forest` - Ensemble decision trees
- `logistic_regression` - Linear classification
- `neural_network` - Deep learning models
- `isolation_forest` - Anomaly detection
- `kmeans` - Clustering algorithm

### Feature Scaling Methods
- `min_max` - Min-max normalization
- `z_score` - Z-score standardization
- `robust` - Robust scaling
- `unit_vector` - Unit vector scaling

## Integration Examples

### Threat Detection Pipeline

```javascript
const { PhantomMLCore } = require('@phantom-spire/ml-core');

class ThreatDetectionPipeline {
  constructor() {
    this.mlCore = new PhantomMLCore();
    this.modelId = null;
  }

  async initialize() {
    // Create threat detection model
    const config = {
      model_type: "classification",
      algorithm: "random_forest",
      hyperparameters: {
        n_estimators: 100,
        max_depth: 10
      },
      feature_config: {
        input_features: ["ip_reputation", "domain_age", "request_frequency"],
        normalization: true,
        scaling_method: "min_max"
      }
    };

    const result = await this.mlCore.create_model(JSON.stringify(config));
    const response = JSON.parse(result);
    this.modelId = response.model_id;
  }

  async trainModel(trainingData) {
    const result = await this.mlCore.train_model(this.modelId, JSON.stringify(trainingData));
    return JSON.parse(result);
  }

  async detectThreat(networkEvent) {
    // Engineer features from raw network event
    const featureConfig = {
      input_features: ["source_ip", "destination", "payload"],
      normalization: true
    };

    const featuresResult = await this.mlCore.engineer_features(
      JSON.stringify(networkEvent),
      JSON.stringify(featureConfig)
    );

    const features = JSON.parse(featuresResult);
    
    // Classify threat
    const predictionResult = await this.mlCore.predict(
      this.modelId,
      JSON.stringify(features.engineered_features)
    );

    return JSON.parse(predictionResult);
  }
}

// Usage
const pipeline = new ThreatDetectionPipeline();
await pipeline.initialize();

const networkEvent = {
  source_ip: "192.168.1.100",
  destination: "malicious-domain.com",
  payload: "GET /admin HTTP/1.1"
};

const threatAssessment = await pipeline.detectThreat(networkEvent);
console.log("Threat detected:", threatAssessment.prediction);
console.log("Confidence:", threatAssessment.confidence);
```

### Behavioral Anomaly Detection

```javascript
async function detectBehavioralAnomalies(userActivity) {
  const mlCore = new PhantomMLCore();
  
  // Extract behavioral metrics
  const behaviorData = [
    userActivity.loginFrequency,
    userActivity.dataAccessed,
    userActivity.privilegedActions,
    userActivity.offHoursActivity,
    userActivity.locationChanges
  ];

  const result = await mlCore.detect_anomalies(
    JSON.stringify(behaviorData),
    0.8 // High sensitivity
  );

  const analysis = JSON.parse(result);
  
  if (analysis.risk_level === "high") {
    console.log("⚠️ High-risk behavior detected!");
    console.log("Anomalies:", analysis.anomalies);
    // Trigger security response
  }

  return analysis;
}
```

## Performance Characteristics

### Throughput
- **Single Inference**: ~1-5ms average latency
- **Batch Processing**: 1000+ predictions/second
- **Feature Engineering**: 500+ transformations/second
- **Anomaly Detection**: 200+ analyses/second

### Memory Usage
- **Base Memory**: ~50MB per model
- **Cache Overhead**: ~10MB per 1000 cached predictions
- **Peak Memory**: Scales linearly with batch size

### Scalability
- **Concurrent Models**: Up to 100 active models
- **Parallel Processing**: Automatic multi-core utilization
- **Memory Management**: Automatic garbage collection
- **Resource Limits**: Configurable memory and CPU limits

## Error Handling

All methods return JSON strings with error information when failures occur:

```javascript
try {
  const result = await mlCore.predict(modelId, features);
  const prediction = JSON.parse(result);
} catch (error) {
  console.error("ML operation failed:", error.message);
  // Handle error appropriately
}
```

## Monitoring and Observability

The package provides comprehensive metrics for monitoring:

```javascript
const stats = await mlCore.get_performance_stats();
const metrics = JSON.parse(stats);

// Key performance indicators
console.log("Inference latency:", metrics.average_inference_time_ms);
console.log("Training time:", metrics.average_training_time_ms);
console.log("Total operations:", metrics.total_inferences + metrics.total_trainings);
```

## Security Considerations

- All input data is validated and sanitized
- Model weights are stored securely in memory
- No sensitive data is logged by default
- Resource limits prevent DoS attacks
- All operations are auditable

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: [phantom-spire/issues](https://github.com/harborgrid-justin/phantom-spire/issues)
- Documentation: [docs.phantom-spire.com](https://docs.phantom-spire.com)
- Email: support@phantom-spire.com