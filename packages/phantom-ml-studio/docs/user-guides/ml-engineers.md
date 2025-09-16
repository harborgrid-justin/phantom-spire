# ML Engineers Guide

**Complete guide for ML model deployment, monitoring, and production operations**

This comprehensive guide covers everything ML engineers need to know to successfully deploy, monitor, and maintain machine learning models in production using Phantom ML Studio.

## 🎯 Overview for ML Engineers

Phantom ML Studio provides enterprise-grade infrastructure for ML operations with:
- **Production-Ready Deployment**: Automated deployment pipelines with zero-downtime updates
- **Comprehensive Monitoring**: Real-time performance tracking and alerting
- **Scalable Infrastructure**: Auto-scaling capabilities for variable workloads
- **DevOps Integration**: Native integration with CI/CD pipelines and infrastructure tools
- **Enterprise Security**: Built-in compliance and security features

### Key Capabilities for ML Engineers
| Feature | Description | Benefit |
|---------|-------------|---------|
| **Model Registry** | Centralized model versioning and metadata management | Organized model lifecycle |
| **Deployment Pipelines** | Automated CI/CD for ML models | Faster, reliable deployments |
| **Performance Monitoring** | Real-time model and infrastructure monitoring | Proactive issue detection |
| **A/B Testing Framework** | Built-in experimentation platform | Safe model rollouts |
| **Infrastructure Management** | Container orchestration and scaling | Efficient resource utilization |

## 🚀 Getting Started

### Environment Setup
```bash
# Configure ML Engineering environment
phantom-ml-studio auth login --username ml-engineer

# Set up deployment workspace
phantom-ml-studio workspace create --name "ml-ops-workspace" --type production
phantom-ml-studio workspace activate --name "ml-ops-workspace"

# Install ML Ops tools
phantom-ml-studio tools install kubectl helm docker-compose

# Configure deployment environments
phantom-ml-studio env create --name staging --type kubernetes
phantom-ml-studio env create --name production --type kubernetes
```

### Access Control Setup
```bash
# Configure deployment permissions
phantom-ml-studio rbac assign --user ml-engineer@company.com --role ml-engineer
phantom-ml-studio rbac grant --role ml-engineer --permissions "models:deploy,infrastructure:manage,monitoring:read"

# Set up service accounts for automated deployments
phantom-ml-studio service-account create --name ml-deployment-bot --roles deploy-automation
```

## 📦 Model Registry and Versioning

### Model Registration
```python
# Register models in the centralized registry
from phantom_ml_studio import ModelRegistry

registry = ModelRegistry(client)

# Register a new model
model_registration = registry.register_model(
    name="fraud-detection-v2",
    description="Enhanced fraud detection with deep learning",
    model_path="./models/fraud_detector_v2.pkl",
    metadata={
        "algorithm": "xgboost",
        "framework": "scikit-learn",
        "version": "2.1.0",
        "training_date": "2024-01-15",
        "performance_metrics": {
            "accuracy": 0.947,
            "precision": 0.923,
            "recall": 0.891,
            "f1_score": 0.907
        },
        "training_config": {
            "dataset_size": 1000000,
            "features": 45,
            "training_time_hours": 3.2
        }
    },
    tags=["fraud", "production", "xgboost"],
    stage="staging"
)

print(f"Model registered with ID: {model_registration.model_id}")
```

### Model Versioning
```python
# Advanced model versioning and lifecycle management
model_version = registry.create_version(
    model_id="fraud-detection-v2",
    version="2.1.1",
    model_path="./models/fraud_detector_v2_1.pkl",
    changes=[
        "Improved feature engineering pipeline",
        "Enhanced handling of edge cases",
        "Updated hyperparameters for better performance"
    ],
    performance_comparison={
        "baseline_version": "2.1.0",
        "improvements": {
            "accuracy": "+0.003",
            "latency": "-15ms",
            "memory_usage": "-10%"
        }
    }
)

# Promote model through stages
registry.promote_model(
    model_id="fraud-detection-v2",
    version="2.1.1",
    from_stage="staging",
    to_stage="production",
    approval_required=True,
    reviewer="senior-ml-engineer@company.com"
)
```

### Model Lineage Tracking
```python
# Track complete model lineage and dependencies
lineage = registry.create_lineage(
    model_id="fraud-detection-v2",
    lineage_info={
        "source_data": [
            {
                "dataset": "transactions_2024_q1",
                "version": "1.3",
                "hash": "sha256:abc123..."
            }
        ],
        "feature_pipelines": [
            {
                "pipeline": "fraud_features_v3",
                "version": "1.2",
                "transformations": ["scaling", "encoding", "feature_selection"]
            }
        ],
        "training_code": {
            "repository": "ml-models/fraud-detection",
            "commit": "a1b2c3d4",
            "branch": "feature/enhanced-model"
        },
        "dependencies": {
            "python": "3.9.16",
            "scikit-learn": "1.3.0",
            "xgboost": "1.7.3",
            "pandas": "2.0.1"
        }
    }
)
```

## 🚀 Deployment Infrastructure

### Container-Based Deployment
```dockerfile
# Dockerfile for model serving
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY models/ ./models/
COPY config/ ./config/

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["python", "-m", "src.api.serve"]
```

### Kubernetes Deployment Configuration
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fraud-detection-v2
  labels:
    app: fraud-detection
    version: v2.1.1
    component: ml-model
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 2
  selector:
    matchLabels:
      app: fraud-detection
      version: v2.1.1
  template:
    metadata:
      labels:
        app: fraud-detection
        version: v2.1.1
        component: ml-model
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: fraud-detection
        image: phantomml/fraud-detection:v2.1.1
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: MODEL_VERSION
          value: "v2.1.1"
        - name: LOG_LEVEL
          value: "INFO"
        - name: METRICS_ENABLED
          value: "true"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 2
        volumeMounts:
        - name: model-data
          mountPath: /app/models
          readOnly: true
        - name: config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: model-data
        configMap:
          name: fraud-detection-model
      - name: config
        configMap:
          name: fraud-detection-config
      imagePullSecrets:
      - name: registry-secret

---
apiVersion: v1
kind: Service
metadata:
  name: fraud-detection-service
  labels:
    app: fraud-detection
spec:
  selector:
    app: fraud-detection
  ports:
  - name: http
    port: 80
    targetPort: 8080
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fraud-detection-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "1000"
spec:
  tls:
  - hosts:
    - api.frauddetection.company.com
    secretName: fraud-detection-tls
  rules:
  - host: api.frauddetection.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fraud-detection-service
            port:
              number: 80
```

### Automated Deployment Pipeline
```python
# Automated deployment using Phantom ML Studio
from phantom_ml_studio import DeploymentPipeline

pipeline = DeploymentPipeline(client)

# Create deployment pipeline
ml_pipeline = pipeline.create(
    name="fraud-detection-deployment",
    description="Automated deployment pipeline for fraud detection model"
)

# Configure pipeline stages
pipeline.add_stage(ml_pipeline.id, {
    "name": "model_validation",
    "type": "validation",
    "config": {
        "performance_checks": {
            "min_accuracy": 0.85,
            "max_latency": 100,
            "min_throughput": 1000
        },
        "security_scan": True,
        "dependency_check": True
    }
})

pipeline.add_stage(ml_pipeline.id, {
    "name": "build_container",
    "type": "containerization",
    "config": {
        "base_image": "python:3.9-slim",
        "registry": "phantomml.azurecr.io",
        "image_name": "fraud-detection",
        "tag_strategy": "version+hash"
    }
})

pipeline.add_stage(ml_pipeline.id, {
    "name": "deploy_staging",
    "type": "deployment",
    "config": {
        "environment": "staging",
        "strategy": "blue_green",
        "health_check_timeout": 300,
        "rollback_on_failure": True
    }
})

pipeline.add_stage(ml_pipeline.id, {
    "name": "integration_tests",
    "type": "testing",
    "config": {
        "test_suite": "integration_tests",
        "test_data": "staging_test_data",
        "success_criteria": {
            "test_pass_rate": 0.95,
            "performance_degradation": 0.05
        }
    }
})

pipeline.add_stage(ml_pipeline.id, {
    "name": "deploy_production",
    "type": "deployment",
    "config": {
        "environment": "production",
        "strategy": "canary",
        "canary_percentage": 5,
        "canary_duration": 3600,
        "approval_required": True,
        "approvers": ["senior-ml-engineer@company.com"]
    }
})

# Execute pipeline
execution = pipeline.execute(
    pipeline_id=ml_pipeline.id,
    model_id="fraud-detection-v2",
    version="2.1.1",
    trigger="automated"
)

# Monitor pipeline execution
status = pipeline.get_execution_status(execution.id)
print(f"Pipeline status: {status.phase}")
print(f"Current stage: {status.current_stage}")
print(f"Progress: {status.progress}%")
```

## 📊 Monitoring and Observability

### Model Performance Monitoring
```python
# Comprehensive model monitoring setup
from phantom_ml_studio import ModelMonitor

monitor = ModelMonitor(client)

# Create monitoring dashboard
monitoring_config = monitor.create_dashboard(
    model_id="fraud-detection-v2",
    dashboard_name="Fraud Detection Monitoring",
    metrics=[
        {
            "name": "prediction_latency",
            "type": "histogram",
            "thresholds": {"warning": 50, "critical": 100},
            "unit": "milliseconds"
        },
        {
            "name": "prediction_accuracy",
            "type": "gauge",
            "thresholds": {"warning": 0.9, "critical": 0.85},
            "unit": "percentage"
        },
        {
            "name": "throughput",
            "type": "counter",
            "thresholds": {"warning": 500, "critical": 100},
            "unit": "requests_per_second"
        },
        {
            "name": "error_rate",
            "type": "gauge",
            "thresholds": {"warning": 0.01, "critical": 0.05},
            "unit": "percentage"
        },
        {
            "name": "data_drift",
            "type": "gauge",
            "thresholds": {"warning": 0.1, "critical": 0.2},
            "unit": "drift_score"
        }
    ]
)

# Set up alerting rules
monitor.create_alert_rule(
    name="high_latency_alert",
    condition="prediction_latency_p95 > 100",
    severity="warning",
    description="Model prediction latency is above acceptable threshold",
    actions=[
        {"type": "email", "recipients": ["ml-team@company.com"]},
        {"type": "slack", "channel": "#ml-alerts"},
        {"type": "pagerduty", "service": "ml-platform"}
    ]
)

monitor.create_alert_rule(
    name="accuracy_degradation",
    condition="prediction_accuracy < 0.85",
    severity="critical",
    description="Model accuracy has dropped below critical threshold",
    actions=[
        {"type": "email", "recipients": ["ml-team@company.com", "cto@company.com"]},
        {"type": "slack", "channel": "#ml-critical"},
        {"type": "pagerduty", "service": "ml-platform"},
        {"type": "auto_rollback", "previous_version": "auto"}
    ]
)
```

### Infrastructure Monitoring
```python
# Infrastructure and resource monitoring
infra_monitor = monitor.create_infrastructure_monitor(
    deployment_id="fraud-detection-v2-prod",
    metrics=[
        "cpu_usage",
        "memory_usage",
        "disk_usage",
        "network_io",
        "container_restarts",
        "pod_status"
    ],
    aggregation_interval="1m",
    retention_period="30d"
)

# Custom metrics collection
monitor.add_custom_metric(
    name="business_impact",
    query="""
    SELECT
        COUNT(*) as prevented_frauds,
        SUM(transaction_amount) as saved_amount,
        AVG(customer_satisfaction) as satisfaction_score
    FROM fraud_predictions
    WHERE prediction = 'fraud'
    AND actual_fraud = true
    AND timestamp >= NOW() - INTERVAL 1 HOUR
    """,
    schedule="0 */1 * * *"  # Every hour
)
```

### Data Drift Detection
```python
# Automated data drift detection and alerting
from phantom_ml_studio import DriftDetector

drift_detector = DriftDetector(client)

# Configure drift detection
drift_config = drift_detector.create_detector(
    model_id="fraud-detection-v2",
    reference_dataset="training_data_2024_q1",
    detection_methods=[
        {
            "method": "kolmogorov_smirnov",
            "features": "numerical",
            "threshold": 0.05
        },
        {
            "method": "chi_square",
            "features": "categorical",
            "threshold": 0.05
        },
        {
            "method": "population_stability_index",
            "features": "all",
            "threshold": 0.1
        }
    ],
    monitoring_frequency="hourly",
    alert_thresholds={
        "minor_drift": 0.1,
        "major_drift": 0.2,
        "severe_drift": 0.3
    }
)

# Schedule drift analysis
drift_detector.schedule_analysis(
    detector_id=drift_config.id,
    schedule="0 */6 * * *",  # Every 6 hours
    data_source="production_predictions",
    sample_size=10000
)
```

## 🔄 A/B Testing and Experimentation

### A/B Testing Framework
```python
# Set up A/B testing for model deployment
from phantom_ml_studio import ABTestFramework

ab_test = ABTestFramework(client)

# Create A/B test experiment
experiment = ab_test.create_experiment(
    name="fraud_detection_v2_vs_v1",
    description="Compare performance of new fraud detection model",
    hypothesis="New model will improve precision by 5% without reducing recall",
    control_model={
        "model_id": "fraud-detection-v1",
        "version": "1.8.3",
        "traffic_percentage": 90
    },
    treatment_models=[
        {
            "model_id": "fraud-detection-v2",
            "version": "2.1.1",
            "traffic_percentage": 10
        }
    ],
    success_metrics=[
        {
            "name": "precision",
            "target_improvement": 0.05,
            "direction": "increase"
        },
        {
            "name": "recall",
            "target_improvement": 0.0,
            "direction": "maintain"
        },
        {
            "name": "latency",
            "target_improvement": -10,
            "direction": "decrease"
        }
    ],
    experiment_duration_days=14,
    minimum_sample_size=100000,
    statistical_power=0.8,
    significance_level=0.05
)

# Configure traffic routing
ab_test.configure_routing(
    experiment_id=experiment.id,
    routing_strategy="user_hash",
    routing_config={
        "hash_field": "user_id",
        "sticky_sessions": True,
        "ramp_up_schedule": [
            {"day": 1, "treatment_percentage": 5},
            {"day": 3, "treatment_percentage": 10},
            {"day": 7, "treatment_percentage": 15}
        ]
    }
)

# Monitor experiment progress
experiment_status = ab_test.get_experiment_status(experiment.id)
print(f"Experiment status: {experiment_status.phase}")
print(f"Sample size: {experiment_status.sample_size}")
print(f"Statistical significance: {experiment_status.is_significant}")

if experiment_status.is_significant:
    results = ab_test.get_results(experiment.id)
    print(f"Winner: {results.winner}")
    print(f"Confidence interval: {results.confidence_interval}")
    print(f"Effect size: {results.effect_size}")
```

### Canary Deployments
```python
# Automated canary deployment with gradual rollout
from phantom_ml_studio import CanaryDeployment

canary = CanaryDeployment(client)

# Configure canary deployment
canary_config = canary.create_deployment(
    model_id="fraud-detection-v2",
    version="2.1.1",
    environment="production",
    canary_strategy={
        "initial_percentage": 1,
        "target_percentage": 100,
        "increment_percentage": 5,
        "increment_interval_minutes": 30,
        "success_criteria": {
            "error_rate_threshold": 0.01,
            "latency_p95_threshold": 100,
            "minimum_requests": 1000
        },
        "auto_rollback": {
            "enabled": True,
            "failure_threshold": 3,
            "rollback_percentage": 0
        }
    }
)

# Monitor canary deployment
canary_status = canary.get_deployment_status(canary_config.id)

# Manual controls
if canary_status.current_percentage < 10:
    canary.promote(canary_config.id, target_percentage=25)
elif canary_status.error_rate > 0.02:
    canary.rollback(canary_config.id)
```

## 🔧 Infrastructure Management

### Auto-Scaling Configuration
```python
# Configure intelligent auto-scaling for ML workloads
from phantom_ml_studio import AutoScaler

scaler = AutoScaler(client)

# Create scaling policy
scaling_policy = scaler.create_policy(
    deployment_id="fraud-detection-v2-prod",
    scaling_config={
        "min_replicas": 2,
        "max_replicas": 20,
        "metrics": [
            {
                "type": "cpu_utilization",
                "target": 70,
                "weight": 0.4
            },
            {
                "type": "memory_utilization",
                "target": 80,
                "weight": 0.3
            },
            {
                "type": "request_rate",
                "target": 1000,
                "weight": 0.3
            }
        ],
        "scale_up": {
            "cooldown_seconds": 300,
            "step_size": 2,
            "stabilization_window": 180
        },
        "scale_down": {
            "cooldown_seconds": 600,
            "step_size": 1,
            "stabilization_window": 300
        }
    }
)

# Predictive scaling based on historical patterns
scaler.enable_predictive_scaling(
    policy_id=scaling_policy.id,
    prediction_window_hours=2,
    historical_data_days=30,
    confidence_threshold=0.8
)
```

### Resource Optimization
```python
# Automated resource optimization and cost management
from phantom_ml_studio import ResourceOptimizer

optimizer = ResourceOptimizer(client)

# Analyze resource utilization
utilization_report = optimizer.analyze_utilization(
    deployment_id="fraud-detection-v2-prod",
    time_range="last_30_days",
    include_recommendations=True
)

print(f"Average CPU utilization: {utilization_report.cpu.average:.1%}")
print(f"Peak memory usage: {utilization_report.memory.peak:.1f}GB")
print(f"Cost optimization potential: ${utilization_report.cost_savings.monthly:.2f}/month")

# Apply optimization recommendations
if utilization_report.recommendations:
    for rec in utilization_report.recommendations:
        if rec.confidence > 0.8:
            optimizer.apply_recommendation(
                deployment_id="fraud-detection-v2-prod",
                recommendation_id=rec.id,
                approval_required=True
            )

# Set up automated cost optimization
optimizer.create_cost_optimization_policy(
    deployment_id="fraud-detection-v2-prod",
    policy={
        "enable_spot_instances": True,
        "max_spot_percentage": 50,
        "cost_threshold_alert": 1000,
        "automatic_rightsizing": True,
        "idle_resource_cleanup": True
    }
)
```

## 🔍 Performance Optimization

### Model Optimization for Production
```python
# Optimize models for production deployment
from phantom_ml_studio import ModelOptimizer

optimizer = ModelOptimizer(client)

# Quantization for reduced model size and faster inference
quantized_model = optimizer.quantize(
    model_id="fraud-detection-v2",
    quantization_config={
        "method": "dynamic_quantization",
        "target_dtype": "int8",
        "preserve_accuracy_threshold": 0.99
    }
)

# Model pruning for efficiency
pruned_model = optimizer.prune(
    model_id="fraud-detection-v2",
    pruning_config={
        "method": "magnitude_based",
        "sparsity_level": 0.2,
        "structured_pruning": True
    }
)

# Knowledge distillation for smaller models
distilled_model = optimizer.distill(
    teacher_model_id="fraud-detection-v2",
    student_architecture="lightweight_xgboost",
    distillation_config={
        "temperature": 3.0,
        "alpha": 0.7,
        "epochs": 50
    }
)

# Benchmark optimized models
benchmark_results = optimizer.benchmark_models(
    model_ids=[
        "fraud-detection-v2",
        quantized_model.id,
        pruned_model.id,
        distilled_model.id
    ],
    benchmark_config={
        "batch_sizes": [1, 10, 100, 1000],
        "metrics": ["latency", "throughput", "memory_usage", "accuracy"],
        "iterations": 100
    }
)
```

### Batch Processing Optimization
```python
# Optimize batch inference workloads
from phantom_ml_studio import BatchProcessor

batch_processor = BatchProcessor(client)

# Configure optimal batch processing
batch_job = batch_processor.create_job(
    name="daily_fraud_scoring",
    model_id="fraud-detection-v2",
    input_config={
        "data_source": "s3://company-data/transactions/daily/",
        "format": "parquet",
        "partitioning": "date",
        "batch_size": 10000
    },
    processing_config={
        "parallelism": 8,
        "memory_per_worker": "4GB",
        "cpu_per_worker": 2,
        "timeout_minutes": 60,
        "retry_failed_batches": True,
        "max_retries": 3
    },
    output_config={
        "destination": "s3://company-data/predictions/daily/",
        "format": "parquet",
        "compression": "snappy",
        "partitioning": "date"
    },
    schedule="0 2 * * *"  # Daily at 2 AM
)

# Monitor batch job execution
job_status = batch_processor.get_job_status(batch_job.id)
print(f"Job status: {job_status.phase}")
print(f"Processed batches: {job_status.completed_batches}/{job_status.total_batches}")
print(f"Processing rate: {job_status.records_per_second:.0f} records/sec")
```

## 🔐 Security and Compliance

### Model Security Scanning
```python
# Automated security scanning for ML models
from phantom_ml_studio import SecurityScanner

security = SecurityScanner(client)

# Comprehensive security scan
scan_results = security.scan_model(
    model_id="fraud-detection-v2",
    scan_types=[
        "vulnerability_assessment",
        "dependency_check",
        "secret_detection",
        "malware_scan",
        "adversarial_robustness"
    ]
)

# Model adversarial testing
adversarial_test = security.adversarial_test(
    model_id="fraud-detection-v2",
    attack_methods=[
        "fgsm",           # Fast Gradient Sign Method
        "pgd",            # Projected Gradient Descent
        "c_and_w",        # Carlini & Wagner
        "boundary_attack" # Boundary Attack
    ],
    test_dataset="adversarial_test_set",
    robustness_threshold=0.8
)

print(f"Adversarial robustness score: {adversarial_test.robustness_score:.3f}")
if adversarial_test.robustness_score < 0.8:
    print("⚠️ Model may be vulnerable to adversarial attacks")

    # Apply defensive measures
    defended_model = security.apply_defenses(
        model_id="fraud-detection-v2",
        defenses=[
            "adversarial_training",
            "input_preprocessing",
            "ensemble_defense"
        ]
    )
```

### Compliance Monitoring
```python
# Automated compliance monitoring and reporting
from phantom_ml_studio import ComplianceMonitor

compliance = ComplianceMonitor(client)

# Set up compliance frameworks
compliance_config = compliance.configure_frameworks(
    deployment_id="fraud-detection-v2-prod",
    frameworks=[
        {
            "name": "gdpr",
            "requirements": [
                "data_protection",
                "right_to_explanation",
                "data_retention_limits",
                "consent_management"
            ]
        },
        {
            "name": "pci_dss",
            "requirements": [
                "data_encryption",
                "access_controls",
                "audit_trails",
                "vulnerability_management"
            ]
        },
        {
            "name": "sox",
            "requirements": [
                "financial_reporting_controls",
                "audit_trails",
                "segregation_of_duties"
            ]
        }
    ]
)

# Generate compliance reports
compliance_report = compliance.generate_report(
    deployment_id="fraud-detection-v2-prod",
    report_type="comprehensive",
    time_period="quarterly",
    include_evidence=True
)

# Automated compliance checks
compliance.schedule_checks(
    deployment_id="fraud-detection-v2-prod",
    check_frequency="daily",
    alert_on_violations=True,
    auto_remediation=True
)
```

## 📊 Business Impact Measurement

### ROI Tracking and Analysis
```python
# Comprehensive business impact measurement
from phantom_ml_studio import BusinessImpactTracker

impact_tracker = BusinessImpactTracker(client)

# Configure business metrics tracking
impact_config = impact_tracker.configure_tracking(
    model_id="fraud-detection-v2",
    business_metrics={
        "prevented_fraud_amount": {
            "calculation": "SUM(transaction_amount WHERE prediction='fraud' AND actual_fraud=true)",
            "unit": "USD",
            "frequency": "daily"
        },
        "false_positive_cost": {
            "calculation": "COUNT(*) * 15 WHERE prediction='fraud' AND actual_fraud=false",
            "unit": "USD",
            "frequency": "daily"
        },
        "operational_cost": {
            "calculation": "infrastructure_cost + personnel_cost + licensing_cost",
            "unit": "USD",
            "frequency": "monthly"
        },
        "customer_satisfaction": {
            "calculation": "AVG(satisfaction_score)",
            "unit": "percentage",
            "frequency": "weekly"
        }
    }
)

# Calculate ROI and business impact
impact_analysis = impact_tracker.calculate_impact(
    model_id="fraud-detection-v2",
    time_period="last_quarter",
    baseline_comparison=True
)

print(f"Quarterly Business Impact:")
print(f"Revenue Protected: ${impact_analysis.revenue_protected:,.2f}")
print(f"Cost Savings: ${impact_analysis.cost_savings:,.2f}")
print(f"Total ROI: {impact_analysis.roi_percentage:.1f}%")
print(f"Payback Period: {impact_analysis.payback_months:.1f} months")

# Create executive dashboard
executive_dashboard = impact_tracker.create_executive_dashboard(
    model_id="fraud-detection-v2",
    metrics=[
        "monthly_roi",
        "prevented_fraud_amount",
        "model_accuracy",
        "customer_satisfaction",
        "operational_efficiency"
    ],
    update_frequency="daily"
)
```

## 🔧 Maintenance and Lifecycle Management

### Automated Model Retraining
```python
# Set up automated model retraining pipelines
from phantom_ml_studio import RetrainingPipeline

retraining = RetrainingPipeline(client)

# Configure retraining triggers
retraining_config = retraining.create_pipeline(
    model_id="fraud-detection-v2",
    retraining_triggers=[
        {
            "type": "performance_degradation",
            "threshold": 0.05,  # 5% accuracy drop
            "window": "7_days"
        },
        {
            "type": "data_drift",
            "threshold": 0.2,
            "detection_method": "kolmogorov_smirnov"
        },
        {
            "type": "scheduled",
            "schedule": "0 2 1 * *"  # Monthly on 1st at 2 AM
        },
        {
            "type": "data_volume",
            "threshold": 100000,  # New training samples
            "window": "30_days"
        }
    ],
    retraining_config={
        "data_source": "production_feedback",
        "validation_strategy": "time_series_split",
        "performance_improvement_threshold": 0.02,
        "auto_deploy": False,  # Require manual approval
        "notification_recipients": ["ml-team@company.com"]
    }
)

# Monitor retraining pipeline
pipeline_status = retraining.get_pipeline_status(retraining_config.id)
if pipeline_status.retraining_recommended:
    print(f"⚠️ Retraining recommended due to: {pipeline_status.trigger_reason}")

    # Trigger manual retraining
    retraining_job = retraining.trigger_retraining(
        pipeline_id=retraining_config.id,
        data_end_date="2024-01-31",
        validation_strategy="holdout",
        approval_required=True
    )
```

### Model Retirement and Archival
```python
# Manage model lifecycle and retirement
from phantom_ml_studio import ModelLifecycle

lifecycle = ModelLifecycle(client)

# Assess model for retirement
retirement_assessment = lifecycle.assess_retirement(
    model_id="fraud-detection-v1",
    criteria={
        "performance_comparison": {
            "current_model": "fraud-detection-v2",
            "metrics": ["accuracy", "precision", "recall"]
        },
        "usage_metrics": {
            "min_daily_requests": 100,
            "usage_trend": "declining"
        },
        "maintenance_cost": {
            "monthly_cost_threshold": 1000
        },
        "business_value": {
            "roi_threshold": 0.1
        }
    }
)

if retirement_assessment.recommend_retirement:
    print(f"Model retirement recommended:")
    for reason in retirement_assessment.reasons:
        print(f"  - {reason}")

    # Plan retirement
    retirement_plan = lifecycle.plan_retirement(
        model_id="fraud-detection-v1",
        retirement_strategy={
            "migration_plan": {
                "target_model": "fraud-detection-v2",
                "migration_duration_days": 30,
                "traffic_transition": "gradual"
            },
            "data_retention": {
                "keep_model_artifacts": True,
                "archive_predictions": True,
                "retention_period": "7_years"
            },
            "notification_plan": {
                "advance_notice_days": 60,
                "stakeholders": ["ml-team@company.com", "product-team@company.com"]
            }
        }
    )

    # Execute retirement
    lifecycle.execute_retirement(retirement_plan.id)
```

## 📋 Best Practices for ML Engineers

### CI/CD Pipeline Integration
```yaml
# .github/workflows/ml-deployment.yml
name: ML Model CI/CD Pipeline

on:
  push:
    branches: [main]
    paths: [models/**, src/**, requirements.txt]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov

    - name: Run unit tests
      run: pytest tests/unit/ --cov=src/

    - name: Model validation tests
      run: pytest tests/model/ --cov=src/models/

    - name: Integration tests
      run: pytest tests/integration/

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: |
        docker build -t fraud-detection:${{ github.sha }} .

    - name: Run security scan
      run: |
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          aquasec/trivy image fraud-detection:${{ github.sha }}

    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push fraud-detection:${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to staging
      run: |
        phantom-ml-studio deploy \
          --model-id fraud-detection-v2 \
          --image fraud-detection:${{ github.sha }} \
          --environment staging \
          --wait-for-ready

    - name: Run integration tests
      run: |
        phantom-ml-studio test \
          --environment staging \
          --test-suite integration \
          --timeout 300

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - name: Deploy to production
      run: |
        phantom-ml-studio deploy \
          --model-id fraud-detection-v2 \
          --image fraud-detection:${{ github.sha }} \
          --environment production \
          --strategy canary \
          --canary-percentage 5 \
          --approval-required
```

### Monitoring Best Practices
1. **Multi-Layer Monitoring**: Monitor at application, model, and infrastructure levels
2. **Proactive Alerting**: Set up alerts before issues become critical
3. **Business Metrics**: Track business impact, not just technical metrics
4. **Data Quality**: Monitor input data quality and drift continuously
5. **Performance Baselines**: Establish and maintain performance baselines

### Security Best Practices
1. **Principle of Least Privilege**: Grant minimal necessary permissions
2. **Regular Security Scans**: Automate vulnerability assessments
3. **Secure Communication**: Use TLS for all communications
4. **Audit Trails**: Maintain comprehensive audit logs
5. **Model Signing**: Sign models to ensure integrity

---

**Next Steps**: Continue with the [Enterprise Methods API Reference](../api-reference/enterprise-methods.md) for detailed API documentation.