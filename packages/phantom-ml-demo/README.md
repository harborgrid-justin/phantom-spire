# Phantom ML Core Demo Application

A Node.js Express application demonstrating the Phantom ML Core NAPI-RS module integration.

## 🚀 Features

- **REST API** - Complete API endpoints for ML operations
- **Web Interface** - Interactive demo page with live testing
- **Error Handling** - Robust error handling and logging
- **Test Suite** - Comprehensive API testing
- **NAPI Integration** - Direct integration with the Rust NAPI module

## 📦 Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or start in development mode with auto-reload
npm run dev
```

## 🔗 API Endpoints

### System Endpoints

- **GET** `/health` - Health check
- **GET** `/api/ml/status` - ML Core status
- **GET** `/api/ml/system-info` - System information
- **GET** `/api/ml/version` - ML Core version
- **GET** `/api/ml/metrics` - Performance metrics

### ML Operations

- **POST** `/api/ml/initialize` - Initialize ML Core
- **POST** `/api/ml/process` - Process data
- **POST** `/api/ml/train` - Train a model
- **POST** `/api/ml/batch-process` - Batch process multiple inputs

## 📝 API Usage Examples

### Initialize ML Core
```bash
curl -X POST http://localhost:3000/api/ml/initialize
```

### Process Data
```bash
curl -X POST http://localhost:3000/api/ml/process \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Your data here"}'
```

### Train Model
```bash
curl -X POST http://localhost:3000/api/ml/train \\
  -H "Content-Type: application/json" \\
  -d '{
    "modelType": "classification",
    "parameters": {
      "epochs": 10,
      "learningRate": 0.01
    }
  }'
```

### Batch Processing
```bash
curl -X POST http://localhost:3000/api/ml/batch-process \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": ["data1", "data2", "data3"]
  }'
```

## 🧪 Testing

### Run Test Suite
```bash
npm test
```

### Manual Testing
1. Start the server: `npm start`
2. Open http://localhost:3000 in your browser
3. Use the interactive interface to test endpoints

## 🏗️ Architecture

```
phantom-ml-demo/
├── server.js                 # Main Express server
├── lib/
│   ├── phantom-ml-wrapper.js # NAPI module wrapper
│   ├── index.js             # Generated NAPI bindings
│   ├── index.d.ts           # TypeScript definitions
│   └── phantom-ml-core.win32-x64-msvc.node # Native module
├── test-api.js              # API test suite
└── package.json
```

## 🔧 Configuration

The application runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## 📊 Response Format

All API endpoints return JSON responses in this format:

```json
{
  "success": true,
  "data": "...",
  "timestamp": "2023-09-15T13:37:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2023-09-15T13:37:00.000Z"
}
```

## 🚨 Error Handling

The application includes comprehensive error handling:

- **Validation errors** (400) - Invalid input data
- **ML errors** (500) - Native module errors
- **Server errors** (500) - General server errors
- **Not found** (404) - Invalid endpoints

## 🔍 Debugging

To enable debug logging:

```bash
DEBUG=* npm start
```

Check the console output for detailed logging of all ML operations and API requests.

## 🧩 Integration Notes

The demo app wraps the NAPI-RS module with:

1. **Safe Loading** - Graceful handling of module loading failures
2. **Error Wrapping** - Conversion of native errors to JSON responses
3. **Status Tracking** - Real-time status of ML Core initialization
4. **Performance Monitoring** - Built-in metrics collection

## 📈 Performance

The application includes performance monitoring:

- Memory usage tracking
- CPU usage monitoring
- Request/response timing
- ML operation statistics

Access metrics via `/api/ml/metrics` endpoint.

## 🔗 Links

- **Demo Interface**: http://localhost:3000
- **API Base**: http://localhost:3000/api/ml
- **Health Check**: http://localhost:3000/health