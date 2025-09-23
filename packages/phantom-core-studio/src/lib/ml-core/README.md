# Phantom ML Core Integration Layer

This directory contains the comprehensive TypeScript integration layer for connecting phantom-ml-studio with the expanded phantom-ml-core Rust APIs.

## 🏗️ Architecture Overview

The integration layer consists of three main components:

1. **Type Definitions** (`types.ts`) - Complete TypeScript interfaces matching Rust NAPI structures
2. **Core Integration** (`index.ts`) - Main integration logic with error handling and fallbacks
3. **Provider Context** (`../components/providers/MLCoreProvider.tsx`) - React context for state management

## 📁 File Structure

```
src/lib/ml-core/
├── types.ts           # TypeScript type definitions
├── index.ts           # Core integration logic
└── README.md          # This documentation

src/components/providers/
└── MLCoreProvider.tsx # React context provider

src/app/api/ml-core/
├── route.ts           # System overview endpoint
├── health/route.ts    # Health check endpoint
├── models/route.ts    # Models management
├── datasets/route.ts  # Dataset management
├── performance/route.ts # Performance monitoring
├── train/route.ts     # Model training
└── predictions/route.ts # Predictions generation
```

## 🔌 API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ml-core` | GET | System overview and capabilities |
| `/api/ml-core/health` | GET | Health check and status |
| `/api/ml-core/models` | GET | List all available models |
| `/api/ml-core/datasets` | GET | List all available datasets |
| `/api/ml-core/performance` | GET | System performance statistics |
| `/api/ml-core/train` | POST | Initiate model training |
| `/api/ml-core/predictions` | POST | Generate predictions |

### Example Usage

```typescript
// Health Check
const response = await fetch('/api/ml-core/health');
const health = await response.json();

// Get Models
const modelsResponse = await fetch('/api/ml-core/models');
const { data: models } = await modelsResponse.json();

// Train Model
const trainingConfig = {
  epochs: 100,
  batch_size: 32,
  validation_split: 0.2,
  cross_validation: true,
  cross_validation_folds: 5
};

const trainResponse = await fetch('/api/ml-core/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(trainingConfig)
});

// Generate Predictions
const predictionRequest = {
  modelId: 'model_security_threat_detection',
  data: [0.5, 0.3, 0.8, 0.2, 0.9]
};

const predictionResponse = await fetch('/api/ml-core/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(predictionRequest)
});
```

## 🎯 Type System

### Core Types

```typescript
// Enhanced model structure
interface Model {
  id: string
  name: string
  model_type: string
  algorithm: string
  version: string
  status: string
  accuracy?: number
  precision?: number
  recall?: number
  f1_score?: number
  created_at: string
  last_trained?: string
  training_time_ms?: number
  dataset_id?: string
  feature_count: number
  model_size_mb: number
  inference_time_avg_ms: number
  tags: string[]
}

// Enhanced dataset structure
interface Dataset {
  id: string
  name: string
  description: string
  dataset_type: string
  format: string
  size_bytes: number
  size_human: string
  created_at: string
  last_modified: string
  status: string
  feature_count: number
  sample_count: number
  target_column?: string
  missing_values_percent: number
  data_quality_score: number
  tags: string[]
  source: string
}

// Training configuration
interface TrainingConfig {
  epochs: number
  batch_size: number
  validation_split: number
  cross_validation: boolean
  cross_validation_folds: number
}

// Training job with metrics
interface TrainingJob {
  job_id: string
  model_id: string
  status: string
  progress_percent: number
  current_epoch: number
  total_epochs: number
  current_loss?: number
  best_accuracy?: number
  started_at: string
  estimated_completion?: string
  error_message?: string
  metrics: TrainingMetrics
}
```

## 🔄 Provider Usage

The `MLCoreProvider` gives you access to all ML Core functionality through React hooks:

```typescript
import { useMLCore, useModels, useTraining } from '@/components/providers/MLCoreProvider'

// Full context access
const {
  isInitialized,
  hasNativeExtension,
  models,
  datasets,
  trainModel,
  getPredictions
} = useMLCore()

// Specific hooks
const { models, refreshModels } = useModels()
const { trainModel } = useTraining()
const { getPredictions } = usePrediction()
```

## 🛠️ Error Handling

The integration layer provides comprehensive error handling:

1. **Automatic Fallbacks** - Falls back to mock data when native extension unavailable
2. **Type Safety** - Full TypeScript coverage prevents runtime errors
3. **API Wrappers** - Consistent error responses across all endpoints
4. **Health Monitoring** - Real-time status tracking and diagnostics

```typescript
// All API calls return standardized responses
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Error handling example
try {
  const response = await apiWrapper.getModels()
  if (response.success) {
    console.log('Models:', response.data)
  } else {
    console.error('Error:', response.error)
  }
} catch (error) {
  console.error('Network error:', error)
}
```

## ⚡ Performance Features

- **Lazy Loading** - Components load ML Core only when needed
- **Caching** - Intelligent caching of models and datasets
- **Optimistic Updates** - UI updates before API confirmation
- **Background Refresh** - Automatic data synchronization

## 🔐 Security

- **Input Validation** - All inputs validated before processing
- **Type Safety** - Prevents injection and type confusion attacks
- **Error Sanitization** - Sensitive information removed from error messages
- **CORS Configuration** - Proper cross-origin resource sharing setup

## 🚀 Getting Started

1. **Import the provider** in your app:
```typescript
import { MLCoreProvider } from '@/components/providers/MLCoreProvider'

export default function App() {
  return (
    <MLCoreProvider>
      <YourApp />
    </MLCoreProvider>
  )
}
```

2. **Use the hooks** in your components:
```typescript
import { useModels } from '@/components/providers/MLCoreProvider'

export function ModelsPage() {
  const { models, isLoading, error } = useModels()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {models.map(model => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  )
}
```

## 🧪 Testing

Run the integration test script:

```bash
node scripts/test-ml-integration.js
```

This verifies:
- TypeScript compilation
- Module imports
- Type definitions
- API endpoint availability

## 📈 Monitoring

The integration provides real-time monitoring through:

- **Health checks** - `/api/ml-core/health`
- **Performance stats** - `/api/ml-core/performance`
- **System overview** - `/api/ml-core`

## 🔧 Configuration

Environment variables:

```bash
ML_CORE_PATH=../phantom-ml-core/nextgen  # Path to native extension
NODE_ENV=development|production           # Environment mode
```

## 🤝 Contributing

When extending the integration layer:

1. Update type definitions in `types.ts`
2. Add API methods to `index.ts`
3. Create corresponding API routes
4. Update provider hooks
5. Add tests and documentation

## 📚 Related Documentation

- [Phantom ML Core Rust API](../../phantom-ml-core/README.md)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)