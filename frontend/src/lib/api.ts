import {
  IOC,
  MITRETechnique,
  MITRETactic,
  MITREGroup,
  Issue,
  Organization,
  Evidence,
  Task,
  ApiInfo,
  CreateIOCRequest,
  CreateIssueRequest,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        message: data.message,
        error: response.ok ? undefined : data.error || data.message,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Specific API methods
  async getApiInfo() {
    return this.get('/');
  }

  // IOC methods
  async getIOCs() {
    return this.get('/iocs');
  }

  async getIOC(id: string) {
    return this.get(`/iocs/${id}`);
  }

  async createIOC(ioc: CreateIOCRequest) {
    return this.post<IOC>('/iocs', ioc);
  }

  // MITRE methods
  async getMITRETechniques() {
    return this.get('/mitre/techniques');
  }

  async getMITRETactics() {
    return this.get('/mitre/tactics');
  }

  async getMITREGroups() {
    return this.get('/mitre/groups');
  }

  // Issues methods
  async getIssues() {
    return this.get('/issues');
  }

  async getIssue(id: string) {
    return this.get(`/issues/${id}`);
  }

  async createIssue(issue: CreateIssueRequest) {
    return this.post<Issue>('/issues', issue);
  }

  // Organizations methods
  async getOrganizations() {
    return this.get('/organizations');
  }

  async getOrganization(id: string) {
    return this.get(`/organizations/${id}`);
  }

  // Evidence methods
  async getEvidence() {
    return this.get('/evidence');
  }

  // Tasks methods
  async getTasks() {
    return this.get('/tasks');
  }

  // Task Management - Execution & Operations
  async getTaskExecutionMonitor() {
    return this.get('/tasks/task-execution-monitor');
  }

  async getRealTimeTaskDashboard() {
    return this.get('/tasks/real-time-task-dashboard');
  }

  async getTaskPerformanceAnalyzer() {
    return this.get('/tasks/task-performance-analyzer');
  }

  async getTaskResourceOptimizer() {
    return this.get('/tasks/task-resource-optimizer');
  }

  async getTaskQueueManager() {
    return this.get('/tasks/task-queue-manager');
  }

  async getTaskBatchProcessor() {
    return this.get('/tasks/task-batch-processor');
  }

  async getTaskErrorHandler() {
    return this.get('/tasks/task-error-handler');
  }

  async getTaskRetryManager() {
    return this.get('/tasks/task-retry-manager');
  }

  async getTaskLoadBalancer() {
    return this.get('/tasks/task-load-balancer');
  }

  async getTaskCapacityPlanner() {
    return this.get('/tasks/task-capacity-planner');
  }

  // Task Management - Governance & Compliance
  async getTaskComplianceMonitor() {
    return this.get('/tasks/task-compliance-monitor');
  }

  async getTaskAuditTrail() {
    return this.get('/tasks/task-audit-trail');
  }

  async getTaskPolicyEngine() {
    return this.get('/tasks/task-policy-engine');
  }

  async getTaskRiskAssessment() {
    return this.get('/tasks/task-risk-assessment');
  }

  async getTaskSecurityReview() {
    return this.get('/tasks/task-security-review');
  }

  async getTaskDataGovernance() {
    return this.get('/tasks/task-data-governance');
  }

  async getTaskRegulatoryTracker() {
    return this.get('/tasks/task-regulatory-tracker');
  }

  async getTaskCertificationManager() {
    return this.get('/tasks/task-certification-manager');
  }

  // Task Management - Analytics & Intelligence
  async getTaskAnalyticsDashboard() {
    return this.get('/tasks/task-analytics-dashboard');
  }

  async getTaskPredictionEngine() {
    return this.get('/tasks/task-prediction-engine');
  }

  async getTaskTrendAnalyzer() {
    return this.get('/tasks/task-trend-analyzer');
  }

  async getTaskPatternDetector() {
    return this.get('/tasks/task-pattern-detector');
  }

  async getTaskAnomalyMonitor() {
    return this.get('/tasks/task-anomaly-monitor');
  }

  async getTaskBenchmarkingSuite() {
    return this.get('/tasks/task-benchmarking-suite');
  }

  async getTaskRoiCalculator() {
    return this.get('/tasks/task-roi-calculator');
  }

  async getTaskSuccessMetrics() {
    return this.get('/tasks/task-success-metrics');
  }

  // Task Management - Collaboration & Communication
  async getTaskCollaborationHub() {
    return this.get('/tasks/task-collaboration-hub');
  }

  async getTaskCommunicationCenter() {
    return this.get('/tasks/task-communication-center');
  }

  async getTaskStakeholderPortal() {
    return this.get('/tasks/task-stakeholder-portal');
  }

  async getTaskReviewBoard() {
    return this.get('/tasks/task-review-board');
  }

  async getTaskFeedbackSystem() {
    return this.get('/tasks/task-feedback-system');
  }

  async getTaskKnowledgeBase() {
    return this.get('/tasks/task-knowledge-base');
  }

  async getTaskTrainingCenter() {
    return this.get('/tasks/task-training-center');
  }

  async getTaskDocumentationPortal() {
    return this.get('/tasks/task-documentation-portal');
  }

  // Task Management - Integration & APIs
  async getTaskApiGateway() {
    return this.get('/tasks/task-api-gateway');
  }

  async getTaskWebhookManager() {
    return this.get('/tasks/task-webhook-manager');
  }

  async getTaskIntegrationHub() {
    return this.get('/tasks/task-integration-hub');
  }

  async getTaskDataConnectors() {
    return this.get('/tasks/task-data-connectors');
  }

  async getTaskExternalServices() {
    return this.get('/tasks/task-external-services');
  }

  async getTaskSiemIntegration() {
    return this.get('/tasks/task-siem-integration');
  }

  async getTaskOrchestrationEngine() {
    return this.get('/tasks/task-orchestration-engine');
  }

  async getTaskEventProcessor() {
    return this.get('/tasks/task-event-processor');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
