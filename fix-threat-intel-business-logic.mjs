#!/usr/bin/env node

/**
 * Fix Threat Intelligence Business Logic Services
 * Fixes template issues in the generated business logic services
 */

import fs from 'fs/promises';
import path from 'path';

// Fixed business logic template
const fixedBusinessLogicTemplate = (page) => `/**
 * ${page.title} Business Logic Service
 * ${page.description}
 */

export interface I${toPascalCase(page.name)}Data {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending' | 'analyzing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface I${toPascalCase(page.name)}Analytics {
  totalItems: number;
  activeItems: number;
  criticalItems: number;
  accuracy: number;
  processingTime: number;
  trendsData: Array<{
    timestamp: string;
    value: number;
    category: string;
  }>;
}

export interface I${toPascalCase(page.name)}Config {
  enableRealTimeProcessing: boolean;
  confidenceThreshold: number;
  alertingEnabled: boolean;
  autoResponseEnabled: boolean;
  retentionPeriod: number;
  processingBatchSize: number;
}

export class ${toPascalCase(page.name)}BusinessLogic {
  private config: I${toPascalCase(page.name)}Config;
  private readonly pageInfo = {
    category: '${page.category}',
    name: '${page.name}',
    title: '${page.title}',
    description: '${page.description}'
  };

  constructor(config?: Partial<I${toPascalCase(page.name)}Config>) {
    this.config = {
      enableRealTimeProcessing: true,
      confidenceThreshold: 80,
      alertingEnabled: true,
      autoResponseEnabled: false,
      retentionPeriod: 365,
      processingBatchSize: 100,
      ...config
    };
  }

  /**
   * Get all ${page.title.toLowerCase()} entries with filtering and pagination
   */
  async getAll(filters: {
    status?: string;
    severity?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: I${toPascalCase(page.name)}Data[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Mock implementation - replace with actual data layer integration
    const mockData: I${toPascalCase(page.name)}Data[] = [
      {
        id: \`\${this.pageInfo.category}-001\`,
        title: \`Sample \${this.pageInfo.title} Entry\`,
        description: this.pageInfo.description,
        status: 'active',
        severity: 'high',
        confidence: 95,
        tags: [this.pageInfo.category, 'threat-intelligence', 'automated'],
        metadata: {
          category: this.pageInfo.category,
          processingEngine: '${toPascalCase(page.name)}Engine',
          lastAnalysis: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
    ];

    // Apply filters
    let filteredData = mockData;
    if (filters.status) {
      filteredData = filteredData.filter(item => item.status === filters.status);
    }
    if (filters.severity) {
      filteredData = filteredData.filter(item => item.severity === filters.severity);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().indexOf(searchTerm) !== -1 ||
        item.description.toLowerCase().indexOf(searchTerm) !== -1
      );
    }

    // Pagination
    const pageNum = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (pageNum - 1) * limit;
    const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total: filteredData.length,
      page: pageNum,
      limit
    };
  }

  /**
   * Get specific ${page.title.toLowerCase()} entry by ID
   */
  async getById(id: string): Promise<I${toPascalCase(page.name)}Data | null> {
    // Mock implementation
    return {
      id,
      title: \`\${this.pageInfo.title} Entry \${id}\`,
      description: this.pageInfo.description,
      status: 'active',
      severity: 'medium',
      confidence: 87,
      tags: [this.pageInfo.category, 'detailed-analysis'],
      metadata: {
        category: this.pageInfo.category,
        analysisDepth: 'comprehensive',
        correlationScore: 0.92
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'analyst-001'
    };
  }

  /**
   * Create new ${page.title.toLowerCase()} entry
   */
  async create(data: Omit<I${toPascalCase(page.name)}Data, 'id' | 'createdAt' | 'updatedAt'>): Promise<I${toPascalCase(page.name)}Data> {
    // Mock implementation
    const newEntry: I${toPascalCase(page.name)}Data = {
      id: \`\${this.pageInfo.category}-\${Date.now()}\`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Trigger analysis if enabled
    if (this.config.enableRealTimeProcessing) {
      await this.processAnalysis(newEntry);
    }

    return newEntry;
  }

  /**
   * Update ${page.title.toLowerCase()} entry
   */
  async update(id: string, data: Partial<I${toPascalCase(page.name)}Data>): Promise<I${toPascalCase(page.name)}Data | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updated: I${toPascalCase(page.name)}Data = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };

    return updated;
  }

  /**
   * Delete ${page.title.toLowerCase()} entry
   */
  async delete(id: string): Promise<boolean> {
    // Mock implementation
    return true;
  }

  /**
   * Get analytics and metrics for ${page.title.toLowerCase()}
   */
  async getAnalytics(timeRange?: { from: Date; to: Date }): Promise<I${toPascalCase(page.name)}Analytics> {
    // Mock implementation
    return {
      totalItems: 1547,
      activeItems: 234,
      criticalItems: 23,
      accuracy: 94.7,
      processingTime: 125,
      trendsData: [
        { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 120, category: 'processed' },
        { timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), value: 89, category: 'processed' },
        { timestamp: new Date().toISOString(), value: 156, category: 'processed' }
      ]
    };
  }

  /**
   * Process analysis for ${page.title.toLowerCase()}
   */
  async processAnalysis(data: I${toPascalCase(page.name)}Data): Promise<void> {
    // Mock analysis processing
    console.log(\`Processing \${this.pageInfo.title} analysis for entry: \${data.id}\`);
    
    // Simulate analysis workflow
    if (data.confidence >= this.config.confidenceThreshold) {
      console.log(\`High confidence detection in \${this.pageInfo.title}: \${data.title}\`);
      
      if (this.config.alertingEnabled) {
        await this.triggerAlert(data);
      }
    }
  }

  /**
   * Trigger alert for high-priority items
   */
  async triggerAlert(data: I${toPascalCase(page.name)}Data): Promise<void> {
    // Mock alerting system
    console.log(\`Alert triggered for \${this.pageInfo.title}: \${data.title} (Confidence: \${data.confidence}%)\`);
  }

  /**
   * Get configuration for ${page.title.toLowerCase()}
   */
  getConfig(): I${toPascalCase(page.name)}Config {
    return { ...this.config };
  }

  /**
   * Update configuration for ${page.title.toLowerCase()}
   */
  updateConfig(newConfig: Partial<I${toPascalCase(page.name)}Config>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Validate ${page.title.toLowerCase()} data
   */
  validateData(data: Partial<I${toPascalCase(page.name)}Data>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.title && data.title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (data.confidence !== undefined && (data.confidence < 0 || data.confidence > 100)) {
      errors.push('Confidence must be between 0 and 100');
    }

    if (data.severity && !['critical', 'high', 'medium', 'low'].some(s => s === data.severity)) {
      errors.push('Severity must be one of: critical, high, medium, low');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ${toPascalCase(page.name)}BusinessLogic;
`;

// Convert kebab-case to PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Just generate one corrected file to test
const testPage = {
  name: 'threat-analytics',
  category: 'advanced-analytics',
  title: 'Advanced Threat Analytics',
  description: 'Advanced analytics and machine learning for threat detection'
};

async function fixBusinessLogicService() {
  console.log('🔧 Fixing threat intelligence business logic template...\n');
  
  const businessLogicDir = 'src/services/business-logic/modules/threat-intelligence';
  const testFileName = `${toPascalCase(testPage.name)}BusinessLogic.ts`;
  const correctedContent = fixedBusinessLogicTemplate(testPage);
  
  await fs.writeFile(
    path.join(businessLogicDir, testFileName),
    correctedContent
  );

  console.log(`✅ Fixed: ${testFileName}`);
  console.log('\n🧪 Testing compilation...');
}

// Run the fix
fixBusinessLogicService().catch(console.error);