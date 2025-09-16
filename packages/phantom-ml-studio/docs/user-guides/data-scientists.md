# Data Scientists Guide

**Complete workflow guide for ML model development, training, and analysis**

This comprehensive guide covers everything data scientists need to know to effectively use Phantom ML Studio for machine learning model development, from data exploration to production deployment.

## 🎯 Overview for Data Scientists

Phantom ML Studio provides a complete environment for data science workflows with:
- **Unified Interface**: Web-based and API access for all ML operations
- **Native Performance**: Rust-powered core for high-performance computing
- **Enterprise Features**: Advanced analytics, compliance, and collaboration tools
- **Flexible Deployment**: From experimentation to production-ready models

### Key Capabilities for Data Scientists
| Feature | Description | Benefit |
|---------|-------------|---------|
| **Interactive Workbench** | Web-based data exploration and modeling | Faster iteration cycles |
| **AutoML Pipeline** | Automated model selection and tuning | Rapid prototyping |
| **Model Registry** | Version control and metadata management | Organized experiments |
| **Advanced Analytics** | Statistical analysis and business intelligence | Deeper insights |
| **Collaboration Tools** | Team sharing and workflow management | Seamless teamwork |

## 🚀 Getting Started

### Access Your Workspace
1. **Login to Platform**: Navigate to your Phantom ML Studio instance
2. **Select Role**: Choose "Data Scientist" during initial setup
3. **Access Workbench**: Click "Analytics Workbench" from the main dashboard
4. **Configure Environment**: Set up your preferred development settings

### First-Time Setup
```bash
# Configure your API access
phantom-ml-studio auth login --username your-username

# Set up your workspace
phantom-ml-studio workspace create --name "my-ds-workspace"
phantom-ml-studio workspace activate --name "my-ds-workspace"

# Install additional Python packages (if needed)
phantom-ml-studio packages install pandas scikit-learn matplotlib seaborn
```

### Web Interface Tour
The Analytics Workbench provides:
- **Data Explorer**: Interactive data browsing and visualization
- **Model Builder**: Drag-and-drop model creation interface
- **Experiment Tracker**: Version control for experiments
- **Results Dashboard**: Performance metrics and visualizations
- **Collaboration Hub**: Team sharing and discussion features

## 📊 Data Management

### Data Upload and Import
```bash
# Upload data via CLI
phantom-ml-studio data upload --file dataset.csv --name "customer_data"

# Import from various sources
phantom-ml-studio data import --source s3://my-bucket/data.parquet --name "sales_data"
phantom-ml-studio data import --source postgresql://db:5432/warehouse --query "SELECT * FROM customers" --name "customer_profiles"
```

#### Supported Data Formats
| Format | Extension | Use Case |
|--------|-----------|----------|
| **CSV** | .csv | Structured tabular data |
| **JSON** | .json | Semi-structured data, API responses |
| **Parquet** | .parquet | Large datasets, columnar storage |
| **Excel** | .xlsx, .xls | Business reports, spreadsheets |
| **HDF5** | .h5, .hdf5 | Scientific data, large arrays |
| **Feather** | .feather | Fast R/Python interop |
| **Avro** | .avro | Schema evolution, streaming |

### Data Exploration
#### Web Interface
1. **Navigate to Data Explorer**: Click "Explore Data" in the workbench
2. **Select Dataset**: Choose from uploaded or connected data sources
3. **Interactive Analysis**: Use built-in tools for:
   - Statistical summaries
   - Distribution plots
   - Correlation matrices
   - Missing value analysis
   - Outlier detection

#### API-Based Exploration
```python
# Using the Phantom ML Studio Python SDK
from phantom_ml_studio import PlatformClient

client = PlatformClient(api_url="http://localhost:8080")

# Load dataset
dataset = client.data.load("customer_data")

# Get statistical summary
summary = client.analytics.statistical_summary(dataset.id)
print(summary)

# Generate correlation analysis
correlations = client.analytics.correlation_analysis(dataset.id)

# Create visualizations
plots = client.analytics.generate_plots(
    dataset.id,
    plot_types=["distribution", "correlation", "scatter"]
)
```

### Data Quality Assessment
```bash
# Comprehensive data quality report
phantom-ml-studio data quality --dataset customer_data

# Output example:
📊 Data Quality Report for 'customer_data'
├── Records: 50,000
├── Features: 25
├── Missing Values: 3.2% overall
├── Duplicates: 15 records (0.03%)
├── Outliers: 234 records (0.47%)
├── Data Types:
│   ├── Numeric: 15 features
│   ├── Categorical: 8 features
│   └── DateTime: 2 features
└── Quality Score: 94.2/100 ✅

Recommendations:
• Handle missing values in 'income' column (8.5% missing)
• Consider outlier treatment for 'transaction_amount'
• Standardize categorical values in 'region' column
```

#### Data Quality Configuration
```json
{
  "dataQuality": {
    "checks": [
      {
        "name": "missing_values",
        "threshold": 0.05,
        "action": "warn"
      },
      {
        "name": "outliers",
        "method": "iqr",
        "threshold": 3.0,
        "action": "flag"
      },
      {
        "name": "duplicates",
        "threshold": 0.01,
        "action": "remove"
      },
      {
        "name": "data_drift",
        "baseline": "training_data",
        "threshold": 0.1,
        "action": "alert"
      }
    ],
    "autoFix": {
      "enabled": true,
      "strategies": {
        "missing_values": "mean_imputation",
        "outliers": "winsorization",
        "duplicates": "keep_first"
      }
    }
  }
}
```

## 🤖 Model Development

### AutoML Quick Start
```python
# Use AutoML for rapid model development
from phantom_ml_studio import AutoML

automl = AutoML(client)

# Configure AutoML experiment
experiment = automl.create_experiment(
    name="customer_churn_prediction",
    dataset="customer_data",
    target_column="churn",
    problem_type="classification",
    time_budget_hours=2,
    optimization_metric="f1_score"
)

# Start training
results = automl.fit(experiment.id)

# Get best model
best_model = automl.get_best_model(experiment.id)
print(f"Best model: {best_model.algorithm} with {best_model.score:.3f} F1-score")
```

#### AutoML Configuration Options
```json
{
  "automl": {
    "algorithms": [
      "xgboost",
      "random_forest",
      "gradient_boosting",
      "neural_network",
      "svm",
      "logistic_regression"
    ],
    "hyperparameter_tuning": {
      "method": "bayesian_optimization",
      "n_trials": 100,
      "timeout_per_trial": 300
    },
    "feature_engineering": {
      "enabled": true,
      "techniques": [
        "polynomial_features",
        "feature_selection",
        "scaling",
        "encoding"
      ]
    },
    "cross_validation": {
      "folds": 5,
      "stratified": true,
      "shuffle": true
    }
  }
}
```

### Custom Model Development
#### Using the Model Builder Interface
1. **Create New Experiment**: Click "New Experiment" in the workbench
2. **Select Data**: Choose your preprocessed dataset
3. **Define Problem**: Specify problem type (classification/regression)
4. **Choose Algorithm**: Select from available algorithms or upload custom
5. **Configure Features**: Select features and preprocessing steps
6. **Set Validation**: Configure cross-validation and test split
7. **Train Model**: Start training with monitoring dashboard

#### API-Based Model Development
```python
# Custom model training workflow
from phantom_ml_studio import ModelBuilder

builder = ModelBuilder(client)

# Create experiment
experiment = builder.create_experiment(
    name="fraud_detection_v2",
    description="Advanced fraud detection with feature engineering"
)

# Configure data pipeline
pipeline = builder.create_pipeline(
    steps=[
        {"type": "imputation", "strategy": "median"},
        {"type": "scaling", "method": "standard"},
        {"type": "feature_selection", "k": 20},
        {"type": "encoding", "method": "target"}
    ]
)

# Define model configuration
model_config = {
    "algorithm": "xgboost",
    "hyperparameters": {
        "n_estimators": 100,
        "max_depth": 6,
        "learning_rate": 0.1,
        "subsample": 0.8,
        "colsample_bytree": 0.8
    },
    "validation": {
        "method": "stratified_kfold",
        "folds": 5,
        "test_size": 0.2
    }
}

# Train model
model = builder.train_model(
    experiment_id=experiment.id,
    dataset="transaction_data",
    target_column="is_fraud",
    config=model_config,
    pipeline=pipeline
)

# Monitor training progress
status = builder.get_training_status(model.id)
print(f"Training status: {status.phase} - {status.progress}%")
```

### Feature Engineering
```python
# Advanced feature engineering
from phantom_ml_studio import FeatureEngine

fe = FeatureEngine(client)

# Create feature set
features = fe.create_feature_set(
    name="transaction_features_v1",
    base_dataset="transactions"
)

# Add engineered features
fe.add_features(features.id, [
    {
        "name": "transaction_hour",
        "expression": "EXTRACT(hour FROM transaction_time)",
        "type": "numerical"
    },
    {
        "name": "amount_zscore",
        "expression": "(amount - AVG(amount)) / STDDEV(amount)",
        "type": "numerical"
    },
    {
        "name": "merchant_frequency",
        "expression": "COUNT(*) OVER (PARTITION BY merchant_id)",
        "type": "numerical"
    },
    {
        "name": "is_weekend",
        "expression": "CASE WHEN DAYOFWEEK(transaction_time) IN (1,7) THEN 1 ELSE 0 END",
        "type": "categorical"
    }
])

# Generate feature importance analysis
importance = fe.analyze_importance(
    feature_set_id=features.id,
    target_column="is_fraud",
    method="mutual_information"
)
```

## 📈 Model Evaluation and Analysis

### Performance Metrics
```python
# Comprehensive model evaluation
from phantom_ml_studio import ModelEvaluator

evaluator = ModelEvaluator(client)

# Evaluate model performance
evaluation = evaluator.evaluate_model(
    model_id=model.id,
    test_dataset="test_data",
    metrics=[
        "accuracy", "precision", "recall", "f1_score",
        "roc_auc", "confusion_matrix", "classification_report"
    ]
)

print(f"Model Performance:")
print(f"Accuracy: {evaluation.metrics.accuracy:.3f}")
print(f"Precision: {evaluation.metrics.precision:.3f}")
print(f"Recall: {evaluation.metrics.recall:.3f}")
print(f"F1-Score: {evaluation.metrics.f1_score:.3f}")
print(f"ROC-AUC: {evaluation.metrics.roc_auc:.3f}")

# Generate detailed analysis report
report = evaluator.generate_report(
    model_id=model.id,
    report_type="comprehensive",
    include_explanations=True
)
```

### Model Interpretability
```python
# Model explainability and interpretation
from phantom_ml_studio import ModelExplainer

explainer = ModelExplainer(client)

# Global explanations
global_explanation = explainer.explain_global(
    model_id=model.id,
    method="shap",
    sample_size=1000
)

# Feature importance
feature_importance = explainer.get_feature_importance(
    model_id=model.id,
    method="permutation"
)

# Local explanations for specific predictions
local_explanation = explainer.explain_prediction(
    model_id=model.id,
    instance_id="transaction_12345",
    method="lime"
)

# Generate interpretability dashboard
dashboard = explainer.create_dashboard(
    model_id=model.id,
    explanations=[global_explanation, local_explanation]
)
```

### A/B Testing and Model Comparison
```python
# Compare multiple models
from phantom_ml_studio import ModelComparator

comparator = ModelComparator(client)

# Compare models
comparison = comparator.compare_models(
    model_ids=["model_v1", "model_v2", "model_v3"],
    test_dataset="holdout_test",
    metrics=["accuracy", "f1_score", "precision", "recall"],
    statistical_tests=True
)

# A/B testing setup
ab_test = comparator.setup_ab_test(
    control_model="model_v1",
    treatment_models=["model_v2"],
    traffic_split=0.1,
    success_metric="conversion_rate",
    duration_days=14
)

# Monitor A/B test results
results = comparator.get_ab_test_results(ab_test.id)
print(f"Statistical significance: {results.is_significant}")
print(f"Confidence interval: {results.confidence_interval}")
```

## 🎨 Visualization and Reporting

### Interactive Dashboards
```python
# Create custom analytics dashboard
from phantom_ml_studio import Dashboard

dashboard = Dashboard(client)

# Create dashboard
ds_dashboard = dashboard.create(
    name="Data Science Dashboard",
    description="Model performance and data insights"
)

# Add visualization components
dashboard.add_component(ds_dashboard.id, {
    "type": "metric_cards",
    "config": {
        "metrics": ["model_accuracy", "data_quality_score", "prediction_volume"],
        "time_range": "last_30_days"
    }
})

dashboard.add_component(ds_dashboard.id, {
    "type": "line_chart",
    "config": {
        "title": "Model Performance Over Time",
        "x_axis": "date",
        "y_axis": "accuracy",
        "data_source": "model_metrics"
    }
})

dashboard.add_component(ds_dashboard.id, {
    "type": "confusion_matrix",
    "config": {
        "model_id": model.id,
        "dataset": "test_data"
    }
})

# Share dashboard with team
dashboard.share(ds_dashboard.id, users=["ml-team@company.com"])
```

### Advanced Analytics Reports
```python
# Generate comprehensive analytics reports
from phantom_ml_studio import ReportGenerator

reporter = ReportGenerator(client)

# Data analysis report
data_report = reporter.generate_report(
    type="data_analysis",
    dataset="customer_data",
    config={
        "include_sections": [
            "summary_statistics",
            "distribution_analysis",
            "correlation_analysis",
            "outlier_detection",
            "missing_value_analysis"
        ],
        "visualizations": True,
        "recommendations": True
    }
)

# Model performance report
model_report = reporter.generate_report(
    type="model_performance",
    model_id=model.id,
    config={
        "include_sections": [
            "performance_metrics",
            "confusion_matrix",
            "roc_curves",
            "feature_importance",
            "prediction_distribution"
        ],
        "comparison_models": ["baseline_model"],
        "business_impact": True
    }
)

# Export reports
reporter.export_report(data_report.id, format="pdf", path="./reports/")
reporter.export_report(model_report.id, format="html", path="./reports/")
```

## 🔄 Workflow Management

### Experiment Tracking
```python
# Comprehensive experiment management
from phantom_ml_studio import ExperimentTracker

tracker = ExperimentTracker(client)

# Create experiment group
experiment_group = tracker.create_group(
    name="customer_churn_experiments",
    description="Various approaches to customer churn prediction"
)

# Track individual experiments
experiment1 = tracker.create_experiment(
    group_id=experiment_group.id,
    name="xgboost_baseline",
    parameters={
        "algorithm": "xgboost",
        "max_depth": 6,
        "learning_rate": 0.1,
        "n_estimators": 100
    },
    tags=["baseline", "xgboost"]
)

# Log metrics during training
tracker.log_metric(experiment1.id, "train_accuracy", 0.892, step=1)
tracker.log_metric(experiment1.id, "val_accuracy", 0.876, step=1)
tracker.log_metric(experiment1.id, "train_loss", 0.234, step=1)

# Log artifacts
tracker.log_artifact(experiment1.id, "model.pkl", "./models/xgboost_model.pkl")
tracker.log_artifact(experiment1.id, "feature_importance.png", "./plots/feature_importance.png")

# Compare experiments
comparison = tracker.compare_experiments(
    experiment_ids=[experiment1.id, experiment2.id, experiment3.id],
    metrics=["accuracy", "f1_score", "training_time"]
)
```

### Automated Workflows
```python
# Create automated ML workflows
from phantom_ml_studio import WorkflowBuilder

workflow = WorkflowBuilder(client)

# Define workflow steps
ml_workflow = workflow.create(
    name="customer_churn_pipeline",
    description="End-to-end customer churn prediction workflow"
)

# Add workflow steps
workflow.add_step(ml_workflow.id, {
    "name": "data_validation",
    "type": "data_quality_check",
    "config": {
        "dataset": "customer_data",
        "quality_threshold": 0.95
    }
})

workflow.add_step(ml_workflow.id, {
    "name": "feature_engineering",
    "type": "feature_pipeline",
    "config": {
        "feature_set": "customer_features_v2",
        "target_column": "churn"
    },
    "depends_on": ["data_validation"]
})

workflow.add_step(ml_workflow.id, {
    "name": "model_training",
    "type": "automl",
    "config": {
        "time_budget": 120,
        "optimization_metric": "f1_score",
        "algorithms": ["xgboost", "random_forest", "neural_network"]
    },
    "depends_on": ["feature_engineering"]
})

workflow.add_step(ml_workflow.id, {
    "name": "model_validation",
    "type": "model_evaluation",
    "config": {
        "test_dataset": "holdout_test",
        "performance_threshold": 0.8
    },
    "depends_on": ["model_training"]
})

# Schedule workflow execution
workflow.schedule(ml_workflow.id, cron="0 2 * * 1")  # Weekly on Monday 2 AM

# Execute workflow manually
execution = workflow.execute(ml_workflow.id)
status = workflow.get_execution_status(execution.id)
```

## 📊 Business Intelligence Integration

### ROI Analysis
```python
# Calculate business impact of ML models
from phantom_ml_studio import BusinessAnalyzer

biz_analyzer = BusinessAnalyzer(client)

# Configure business metrics
roi_config = {
    "model_id": model.id,
    "business_metrics": {
        "prevented_fraud_value": 50000,  # Average fraud amount prevented
        "false_positive_cost": 15,       # Cost per false positive
        "operational_cost_per_prediction": 0.01
    },
    "time_period": "monthly",
    "baseline_performance": {
        "accuracy": 0.75,
        "precision": 0.65,
        "recall": 0.80
    }
}

# Calculate ROI
roi_analysis = biz_analyzer.calculate_roi(roi_config)

print(f"Monthly ROI Analysis:")
print(f"Cost Savings: ${roi_analysis.cost_savings:,.2f}")
print(f"Revenue Impact: ${roi_analysis.revenue_impact:,.2f}")
print(f"Total ROI: {roi_analysis.roi_percentage:.1f}%")
print(f"Payback Period: {roi_analysis.payback_months:.1f} months")

# Generate business impact report
impact_report = biz_analyzer.generate_impact_report(
    model_id=model.id,
    time_period="quarterly",
    include_forecasts=True
)
```

### Performance Forecasting
```python
# Forecast model and business performance
forecasts = biz_analyzer.forecast_performance(
    model_id=model.id,
    forecast_horizon_months=12,
    scenarios=["optimistic", "realistic", "pessimistic"],
    include_confidence_intervals=True
)

print("12-Month Performance Forecast:")
for scenario in forecasts.scenarios:
    print(f"{scenario.name}:")
    print(f"  Expected Accuracy: {scenario.accuracy:.3f} ± {scenario.accuracy_ci:.3f}")
    print(f"  Predicted ROI: ${scenario.roi:,.0f}")
    print(f"  Confidence Level: {scenario.confidence:.1%}")
```

## 🚀 Model Deployment

### Staging Deployment
```python
# Deploy to staging environment
from phantom_ml_studio import ModelDeployment

deployer = ModelDeployment(client)

# Create staging deployment
staging_deployment = deployer.deploy_to_staging(
    model_id=model.id,
    deployment_config={
        "environment": "staging",
        "scaling": {
            "min_instances": 1,
            "max_instances": 3,
            "target_cpu": 70
        },
        "monitoring": {
            "enabled": True,
            "alerts": ["latency", "accuracy", "drift"]
        },
        "testing": {
            "canary_percentage": 10,
            "duration_hours": 24
        }
    }
)

# Monitor staging performance
performance = deployer.get_deployment_metrics(staging_deployment.id)
print(f"Staging Performance:")
print(f"Latency P95: {performance.latency_p95:.0f}ms")
print(f"Throughput: {performance.requests_per_second:.1f} req/s")
print(f"Accuracy: {performance.accuracy:.3f}")
```

### Production Readiness Checklist
```python
# Automated production readiness assessment
readiness = deployer.assess_production_readiness(
    model_id=model.id,
    criteria={
        "performance": {
            "min_accuracy": 0.85,
            "max_latency": 500,
            "min_throughput": 100
        },
        "quality": {
            "data_drift_threshold": 0.1,
            "model_stability": True,
            "feature_importance_consistency": True
        },
        "compliance": {
            "audit_trail": True,
            "explainability": True,
            "bias_assessment": True
        }
    }
)

if readiness.is_ready:
    print("✅ Model is ready for production deployment")
else:
    print("❌ Production readiness issues found:")
    for issue in readiness.issues:
        print(f"  - {issue.category}: {issue.description}")
```

## 🔍 Advanced Analytics

### Statistical Analysis
```python
# Advanced statistical analysis capabilities
from phantom_ml_studio import StatisticalAnalyzer

stats = StatisticalAnalyzer(client)

# Hypothesis testing
ab_test_results = stats.hypothesis_test(
    control_group="model_a_predictions",
    treatment_group="model_b_predictions",
    metric="conversion_rate",
    test_type="t_test",
    alpha=0.05
)

# Time series analysis
time_series_analysis = stats.time_series_analysis(
    data="monthly_sales",
    components=["trend", "seasonality", "cyclical"],
    forecast_periods=12
)

# Causal inference
causal_analysis = stats.causal_inference(
    treatment="model_intervention",
    outcome="business_metric",
    confounders=["customer_segment", "season", "geography"],
    method="doubly_robust"
)
```

### Cohort Analysis
```python
# Customer cohort analysis
cohort_analysis = stats.cohort_analysis(
    dataset="customer_transactions",
    user_id_column="customer_id",
    time_column="transaction_date",
    metric_column="revenue",
    cohort_period="monthly"
)

# Retention analysis
retention = stats.retention_analysis(
    dataset="user_activity",
    user_id_column="user_id",
    activity_date_column="login_date",
    periods=[1, 7, 30, 90, 365]
)
```

## 🤝 Collaboration Features

### Team Workspaces
```python
# Create and manage team workspaces
from phantom_ml_studio import TeamWorkspace

workspace = TeamWorkspace(client)

# Create team workspace
ds_team_workspace = workspace.create(
    name="Data Science Team",
    description="Collaborative workspace for DS team projects",
    members=[
        {"email": "alice@company.com", "role": "lead"},
        {"email": "bob@company.com", "role": "senior"},
        {"email": "charlie@company.com", "role": "junior"}
    ]
)

# Share experiments and models
workspace.share_experiment(
    workspace_id=ds_team_workspace.id,
    experiment_id=experiment1.id,
    permissions=["read", "comment"]
)

workspace.share_model(
    workspace_id=ds_team_workspace.id,
    model_id=model.id,
    permissions=["read", "deploy"]
)

# Add discussion threads
discussion = workspace.create_discussion(
    workspace_id=ds_team_workspace.id,
    title="Model Performance Review",
    content="Let's discuss the latest model results and next steps.",
    tags=["review", "performance"]
)
```

### Knowledge Management
```python
# Document and share knowledge
from phantom_ml_studio import KnowledgeBase

kb = KnowledgeBase(client)

# Create documentation
documentation = kb.create_document(
    title="Customer Churn Model Documentation",
    content="## Model Overview\n\nThis model predicts customer churn...",
    tags=["model", "churn", "documentation"],
    workspace_id=ds_team_workspace.id
)

# Share best practices
best_practice = kb.create_best_practice(
    title="Feature Engineering Guidelines",
    category="data_preprocessing",
    content="## Guidelines for Feature Engineering\n\n1. Always validate...",
    examples=[
        {"title": "Example 1", "code": "# Feature scaling example\n..."}
    ]
)

# Create model cards
model_card = kb.create_model_card(
    model_id=model.id,
    sections={
        "overview": "Fraud detection model using XGBoost",
        "intended_use": "Real-time fraud detection in payment processing",
        "performance": "F1-score: 0.92, Precision: 0.89, Recall: 0.95",
        "limitations": "May have reduced performance on new merchant categories",
        "ethical_considerations": "Bias assessment completed for protected attributes"
    }
)
```

## 📋 Best Practices for Data Scientists

### Development Workflow
1. **Start with EDA**: Always begin with thorough exploratory data analysis
2. **Version Everything**: Use experiment tracking for all model iterations
3. **Document Assumptions**: Clearly document all assumptions and decisions
4. **Validate Rigorously**: Use proper cross-validation and holdout testing
5. **Monitor Continuously**: Set up monitoring for deployed models

### Code Organization
```python
# Recommended project structure
project/
├── data/
│   ├── raw/
│   ├── processed/
│   └── external/
├── notebooks/
│   ├── 01_exploration.ipynb
│   ├── 02_preprocessing.ipynb
│   └── 03_modeling.ipynb
├── src/
│   ├── data/
│   ├── features/
│   ├── models/
│   └── visualization/
├── experiments/
├── models/
└── reports/
```

### Performance Optimization
```python
# Optimize data loading and processing
import dask.dataframe as dd

# Use Dask for large datasets
df = dd.read_csv("large_dataset.csv")
processed_df = df.map_partitions(preprocess_function)

# Enable parallel processing
from phantom_ml_studio import Config
Config.set_parallel_processing(True, n_jobs=4)

# Use caching for expensive operations
@cache_result(ttl=3600)
def expensive_feature_engineering(data):
    return processed_data
```

## 🎯 Common Use Cases

### Fraud Detection Pipeline
```python
# Complete fraud detection workflow
def fraud_detection_pipeline():
    # 1. Data preparation
    data = client.data.load("transactions")
    quality_report = client.analytics.data_quality_assessment(data.id)

    # 2. Feature engineering
    features = client.features.create_fraud_features(data.id)

    # 3. Model training
    model = client.automl.train(
        dataset=data.id,
        target="is_fraud",
        problem_type="classification",
        time_budget=60
    )

    # 4. Evaluation
    evaluation = client.models.evaluate(model.id, test_data="fraud_test")

    # 5. Deployment
    if evaluation.f1_score > 0.9:
        deployment = client.models.deploy(model.id, environment="production")
        return deployment
    else:
        raise ValueError("Model performance below threshold")
```

### Customer Lifetime Value Prediction
```python
# CLV prediction workflow
def clv_prediction_pipeline():
    # Historical transaction data
    transactions = client.data.load("customer_transactions")

    # Feature engineering for CLV
    clv_features = client.features.create_clv_features(
        transactions.id,
        customer_id_col="customer_id",
        transaction_date_col="purchase_date",
        amount_col="transaction_amount"
    )

    # Time series modeling
    model = client.models.train_time_series(
        dataset=clv_features.id,
        target="clv_12_months",
        algorithm="lstm",
        sequence_length=12
    )

    # Business impact analysis
    roi = client.business.calculate_clv_roi(
        model_id=model.id,
        marketing_cost_per_customer=50
    )

    return model, roi
```

## 📚 Learning Resources

### Platform Training
- **Interactive Tutorials**: Built-in tutorials for common workflows
- **Video Courses**: Comprehensive video training series
- **Documentation**: Complete API and feature documentation
- **Community Forum**: Ask questions and share solutions
- **Office Hours**: Weekly Q&A sessions with platform experts

### External Resources
- **Recommended Books**: Curated list of ML and data science books
- **Online Courses**: Integration with Coursera, edX, and Udacity
- **Conferences**: List of relevant ML conferences and events
- **Research Papers**: Access to latest ML research and implementations

---

**Next Steps**: Continue with the [ML Engineers Guide](./ml-engineers.md) to learn about production deployment and monitoring workflows.