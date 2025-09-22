# ML API Documentation

## Overview
This directory contains the refactored ML API for the Phantom ML Core, broken down into smaller, more manageable modules for better maintainability and code organization. The API provides comprehensive machine learning security analytics including threat detection, anomaly analysis, model training, and performance monitoring.

## File Structure

```
src/app/api/phantom-cores/ml/
├── route.ts                           # Main API route handler
├── types.ts                           # TypeScript interfaces and types
├── utils.ts                           # Utility functions and helpers
├── handlers/
│   ├── index.ts                      # Handler exports
│   ├── get-handlers.ts               # GET request handlers
│   └── post-handlers.ts              # POST request handlers
└── README.md                         # This file
```

## API Endpoints

### GET Operations

#### GET /api/phantom-cores/ml?operation=status
Returns comprehensive ML system status and operational metrics.

**Response:**
- System operational status and uptime
- Active model counts and accuracy metrics
- Predictions per second and anomaly detection rates
- Component status (model registry, training pipeline, prediction engine)
- Anomaly detection algorithms and performance metrics
- Feature engineering capabilities and store statistics

#### GET /api/phantom-cores/ml?operation=models
Returns ML model registry with deployed and training models.

**Response:**
- Total model count and model catalog
- Individual model details (ID, name, type, status)
- Model accuracy and version information
- Training timestamps and daily prediction counts
- Model deployment status and performance metrics

#### GET /api/phantom-cores/ml?operation=performance
Returns real-time ML system performance metrics.

**Response:**
- System resource usage (CPU, memory, GPU, disk, network)
- Model performance metrics (inference time, throughput, queue length)
- Training pipeline metrics (active jobs, queue status, completion rates)
- Error rates and system health indicators

### POST Operations

#### POST /api/phantom-cores/ml
Performs various ML operations based on the `operation` parameter.

**Operations:**

##### run-analysis
Executes ML-powered security analysis and threat detection.

**Request Body:**
```json
{
  "operation": "run-analysis",
  "mlData": {
    "model_type": "ensemble_methods"
  }
}
```

**Response:**
- ML analysis results with unique analysis ID
- ML model profile (name, algorithm, confidence scores)
- Security insights (threats detected, severity distribution)
- Anomaly detection results and behavioral patterns
- Security recommendations and actionable insights

##### train-model
Initiates ML model training with specified parameters.

**Request Body:**
```json
{
  "operation": "train-model",
  "trainingData": {
    "model_type": "threat_detection",
    "algorithm": "ensemble_methods",
    "validation_split": 0.2,
    "hyperparameter_tuning": true
  }
}
```

**Response:**
- Training job ID and configuration details
- Model configuration (type, algorithm, data size)
- Training progress tracking and estimated duration
- Resource allocation (CPU, memory, GPU, storage)
- Expected outcomes and deployment readiness timeline

##### detect-anomalies
Performs advanced anomaly detection across security data.

**Request Body:**
```json
{
  "operation": "detect-anomalies",
  "anomalyData": {
    "detection_algorithms": ["isolation_forest", "one_class_svm"],
    "sensitivity_level": "high",
    "time_window": "24_hours",
    "feature_selection": "automated"
  }
}
```

**Response:**
- Detection ID and configuration parameters
- Anomaly analysis results and data point statistics
- Anomaly categorization by type and severity
- Confidence distribution and detection rates
- Recommended actions for investigation and response

##### generate-ml-report
Generates comprehensive ML analytics and performance reports.

**Request Body:**
```json
{
  "operation": "generate-ml-report",
  "reportData": {
    "report_type": "ML Security Analytics Report",
    "time_period": "7_days"
  }
}
```

**Response:**
- Report generation confirmation with unique ID
- Executive summary with key performance metrics
- Detailed model performance and threat analysis
- Anomaly insights and investigation outcomes
- Strategic recommendations and download URL

## Architecture Components

### Types (`types.ts`)
Defines comprehensive TypeScript interfaces for:
- `MLStatus`: System status and operational metrics
- `ModelsData`: Model registry and deployment information
- `PerformanceData`: Real-time system and model performance
- `MLAnalysis`: Security analysis results and insights
- `ModelTraining`: Training job configuration and progress
- `AnomalyDetectionResult`: Anomaly analysis and categorization
- `MLReport`: Report generation and analytics data
- Request interfaces for all operations
- `ApiResponse`: Standardized API response format

### Utilities (`utils.ts`)
Provides comprehensive helper functions for:
- Standardized API response creation and error handling
- ID generation for analysis, training, detection, and reports
- Random data generation for realistic mock responses
- Performance metric calculations and system monitoring
- Common constants (algorithms, threat categories, recommendations)
- Data generation helpers for complex ML structures

### GET Handlers (`handlers/get-handlers.ts`)
Implements handlers for:
- `handleStatus()`: System status and component health
- `handleModels()`: Model registry and deployment status
- `handlePerformance()`: Real-time performance monitoring

### POST Handlers (`handlers/post-handlers.ts`)
Implements handlers for:
- `handleRunAnalysis()`: ML security analysis and threat detection
- `handleTrainModel()`: Model training job initialization
- `handleDetectAnomalies()`: Advanced anomaly detection
- `handleGenerateMLReport()`: Analytics report generation

## Key Features

### Machine Learning Security Analytics
- Advanced threat detection using ensemble methods
- Real-time security analysis with high confidence scoring
- Behavioral pattern recognition and anomaly identification
- Multi-algorithm approach for comprehensive coverage
- Continuous learning and model adaptation capabilities

### Anomaly Detection and Analysis
- Multi-algorithm anomaly detection (Isolation Forest, One-Class SVM, Autoencoders)
- Configurable sensitivity levels and time windows
- Automated feature selection and engineering
- Confidence-based categorization and prioritization
- Investigation workflow integration and response recommendations

### Model Training and Management
- Automated model training pipeline with hyperparameter tuning
- Resource allocation and optimization for training jobs
- Model versioning and deployment management
- Performance tracking and accuracy monitoring
- Real-time training progress and status updates

### Performance Monitoring and Analytics
- Real-time system resource monitoring (CPU, GPU, memory, network)
- Model performance tracking (inference time, throughput, accuracy)
- Training pipeline monitoring (job queues, completion rates)
- Comprehensive analytics and reporting capabilities
- Alert generation for performance degradation

### Threat Intelligence Integration
- Advanced threat categorization and severity assessment
- Behavioral pattern analysis and user activity monitoring
- Security insights generation with actionable recommendations
- Integration with security operations workflows
- Continuous threat landscape adaptation and learning

## Benefits of Refactoring

1. **Modularity**: Each handler focuses on specific ML operations
2. **Maintainability**: Changes to individual operations don't affect others
3. **Type Safety**: Centralized type definitions ensure API consistency
4. **Code Organization**: Related functionality is logically grouped
5. **Testing**: Individual handlers can be unit tested in isolation
6. **Reusability**: Utility functions can be shared across handlers
7. **Error Handling**: Consistent error handling and logging
8. **Scalability**: Easy to add new algorithms and extend functionality

## Usage Examples

### Getting System Status
```javascript
const response = await fetch('/api/phantom-cores/ml?operation=status');
const data = await response.json();
console.log('ML system status:', data.data.status);
console.log('Active models:', data.data.metrics.active_models);
```

### Model Registry
```javascript
const response = await fetch('/api/phantom-cores/ml?operation=models');
const data = await response.json();
console.log('Available models:', data.data.models);
```

### Performance Monitoring
```javascript
const response = await fetch('/api/phantom-cores/ml?operation=performance');
const data = await response.json();
console.log('System performance:', data.data.system_performance);
console.log('Model performance:', data.data.model_performance);
```

### Security Analysis
```javascript
const response = await fetch('/api/phantom-cores/ml', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'run-analysis',
    mlData: {
      model_type: 'ensemble_methods'
    }
  })
});
const analysis = await response.json();
console.log('ML analysis:', analysis.data);
```

### Model Training
```javascript
const response = await fetch('/api/phantom-cores/ml', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'train-model',
    trainingData: {
      model_type: 'threat_detection',
      algorithm: 'ensemble_methods',
      validation_split: 0.2,
      hyperparameter_tuning: true
    }
  })
});
const training = await response.json();
console.log('Training job:', training.data);
```

### Anomaly Detection
```javascript
const response = await fetch('/api/phantom-cores/ml', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'detect-anomalies',
    anomalyData: {
      detection_algorithms: ['isolation_forest', 'one_class_svm'],
      sensitivity_level: 'high',
      time_window: '24_hours',
      feature_selection: 'automated'
    }
  })
});
const detection = await response.json();
console.log('Anomaly detection:', detection.data);
```

### Report Generation
```javascript
const response = await fetch('/api/phantom-cores/ml', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'generate-ml-report',
    reportData: {
      report_type: 'ML Security Analytics Report',
      time_period: '7_days'
    }
  })
});
const report = await response.json();
console.log('ML report:', report.data);
```

## Machine Learning Algorithms and Models

### Classification Algorithms
- **Ensemble Methods**: Combined multiple algorithms for improved accuracy
- **Random Forest**: Tree-based ensemble for robust classification
- **Gradient Boosting**: Sequential learning for high-precision detection
- **Support Vector Machines**: Effective for high-dimensional security data
- **Neural Networks**: Deep learning for complex pattern recognition

### Anomaly Detection Algorithms
- **Isolation Forest**: Efficient anomaly detection in large datasets
- **One-Class SVM**: Boundary-based anomaly identification
- **Autoencoders**: Neural network-based reconstruction for anomalies
- **Local Outlier Factor**: Density-based local anomaly detection
- **Elliptic Envelope**: Gaussian distribution-based outlier detection

### Time Series and Sequential Models
- **LSTM Networks**: Long short-term memory for temporal patterns
- **Transformers**: Attention-based models for sequence analysis
- **Time Series Forecasting**: Predictive analytics for security trends
- **Sequential Pattern Mining**: Discovery of attack sequences
- **Behavioral Modeling**: User and entity behavior analysis

## Security Use Cases and Applications

### Threat Detection and Classification
- **Malware Detection**: Binary and multi-class malware classification
- **Phishing Detection**: Email and web-based phishing identification
- **Insider Threat Detection**: Behavioral analysis for insider threats
- **Advanced Persistent Threat (APT)**: Long-term campaign detection
- **Zero-Day Exploit Detection**: Novel attack pattern identification

### Anomaly Detection Applications
- **Network Behavior Analysis**: Unusual traffic pattern detection
- **User Activity Monitoring**: Abnormal user behavior identification
- **System Performance Anomalies**: Infrastructure health monitoring
- **Data Access Patterns**: Unauthorized data access detection
- **Application Behavior**: Abnormal application usage patterns

### Behavioral Analytics
- **User Entity Behavior Analytics (UEBA)**: User risk scoring
- **Network Traffic Analysis**: Communication pattern analysis
- **Endpoint Behavior Monitoring**: Host-based activity analysis
- **Privilege Usage Analysis**: Administrative action monitoring
- **Resource Access Patterns**: Asset utilization analysis

## Performance Metrics and KPIs

### Model Performance Indicators
- **Accuracy**: Overall correctness of predictions
- **Precision**: True positive rate for threat detection
- **Recall**: Coverage of actual threats detected
- **F1-Score**: Balanced measure of precision and recall
- **False Positive Rate**: Incorrect threat classifications
- **False Negative Rate**: Missed threat detections

### System Performance Metrics
- **Inference Latency**: Time to generate predictions
- **Throughput**: Predictions processed per second
- **Resource Utilization**: CPU, GPU, memory, and network usage
- **Queue Length**: Pending analysis requests
- **System Uptime**: Operational availability percentage

### Anomaly Detection Metrics
- **Detection Rate**: Percentage of anomalies identified
- **Confidence Distribution**: High, medium, low confidence levels
- **Investigation Outcomes**: Confirmed threats vs. false positives
- **Response Time**: Time from detection to investigation
- **Coverage**: Percentage of data sources monitored

## Implementation Best Practices

### Model Training and Management
1. **Data Quality**: Ensure high-quality, representative training data
2. **Feature Engineering**: Implement automated feature selection and engineering
3. **Model Validation**: Use cross-validation and holdout testing
4. **Hyperparameter Tuning**: Optimize model parameters for best performance
5. **Version Control**: Maintain model versioning and rollback capabilities

### Anomaly Detection Configuration
1. **Sensitivity Tuning**: Balance detection rate with false positive rate
2. **Algorithm Selection**: Choose appropriate algorithms for data types
3. **Threshold Management**: Regularly update detection thresholds
4. **Baseline Establishment**: Maintain current normal behavior baselines
5. **Continuous Learning**: Implement feedback loops for model improvement

### Performance Optimization
1. **Resource Allocation**: Optimize compute resources for training and inference
2. **Batch Processing**: Implement efficient batch processing for large datasets
3. **Caching**: Cache frequently accessed models and features
4. **Load Balancing**: Distribute processing across available resources
5. **Monitoring**: Implement comprehensive performance monitoring

### Security Integration
1. **SIEM Integration**: Connect ML insights to security information systems
2. **Incident Response**: Integrate with existing incident response workflows
3. **Threat Intelligence**: Incorporate external threat intelligence feeds
4. **Alert Management**: Implement intelligent alert prioritization
5. **Forensic Support**: Provide detailed analysis for investigation

## Deployment and Operations

### Development Environment Setup
1. **Dependencies**: Install required ML libraries (scikit-learn, TensorFlow, PyTorch)
2. **Data Sources**: Configure access to security data sources
3. **Computing Resources**: Set up GPU resources for training
4. **Model Storage**: Configure model registry and storage
5. **Monitoring**: Set up performance and health monitoring

### Production Deployment
1. **Scalability**: Design for horizontal scaling across multiple nodes
2. **High Availability**: Implement redundancy and failover capabilities
3. **Security**: Secure model artifacts and API endpoints
4. **Compliance**: Ensure regulatory compliance for data handling
5. **Disaster Recovery**: Implement backup and recovery procedures

### Monitoring and Maintenance
1. **Model Drift Detection**: Monitor for changes in data patterns
2. **Performance Degradation**: Track model accuracy over time
3. **Resource Monitoring**: Monitor system resource usage and capacity
4. **Alert Management**: Set up alerts for system issues
5. **Regular Updates**: Schedule regular model retraining and updates

All operations maintain comprehensive audit trails and provide detailed documentation suitable for security analysis, threat detection, and compliance requirements in cybersecurity operations powered by advanced machine learning capabilities.
