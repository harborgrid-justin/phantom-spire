/**
 * UI/UX Evaluation System - Main Export
 * Fortune 100-Grade Enterprise UI/UX Evaluation Platform
 */

// Core services
export { UIUXEvaluationService } from './core/UIUXEvaluationService';

// Interfaces and types
export {
  EvaluationCategory,
  EvaluationSeverity,
  type IUIUXEvaluationService,
  type IUIUXEvaluationConfig,
  type IPageEvaluation,
  type IEvaluationMetric,
  type IEvaluationIssue,
  type IEvaluationReport,
  type IEvaluationSession,
  type IEvaluationDashboard
} from './interfaces/IUIUXEvaluation';

// React components (if React is available)
export { EvaluationWidget } from './components/EvaluationComponents';

// Hooks and utilities
export {
  useUIUXEvaluation,
  createEvaluationStatusElement,
  addUIUXEvaluation
} from './hooks/useUIUXEvaluation';

// Default configuration
export const defaultEvaluationConfig = {
  enabled: true,
  autoEvaluate: true,
  evaluationInterval: 30000, // 30 seconds
  categories: [
    'accessibility',
    'performance', 
    'usability',
    'visual_design',
    'enterprise_standards',
    'user_journey'
  ],
  accessibility: {
    enabled: true,
    wcagLevel: 'AA' as const,
    checkColorContrast: true,
    checkKeyboardNav: true,
    checkScreenReader: true
  },
  performance: {
    enabled: true,
    targetLoadTime: 2000,
    targetInteractionTime: 100,
    monitorFrameRate: true
  },
  usability: {
    enabled: true,
    trackUserActions: true,
    trackErrorRates: true,
    trackCompletionTimes: true
  },
  reporting: {
    enabled: true,
    autoGenerate: true,
    retentionDays: 90
  }
};

// Quick start function for immediate evaluation
export const quickEvaluate = async (pageId: string, options?: {
  continuous?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  minimized?: boolean;
}) => {
  console.log(`🚀 Quick UI/UX evaluation started for: ${pageId}`);
  
  return addUIUXEvaluation(pageId, {
    autoStart: true,
    continuous: options?.continuous || false,
    position: options?.position || 'bottom-right',
    minimized: options?.minimized || false
  });
};

// Global evaluation manager for multiple pages
export class GlobalUIUXEvaluationManager {
  private static instance: GlobalUIUXEvaluationManager;
  private evaluations: Map<string, any> = new Map();
  private service: UIUXEvaluationService;

  private constructor() {
    this.service = new UIUXEvaluationService();
  }

  static getInstance(): GlobalUIUXEvaluationManager {
    if (!GlobalUIUXEvaluationManager.instance) {
      GlobalUIUXEvaluationManager.instance = new GlobalUIUXEvaluationManager();
    }
    return GlobalUIUXEvaluationManager.instance;
  }

  async startEvaluationForPage(pageId: string, options?: any) {
    if (this.evaluations.has(pageId)) {
      console.warn(`Evaluation already running for ${pageId}`);
      return this.evaluations.get(pageId);
    }

    const evaluation = addUIUXEvaluation(pageId, options);
    this.evaluations.set(pageId, evaluation);
    
    console.log(`✅ Started evaluation for ${pageId}`);
    return evaluation;
  }

  async stopEvaluationForPage(pageId: string) {
    const evaluation = this.evaluations.get(pageId);
    if (evaluation) {
      evaluation.remove();
      this.evaluations.delete(pageId);
      console.log(`🛑 Stopped evaluation for ${pageId}`);
    }
  }

  async generateGlobalReport() {
    const pageIds = Array.from(this.evaluations.keys());
    if (pageIds.length === 0) {
      console.warn('No pages being evaluated');
      return null;
    }

    const report = await this.service.generateReport(pageIds);
    console.log(`📊 Generated global report for ${pageIds.length} pages`);
    return report;
  }

  getActiveEvaluations() {
    return Array.from(this.evaluations.keys());
  }

  async stopAll() {
    for (const [pageId, evaluation] of this.evaluations) {
      evaluation.remove();
    }
    this.evaluations.clear();
    console.log('🛑 Stopped all UI/UX evaluations');
  }
}

// Convenience export
export const globalEvaluationManager = GlobalUIUXEvaluationManager.getInstance();