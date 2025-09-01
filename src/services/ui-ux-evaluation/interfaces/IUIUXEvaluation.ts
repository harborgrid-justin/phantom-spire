/**
 * Fortune 100-Grade UI/UX Evaluation Interfaces
 * Comprehensive evaluation system for enterprise user interface and experience metrics
 */

export enum EvaluationCategory {
  ACCESSIBILITY = 'accessibility',
  PERFORMANCE = 'performance',
  USABILITY = 'usability',
  VISUAL_DESIGN = 'visual_design',
  ENTERPRISE_STANDARDS = 'enterprise_standards',
  USER_JOURNEY = 'user_journey'
}

export enum EvaluationSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export interface IEvaluationMetric {
  id: string;
  name: string;
  category: EvaluationCategory;
  description: string;
  value: number;
  maxValue: number;
  unit: string;
  threshold: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IEvaluationIssue {
  id: string;
  category: EvaluationCategory;
  severity: EvaluationSeverity;
  title: string;
  description: string;
  element?: string;
  selector?: string;
  recommendation: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface IPageEvaluation {
  pageId: string;
  pageName: string;
  url?: string;
  component: string;
  timestamp: Date;
  duration: number;
  metrics: IEvaluationMetric[];
  issues: IEvaluationIssue[];
  overallScore: number;
  categoryScores: Record<EvaluationCategory, number>;
  recommendations: string[];
  compliance: {
    wcag: 'A' | 'AA' | 'AAA' | 'Non-compliant';
    enterprise: boolean;
    responsive: boolean;
  };
}

export interface IEvaluationReport {
  id: string;
  title: string;
  timestamp: Date;
  pages: IPageEvaluation[];
  summary: {
    totalPages: number;
    overallScore: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  trends: {
    scoreImprovement: number;
    issuesReduced: number;
    previousReportId?: string;
  };
  exportFormats: ('pdf' | 'json' | 'csv' | 'xlsx')[];
}

export interface IUIUXEvaluationConfig {
  enabled: boolean;
  autoEvaluate: boolean;
  evaluationInterval: number; // milliseconds
  categories: EvaluationCategory[];
  accessibility: {
    enabled: boolean;
    wcagLevel: 'A' | 'AA' | 'AAA';
    checkColorContrast: boolean;
    checkKeyboardNav: boolean;
    checkScreenReader: boolean;
  };
  performance: {
    enabled: boolean;
    targetLoadTime: number;
    targetInteractionTime: number;
    monitorFrameRate: boolean;
  };
  usability: {
    enabled: boolean;
    trackUserActions: boolean;
    trackErrorRates: boolean;
    trackCompletionTimes: boolean;
  };
  reporting: {
    enabled: boolean;
    autoGenerate: boolean;
    retentionDays: number;
  };
}

export interface IUIUXEvaluationService {
  // Configuration
  configure(config: Partial<IUIUXEvaluationConfig>): Promise<void>;
  getConfig(): Promise<IUIUXEvaluationConfig>;

  // Page evaluation
  evaluatePage(pageId: string, element?: HTMLElement): Promise<IPageEvaluation>;
  startContinuousEvaluation(pageId: string, element?: HTMLElement): Promise<string>;
  stopContinuousEvaluation(sessionId: string): Promise<void>;

  // Metrics collection
  collectMetric(pageId: string, metric: Omit<IEvaluationMetric, 'id' | 'timestamp'>): Promise<void>;
  getMetrics(pageId: string, category?: EvaluationCategory): Promise<IEvaluationMetric[]>;

  // Issue management
  reportIssue(pageId: string, issue: Omit<IEvaluationIssue, 'id' | 'timestamp' | 'resolved'>): Promise<void>;
  getIssues(pageId: string, severity?: EvaluationSeverity): Promise<IEvaluationIssue[]>;
  resolveIssue(issueId: string): Promise<void>;

  // Reporting
  generateReport(pageIds?: string[]): Promise<IEvaluationReport>;
  exportReport(reportId: string, format: 'pdf' | 'json' | 'csv' | 'xlsx'): Promise<Buffer | string>;
  getReports(): Promise<IEvaluationReport[]>;

  // Real-time monitoring
  subscribe(callback: (evaluation: IPageEvaluation) => void): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;

  // Utilities
  calculateScore(metrics: IEvaluationMetric[], issues: IEvaluationIssue[]): number;
  validateWCAGCompliance(element: HTMLElement): Promise<IEvaluationIssue[]>;
  measurePerformance(action: () => Promise<void>): Promise<number>;
}

export interface IEvaluationSession {
  id: string;
  pageId: string;
  startTime: Date;
  endTime?: Date;
  userActions: Array<{
    type: string;
    element: string;
    timestamp: Date;
    duration?: number;
  }>;
  errors: Array<{
    type: string;
    message: string;
    element?: string;
    timestamp: Date;
  }>;
  performance: {
    loadTime: number;
    interactionTimes: number[];
    frameRate: number[];
  };
}

export interface IEvaluationDashboard {
  pageId: string;
  currentScore: number;
  trend: 'improving' | 'declining' | 'stable';
  activeIssues: number;
  lastEvaluation: Date;
  quickActions: Array<{
    label: string;
    action: () => void;
    severity: EvaluationSeverity;
  }>;
}