# Phantom ML Core API Documentation

## Overview

The `@phantom-spire/ml-core` extension provides a comprehensive machine learning platform with enterprise-grade security features, AutoML capabilities, HuggingFace integration, and high-performance SIMD operations.

## Installation and Setup

```javascript
const phantomML = require('@phantom-spire/ml-core');
```

## API Categories

### 1. Core System Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getBuildInfo()` | Get build information | None | Build details object |
| `getVersion()` | Get version information | None | Version string |
| `getSystemInfo()` | Get system information | None | System details object |
| `healthCheck()` | System health check | None | Health status object |
| `testNapi()` | Test NAPI functionality | None | Test result |

### 2. PhantomMLCore Class

```javascript
const core = new phantomML.PhantomMLCore();
```

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `initialize()` | Initialize the core instance | None | Void |
| `isInitialized()` | Check initialization status | None | Boolean |
| `getVersion()` | Get core version | None | Version string |

### 3. Model Management

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `listAllModels()` | List all available models | None | JSON string with models array |
| `loadHuggingfaceModel(config)` | Load HuggingFace model | Model config object | Model ID |
| `trainSimpleModel(config)` | Train simple model | Training config | Model details |
| `deleteModel(modelId)` | Delete a model | Model ID string | Success status |
| `exportModel(modelId, format)` | Export model | Model ID, format | Export details |
| `getModelDetails(modelId)` | Get model details | Model ID string | Model info object |

### 4. Data Processing

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `loadDataframeCsv(filepath)` | Load CSV into dataframe | File path string | Dataframe ID |
| `preprocessDataframe(dfId, config)` | Preprocess dataframe | Dataframe ID, config | Processing result |
| `getDataframeInfo(dfId)` | Get dataframe information | Dataframe ID | DataFrame details |

### 5. Machine Learning Operations

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `predictSimple(modelId, data)` | Simple prediction | Model ID, input data | Prediction result |
| `classifyText(text, type)` | Text classification | Text string, type | Classification result |
| `extractTextFeatures(text)` | Extract text features | Text string | Feature vector |
| `generateText(prompt, maxLength)` | Generate text | Prompt, max length | Generated text |
| `runAutomlExperiment(config)` | Run AutoML experiment | AutoML config | Experiment ID |
| `getAutomlLeaderboard()` | Get AutoML leaderboard | None | Leaderboard data |

### 6. Performance & Analytics

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getPerformanceHistory(hours)` | Get performance history | Hours back | Performance data |
| `getRealtimeAnalytics()` | Get real-time analytics | None | Current metrics |
| `generateMlReport(type)` | Generate ML report | Report type | Report data |

### 7. Security & Enterprise

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `initEnterpriseSecurity(config)` | Initialize enterprise security | Security config | Initialization status |
| `validateModelConfigSecure(config)` | Validate model config securely | Model config | Validation result |
| `getSecurityAuditLog(limit)` | Get security audit log | Entry limit | Audit log entries |
| `checkRateLimit(userId, operation)` | Check rate limits | User ID, operation | Rate limit status |

### 8. System Capabilities

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getApiCapabilities()` | Get API capabilities | None | Capabilities object |
| `getSimdCapabilities()` | Get SIMD capabilities | None | SIMD features |
| `createSimdBuffer(size, alignment)` | Create SIMD buffer | Size, alignment | Buffer ID |
| `performSimdOperations(operation, data)` | Perform SIMD operations | Operation type, data | Result array |

## Usage Examples

### Basic Setup and Health Check

```javascript
const phantomML = require('@phantom-spire/ml-core');

// Check system health
const health = JSON.parse(phantomML.healthCheck());
console.log('System status:', health.status);

// Get API capabilities
const capabilities = JSON.parse(phantomML.getApiCapabilities());
console.log('Available features:', capabilities.features);
```

### Model Training and Prediction

```javascript
// Train a simple model
const modelConfig = {
    modelType: 'random_forest',
    parameters: JSON.stringify({
        n_estimators: 100,
        max_depth: 10
    })
};

const trainingResult = phantomML.trainSimpleModel(modelConfig);
const training = JSON.parse(trainingResult);
console.log('Model trained:', training.model_id);

// Make predictions
const prediction = phantomML.predictSimple(training.model_id, [1.5, 2.3, 3.1]);
const result = JSON.parse(prediction);
console.log('Prediction:', result.prediction);
```

### Text Processing with HuggingFace

```javascript
// Load a HuggingFace model
const hfConfig = {
    modelName: 'bert-base-uncased',
    modelType: 'classification',
    useGpu: false
};

const modelId = phantomML.loadHuggingfaceModel(hfConfig);

// Classify text
const classification = phantomML.classifyText('This is amazing!', 'sentiment');
console.log('Classification:', JSON.parse(classification));

// Extract features
const features = phantomML.extractTextFeatures('Machine learning is powerful');
console.log('Features:', JSON.parse(features));
```

### Data Processing

```javascript
// Load CSV data
const dataframe = phantomML.loadDataframeCsv('./data.csv');
const dfInfo = JSON.parse(dataframe);

// Get dataframe information
const info = phantomML.getDataframeInfo(dfInfo.dataframe_id);
console.log('DataFrame info:', JSON.parse(info));

// Preprocess data
const preprocessed = phantomML.preprocessDataframe(
    dfInfo.dataframe_id,
    JSON.stringify(['normalize', 'remove_outliers'])
);
```

### AutoML Experiment

```javascript
// Configure AutoML experiment
const automlConfig = {
    taskType: 'binary_classification',
    targetColumn: 'target',
    optimizationMetric: 'accuracy',
    timeBudgetMinutes: 30,
    maxModels: 10
};

// Run experiment
const experiment = phantomML.runAutomlExperiment(automlConfig, './training_data.csv');
const expResult = JSON.parse(experiment);

// Get leaderboard
const leaderboard = phantomML.getAutomlLeaderboard(expResult.experiment_id);
console.log('Best models:', JSON.parse(leaderboard));
```

### Security and Monitoring

```javascript
// Initialize enterprise security
const securityConfig = JSON.stringify({
    rateLimit: { requestsPerMinute: 1000 },
    validation: { strictMode: true }
});

phantomML.initEnterpriseSecurity(securityConfig);

// Check rate limits
const rateLimitOk = phantomML.checkRateLimit('user123', 'prediction');
console.log('Rate limit OK:', rateLimitOk);

// Get audit logs
const auditLog = phantomML.getSecurityAuditLog(10);
console.log('Recent activity:', JSON.parse(auditLog));

// Monitor performance
const analytics = phantomML.getRealtimeAnalytics();
console.log('Current metrics:', JSON.parse(analytics));
```

### SIMD Operations for High Performance

```javascript
// Check SIMD capabilities
const simdCaps = JSON.parse(phantomML.getSimdCapabilities());
console.log('SIMD support:', simdCaps);

// Create SIMD buffer
const buffer = phantomML.createSimdBuffer(1024, 32);
const bufferInfo = JSON.parse(buffer);

// Perform vectorized operations
const data = [1.0, 2.0, 3.0, 4.0, 5.0];
const result = phantomML.performSimdOperations('multiply', data);
console.log('SIMD result:', result);
```

## Error Handling

All functions may throw exceptions. Wrap calls in try-catch blocks:

```javascript
try {
    const result = phantomML.someFunction();
    // Process result
} catch (error) {
    console.error('Operation failed:', error.message);
}
```

## Performance Considerations

- Use SIMD operations for large numerical computations
- Monitor rate limits for enterprise deployments
- Cache model loading for repeated use
- Use AutoML for optimal model selection

## Security Features

- Enterprise-grade rate limiting
- Model configuration validation
- Comprehensive audit logging
- Secure model deployment

This API provides a complete machine learning platform suitable for enterprise applications with strong security, performance, and scalability features.