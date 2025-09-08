#!/usr/bin/env node

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Define the 44 error boundary modules grouped by category
const errorBoundaryModules = {
  'system-error-management': [
    'critical-system-error-handler',
    'database-connection-error-manager',
    'service-unavailable-error-handler',
    'memory-overflow-error-manager',
    'performance-degradation-handler',
    'configuration-error-resolver',
    'dependency-error-tracker',
    'system-recovery-coordinator'
  ],
  'data-error-recovery': [
    'data-corruption-recovery-engine',
    'malformed-data-handler',
    'missing-data-validator',
    'data-integrity-monitor',
    'backup-recovery-manager',
    'data-sync-error-handler',
    'schema-validation-error-manager',
    'data-migration-error-handler'
  ],
  'network-error-handling': [
    'connection-timeout-manager',
    'dns-resolution-error-handler',
    'bandwidth-throttling-manager',
    'ssl-certificate-error-handler',
    'proxy-error-manager',
    'load-balancer-error-handler',
    'cdn-error-recovery-manager',
    'api-gateway-error-handler'
  ],
  'security-error-response': [
    'authentication-error-handler',
    'authorization-error-manager',
    'encryption-error-handler',
    'security-policy-violation-handler',
    'intrusion-detection-error-manager',
    'certificate-error-handler',
    'token-expiration-manager',
    'privilege-escalation-error-handler'
  ],
  'integration-error-management': [
    'third-party-api-error-handler',
    'webhook-error-manager',
    'message-queue-error-handler',
    'event-stream-error-handler',
    'sync-service-error-manager',
    'plugin-error-handler'
  ],
  'user-error-guidance': [
    'user-input-validation-error',
    'session-timeout-error-handler',
    'permission-denied-error-manager',
    'feature-unavailable-handler',
    'browser-compatibility-error-handler',
    'user-workflow-error-guidance'
  ]
};

// Helper functions
function toPascalCase(str) {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toDisplayName(str) {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getModuleIcon(category) {
  const icons = {
    'system-error-management': '⚠️',
    'data-error-recovery': '🔄',
    'network-error-handling': '🌐',
    'security-error-response': '🔒',
    'integration-error-management': '🔗',
    'user-error-guidance': '👤'
  };
  return icons[category] || '🚨';
}

// Business Logic Template
function generateBusinessLogic(category, moduleName) {
  const className = `${toPascalCase(moduleName)}BusinessLogic`;
  const interfaceName = `${toPascalCase(moduleName)}Item`;
  
  return `import { EventEmitter } from 'events';

interface ${interfaceName} {
  id: string;
  name: string;
  status: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  errorCode: string;
  affectedSystems: string[];
  resolutionSteps: string[];
  createdAt: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export class ${className} extends EventEmitter {
  private items: Map<string, ${interfaceName}> = new Map();

  constructor() {
    super();
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleItem: ${interfaceName} = {
      id: '1',
      name: 'Sample ${toDisplayName(moduleName)}',
      status: 'active',
      category: '${category}',
      description: 'Comprehensive ${moduleName.replace(/-/g, ' ')} with automated resolution',
      severity: 'medium',
      errorCode: 'ERR_${moduleName.toUpperCase().replace(/-/g, '_')}_001',
      affectedSystems: ['primary-system', 'backup-system'],
      resolutionSteps: [
        'Identify root cause',
        'Implement corrective measures',
        'Verify system stability',
        'Monitor for recurrence'
      ],
      createdAt: new Date().toISOString()
    };
    
    this.items.set(sampleItem.id, sampleItem);
  }

  /**
   * Process business rules for ${moduleName}
   */
  async processBusinessRules(data: any): Promise<any> {
    // Validate input data
    const validatedData = await this.validateData(data);
    
    // Enrich data with additional context
    const enrichedData = await this.enrichData(validatedData);
    
    // Classify error severity and priority
    const classifiedData = await this.classifyData(enrichedData);
    
    // Send notifications if required
    await this.sendNotifications(classifiedData);
    
    return classifiedData;
  }

  private async validateData(data: any): Promise<any> {
    // Implement data validation logic
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data provided for ${moduleName}');
    }
    
    return {
      ...data,
      validatedAt: new Date().toISOString(),
      isValid: true
    };
  }

  private async enrichData(data: any): Promise<any> {
    // Add enrichment metadata
    return {
      ...data,
      enrichment: {
        module: '${moduleName}',
        category: '${category}',
        enrichedAt: new Date().toISOString(),
        systemContext: {
          nodeId: process.env.NODE_ID || 'unknown',
          environment: process.env.NODE_ENV || 'development'
        }
      }
    };
  }

  private async classifyData(data: any): Promise<any> {
    // Implement classification logic
    const classification = {
      riskLevel: this.calculateRiskLevel(data),
      urgency: this.calculateUrgency(data),
      category: '${category}',
      subcategory: '${moduleName}'
    };

    return {
      ...data,
      classification,
      classifiedAt: new Date().toISOString()
    };
  }

  private calculateRiskLevel(data: any): string {
    // Simple risk calculation
    if (data.severity === 'critical') return 'high';
    if (data.severity === 'high') return 'medium';
    return 'low';
  }

  private calculateUrgency(data: any): string {
    // Simple urgency calculation
    if (data.affectedSystems?.length > 3) return 'high';
    if (data.affectedSystems?.length > 1) return 'medium';
    return 'low';
  }

  private async sendNotifications(data: any): Promise<void> {
    // Emit events for notification system
    this.emit('error:classified', {
      module: '${moduleName}',
      data,
      timestamp: new Date().toISOString()
    });

    if (data.classification?.riskLevel === 'high') {
      this.emit('error:high-risk', {
        module: '${moduleName}',
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateAnalytics(data: any): Promise<any> {
    return {
      module: '${moduleName}',
      category: '${category}',
      totalErrors: this.items.size,
      errorsByStatus: this.getErrorsByStatus(),
      errorsBySeverity: this.getErrorsBySeverity(),
      resolutionRate: this.calculateResolutionRate(),
      averageResolutionTime: this.calculateAverageResolutionTime(),
      generatedAt: new Date().toISOString()
    };
  }

  private getErrorsByStatus(): Record<string, number> {
    const statusCount: Record<string, number> = {};
    for (const item of this.items.values()) {
      statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    }
    return statusCount;
  }

  private getErrorsBySeverity(): Record<string, number> {
    const severityCount: Record<string, number> = {};
    for (const item of this.items.values()) {
      severityCount[item.severity] = (severityCount[item.severity] || 0) + 1;
    }
    return severityCount;
  }

  private calculateResolutionRate(): number {
    const resolved = Array.from(this.items.values()).filter(item => item.resolvedAt);
    return this.items.size > 0 ? (resolved.length / this.items.size) * 100 : 0;
  }

  private calculateAverageResolutionTime(): number {
    const resolvedItems = Array.from(this.items.values()).filter(item => item.resolvedAt);
    if (resolvedItems.length === 0) return 0;

    const totalTime = resolvedItems.reduce((sum, item) => {
      const created = new Date(item.createdAt).getTime();
      const resolved = new Date(item.resolvedAt!).getTime();
      return sum + (resolved - created);
    }, 0);

    return totalTime / resolvedItems.length / (1000 * 60 * 60); // Convert to hours
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Perform health checks
      const memoryUsage = process.memoryUsage();
      const isHealthy = memoryUsage.heapUsed < 100 * 1024 * 1024; // Less than 100MB
      
      this.emit('health:check', {
        module: '${moduleName}',
        healthy: isHealthy,
        memoryUsage,
        timestamp: new Date().toISOString()
      });

      return isHealthy;
    } catch (error) {
      this.emit('health:error', {
        module: '${moduleName}',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  async getItems(): Promise<${interfaceName}[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<${interfaceName} | null> {
    return this.items.get(id) || null;
  }

  async createItem(data: Partial<${interfaceName}>): Promise<${interfaceName}> {
    const item: ${interfaceName} = {
      id: Date.now().toString(),
      name: data.name || \`New \${toDisplayName(moduleName)}\`,
      status: data.status || 'pending',
      category: '${category}',
      description: data.description || '',
      severity: data.severity || 'medium',
      errorCode: data.errorCode || \`ERR_\${Date.now()}\`,
      affectedSystems: data.affectedSystems || [],
      resolutionSteps: data.resolutionSteps || [],
      createdAt: new Date().toISOString(),
      metadata: data.metadata || {}
    };

    this.items.set(item.id, item);
    this.emit('item:created', item);
    
    return item;
  }

  async updateItem(id: string, data: Partial<${interfaceName}>): Promise<${interfaceName} | null> {
    const existingItem = this.items.get(id);
    if (!existingItem) return null;

    const updatedItem: ${interfaceName} = {
      ...existingItem,
      ...data,
      id, // Ensure ID doesn't change
      category: '${category}' // Ensure category doesn't change
    };

    this.items.set(id, updatedItem);
    this.emit('item:updated', updatedItem);
    
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    const deleted = this.items.delete(id);
    if (deleted) {
      this.emit('item:deleted', { id, timestamp: new Date().toISOString() });
    }
    return deleted;
  }
}

export default ${className};`;
}

// Controller Template
function generateController(category, moduleName) {
  const className = `${toPascalCase(moduleName)}Controller`;
  const businessLogicClass = `${toPascalCase(moduleName)}BusinessLogic`;
  const instanceName = `${toCamelCase(moduleName)}BusinessLogic`;
  
  return `import { Request, Response } from 'express';
import { ${businessLogicClass} } from '../../services/business-logic/modules/${category}/${businessLogicClass}';

export class ${className} {
  private ${instanceName}: ${businessLogicClass};

  constructor() {
    this.${instanceName} = new ${businessLogicClass}();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.${instanceName}.getItems();
      const analytics = await this.${instanceName}.generateAnalytics({});

      res.status(200).json({
        success: true,
        data: items,
        analytics,
        total: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(\`Error in \${${className}.name}.getAll:\`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ${moduleName.replace(/-/g, ' ')} items',
        code: 'GET_ALL_ERROR'
      });
    }
  }

  public async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.${instanceName}.getItem(id);
      
      if (!item) {
        res.status(404).json({
          success: false,
          error: '${toDisplayName(moduleName)} item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: item,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(\`Error in \${${className}.name}.getById:\`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ${moduleName.replace(/-/g, ' ')} item',
        code: 'GET_BY_ID_ERROR'
      });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Process business rules before creation
      const processedData = await this.${instanceName}.processBusinessRules(req.body);
      
      const newItem = await this.${instanceName}.createItem(processedData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: '${toDisplayName(moduleName)} item created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(\`Error in \${${className}.name}.create:\`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to create ${moduleName.replace(/-/g, ' ')} item',
        code: 'CREATE_ERROR',
        details: error.message
      });
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Process business rules before update
      const processedData = await this.${instanceName}.processBusinessRules(req.body);
      
      const updatedItem = await this.${instanceName}.updateItem(id, processedData);
      
      if (!updatedItem) {
        res.status(404).json({
          success: false,
          error: '${toDisplayName(moduleName)} item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedItem,
        message: '${toDisplayName(moduleName)} item updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(\`Error in \${${className}.name}.update:\`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to update ${moduleName.replace(/-/g, ' ')} item',
        code: 'UPDATE_ERROR',
        details: error.message
      });
    }
  }

  public async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.${instanceName}.deleteItem(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: '${toDisplayName(moduleName)} item not found',
          code: 'ITEM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: '${toDisplayName(moduleName)} item deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(\`Error in \${${className}.name}.delete:\`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete ${moduleName.replace(/-/g, ' ')} item',
        code: 'DELETE_ERROR'
      });
    }
  }

  public async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isHealthy = await this.${instanceName}.healthCheck();
      
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: '${moduleName}',
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(\`Error in \${${className}.name}.healthCheck:\`, error);
      res.status(503).json({
        success: false,
        service: '${moduleName}',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const ${toCamelCase(moduleName)}Controller = new ${className}();`;
}

// Routes Template
function generateRoutes(category, moduleName) {
  const controllerName = `${toCamelCase(moduleName)}Controller`;
  const className = `${toPascalCase(moduleName)}Controller`;
  const routeName = `${toCamelCase(moduleName)}Routes`;
  
  return `import { Router } from 'express';
import { ${controllerName} } from '../../controllers/${category}/${toCamelCase(moduleName)}Controller';

const router = Router();

/**
 * @swagger
 * /api/${category}/${moduleName}:
 *   get:
 *     summary: Get all ${moduleName.replace(/-/g, ' ')} items
 *     tags: [${toDisplayName(moduleName)}]
 *     responses:
 *       200:
 *         description: List of ${moduleName.replace(/-/g, ' ')} items with analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 analytics:
 *                   type: object
 *                 total:
 *                   type: number
 *       500:
 *         description: Internal server error
 */
router.get('/', ${controllerName}.getAll.bind(${controllerName}));

/**
 * @swagger
 * /api/${category}/${moduleName}/{id}:
 *   get:
 *     summary: Get ${moduleName.replace(/-/g, ' ')} item by ID
 *     tags: [${toDisplayName(moduleName)}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${toDisplayName(moduleName)} item ID
 *     responses:
 *       200:
 *         description: ${toDisplayName(moduleName)} item details
 *       404:
 *         description: ${toDisplayName(moduleName)} item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', ${controllerName}.getById.bind(${controllerName}));

/**
 * @swagger
 * /api/${category}/${moduleName}:
 *   post:
 *     summary: Create new ${moduleName.replace(/-/g, ' ')} item
 *     tags: [${toDisplayName(moduleName)}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               affectedSystems:
 *                 type: array
 *                 items:
 *                   type: string
 *               resolutionSteps:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: ${toDisplayName(moduleName)} item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', ${controllerName}.create.bind(${controllerName}));

/**
 * @swagger
 * /api/${category}/${moduleName}/{id}:
 *   put:
 *     summary: Update ${moduleName.replace(/-/g, ' ')} item
 *     tags: [${toDisplayName(moduleName)}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${toDisplayName(moduleName)} item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: ${toDisplayName(moduleName)} item updated successfully
 *       404:
 *         description: ${toDisplayName(moduleName)} item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', ${controllerName}.update.bind(${controllerName}));

/**
 * @swagger
 * /api/${category}/${moduleName}/{id}:
 *   delete:
 *     summary: Delete ${moduleName.replace(/-/g, ' ')} item
 *     tags: [${toDisplayName(moduleName)}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ${toDisplayName(moduleName)} item ID
 *     responses:
 *       200:
 *         description: ${toDisplayName(moduleName)} item deleted successfully
 *       404:
 *         description: ${toDisplayName(moduleName)} item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', ${controllerName}.delete.bind(${controllerName}));

/**
 * @swagger
 * /api/${category}/${moduleName}/health:
 *   get:
 *     summary: Health check for ${moduleName.replace(/-/g, ' ')} service
 *     tags: [${toDisplayName(moduleName)}]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/health', ${controllerName}.healthCheck.bind(${controllerName}));

export { router as ${routeName} };
export default router;`;
}

// Frontend Component Template
function generateFrontendComponent(category, moduleName) {
  const componentName = `${toPascalCase(moduleName)}Page`;
  const interfaceName = `${toPascalCase(moduleName)}Data`;
  const icon = getModuleIcon(category);
  
  return `'use client';

import { useEffect, useState } from 'react';

interface ${interfaceName} {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed' | 'failed' | 'draft' | 'suspended' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  description?: string;
  errorCode?: string;
  affectedSystems?: string[];
  resolutionSteps?: string[];
  resolvedAt?: string;
  completionRate?: number;
}

export default function ${componentName}() {
  const [data, setData] = useState<${interfaceName}[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Mock data for ${moduleName}
    setData([
      {
        id: '1',
        name: 'Critical System Error #001',
        status: 'active',
        severity: 'high',
        createdAt: new Date().toISOString(),
        description: 'Comprehensive ${moduleName.replace(/-/g, ' ')} with automated resolution',
        errorCode: 'ERR_${moduleName.toUpperCase().replace(/-/g, '_')}_001',
        affectedSystems: ['authentication-service', 'user-database'],
        resolutionSteps: [
          'Identify root cause',
          'Implement corrective measures',
          'Verify system stability',
          'Monitor for recurrence'
        ],
        completionRate: 75
      },
      {
        id: '2',
        name: 'Security Violation Alert #002',
        status: 'pending',
        severity: 'critical',
        createdAt: new Date().toISOString(),
        description: 'Advanced ${moduleName.replace(/-/g, ' ')} processing',
        errorCode: 'ERR_${moduleName.toUpperCase().replace(/-/g, '_')}_002',
        affectedSystems: ['api-gateway', 'security-service'],
        resolutionSteps: [
          'Assess security impact',
          'Isolate affected components',
          'Apply security patches',
          'Conduct security audit'
        ],
        completionRate: 45
      },
      {
        id: '3',
        name: 'Performance Degradation #003',
        status: 'resolved',
        severity: 'medium',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date().toISOString(),
        description: 'Resolved ${moduleName.replace(/-/g, ' ')} issue',
        errorCode: 'ERR_${moduleName.toUpperCase().replace(/-/g, '_')}_003',
        affectedSystems: ['database-cluster'],
        resolutionSteps: [
          'Monitor performance metrics',
          'Optimize database queries',
          'Scale resources',
          'Validate improvements'
        ],
        completionRate: 100
      }
    ]);

    // Mock analytics
    setAnalytics({
      totalErrors: 3,
      errorsByStatus: { active: 1, pending: 1, resolved: 1 },
      errorsBySeverity: { critical: 1, high: 1, medium: 1 },
      resolutionRate: 33.33,
      averageResolutionTime: 8.5
    });

    setLoading(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="mr-3">${icon}</span>
          ${toDisplayName(moduleName)}
        </h1>
        <p className="text-gray-600 mt-2">
          Comprehensive ${moduleName.replace(/-/g, ' ')} and recovery management
        </p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">{analytics?.totalErrors || 0}</div>
          <div className="text-sm text-gray-600">Total Errors</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {analytics?.resolutionRate?.toFixed(1) || 0}%
          </div>
          <div className="text-sm text-gray-600">Resolution Rate</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-purple-600">
            {analytics?.averageResolutionTime?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-600">Avg Resolution Time</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">
            {data.filter(item => item.status === 'active' || item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Active Issues</div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-blue-600">
            {data.filter(item => item.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-yellow-600">
            {data.filter(item => item.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-green-600">
            {data.filter(item => item.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-semibold text-red-600">
            {data.filter(item => item.status === 'failed').length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Error Items Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">${toDisplayName(moduleName)} Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <span className={\`px-2 py-1 text-xs font-medium rounded-full \${getSeverityColor(item.severity)}\`}>
                      {item.severity}
                    </span>
                    <span className={\`px-2 py-1 text-xs font-medium rounded-full \${getStatusColor(item.status)}\`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Error Code: {item.errorCode}</div>
                    <div>Affected Systems: {item.affectedSystems?.join(', ') || 'None'}</div>
                    <div>Created: {new Date(item.createdAt).toLocaleString()}</div>
                    {item.resolvedAt && (
                      <div>Resolved: {new Date(item.resolvedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium">{item.completionRate}%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: \`\${item.completionRate}%\` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Resolution Steps */}
              {item.resolutionSteps && item.resolutionSteps.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Resolution Steps:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {item.resolutionSteps.map((step, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Main generation function
async function generateAllModules() {
  console.log('🚀 Generating 44 Error Boundary Modules...\n');

  let totalModulesGenerated = 0;

  for (const [category, modules] of Object.entries(errorBoundaryModules)) {
    console.log(`📁 Processing category: ${category}`);
    console.log(`   Modules: ${modules.length}`);

    for (const moduleName of modules) {
      console.log(`   📄 Generating: ${moduleName}`);

      try {
        // Create directory structure
        const businessLogicDir = join('src', 'services', 'business-logic', 'modules', category);
        const controllerDir = join('src', 'controllers', category);
        const routesDir = join('src', 'routes', category);
        const frontendDir = join('frontend', 'src', 'app', category, moduleName);

        await mkdir(businessLogicDir, { recursive: true });
        await mkdir(controllerDir, { recursive: true });
        await mkdir(routesDir, { recursive: true });
        await mkdir(frontendDir, { recursive: true });

        // Generate business logic
        const businessLogicContent = generateBusinessLogic(category, moduleName);
        const businessLogicPath = join(businessLogicDir, `${toPascalCase(moduleName)}BusinessLogic.ts`);
        await writeFile(businessLogicPath, businessLogicContent);

        // Generate controller
        const controllerContent = generateController(category, moduleName);
        const controllerPath = join(controllerDir, `${toCamelCase(moduleName)}Controller.ts`);
        await writeFile(controllerPath, controllerContent);

        // Generate routes
        const routesContent = generateRoutes(category, moduleName);
        const routesPath = join(routesDir, `${toCamelCase(moduleName)}Routes.ts`);
        await writeFile(routesPath, routesContent);

        // Generate frontend component
        const frontendContent = generateFrontendComponent(category, moduleName);
        const frontendPath = join(frontendDir, 'page.tsx');
        await writeFile(frontendPath, frontendContent);

        totalModulesGenerated++;

      } catch (error) {
        console.error(`   ❌ Error generating ${moduleName}:`, error.message);
      }
    }
    
    console.log(`   ✅ Completed ${category}\n`);
  }

  console.log(`🎉 Successfully generated ${totalModulesGenerated} error boundary modules!`);
  console.log(`📊 Generated files per module:`);
  console.log(`   - Business Logic Service (TypeScript)`);
  console.log(`   - Controller (TypeScript)`);
  console.log(`   - Routes (TypeScript)`);
  console.log(`   - Frontend Component (React/TSX)`);
  console.log(`\n📁 Total files generated: ${totalModulesGenerated * 4}`);
}

// Run the generation
generateAllModules().catch(console.error);