# Hugging Face Model Integration Guide for Phantom ML Core

## Overview

Phantom ML Core provides seamless integration with Hugging Face models for advanced Cyber Threat Intelligence (CTI) applications. This guide shows how to use Hugging Face models within your existing ML pipeline.

## Quick Start

### 1. Install Dependencies

```bash
# For Node.js/TypeScript usage
npm install @huggingface/inference transformers

# For Rust (if using PyO3 bridge)
cargo add pyo3
```

### 2. Basic Usage Example

```typescript
import { MLCore } from 'phantom-ml-core';

async function quickStart() {
  const mlCore = await MLCore.new();

  // Create a Hugging Face model
  const model = await mlCore.createModel('nlp', {
    algorithm: 'BERT',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'nickmuchi/deberta-v3-base-finetuned-finance-text-classification',
      max_length: 512
    }
  });

  // Make predictions
  const result = await mlCore.predict(model.id, {
    text: "Company reports significant revenue decline due to cyber attack"
  });

  console.log('Prediction:', result.prediction);
  console.log('Confidence:', result.confidence);
}
```

## Model Types & Use Cases

### 1. Text Classification (Most Common for CTI)

**Use Cases:**
- Threat detection in logs
- Financial impact analysis
- Sentiment analysis of security reports
- Categorizing security incidents

```typescript
const textClassifier = await mlCore.createModel('nlp', {
  algorithm: 'BERT',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'microsoft/DialoGPT-medium',
    max_length: 512,
    num_labels: 5 // normal, warning, error, critical, attack
  }
});
```

### 2. Text Generation

**Use Cases:**
- Automated threat intelligence reports
- Incident response recommendations
- Security policy generation

```typescript
const textGenerator = await mlCore.createModel('nlp', {
  algorithm: 'GPT',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'microsoft/DialoGPT-medium',
    max_length: 1024,
    temperature: 0.7,
    do_sample: true
  }
});
```

### 3. Image Classification

**Use Cases:**
- Malware detection from screenshots
- Logo recognition in phishing emails
- Document classification

```typescript
const imageClassifier = await mlCore.createModel('computer_vision', {
  algorithm: 'ResNet',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'microsoft/resnet-50',
    image_size: 224,
    num_classes: 2 // benign, malicious
  }
});
```

## Advanced Integration Patterns

### 1. Model Chaining for Comprehensive Analysis

```typescript
// Chain multiple models for multi-stage analysis
async function comprehensiveThreatAnalysis(threatData: any) {
  // Step 1: Classify threat type
  const classification = await mlCore.predict(threatClassifier.id, threatData);

  // Step 2: Generate detailed report
  const report = await mlCore.predict(textGenerator.id, {
    prompt: `Generate a detailed threat intelligence report for: ${classification.prediction}`
  });

  // Step 3: Detect anomalies in the data
  const anomalyScore = await mlCore.detectAnomalies(anomalyDetector.id, threatData);

  return {
    classification: classification.prediction,
    report: report.prediction,
    risk_level: anomalyScore.is_anomaly ? 'high' : 'low'
  };
}
```

### 2. Batch Processing for High-Throughput CTI

```typescript
async function processSecurityLogs(logs: string[]) {
  const batchData = logs.map(log => ({ text: log }));

  const results = await mlCore.predictBatch(logClassifier.id, batchData);

  // Filter high-confidence threats
  const threats = results.filter(r => r.confidence > 0.8 && r.prediction === 'attack');

  return {
    total_logs: logs.length,
    threats_detected: threats.length,
    threat_percentage: (threats.length / logs.length) * 100
  };
}
```

### 3. Real-time Streaming Analysis

```typescript
async function setupStreamingAnalysis() {
  const streamingConfig = {
    model_id: threatClassifier.id,
    batch_size: 10,
    window_size: 100,
    alerting_threshold: 0.8
  };

  // This would integrate with your streaming pipeline
  console.log('Streaming analysis configured:', streamingConfig);
}
```

## Performance Optimization

### 1. GPU Acceleration

```typescript
const gpuModel = await mlCore.createModel('nlp', {
  algorithm: 'BERT',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'bert-base-uncased',
    use_gpu: true,
    fp16: true, // Mixed precision for 2x speedup
    gradient_checkpointing: true // Memory optimization
  }
});
```

### 2. Model Quantization

```typescript
const quantizedModel = await mlCore.createModel('nlp', {
  algorithm: 'BERT',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'bert-base-uncased',
    quantization: 'dynamic', // int8 quantization
    optimize_for_mobile: true
  }
});
```

### 3. ONNX Export for Cross-Platform

```typescript
const onnxConfig = {
  model_id: model.id,
  export_format: 'onnx',
  target_platform: 'cpu',
  optimization_level: 'O3'
};
```

## Security-Specific Configurations

### 1. Threat Detection Pipeline

```typescript
const threatDetectionPipeline = {
  models: {
    text_classifier: {
      model_name: 'nickmuchi/deberta-v3-base-finetuned-finance-text-classification',
      task: 'text-classification'
    },
    log_analyzer: {
      model_name: 'bert-base-uncased',
      task: 'text-classification',
      labels: ['normal', 'suspicious', 'malicious']
    },
    anomaly_detector: {
      algorithm: 'IsolationForest',
      contamination: 0.1
    }
  },
  thresholds: {
    confidence: 0.8,
    anomaly_score: 0.7
  }
};
```

### 2. Multi-Modal Analysis

```typescript
async function analyzeSecurityIncident(incident: SecurityIncident) {
  const results = await Promise.all([
    // Text analysis
    mlCore.predict(textModel.id, { text: incident.description }),

    // Log analysis
    mlCore.predict(logModel.id, { logs: incident.logs }),

    // Image analysis (if screenshots available)
    incident.screenshots ?
      mlCore.predict(imageModel.id, { images: incident.screenshots }) :
      Promise.resolve(null)
  ]);

  return {
    text_analysis: results[0],
    log_analysis: results[1],
    image_analysis: results[2],
    overall_risk: calculateOverallRisk(results)
  };
}
```

## Running the Examples

### 1. TypeScript/JavaScript Example

```bash
# Run the Hugging Face integration example
cd packages/phantom-ml-core
npx ts-node examples/huggingface-integration.ts
```

### 2. Rust Integration

```rust
// In your main.rs or lib.rs
mod huggingface_integration;

use huggingface_integration::HuggingFaceIntegration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let hf_integration = HuggingFaceIntegration::new();

    // Load a security model
    let config = HuggingFaceIntegration::create_security_model_config(
        "bert-base-uncased",
        HuggingFaceModelType::TextClassification
    );

    let model_id = hf_integration.load_model(config).await?;

    // Make predictions
    let input = serde_json::json!({"text": "Suspicious activity detected"});
    let prediction = hf_integration.predict(&model_id, input).await?;

    println!("Prediction: {:?}", prediction);

    Ok(())
}
```

## Best Practices

### 1. Model Selection
- Choose models fine-tuned for security/CTI tasks when available
- Consider model size vs. performance trade-offs
- Use quantized models for production deployments

### 2. Error Handling
```typescript
try {
  const result = await mlCore.predict(model.id, inputData);
  if (result.confidence < 0.5) {
    console.warn('Low confidence prediction, manual review recommended');
  }
} catch (error) {
  console.error('Model prediction failed:', error);
  // Fallback to rule-based system
}
```

### 3. Monitoring & Metrics
```typescript
// Track model performance
const stats = await mlCore.getPerformanceStats();
console.log('Model throughput:', stats.average_response_time);

// Monitor for model drift
const driftDetection = await mlCore.detectAnomalies(model.id, recentPredictions);
if (driftDetection.is_anomaly) {
  console.warn('Model drift detected, consider retraining');
}
```

### 4. Resource Management
```typescript
// Unload unused models to free memory
await mlCore.deleteModel(model.id);

// Use batch processing for efficiency
const batchResults = await mlCore.predictBatch(model.id, inputBatch);
```

## Integration with Existing CTI Workflow

```typescript
class CTIAnalyzer {
  private mlCore: MLCore;
  private models: Map<string, string>;

  async analyzeThreat(threatData: ThreatData): Promise<AnalysisResult> {
    // 1. Text classification
    const textResult = await this.classifyText(threatData.description);

    // 2. IOC analysis
    const iocResult = await this.analyzeIOCs(threatData.indicators);

    // 3. Behavioral analysis
    const behaviorResult = await this.analyzeBehavior(threatData.logs);

    // 4. Generate comprehensive report
    const report = await this.generateReport({
      text: textResult,
      iocs: iocResult,
      behavior: behaviorResult
    });

    return {
      threat_level: this.calculateThreatLevel([textResult, iocResult, behaviorResult]),
      analysis: { textResult, iocResult, behaviorResult },
      report,
      recommendations: this.generateRecommendations(report)
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **Model Loading Failures**
   - Check internet connection for model downloads
   - Verify model name exists on Hugging Face Hub
   - Ensure sufficient disk space

2. **Memory Issues**
   - Use quantized models for lower memory usage
   - Implement model unloading for unused models
   - Use batch processing instead of individual predictions

3. **Performance Issues**
   - Enable GPU acceleration if available
   - Use smaller batch sizes for memory-constrained systems
   - Consider model distillation for faster inference

4. **Authentication Issues**
   - Set `HF_TOKEN` environment variable for private models
   - Check token permissions for model access

This integration provides powerful AI capabilities for your CTI platform while maintaining the performance and reliability standards of enterprise systems.</content>