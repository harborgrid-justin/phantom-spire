/**
 * Sample datasets and algorithm definitions for the Model Builder
 */

import { Dataset, AlgorithmInfo, Column } from '../../../../../lib/ml-core/types';

// Sample datasets for demo
export const sampleDatasets: Dataset[] = [
  {
    id: 'employee-performance',
    name: 'Employee Performance Dataset',
    description: 'HR analytics data for predicting employee performance scores',
    rows: 1000,
    columns: 12,
    size: '85 KB',
    type: 'sample'
  },
  {
    id: 'customer-churn',
    name: 'Customer Churn Analysis',
    description: 'Customer behavior data for churn prediction',
    rows: 5000,
    columns: 18,
    size: '220 KB',
    type: 'sample'
  },
  {
    id: 'fraud-detection',
    name: 'Fraud Detection Dataset',
    description: 'Transaction data for fraud detection models',
    rows: 50000,
    columns: 25,
    size: '2.1 MB',
    type: 'sample'
  }
];

// Algorithm definitions
export const algorithmCategories = {
  classification: [
    {
      id: 'random-forest',
      name: 'Random Forest',
      category: 'classification' as const,
      description: 'Ensemble method combining multiple decision trees',
      pros: ['High accuracy', 'Handles missing values', 'Feature importance'],
      cons: ['Less interpretable', 'Can overfit'],
      complexity: 'Intermediate' as const,
      estimatedAccuracy: 87,
      trainingTime: '2-5 minutes',
      inferenceSpeed: 'Fast'
    },
    {
      id: 'svm',
      name: 'Support Vector Machine',
      category: 'classification' as const,
      description: 'Creates optimal decision boundaries between classes',
      pros: ['Effective in high dimensions', 'Memory efficient'],
      cons: ['Slow on large datasets', 'Requires feature scaling'],
      complexity: 'Advanced' as const,
      estimatedAccuracy: 85,
      trainingTime: '5-10 minutes',
      inferenceSpeed: 'Medium'
    },
    {
      id: 'logistic-regression',
      name: 'Logistic Regression',
      category: 'classification' as const,
      description: 'Linear model for binary and multiclass classification',
      pros: ['Fast training', 'Interpretable', 'Probabilistic output'],
      cons: ['Assumes linear relationship', 'Sensitive to outliers'],
      complexity: 'Beginner' as const,
      estimatedAccuracy: 82,
      trainingTime: '< 1 minute',
      inferenceSpeed: 'Very Fast'
    },
    {
      id: 'naive-bayes',
      name: 'Naive Bayes',
      category: 'classification' as const,
      description: 'Probabilistic classifier based on Bayes theorem',
      pros: ['Fast training', 'Good with small datasets', 'Handles categorical features'],
      cons: ['Strong independence assumption', 'Can be biased'],
      complexity: 'Beginner' as const,
      estimatedAccuracy: 78,
      trainingTime: '< 1 minute',
      inferenceSpeed: 'Very Fast'
    }
  ],
  regression: [
    {
      id: 'linear-regression',
      name: 'Linear Regression',
      category: 'regression' as const,
      description: 'Simple linear relationship between features and target',
      pros: ['Very interpretable', 'Fast training', 'No hyperparameters'],
      cons: ['Assumes linear relationship', 'Sensitive to outliers'],
      complexity: 'Beginner' as const,
      estimatedAccuracy: 75,
      trainingTime: '< 1 minute',
      inferenceSpeed: 'Very Fast'
    },
    {
      id: 'ridge-regression',
      name: 'Ridge Regression',
      category: 'regression' as const,
      description: 'Linear regression with L2 regularization',
      pros: ['Handles multicollinearity', 'Reduces overfitting'],
      cons: ['Still assumes linear relationship', 'Requires tuning'],
      complexity: 'Intermediate' as const,
      estimatedAccuracy: 78,
      trainingTime: '1-2 minutes',
      inferenceSpeed: 'Very Fast'
    },
    {
      id: 'lasso-regression',
      name: 'Lasso Regression',
      category: 'regression' as const,
      description: 'Linear regression with L1 regularization for feature selection',
      pros: ['Feature selection', 'Sparse models', 'Interpretable'],
      cons: ['Can be unstable', 'Requires tuning'],
      complexity: 'Intermediate' as const,
      estimatedAccuracy: 77,
      trainingTime: '1-3 minutes',
      inferenceSpeed: 'Very Fast'
    },
    {
      id: 'polynomial-regression',
      name: 'Polynomial Regression',
      category: 'regression' as const,
      description: 'Linear regression with polynomial features',
      pros: ['Captures non-linear relationships', 'Still interpretable'],
      cons: ['Risk of overfitting', 'Computationally expensive'],
      complexity: 'Intermediate' as const,
      estimatedAccuracy: 80,
      trainingTime: '2-5 minutes',
      inferenceSpeed: 'Fast'
    }
  ],
  clustering: [
    {
      id: 'kmeans',
      name: 'K-Means',
      category: 'clustering' as const,
      description: 'Partitions data into k clusters',
      pros: ['Simple and fast', 'Works well with spherical clusters'],
      cons: ['Requires specifying k', 'Sensitive to initialization'],
      complexity: 'Beginner' as const,
      estimatedAccuracy: 70,
      trainingTime: '1-2 minutes',
      inferenceSpeed: 'Very Fast'
    }
  ],
  'neural-networks': [
    {
      id: 'mlp',
      name: 'Multi-Layer Perceptron',
      category: 'neural-networks' as const,
      description: 'Feed-forward neural network with hidden layers',
      pros: ['Can learn complex patterns', 'Flexible architecture'],
      cons: ['Requires large datasets', 'Black box', 'Slow training'],
      complexity: 'Advanced' as const,
      estimatedAccuracy: 88,
      trainingTime: '10-30 minutes',
      inferenceSpeed: 'Medium'
    }
  ]
};

export const wizardSteps = [
  'Create Model', 
  'Select Dataset', 
  'Choose Target', 
  'Select Features', 
  'Choose Algorithm', 
  'Configure & Train'
];

// Sample columns for employee performance dataset
export const sampleColumns: Column[] = [
  { name: 'employee_id', type: 'categorical', nullCount: 0, unique: 1000 },
  { name: 'department', type: 'categorical', nullCount: 0, unique: 8 },
  { name: 'years_experience', type: 'numeric', nullCount: 0, unique: 15 },
  { name: 'training_hours', type: 'numeric', nullCount: 5, unique: 120 },
  { name: 'projects_completed', type: 'numeric', nullCount: 0, unique: 25 },
  { name: 'performance_score', type: 'numeric', nullCount: 0, unique: 100 },
  { name: 'salary', type: 'numeric', nullCount: 2, unique: 850 },
  { name: 'manager_rating', type: 'numeric', nullCount: 10, unique: 10 },
  { name: 'team_size', type: 'numeric', nullCount: 0, unique: 12 },
  { name: 'remote_work_days', type: 'numeric', nullCount: 0, unique: 6 },
  { name: 'certifications', type: 'numeric', nullCount: 20, unique: 8 },
  { name: 'overtime_hours', type: 'numeric', nullCount: 0, unique: 60 }
];
