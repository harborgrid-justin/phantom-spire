# Phantom ML Core - Hugging Face Integration Examples

This directory contains examples demonstrating how to use Hugging Face models within the Phantom ML Core system for Cyber Threat Intelligence (CTI) applications.

## Files Overview

### `huggingface-integration.ts`
Comprehensive TypeScript example showing:
- Financial text classification for CTI
- Threat intelligence analysis
- Security log analysis
- Malware detection using image classification
- Advanced integration patterns
- Performance optimizations

### `run-huggingface-demo.js`
Simple Node.js script demonstrating:
- Basic model loading and usage
- Security log classification
- Threat intelligence analysis
- Batch processing
- Performance monitoring

### `src/huggingface_integration.rs`
Rust-side integration showing:
- Hugging Face model management
- Prediction pipelines
- Security-specific configurations
- Performance optimizations

## Prerequisites

1. **Build the native addon first:**
   ```bash
   cd packages/phantom-ml-core
   npm run build:native
   npm run build
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Hugging Face authentication (optional but recommended):**
   ```bash
   export HF_TOKEN=your_huggingface_token
   ```

## Running the Examples

### 1. TypeScript Example
```bash
# Run the comprehensive TypeScript example
npx ts-node examples/huggingface-integration.ts
```

### 2. Node.js Demo Script
```bash
# Run the simple demo script
node examples/run-huggingface-demo.js
```

### 3. Rust Integration
```rust
// Add to your main.rs
mod huggingface_integration;
use huggingface_integration::HuggingFaceIntegration;

// Use the integration
let hf_integration = HuggingFaceIntegration::new();
let config = HuggingFaceIntegration::create_security_model_config(
    "bert-base-uncased",
    HuggingFaceModelType::TextClassification
);
let model_id = hf_integration.load_model(config).await?;
```

## Example Use Cases

### Security Log Analysis
```typescript
const logModel = await mlCore.createModel('nlp', {
  algorithm: 'BERT',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'bert-base-uncased',
    max_length: 512
  }
});

const result = await mlCore.predict(logModel.id, {
  log_entry: "CRITICAL: Unauthorized access from IP 192.168.1.100"
});
```

### Threat Intelligence Classification
```typescript
const threatModel = await mlCore.createModel('nlp', {
  algorithm: 'Transformer',
  framework: 'HuggingFace',
  hyperparameters: {
    model_name: 'nickmuchi/deberta-v3-base-finetuned-finance-text-classification'
  }
});

const analysis = await mlCore.predict(threatModel.id, {
  text: "Company reports significant data breach affecting customer records"
});
```

### Batch Processing for High-Throughput
```typescript
const batchData = securityLogs.map(log => ({ log_entry: log }));
const results = await mlCore.predictBatch(model.id, batchData);
```

## Performance Tips

1. **Use GPU acceleration:**
   ```typescript
   hyperparameters: { use_gpu: true, fp16: true }
   ```

2. **Enable quantization for production:**
   ```typescript
   hyperparameters: { quantization: 'dynamic' }
   ```

3. **Use batch processing:**
   ```typescript
   const results = await mlCore.predictBatch(model.id, inputBatch);
   ```

4. **Monitor performance:**
   ```typescript
   const stats = await mlCore.getPerformanceStats();
   ```

## Integration with CTI Workflow

```typescript
class CTIAnalyzer {
  async analyzeThreat(threatData: ThreatData) {
    // 1. Classify threat type
    const classification = await this.classifyThreat(threatData.description);

    // 2. Analyze indicators
    const iocAnalysis = await this.analyzeIOCs(threatData.indicators);

    // 3. Generate report
    const report = await this.generateReport(classification, iocAnalysis);

    return {
      threat_level: this.calculateRiskLevel(classification, iocAnalysis),
      report,
      recommendations: this.generateRecommendations(report)
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **Model loading fails:**
   - Check internet connection
   - Verify model name exists on Hugging Face Hub
   - Ensure sufficient disk space

2. **Memory issues:**
   - Use quantized models
   - Reduce batch size
   - Enable gradient checkpointing

3. **Performance issues:**
   - Enable GPU acceleration
   - Use smaller models for real-time processing
   - Implement model caching

4. **Authentication issues:**
   - Set `HF_TOKEN` environment variable
   - Check token permissions

## Next Steps

1. **Explore different models** from the Hugging Face Hub
2. **Fine-tune models** on your specific CTI datasets
3. **Implement model versioning** and A/B testing
4. **Add monitoring and alerting** for model performance
5. **Deploy to production** with proper scaling and optimization

For more detailed information, see the main integration guide at `docs/HUGGINGFACE_INTEGRATION.md`.