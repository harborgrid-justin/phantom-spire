// phantom-ml-core/examples/huggingface-integration.ts
// Example: Using Hugging Face models in Phantom ML Core for CTI

import { MLCore } from '../src-ts/index.js';

async function demonstrateHuggingFaceIntegration() {
  console.log('🚀 Demonstrating Hugging Face Model Integration');

  // Initialize ML Core
  const mlCore = await MLCore.new();

  // Example 1: Financial Text Classification for CTI
  console.log('\n📊 Example 1: Financial Text Classification');
  await demonstrateFinancialClassification(mlCore);

  // Example 2: Threat Intelligence Text Analysis
  console.log('\n🛡️ Example 2: Threat Intelligence Analysis');
  await demonstrateThreatAnalysis(mlCore);

  // Example 3: Log Analysis with Transformers
  console.log('\n📋 Example 3: Security Log Analysis');
  await demonstrateLogAnalysis(mlCore);

  // Example 4: Image-based Malware Detection
  console.log('\n🖼️ Example 4: Image-based Malware Detection');
  await demonstrateMalwareDetection(mlCore);
}

async function demonstrateFinancialClassification(mlCore: MLCore) {
  // Create a Hugging Face model for financial sentiment analysis
  const modelConfig = {
    model_type: 'nlp',
    algorithm: 'BERT',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'nickmuchi/deberta-v3-base-finetuned-finance-text-classification',
      max_length: 512,
      batch_size: 16,
      use_gpu: true
    },
    feature_config: {
      input_features: ['text'],
      text_processing: {
        tokenizer: 'BERT',
        max_sequence_length: 512,
        preprocessing: ['lowercase']
      }
    },
    training_config: {
      epochs: 3,
      batch_size: 16,
      learning_rate: 2e-5
    }
  };

  const model = await mlCore.createModel('nlp', modelConfig);
  console.log('✅ Created financial classification model:', model.id);

  // Example financial texts that could indicate security threats
  const financialTexts = [
    "Company reports significant revenue decline due to cyber attack",
    "Stock price surges following successful security implementation",
    "Investors concerned about data breach impacting quarterly earnings",
    "Cryptocurrency exchange announces enhanced security measures"
  ];

  // Analyze sentiment for threat intelligence
  for (const text of financialTexts) {
    const prediction = await mlCore.predict(model.id, { text });
    console.log(`📈 "${text.substring(0, 50)}..." → ${prediction.prediction} (${prediction.confidence})`);
  }
}

async function demonstrateThreatAnalysis(mlCore: MLCore) {
  // Create threat intelligence analysis model
  const threatModelConfig = {
    model_type: 'nlp',
    algorithm: 'Transformer',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'microsoft/DialoGPT-medium', // Or use a threat-specific model
      max_length: 1024,
      temperature: 0.7,
      do_sample: true
    },
    feature_config: {
      input_features: ['threat_description', 'ioc_data'],
      text_processing: {
        tokenizer: 'GPT',
        max_sequence_length: 1024
      }
    }
  };

  const threatModel = await mlCore.createModel('nlp', threatModelConfig);
  console.log('✅ Created threat analysis model:', threatModel.id);

  // Analyze threat intelligence
  const threatData = {
    threat_description: "Advanced persistent threat targeting financial institutions with ransomware",
    ioc_data: "IP: 192.168.1.100, Domain: malicious-bank.com, Hash: a1b2c3d4..."
  };

  const analysis = await mlCore.predict(threatModel.id, threatData);
  console.log('🔍 Threat Analysis Result:', analysis);
}

async function demonstrateLogAnalysis(mlCore: MLCore) {
  // Create security log analysis model
  const logModelConfig = {
    model_type: 'nlp',
    algorithm: 'LogAnalysisTransformer',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'bert-base-uncased', // Fine-tuned for log analysis
      max_length: 512,
      num_labels: 5, // normal, warning, error, critical, attack
      use_fast_tokenizer: true
    },
    feature_config: {
      input_features: ['log_entry'],
      text_processing: {
        tokenizer: 'BERT',
        max_sequence_length: 512,
        preprocessing: ['remove_timestamps', 'normalize_paths']
      }
    }
  };

  const logModel = await mlCore.createModel('security', logModelConfig);
  console.log('✅ Created log analysis model:', logModel.id);

  // Analyze security logs
  const logEntries = [
    "INFO: User login successful - IP: 10.0.0.1",
    "WARNING: Multiple failed login attempts from IP: 192.168.1.100",
    "ERROR: Database connection failed - possible DoS attack",
    "CRITICAL: Root access detected from unknown IP: 203.0.113.1"
  ];

  for (const log of logEntries) {
    const classification = await mlCore.predict(logModel.id, { log_entry: log });
    console.log(`📋 "${log.substring(0, 40)}..." → ${classification.prediction}`);
  }
}

async function demonstrateMalwareDetection(mlCore: MLCore) {
  // Create image-based malware detection model
  const malwareModelConfig = {
    model_type: 'computer_vision',
    algorithm: 'ResNet',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'microsoft/resnet-50', // Or a malware-specific model
      num_classes: 2, // benign, malicious
      image_size: 224,
      use_gpu: true
    },
    feature_config: {
      input_features: ['image_data'],
      image_processing: {
        input_shape: [224, 224, 3],
        preprocessing: ['normalize', 'resize']
      }
    }
  };

  const malwareModel = await mlCore.createModel('computer_vision', malwareModelConfig);
  console.log('✅ Created malware detection model:', malwareModel.id);

  // Note: In practice, you'd load actual malware images
  // This is just a demonstration of the API
  const imageData = {
    image_path: "/path/to/suspicious/file.png",
    metadata: {
      file_size: 1024000,
      entropy: 7.8,
      strings_found: ["suspicious_string_1", "suspicious_string_2"]
    }
  };

  const detection = await mlCore.predict(malwareModel.id, imageData);
  console.log('🔬 Malware Detection Result:', detection);
}

// Advanced integration patterns
async function demonstrateAdvancedPatterns(mlCore: MLCore) {
  console.log('\n🔧 Advanced Integration Patterns');

  // 1. Model chaining for comprehensive analysis
  const textModel = await mlCore.createModel('nlp', {
    algorithm: 'BERT',
    framework: 'HuggingFace',
    hyperparameters: { model_name: 'bert-base-uncased' }
  });

  const anomalyModel = await mlCore.createModel('anomaly_detection', {
    algorithm: 'IsolationForest',
    framework: 'ScikitLearn'
  });

  // Chain models for multi-stage analysis
  const comprehensiveAnalysis = async (data: any) => {
    // Step 1: Text classification
    const textResult = await mlCore.predict(textModel.id, data);

    // Step 2: Anomaly detection on classification scores
    const anomalyResult = await mlCore.detectAnomalies(
      anomalyModel.id,
      { scores: [textResult.confidence] }
    );

    return {
      classification: textResult,
      anomaly_detection: anomalyResult,
      risk_level: anomalyResult.is_anomaly ? 'high' : 'low'
    };
  };

  // 2. Batch processing for high-throughput CTI
  const batchData = [
    { text: "Suspicious network activity detected" },
    { text: "Normal user authentication" },
    { text: "Potential data exfiltration attempt" }
  ];

  const batchResults = await mlCore.predictBatch(textModel.id, batchData);
  console.log('📦 Batch processing results:', batchResults.length);

  // 3. Real-time streaming analysis
  const streamingConfig = {
    model_id: textModel.id,
    batch_size: 10,
    window_size: 100,
    alerting_threshold: 0.8
  };

  console.log('🌊 Streaming analysis configured:', streamingConfig);
}

// Performance optimization examples
async function demonstratePerformanceOptimizations(mlCore: MLCore) {
  console.log('\n⚡ Performance Optimization Examples');

  // 1. GPU acceleration
  const gpuModel = await mlCore.createModel('nlp', {
    algorithm: 'BERT',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'bert-base-uncased',
      use_gpu: true,
      fp16: true, // Mixed precision
      gradient_checkpointing: true
    }
  });

  // 2. Model quantization for edge deployment
  const quantizedModel = await mlCore.createModel('nlp', {
    algorithm: 'BERT',
    framework: 'HuggingFace',
    hyperparameters: {
      model_name: 'bert-base-uncased',
      quantization: 'dynamic', // int8 quantization
      optimize_for_mobile: true
    }
  });

  // 3. ONNX export for cross-platform deployment
  const onnxConfig = {
    model_id: gpuModel.id,
    export_format: 'onnx',
    target_platform: 'cpu', // or 'cuda', 'tensorrt'
    optimization_level: 'O3'
  };

  console.log('📱 Optimized models created for:', {
    gpu_accelerated: gpuModel.id,
    quantized: quantizedModel.id,
    onnx_config: onnxConfig
  });
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateHuggingFaceIntegration()
    .then(() => console.log('\n✅ Hugging Face integration demonstration completed'))
    .catch(error => console.error('❌ Error:', error));
}

export { demonstrateHuggingFaceIntegration };