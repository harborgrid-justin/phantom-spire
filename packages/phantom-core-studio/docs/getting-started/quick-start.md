# Quick Start Guide

**Get up and running with Phantom ML Studio in 15 minutes**

Welcome to Phantom ML Studio! This guide will help you deploy your first machine learning model and experience the power of our enterprise ML platform in just 15 minutes.

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js 18.0+** installed
- **8GB RAM minimum** (16GB recommended)
- **20GB available disk space**
- **Administrator/sudo access** for installation
- **Internet connection** for dependencies

## 🚀 Step 1: Installation (3 minutes)

### Option A: NPM Installation (Recommended)
```bash
# Install globally for system-wide access
npm install -g @phantom-spire/ml-studio

# Verify installation
phantom-ml-studio --version
```

### Option B: Source Installation
```bash
# Clone and build from source
git clone https://github.com/phantom-spire/phantom-ml-studio.git
cd phantom-ml-studio
npm install
npm run build

# Start the platform
npm start
```

### Option C: Docker Deployment
```bash
# Pull and run the official Docker image
docker pull phantomspire/ml-studio:latest
docker run -p 3000:3000 -p 8080:8080 phantomspire/ml-studio:latest
```

## ⚙️ Step 2: Initial Configuration (2 minutes)

### Basic Configuration
```bash
# Initialize the platform with default settings
phantom-ml-studio init

# Configure for your organization
phantom-ml-studio config set organization-id "your-org-id"
phantom-ml-studio config set environment "production"
```

### Environment Variables
Create a `.env` file in your project directory:
```env
# Platform Configuration
PHANTOM_ML_ENVIRONMENT=production
PHANTOM_ML_LOG_LEVEL=info

# Database Configuration (optional - uses in-memory by default)
DATABASE_URL=postgresql://user:password@localhost:5432/phantom_ml
REDIS_URL=redis://localhost:6379

# Security Configuration
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# API Configuration
API_PORT=8080
WEB_PORT=3000
```

## 🎯 Step 3: Launch Platform (1 minute)

### Start All Services
```bash
# Start the complete platform
phantom-ml-studio start

# Or start individual components
phantom-ml-studio start --web-only    # Web interface only
phantom-ml-studio start --api-only    # API server only
phantom-ml-studio start --worker-only # Background workers only
```

### Verify Platform Status
```bash
# Check system health
phantom-ml-studio status

# View service logs
phantom-ml-studio logs --follow
```

Access the platform:
- **Web Interface**: http://localhost:3000
- **API Endpoint**: http://localhost:8080
- **Documentation**: http://localhost:3000/docs

## 🎨 Step 4: Web Interface Tour (3 minutes)

### Dashboard Overview
Navigate to http://localhost:3000 to access:

1. **Executive Dashboard**
   - Real-time platform metrics
   - Model performance overview
   - Business intelligence summaries
   - Quick action buttons

2. **Model Management**
   - Upload and manage ML models
   - Model validation and testing
   - Deployment configuration
   - Performance monitoring

3. **Analytics Workbench**
   - Data exploration tools
   - Statistical analysis
   - Visualization components
   - Report generation

4. **Workflow Designer**
   - Visual pipeline builder
   - Drag-and-drop components
   - Complex workflow orchestration
   - Scheduling and automation

## 🤖 Step 5: Deploy Your First Model (6 minutes)

### Using the Web Interface

#### Option A: QuickStart Wizard
1. **Navigate to QuickStart**: Click "Deploy New Model" on the dashboard
2. **Select Use Case**: Choose from pre-configured templates:
   - Fraud Detection
   - Customer Churn Prediction
   - Demand Forecasting
   - Image Classification
   - Sentiment Analysis

3. **Upload Data**: Drag and drop your CSV, JSON, or Parquet files
4. **Configure Model**: Adjust parameters using the visual interface
5. **Deploy**: Click "Deploy Model" - deployment completes in 2-3 minutes

#### Option B: Upload Existing Model
1. **Navigate to Models**: Go to "Model Management" section
2. **Import Model**: Click "Import Existing Model"
3. **Select Format**: Choose from supported formats:
   - ONNX (.onnx)
   - TensorFlow (.pb, .h5)
   - PyTorch (.pt, .pth)
   - Scikit-learn (.pkl)
   - XGBoost (.json, .model)

4. **Configure Deployment**: Set scaling and monitoring options
5. **Deploy**: Model becomes available for predictions immediately

### Using the API

#### Quick Model Deployment
```bash
# Deploy a fraud detection model using the QuickStart API
curl -X POST http://localhost:8080/api/v1/models/quickstart \
  -H "Content-Type: application/json" \
  -d '{
    "useCase": "fraud_detection",
    "modelName": "fraud_detector_v1",
    "data": {
      "trainingFile": "./data/transactions.csv",
      "targetColumn": "is_fraud"
    },
    "config": {
      "algorithm": "xgboost",
      "validationSplit": 0.2,
      "deployment": {
        "scaling": "auto",
        "monitoring": true
      }
    }
  }'
```

#### Response Example
```json
{
  "success": true,
  "modelId": "fraud_detector_v1_1703001234",
  "deploymentId": "deploy_1703001234",
  "status": "training",
  "estimatedCompletion": "2024-01-01T12:15:00Z",
  "endpoints": {
    "predict": "/api/v1/models/fraud_detector_v1_1703001234/predict",
    "batch": "/api/v1/models/fraud_detector_v1_1703001234/batch",
    "status": "/api/v1/models/fraud_detector_v1_1703001234/status"
  },
  "message": "Model training initiated. Check status endpoint for progress."
}
```

## 🔮 Step 6: Make Your First Prediction

### Real-time Prediction
```bash
# Single prediction via REST API
curl -X POST http://localhost:8080/api/v1/models/fraud_detector_v1_1703001234/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "transaction_amount": 1500.50,
      "merchant_category": "electronics",
      "time_of_day": "evening",
      "user_history_score": 0.85,
      "geographic_risk": "low"
    }
  }'
```

### Batch Processing
```bash
# Batch predictions for multiple records
curl -X POST http://localhost:8080/api/v1/models/fraud_detector_v1_1703001234/batch \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "transaction_amount": 1500.50,
        "merchant_category": "electronics",
        "time_of_day": "evening",
        "user_history_score": 0.85,
        "geographic_risk": "low"
      },
      {
        "transaction_amount": 25.00,
        "merchant_category": "grocery",
        "time_of_day": "morning",
        "user_history_score": 0.92,
        "geographic_risk": "low"
      }
    ]
  }'
```

### Prediction Response
```json
{
  "success": true,
  "predictions": [
    {
      "prediction": "legitimate",
      "confidence": 0.92,
      "risk_score": 0.08,
      "explanation": {
        "top_factors": [
          "high_user_history_score",
          "low_geographic_risk",
          "normal_amount_for_category"
        ]
      }
    }
  ],
  "model_info": {
    "model_id": "fraud_detector_v1_1703001234",
    "version": "1.0",
    "last_trained": "2024-01-01T12:00:00Z",
    "accuracy": 0.947
  }
}
```

## 📊 Step 7: Monitor and Analyze

### Real-time Monitoring
Access the monitoring dashboard at http://localhost:3000/monitoring to view:
- **Live Predictions**: Real-time prediction feed
- **Performance Metrics**: Latency, throughput, accuracy
- **System Health**: CPU, memory, storage usage
- **Alert Status**: Active alerts and notifications

### Generate Analytics Report
```bash
# Generate comprehensive performance report
curl -X GET http://localhost:8080/api/v1/reports/performance \
  -H "Authorization: Bearer your-api-token"
```

### Business Intelligence Dashboard
Navigate to http://localhost:3000/analytics for:
- **ROI Calculator**: Measure financial impact
- **A/B Testing**: Compare model versions
- **Feature Analysis**: Understand data importance
- **Trend Analysis**: Track performance over time

## ✅ Quick Start Checklist

Mark off each step as you complete it:

- [ ] ✅ **Installation Complete**: Platform installed and verified
- [ ] ✅ **Configuration Set**: Environment configured for your needs
- [ ] ✅ **Platform Running**: All services started successfully
- [ ] ✅ **Web Access**: Dashboard accessible at http://localhost:3000
- [ ] ✅ **Model Deployed**: First model trained and deployed
- [ ] ✅ **Prediction Made**: Successfully called prediction API
- [ ] ✅ **Monitoring Active**: Dashboard shows live metrics
- [ ] ✅ **Documentation Reviewed**: Familiar with key features

## 🎯 Next Steps

### Immediate Actions (Next 30 minutes)
1. **Explore Workflows**: Visit the Workflow Designer to create automated pipelines
2. **Add More Data**: Upload additional datasets to improve model accuracy
3. **Configure Alerts**: Set up monitoring alerts for production readiness
4. **Invite Team**: Add team members and configure role-based access

### Short-term Goals (Next Week)
1. **Production Deployment**: Move from development to production environment
2. **Integration Setup**: Connect to your existing data systems and APIs
3. **Custom Models**: Deploy your organization-specific ML models
4. **Compliance Configuration**: Set up required compliance and audit features

### Long-term Strategy (Next Month)
1. **ML Operations**: Implement comprehensive MLOps workflows
2. **Performance Optimization**: Fine-tune for your specific use cases
3. **Scale Architecture**: Configure for enterprise-scale deployments
4. **Advanced Analytics**: Leverage business intelligence features

## 🆘 Common Issues and Solutions

### Installation Issues
**Problem**: `npm install` fails with permission errors
**Solution**:
```bash
# Use sudo for global installation
sudo npm install -g @phantom-spire/ml-studio

# Or configure npm prefix for user installation
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Port Conflicts
**Problem**: "Port already in use" error
**Solution**:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8080

# Start on different ports
phantom-ml-studio start --web-port 3001 --api-port 8081
```

### Memory Issues
**Problem**: "Out of memory" during model training
**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Or configure in .env file
NODE_OPTIONS=--max-old-space-size=8192
```

### Model Deployment Failures
**Problem**: Model fails to deploy or predict
**Solution**:
1. Check model format compatibility
2. Verify data schema matches training data
3. Review logs: `phantom-ml-studio logs --model-id YOUR_MODEL_ID`
4. Test with sample data first

## 📞 Getting Help

### Documentation Resources
- **Full Documentation**: Continue with [Installation Guide](./installation.md)
- **API Reference**: Complete endpoint documentation
- **User Guides**: Role-specific detailed guides
- **Best Practices**: Proven patterns and recommendations

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Real-time chat with other users
- **Stack Overflow**: Tag questions with `phantom-ml-studio`
- **Documentation**: Comprehensive guides and tutorials

### Enterprise Support
- **Professional Services**: Implementation consulting available
- **24/7 Support**: Critical issue resolution for enterprise customers
- **Training Programs**: On-site and remote training options
- **Custom Development**: Platform extensions and integrations

---

**🎉 Congratulations!** You've successfully deployed your first ML model with Phantom ML Studio. You're now ready to build enterprise-grade machine learning solutions.

**Next**: Continue with the [Installation Guide](./installation.md) for production deployment options.