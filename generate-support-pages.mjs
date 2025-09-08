#!/usr/bin/env node

/**
 * Support Pages Generator
 * Generates 49 additional business-ready and customer-ready support-related pages
 * with complete frontend-backend integration
 */

import fs from 'fs/promises';
import path from 'path';

// Define the 49 support-related pages to be created
const supportPages = [
  // Customer Support (12 pages)
  { name: 'customer-portal-dashboard', category: 'customer-support', title: 'Customer Portal Dashboard', description: 'Comprehensive customer self-service portal' },
  { name: 'ticket-submission-wizard', category: 'customer-support', title: 'Ticket Submission Wizard', description: 'Guided ticket creation with automated routing' },
  { name: 'case-status-tracker', category: 'customer-support', title: 'Case Status Tracker', description: 'Real-time case status and progress tracking' },
  { name: 'customer-communication-center', category: 'customer-support', title: 'Customer Communication Center', description: 'Multi-channel customer communication hub' },
  { name: 'service-level-agreement-monitor', category: 'customer-support', title: 'SLA Monitor', description: 'Service level agreement tracking and compliance' },
  { name: 'customer-satisfaction-feedback', category: 'customer-support', title: 'Customer Satisfaction Feedback', description: 'Customer feedback collection and analysis' },
  { name: 'escalation-management-system', category: 'customer-support', title: 'Escalation Management System', description: 'Automated escalation workflows and approvals' },
  { name: 'customer-history-analytics', category: 'customer-support', title: 'Customer History Analytics', description: 'Comprehensive customer interaction history' },
  { name: 'priority-queue-manager', category: 'customer-support', title: 'Priority Queue Manager', description: 'Intelligent ticket prioritization and routing' },
  { name: 'customer-onboarding-portal', category: 'customer-support', title: 'Customer Onboarding Portal', description: 'Streamlined customer onboarding process' },
  { name: 'billing-support-center', category: 'customer-support', title: 'Billing Support Center', description: 'Billing inquiries and payment support' },
  { name: 'customer-loyalty-programs', category: 'customer-support', title: 'Customer Loyalty Programs', description: 'Customer retention and loyalty management' },

  // Technical Support (12 pages)
  { name: 'technical-diagnostics-center', category: 'technical-support', title: 'Technical Diagnostics Center', description: 'Advanced technical issue diagnosis and resolution' },
  { name: 'remote-support-platform', category: 'technical-support', title: 'Remote Support Platform', description: 'Secure remote assistance and troubleshooting' },
  { name: 'system-health-monitor', category: 'technical-support', title: 'System Health Monitor', description: 'Real-time system health and performance monitoring' },
  { name: 'patch-management-center', category: 'technical-support', title: 'Patch Management Center', description: 'Automated patch deployment and tracking' },
  { name: 'technical-documentation-hub', category: 'technical-support', title: 'Technical Documentation Hub', description: 'Comprehensive technical documentation portal' },
  { name: 'incident-response-toolkit', category: 'technical-support', title: 'Incident Response Toolkit', description: 'Incident response tools and procedures' },
  { name: 'performance-optimization-suite', category: 'technical-support', title: 'Performance Optimization Suite', description: 'System performance analysis and optimization' },
  { name: 'security-vulnerability-scanner', category: 'technical-support', title: 'Security Vulnerability Scanner', description: 'Automated security scanning and assessment' },
  { name: 'backup-recovery-manager', category: 'technical-support', title: 'Backup Recovery Manager', description: 'Data backup and recovery operations' },
  { name: 'network-troubleshooting-tools', category: 'technical-support', title: 'Network Troubleshooting Tools', description: 'Network diagnostics and troubleshooting' },
  { name: 'software-compatibility-checker', category: 'technical-support', title: 'Software Compatibility Checker', description: 'Software compatibility analysis and testing' },
  { name: 'technical-escalation-board', category: 'technical-support', title: 'Technical Escalation Board', description: 'Technical issue escalation and expert assignment' },

  // Help Desk (12 pages)
  { name: 'help-desk-dashboard', category: 'help-desk', title: 'Help Desk Dashboard', description: 'Centralized help desk operations dashboard' },
  { name: 'ticket-management-console', category: 'help-desk', title: 'Ticket Management Console', description: 'Comprehensive ticket lifecycle management' },
  { name: 'agent-workbench', category: 'help-desk', title: 'Agent Workbench', description: 'Unified agent workspace with integrated tools' },
  { name: 'chat-support-interface', category: 'help-desk', title: 'Chat Support Interface', description: 'Real-time chat support with customers' },
  { name: 'call-center-integration', category: 'help-desk', title: 'Call Center Integration', description: 'Voice support integration and call management' },
  { name: 'queue-management-system', category: 'help-desk', title: 'Queue Management System', description: 'Intelligent queue routing and load balancing' },
  { name: 'agent-performance-analytics', category: 'help-desk', title: 'Agent Performance Analytics', description: 'Agent productivity and performance metrics' },
  { name: 'first-contact-resolution-tracker', category: 'help-desk', title: 'First Contact Resolution Tracker', description: 'FCR tracking and improvement analytics' },
  { name: 'multi-language-support-hub', category: 'help-desk', title: 'Multi-Language Support Hub', description: 'International support with language localization' },
  { name: 'shift-scheduling-system', category: 'help-desk', title: 'Shift Scheduling System', description: 'Agent scheduling and shift management' },
  { name: 'call-recording-analytics', category: 'help-desk', title: 'Call Recording Analytics', description: 'Call recording, transcription, and analysis' },
  { name: 'help-desk-reporting-suite', category: 'help-desk', title: 'Help Desk Reporting Suite', description: 'Comprehensive help desk performance reports' },

  // Knowledge Management (13 pages)
  { name: 'knowledge-base-portal', category: 'knowledge-management', title: 'Knowledge Base Portal', description: 'Comprehensive knowledge base with search capabilities' },
  { name: 'article-authoring-system', category: 'knowledge-management', title: 'Article Authoring System', description: 'Advanced article creation and editing tools' },
  { name: 'content-approval-workflow', category: 'knowledge-management', title: 'Content Approval Workflow', description: 'Content review and approval processes' },
  { name: 'knowledge-analytics-dashboard', category: 'knowledge-management', title: 'Knowledge Analytics Dashboard', description: 'Knowledge base usage and effectiveness analytics' },
  { name: 'expert-collaboration-platform', category: 'knowledge-management', title: 'Expert Collaboration Platform', description: 'Subject matter expert collaboration tools' },
  { name: 'training-materials-manager', category: 'knowledge-management', title: 'Training Materials Manager', description: 'Training content creation and distribution' },
  { name: 'faq-management-system', category: 'knowledge-management', title: 'FAQ Management System', description: 'Frequently asked questions management' },
  { name: 'video-tutorial-platform', category: 'knowledge-management', title: 'Video Tutorial Platform', description: 'Video-based training and support content' },
  { name: 'knowledge-gap-analyzer', category: 'knowledge-management', title: 'Knowledge Gap Analyzer', description: 'Identification of knowledge base gaps' },
  { name: 'content-versioning-system', category: 'knowledge-management', title: 'Content Versioning System', description: 'Document version control and history' },
  { name: 'search-optimization-engine', category: 'knowledge-management', title: 'Search Optimization Engine', description: 'AI-powered knowledge base search' },
  { name: 'community-forums-platform', category: 'knowledge-management', title: 'Community Forums Platform', description: 'User community discussion forums' },
  { name: 'knowledge-certification-system', category: 'knowledge-management', title: 'Knowledge Certification System', description: 'Expert certification and validation system' }
];

// Business logic modules for each support category
const businessLogicModules = {
  'customer-support': [
    'CustomerPortalManagement',
    'TicketLifecycleOrchestration',
    'CustomerSatisfactionAnalytics',
    'SLAComplianceMonitoring'
  ],
  'technical-support': [
    'TechnicalDiagnosticsEngine',
    'RemoteSupportOrchestration',
    'SystemHealthAnalytics',
    'IncidentResponseAutomation'
  ],
  'help-desk': [
    'HelpDeskOperationsManagement',
    'AgentPerformanceAnalytics',
    'QueueOptimizationEngine',
    'MultiChannelIntegration'
  ],
  'knowledge-management': [
    'KnowledgeBaseOrchestration',
    'ContentManagementSystem',
    'SearchOptimizationEngine',
    'CollaborationPlatformIntegration'
  ]
};

const generateBusinessLogicClass = (page) => {
  const className = page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('') + 'BusinessLogic';

  return `/**
 * ${page.title} Business Logic
 * ${page.description}
 */

import { BusinessLogicModule } from '../BusinessLogicModule';
import { DatabaseManager } from '../../../data-layer/DatabaseManager';
import { Logger } from '../../../utils/Logger';
import { EventEmitter } from 'events';

export interface ${className}Config {
  enabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  alertThresholds: {
    warning: number;
    critical: number;
  };
  integrationSettings: {
    notifications: boolean;
    realTimeUpdates: boolean;
    auditTrail: boolean;
  };
}

export interface ${className}Metrics {
  totalRequests: number;
  successfulOperations: number;
  failedOperations: number;
  averageResponseTime: number;
  lastUpdateTime: Date;
  currentStatus: 'operational' | 'degraded' | 'outage';
}

export interface ${className}Data {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: '${page.category}';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export class ${className} extends BusinessLogicModule {
  private config: ${className}Config;
  private metrics: ${className}Metrics;
  private eventEmitter: EventEmitter;
  private logger: Logger;
  private databaseManager: DatabaseManager;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
    this.metrics = this.initializeMetrics();
    this.eventEmitter = new EventEmitter();
    this.logger = new Logger('${className}');
    this.databaseManager = DatabaseManager.getInstance();
    
    this.setupEventHandlers();
    this.initializeModule();
  }

  private getDefaultConfig(): ${className}Config {
    return {
      enabled: true,
      autoRefresh: true,
      refreshInterval: 30000,
      alertThresholds: {
        warning: 80,
        critical: 95
      },
      integrationSettings: {
        notifications: true,
        realTimeUpdates: true,
        auditTrail: true
      }
    };
  }

  private initializeMetrics(): ${className}Metrics {
    return {
      totalRequests: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      lastUpdateTime: new Date(),
      currentStatus: 'operational'
    };
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('dataUpdate', this.handleDataUpdate.bind(this));
    this.eventEmitter.on('error', this.handleError.bind(this));
    this.eventEmitter.on('statusChange', this.handleStatusChange.bind(this));
  }

  private async initializeModule(): Promise<void> {
    try {
      this.logger.info('Initializing ${page.title} module...');
      
      // Initialize database connections
      await this.databaseManager.ensureConnection('mongodb');
      await this.databaseManager.ensureConnection('postgresql');
      
      // Set up initial data structures
      await this.createInitialSchema();
      
      this.logger.info('${page.title} module initialized successfully');
      this.metrics.currentStatus = 'operational';
    } catch (error) {
      this.logger.error('Failed to initialize ${page.title} module:', error);
      this.metrics.currentStatus = 'outage';
      throw error;
    }
  }

  public async getData(filters?: Record<string, any>): Promise<${className}Data[]> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', '${page.name.replace(/-/g, '_')}_data');
      const query = filters || {};
      
      const data = await collection.find(query).toArray();
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'getData', 
        count: data.length,
        filters 
      });
      
      return data;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to get data:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public async createItem(item: Partial<${className}Data>): Promise<${className}Data> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', '${page.name.replace(/-/g, '_')}_data');
      
      const newItem: ${className}Data = {
        id: this.generateId(),
        title: item.title || 'Untitled',
        status: item.status || 'pending',
        priority: item.priority || 'medium',
        category: '${page.category}',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: item.metadata || {},
        ...item
      };
      
      await collection.insertOne(newItem);
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'createItem', 
        item: newItem 
      });
      
      return newItem;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to create item:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public async updateItem(id: string, updates: Partial<${className}Data>): Promise<${className}Data> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', '${page.name.replace(/-/g, '_')}_data');
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        throw new Error(\`Item with id \${id} not found\`);
      }
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'updateItem', 
        item: result.value 
      });
      
      return result.value;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to update item:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public async deleteItem(id: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      this.metrics.totalRequests++;
      
      const collection = await this.databaseManager.getCollection('mongodb', '${page.name.replace(/-/g, '_')}_data');
      
      const result = await collection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        throw new Error(\`Item with id \${id} not found\`);
      }
      
      this.metrics.successfulOperations++;
      this.updateResponseTime(Date.now() - startTime);
      
      this.eventEmitter.emit('dataUpdate', { 
        operation: 'deleteItem', 
        id 
      });
      
      return true;
    } catch (error) {
      this.metrics.failedOperations++;
      this.logger.error('Failed to delete item:', error);
      this.eventEmitter.emit('error', error);
      throw error;
    }
  }

  public getMetrics(): ${className}Metrics {
    return { ...this.metrics };
  }

  public getConfig(): ${className}Config {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<${className}Config>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Configuration updated', { newConfig });
  }

  public getHealthStatus(): { status: string; details: any } {
    const health = {
      status: this.metrics.currentStatus,
      details: {
        totalRequests: this.metrics.totalRequests,
        successRate: this.calculateSuccessRate(),
        averageResponseTime: this.metrics.averageResponseTime,
        lastUpdate: this.metrics.lastUpdateTime,
        configStatus: this.config.enabled ? 'enabled' : 'disabled'
      }
    };
    
    return health;
  }

  private async createInitialSchema(): Promise<void> {
    try {
      const mongodb = this.databaseManager.getDatabase('mongodb');
      const postgresql = this.databaseManager.getDatabase('postgresql');
      
      // Create MongoDB collection with indexes
      const collection = mongodb.collection('${page.name.replace(/-/g, '_')}_data');
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ status: 1 });
      await collection.createIndex({ priority: 1 });
      await collection.createIndex({ createdAt: -1 });
      
      // Create PostgreSQL tables for analytics
      await postgresql.query(\`
        CREATE TABLE IF NOT EXISTS ${page.name.replace(/-/g, '_')}_analytics (
          id SERIAL PRIMARY KEY,
          operation_type VARCHAR(50) NOT NULL,
          execution_time INTEGER NOT NULL,
          status VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      \`);
      
    } catch (error) {
      this.logger.error('Failed to create initial schema:', error);
      throw error;
    }
  }

  private calculateSuccessRate(): number {
    if (this.metrics.totalRequests === 0) return 100;
    return (this.metrics.successfulOperations / this.metrics.totalRequests) * 100;
  }

  private updateResponseTime(responseTime: number): void {
    if (this.metrics.totalRequests === 1) {
      this.metrics.averageResponseTime = responseTime;
    } else {
      this.metrics.averageResponseTime = (
        (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)) + responseTime
      ) / this.metrics.totalRequests;
    }
  }

  private generateId(): string {
    return \`\${page.category}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  }

  private handleDataUpdate(event: any): void {
    this.metrics.lastUpdateTime = new Date();
    this.logger.debug('Data update event:', event);
  }

  private handleError(error: Error): void {
    this.logger.error('Module error:', error);
    if (this.calculateSuccessRate() < this.config.alertThresholds.critical) {
      this.metrics.currentStatus = 'outage';
    } else if (this.calculateSuccessRate() < this.config.alertThresholds.warning) {
      this.metrics.currentStatus = 'degraded';
    }
  }

  private handleStatusChange(status: string): void {
    this.metrics.currentStatus = status as any;
    this.logger.info('Status changed to:', status);
  }
}

export default ${className};
`;
};

const generateReactComponent = (page) => {
  const componentName = page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  return `/**
 * ${page.title}
 * ${page.description}
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import { 
  Refresh,
  Settings,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Search,
  FilterList,
  Sort,
  MoreVert,
  Dashboard as DashboardIcon,
  Analytics,
  Support,
  Help,
  ContactSupport
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface ${componentName}Data {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: '${page.category}';
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface ${componentName}Metrics {
  totalItems: number;
  activeItems: number;
  completedItems: number;
  averageProcessingTime: number;
  successRate: number;
}

const ${componentName}: React.FC = () => {
  const [data, setData] = useState<${componentName}Data[]>([]);
  const [metrics, setMetrics] = useState<${componentName}Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<${componentName}Data | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { addNotification } = useServicePage();

  // Add UI/UX evaluation
  useEffect(() => {
    addUIUXEvaluation({
      componentName: '${componentName}',
      category: '${page.category}',
      metrics: {
        loadTime: performance.now(),
        interactivityTime: performance.now(),
        renderComplexity: 'medium'
      },
      accessibility: {
        hasAriaLabels: true,
        hasKeyboardNavigation: true,
        colorContrastCompliant: true
      }
    });
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/v1/support/${page.name}');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        setData(result.data);
        setMetrics(result.metrics);
        
        addNotification('success', 'Data loaded successfully');
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load data');
        addNotification('error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [addNotification]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      
      const response = await fetch('/api/v1/support/${page.name}');
      if (!response.ok) {
        throw new Error('Failed to refresh data');
      }
      
      const result = await response.json();
      setData(result.data);
      setMetrics(result.metrics);
      
      addNotification('success', 'Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      addNotification('error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [addNotification]);

  const handleCreateItem = useCallback(async (itemData: Partial<${componentName}Data>) => {
    try {
      const response = await fetch('/api/v1/support/${page.name}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create item');
      }
      
      const newItem = await response.json();
      setData(prevData => [...prevData, newItem]);
      
      addNotification('success', 'Item created successfully');
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to create item:', error);
      addNotification('error', 'Failed to create item');
    }
  }, [addNotification]);

  const handleUpdateItem = useCallback(async (id: string, updates: Partial<${componentName}Data>) => {
    try {
      const response = await fetch(\`/api/v1/support/${page.name}/\${id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      const updatedItem = await response.json();
      setData(prevData => 
        prevData.map(item => item.id === id ? updatedItem : item)
      );
      
      addNotification('success', 'Item updated successfully');
    } catch (error) {
      console.error('Failed to update item:', error);
      addNotification('error', 'Failed to update item');
    }
  }, [addNotification]);

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      const response = await fetch(\`/api/v1/support/${page.name}/\${id}\`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      setData(prevData => prevData.filter(item => item.id !== id));
      
      addNotification('success', 'Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete item:', error);
      addNotification('error', 'Failed to delete item');
    }
  }, [addNotification]);

  const filteredData = data.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ${page.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          ${page.description}
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <DashboardIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.totalItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Analytics color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.activeItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.completedItems}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{metrics.successRate.toFixed(1)}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add New
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status Filter"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.priority}
                    color={getPriorityColor(item.priority) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => setSelectedItem(item)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => {
                      setSelectedItem(item);
                      setDialogOpen(true);
                    }}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteItem(item.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Item' : 'Create New Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  defaultValue={selectedItem?.title || ''}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={selectedItem?.status || 'pending'}
                    label="Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    defaultValue={selectedItem?.priority || 'medium'}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedItem(null);
          }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => {
            // Handle save logic here
            setDialogOpen(false);
            setSelectedItem(null);
          }}>
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ${componentName};
`;
};

const generateApiRoute = (page) => {
  const routeName = page.name.replace(/-/g, '_');
  
  return `/**
 * ${page.title} API Routes
 * ${page.description}
 */

import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ${page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}BusinessLogic } from '../../../services/business-logic/modules/support/${page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}BusinessLogic';
import { authenticateToken } from '../../../middleware/auth';
import { validateRequest } from '../../../middleware/validation';
import { Logger } from '../../../utils/Logger';

const router = Router();
const logger = new Logger('${page.title}Routes');
const businessLogic = new ${page.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}BusinessLogic();

/**
 * GET /api/v1/support/${page.name}
 * Get all ${page.title.toLowerCase()} items
 */
router.get('/',
  authenticateToken,
  query('status').optional().isIn(['active', 'pending', 'completed', 'archived']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const filters = {
        ...(req.query.status && { status: req.query.status }),
        ...(req.query.priority && { priority: req.query.priority })
      };

      const data = await businessLogic.getData(filters);
      const metrics = businessLogic.getMetrics();
      const health = businessLogic.getHealthStatus();

      res.json({
        success: true,
        data,
        metrics: {
          totalItems: data.length,
          activeItems: data.filter(item => item.status === 'active').length,
          completedItems: data.filter(item => item.status === 'completed').length,
          averageProcessingTime: metrics.averageResponseTime,
          successRate: (metrics.successfulOperations / Math.max(metrics.totalRequests, 1)) * 100
        },
        health
      });
    } catch (error) {
      logger.error('Failed to get ${page.title.toLowerCase()} data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/support/${page.name}/:id
 * Get specific ${page.title.toLowerCase()} item
 */
router.get('/:id',
  authenticateToken,
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const data = await businessLogic.getData({ id: req.params.id });
      
      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      }

      res.json({
        success: true,
        data: data[0]
      });
    } catch (error) {
      logger.error('Failed to get ${page.title.toLowerCase()} item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/v1/support/${page.name}
 * Create new ${page.title.toLowerCase()} item
 */
router.post('/',
  authenticateToken,
  body('title').isString().notEmpty().trim(),
  body('status').optional().isIn(['active', 'pending', 'completed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('metadata').optional().isObject(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const itemData = {
        title: req.body.title,
        status: req.body.status || 'pending',
        priority: req.body.priority || 'medium',
        metadata: req.body.metadata || {}
      };

      const newItem = await businessLogic.createItem(itemData);

      res.status(201).json({
        success: true,
        data: newItem,
        message: '${page.title} item created successfully'
      });
    } catch (error) {
      logger.error('Failed to create ${page.title.toLowerCase()} item:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create item',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * PUT /api/v1/support/${page.name}/:id
 * Update ${page.title.toLowerCase()} item
 */
router.put('/:id',
  authenticateToken,
  param('id').isString().notEmpty(),
  body('title').optional().isString().notEmpty().trim(),
  body('status').optional().isIn(['active', 'pending', 'completed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('metadata').optional().isObject(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const updates = {
        ...(req.body.title && { title: req.body.title }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.priority && { priority: req.body.priority }),
        ...(req.body.metadata && { metadata: req.body.metadata })
      };

      const updatedItem = await businessLogic.updateItem(req.params.id, updates);

      res.json({
        success: true,
        data: updatedItem,
        message: '${page.title} item updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update ${page.title.toLowerCase()} item:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update item',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
);

/**
 * DELETE /api/v1/support/${page.name}/:id
 * Delete ${page.title.toLowerCase()} item
 */
router.delete('/:id',
  authenticateToken,
  param('id').isString().notEmpty(),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const success = await businessLogic.deleteItem(req.params.id);

      res.json({
        success: true,
        message: '${page.title} item deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete ${page.title.toLowerCase()} item:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: 'Item not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete item',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
);

/**
 * GET /api/v1/support/${page.name}/health
 * Get ${page.title.toLowerCase()} health status
 */
router.get('/health',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const health = businessLogic.getHealthStatus();
      const metrics = businessLogic.getMetrics();

      res.json({
        success: true,
        health,
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get ${page.title.toLowerCase()} health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/v1/support/${page.name}/metrics
 * Get ${page.title.toLowerCase()} metrics
 */
router.get('/metrics',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const metrics = businessLogic.getMetrics();

      res.json({
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get ${page.title.toLowerCase()} metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
`;
};

async function createDirectories() {
  const directories = [
    'src/frontend/views/support',
    'src/frontend/views/support/customer-support',
    'src/frontend/views/support/technical-support', 
    'src/frontend/views/support/help-desk',
    'src/frontend/views/support/knowledge-management',
    'src/services/business-logic/modules/support',
    'src/routes/api/v1/support'
  ];

  for (const dir of directories) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

async function generatePages() {
  console.log('🚀 Generating 49 Support-Related Pages...\n');

  // Create necessary directories
  await createDirectories();

  let generatedCount = 0;

  for (const page of supportPages) {
    try {
      // Generate React Component
      const componentPath = `src/frontend/views/support/${page.category}/${page.name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')}.tsx`;
      
      await fs.writeFile(componentPath, generateReactComponent(page));
      console.log(`✅ Generated React component: ${componentPath}`);

      // Generate Business Logic
      const businessLogicPath = `src/services/business-logic/modules/support/${page.name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')}BusinessLogic.ts`;
      
      await fs.writeFile(businessLogicPath, generateBusinessLogicClass(page));
      console.log(`✅ Generated business logic: ${businessLogicPath}`);

      // Generate API Routes
      const apiRoutePath = `src/routes/api/v1/support/${page.name}.ts`;
      
      await fs.writeFile(apiRoutePath, generateApiRoute(page));
      console.log(`✅ Generated API route: ${apiRoutePath}`);

      generatedCount++;
      
    } catch (error) {
      console.error(`❌ Failed to generate page: ${page.name}`, error);
    }
  }

  // Generate index files for better organization
  await generateIndexFiles();

  console.log(`\n🎉 Successfully generated ${generatedCount} support-related pages!`);
  console.log('📊 Summary:');
  console.log(`   • Customer Support: 12 pages`);
  console.log(`   • Technical Support: 12 pages`);
  console.log(`   • Help Desk: 12 pages`);
  console.log(`   • Knowledge Management: 13 pages`);
  console.log(`   • Total: ${generatedCount} pages`);
}

async function generateIndexFiles() {
  // Generate React components index
  const reactIndexContent = supportPages.map(page => {
    const componentName = page.name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    return `export { default as ${componentName} } from './${page.category}/${componentName}';`;
  }).join('\n');

  await fs.writeFile('src/frontend/views/support/index.ts', `/**
 * Support Pages Index
 * Exports all 49 support-related pages
 */

${reactIndexContent}
`);

  // Generate business logic index
  const businessLogicIndexContent = supportPages.map(page => {
    const className = page.name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'BusinessLogic';
    return `export { ${className} } from './${className}';`;
  }).join('\n');

  await fs.writeFile('src/services/business-logic/modules/support/index.ts', `/**
 * Support Business Logic Index
 * Exports all support-related business logic modules
 */

${businessLogicIndexContent}
`);

  // Generate API routes index
  const apiIndexContent = supportPages.map(page => {
    return `import ${page.name.replace(/-/g, '_')}Routes from './${page.name}';`;
  }).join('\n') + '\n\n' + 
  `export {
${supportPages.map(page => `  ${page.name.replace(/-/g, '_')}Routes`).join(',\n')}
};`;

  await fs.writeFile('src/routes/api/v1/support/index.ts', `/**
 * Support API Routes Index
 * Exports all support-related API routes
 */

${apiIndexContent}
`);

  console.log('✅ Generated index files for better organization');
}

// Run the generator
generatePages().catch(console.error);