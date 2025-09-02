/**
 * Analytics Service Business Rules
 * Advanced business logic and validation rules for analytics operations
 */

import { v4 as uuidv4 } from 'uuid';
import { BusinessRule, BusinessLogicRequest, ValidationResult } from '../core/BusinessLogicManager';

/**
 * Report generation validation and processing
 */
export const generateReportRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'analytics',
  operation: 'generate-report',
  enabled: true,
  priority: 100,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const { type, timeRange, filters } = request.payload;

    // Validate report type
    const validReportTypes = ['trend-analysis', 'executive-summary', 'custom-dashboard', 'threat-landscape', 'performance-metrics'];
    if (!type || !validReportTypes.includes(type)) {
      result.errors.push(`Invalid report type. Valid types: ${validReportTypes.join(', ')}`);
    }

    // Validate time range
    const validTimeRanges = ['1h', '24h', '7d', '30d', '90d'];
    if (!timeRange || !validTimeRanges.includes(timeRange)) {
      result.errors.push(`Invalid time range. Valid ranges: ${validTimeRanges.join(', ')}`);
    }

    // Business logic validations
    if (type === 'executive-summary' && ['1h', '24h'].includes(timeRange)) {
      result.warnings.push('Executive summaries typically require at least 7 days of data for meaningful insights');
    }

    if (type === 'trend-analysis' && timeRange === '1h') {
      result.warnings.push('Trend analysis with 1-hour timeframe may have limited statistical significance');
    }

    // Rate limiting check (simulate)
    const recentRequests = 3; // This would be tracked properly
    if (recentRequests > 10) {
      result.errors.push('Report generation rate limit exceeded. Please wait before requesting another report.');
    }

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { type, timeRange, filters } = request.payload;
    
    // Simulate report generation processing
    const processingTime = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Generate mock report data
    const reportData = {
      id: uuidv4(),
      type,
      timeRange,
      filters,
      generatedAt: new Date(),
      processingTimeMs: processingTime,
      status: 'completed',
      data: generateMockReportData(type, timeRange)
    };

    return reportData;
  }
};

/**
 * Data export validation and processing
 */
export const exportAnalyticsDataRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'analytics',
  operation: 'export-analytics-data',
  enabled: true,
  priority: 90,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const { format, timeRange } = request.payload;

    // Validate export format
    const validFormats = ['csv', 'json', 'xlsx', 'pdf'];
    if (!format || !validFormats.includes(format)) {
      result.errors.push(`Invalid export format. Valid formats: ${validFormats.join(', ')}`);
    }

    // Check data size limits
    if (timeRange === '90d' && ['csv', 'json'].includes(format)) {
      result.warnings.push('Large data exports may take several minutes to complete');
    }

    // Permission checks (simulate)
    const userHasExportPermission = true; // This would check actual permissions
    if (!userHasExportPermission) {
      result.errors.push('User does not have permission to export analytics data');
    }

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { format, timeRange } = request.payload;
    
    // Simulate export processing
    const processingTime = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    return {
      id: uuidv4(),
      format,
      timeRange,
      status: 'processing',
      estimatedCompletion: new Date(Date.now() + 60000),
      downloadUrl: `/api/exports/analytics-${uuidv4()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }
};

/**
 * Form validation rule for analytics filters
 */
export const validateFormRule: BusinessRule = {
  id: uuidv4(),
  serviceId: 'analytics',
  operation: 'validate-form',
  enabled: true,
  priority: 80,

  async validator(request: BusinessLogicRequest): Promise<ValidationResult> {
    // Always valid since this is the validation rule itself
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  },

  async processor(request: BusinessLogicRequest): Promise<any> {
    const { formId, formData } = request.payload;
    
    const result = {
      isValid: true,
      errors: {} as Record<string, string[]>,
      warnings: {} as Record<string, string[]>
    };

    // Validate based on form ID
    switch (formId) {
      case 'analytics-filter':
        // Validate date ranges
        if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          
          if (start > end) {
            result.errors.dateRange = ['Start date must be before end date'];
          }
          
          if (end > new Date()) {
            result.errors.dateRange = (result.errors.dateRange || []).concat(['End date cannot be in the future']);
          }

          const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff > 365) {
            result.warnings.dateRange = ['Date range spans more than 1 year. Consider using smaller ranges for better performance'];
          }
        }

        // Validate threat levels
        if (formData.threatLevels && formData.threatLevels.length === 0) {
          result.warnings.threatLevels = ['No threat levels selected. All levels will be included'];
        }

        // Validate confidence threshold
        if (formData.confidenceThreshold !== undefined) {
          const confidence = parseInt(formData.confidenceThreshold);
          if (confidence < 0 || confidence > 100) {
            result.errors.confidenceThreshold = ['Confidence threshold must be between 0 and 100'];
          } else if (confidence < 30) {
            result.warnings.confidenceThreshold = ['Low confidence threshold may include unreliable data'];
          }
        }
        break;

      default:
        result.warnings.general = [`Unknown form ID: ${formId}`];
    }

    // Check if form is valid
    result.isValid = Object.keys(result.errors).length === 0;

    return result;
  }
};

function generateMockReportData(type: string, timeRange: string) {
  const baseData = {
    totalIOCs: Math.floor(Math.random() * 10000) + 50000,
    activeThreats: Math.floor(Math.random() * 100) + 20,
    processedItems: Math.floor(Math.random() * 5000) + 10000,
    confidenceDistribution: {
      high: Math.floor(Math.random() * 40) + 30,
      medium: Math.floor(Math.random() * 35) + 35,
      low: Math.floor(Math.random() * 25) + 10
    }
  };

  switch (type) {
    case 'trend-analysis':
      return {
        ...baseData,
        trends: {
          iocGrowth: (Math.random() - 0.5) * 20,
          threatIncrease: (Math.random() - 0.5) * 15,
          detectionRate: Math.random() * 0.1 + 0.85,
          falsePositiveRate: Math.random() * 0.05 + 0.02
        },
        timeSeriesData: generateTimeSeriesData(timeRange)
      };

    case 'executive-summary':
      return {
        ...baseData,
        executiveSummary: {
          riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          keyFindings: [
            'Threat activity increased by 12% this period',
            'New malware family detected in network traffic',
            'IOC validation accuracy improved to 94.2%'
          ],
          recommendations: [
            'Increase monitoring of suspicious network patterns',
            'Update threat intelligence feeds',
            'Review and update security policies'
          ]
        }
      };

    case 'custom-dashboard':
      return {
        ...baseData,
        widgets: [
          { id: 'threat-map', type: 'geographical', data: generateGeoData() },
          { id: 'ioc-timeline', type: 'timeline', data: generateTimelineData() },
          { id: 'top-threats', type: 'list', data: generateTopThreats() }
        ]
      };

    default:
      return baseData;
  }
}

function generateTimeSeriesData(timeRange: string) {
  const points = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
  return Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(Date.now() - (points - i) * getIntervalMs(timeRange)),
    value: Math.floor(Math.random() * 100) + 50
  }));
}

function generateGeoData() {
  const countries = ['US', 'CN', 'RU', 'DE', 'GB', 'FR', 'JP', 'KR'];
  return countries.map(country => ({
    country,
    threatCount: Math.floor(Math.random() * 500) + 100,
    severity: Math.random()
  }));
}

function generateTimelineData() {
  return Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000),
    event: `Threat event ${i + 1}`,
    severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
  }));
}

function generateTopThreats() {
  const threats = ['Malware.Win32.Generic', 'Trojan.JS.Agent', 'Adware.Generic', 'PUA.Tool.Hack', 'Virus.Boot'];
  return threats.map(threat => ({
    name: threat,
    count: Math.floor(Math.random() * 1000) + 100,
    riskScore: Math.floor(Math.random() * 40) + 60
  }));
}

function getIntervalMs(timeRange: string): number {
  switch (timeRange) {
    case '1h': return 60 * 1000; // 1 minute
    case '24h': return 60 * 60 * 1000; // 1 hour
    case '7d': return 24 * 60 * 60 * 1000; // 1 day
    case '30d': return 24 * 60 * 60 * 1000; // 1 day
    default: return 60 * 60 * 1000;
  }
}

export const analyticsBusinessRules = [
  generateReportRule,
  exportAnalyticsDataRule,
  validateFormRule
];