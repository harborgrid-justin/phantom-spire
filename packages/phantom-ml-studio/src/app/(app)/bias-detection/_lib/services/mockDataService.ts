/**
 * Mock Data Service for Bias Detection Engine
 * Generates sample bias reports and fairness analysis data
 */

import { BiasReport, FairnessAnalysis } from '../../../../../lib/ml-core/types';

export class MockDataService {
  static generateBiasReports(): BiasReport[] {
    return [
      {
        id: 'report_1',
        modelId: 'model_hiring',
        modelName: 'Hiring Decision Model',
        timestamp: new Date(Date.now() - 3600000),
        overallScore: 0.72,
        status: 'moderate',
        metrics: [
          { metric: 'Demographic Parity', value: 0.85, threshold: 0.8, status: 'pass', description: 'Selection rate difference between groups' },
          { metric: 'Equalized Odds', value: 0.75, threshold: 0.8, status: 'warning', description: 'TPR and FPR equality across groups' },
          { metric: 'Equal Opportunity', value: 0.65, threshold: 0.8, status: 'fail', description: 'TPR equality for positive outcomes' },
          { metric: 'Calibration', value: 0.88, threshold: 0.8, status: 'pass', description: 'Prediction accuracy across groups' }
        ],
        protectedAttributes: ['gender', 'race', 'age'],
        recommendations: [
          'Immediate review of model bias required',
          'Retrain model with balanced dataset', 
          'Apply post-processing bias mitigation',
          'Regular monitoring of fairness metrics needed',
          'Document bias testing procedures'
        ]
      },
      {
        id: 'report_2',
        modelId: 'model_credit',
        modelName: 'Credit Approval Model',
        timestamp: new Date(Date.now() - 7200000),
        overallScore: 0.91,
        status: 'good',
        metrics: [
          { metric: 'Demographic Parity', value: 0.92, threshold: 0.8, status: 'pass', description: 'Selection rate difference between groups' },
          { metric: 'Equalized Odds', value: 0.89, threshold: 0.8, status: 'pass', description: 'TPR and FPR equality across groups' },
          { metric: 'Equal Opportunity', value: 0.91, threshold: 0.8, status: 'pass', description: 'TPR equality for positive outcomes' },
          { metric: 'Calibration', value: 0.93, threshold: 0.8, status: 'pass', description: 'Prediction accuracy across groups' }
        ],
        protectedAttributes: ['race', 'gender'],
        recommendations: [
          'Continue monitoring model performance',
          'Regular bias audits recommended'
        ]
      },
      {
        id: 'report_3',
        modelId: 'model_healthcare',
        modelName: 'Treatment Recommendation',
        timestamp: new Date(Date.now() - 10800000),
        overallScore: 0.58,
        status: 'high_bias',
        metrics: [
          { metric: 'Demographic Parity', value: 0.45, threshold: 0.8, status: 'fail', description: 'Selection rate difference between groups' },
          { metric: 'Equalized Odds', value: 0.52, threshold: 0.8, status: 'fail', description: 'TPR and FPR equality across groups' },
          { metric: 'Equal Opportunity', value: 0.68, threshold: 0.8, status: 'warning', description: 'TPR equality for positive outcomes' },
          { metric: 'Calibration', value: 0.71, threshold: 0.8, status: 'warning', description: 'Prediction accuracy across groups' }
        ],
        protectedAttributes: ['race', 'gender', 'age', 'income'],
        recommendations: [
          'URGENT: Immediate bias mitigation required',
          'Collect more representative training data',
          'Apply algorithmic fairness constraints',
          'Consider removing biased features'
        ]
      },
      {
        id: 'report_4',
        modelId: 'model_insurance',
        modelName: 'Insurance Risk Assessment',
        timestamp: new Date(Date.now() - 14400000),
        overallScore: 0.84,
        status: 'good',
        metrics: [
          { metric: 'Demographic Parity', value: 0.87, threshold: 0.8, status: 'pass', description: 'Selection rate difference between groups' },
          { metric: 'Equalized Odds', value: 0.83, threshold: 0.8, status: 'pass', description: 'TPR and FPR equality across groups' },
          { metric: 'Equal Opportunity', value: 0.81, threshold: 0.8, status: 'pass', description: 'TPR equality for positive outcomes' },
          { metric: 'Calibration', value: 0.85, threshold: 0.8, status: 'pass', description: 'Prediction accuracy across groups' }
        ],
        protectedAttributes: ['age', 'gender'],
        recommendations: [
          'Model meets fairness standards',
          'Continue regular monitoring',
          'Document bias testing procedures'
        ]
      }
    ];
  }

  static generateFairnessAnalysis(): FairnessAnalysis[] {
    return [
      {
        attribute: 'gender',
        groups: [
          { group: 'male', accuracy: 0.87, precision: 0.85, recall: 0.89, f1Score: 0.87, count: 5240 },
          { group: 'female', accuracy: 0.82, precision: 0.79, recall: 0.85, f1Score: 0.82, count: 4760 },
          { group: 'non-binary', accuracy: 0.78, precision: 0.76, recall: 0.80, f1Score: 0.78, count: 150 }
        ],
        disparityMetrics: {
          demographicParity: 0.85,
          equalizedOdds: 0.75,
          equalOpportunity: 0.65
        }
      },
      {
        attribute: 'race',
        groups: [
          { group: 'white', accuracy: 0.88, precision: 0.86, recall: 0.90, f1Score: 0.88, count: 6200 },
          { group: 'black', accuracy: 0.81, precision: 0.78, recall: 0.84, f1Score: 0.81, count: 2100 },
          { group: 'hispanic', accuracy: 0.83, precision: 0.80, recall: 0.86, f1Score: 0.83, count: 1500 },
          { group: 'asian', accuracy: 0.85, precision: 0.83, recall: 0.87, f1Score: 0.85, count: 1200 }
        ],
        disparityMetrics: {
          demographicParity: 0.78,
          equalizedOdds: 0.72,
          equalOpportunity: 0.69
        }
      },
      {
        attribute: 'age',
        groups: [
          { group: '18-25', accuracy: 0.79, precision: 0.76, recall: 0.82, f1Score: 0.79, count: 1800 },
          { group: '26-35', accuracy: 0.86, precision: 0.84, recall: 0.88, f1Score: 0.86, count: 3200 },
          { group: '36-45', accuracy: 0.88, precision: 0.86, recall: 0.90, f1Score: 0.88, count: 2900 },
          { group: '46-55', accuracy: 0.85, precision: 0.83, recall: 0.87, f1Score: 0.85, count: 2100 },
          { group: '56+', accuracy: 0.82, precision: 0.80, recall: 0.84, f1Score: 0.82, count: 1150 }
        ],
        disparityMetrics: {
          demographicParity: 0.82,
          equalizedOdds: 0.77,
          equalOpportunity: 0.74
        }
      }
    ];
  }
}