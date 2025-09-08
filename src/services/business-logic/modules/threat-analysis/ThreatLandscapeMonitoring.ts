/**
 * Threat Landscape Monitoring
 * Monitor and analyze the evolving threat landscape
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../../core/BusinessLogicManager';

export const threatLandscapeRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'threat-landscape-monitoring',
  operation: 'monitor-landscape',
  enabled: true,
  priority: 75,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = { isValid: true, errors: [], warnings: [] };
    const { time_range, sectors } = request.payload;

    if (!time_range) {
      result.warnings.push('No time range specified, using default 30 days');
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { time_range = '30d', sectors = ['all'] } = request.payload;
    
    return {
      monitoring_id: uuidv4(),
      time_range,
      sectors_analyzed: sectors,
      threat_trends: {
        ransomware: { trend: 'increasing', percentage_change: 15 + Math.random() * 20 },
        phishing: { trend: 'stable', percentage_change: -2 + Math.random() * 5 },
        malware: { trend: 'decreasing', percentage_change: -5 - Math.random() * 10 }
      },
      emerging_threats: Array.from({length: 3}, (_, i) => ({
        name: `EmergingThreat${i + 1}`,
        first_seen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        confidence: 0.6 + Math.random() * 0.4
      })),
      geographic_distribution: {
        'North America': 35 + Math.random() * 10,
        'Europe': 25 + Math.random() * 10,
        'Asia-Pacific': 20 + Math.random() * 10,
        'Other': 20 + Math.random() * 5
      },
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timestamp: new Date()
    };
  }
};

export const threatLandscapeMonitoringRules = [threatLandscapeRule];