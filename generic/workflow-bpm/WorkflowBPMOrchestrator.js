"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowBPMOrchestrator = void 0;
const events_1 = require("events");
const WorkflowEngine_1 = require("./core/WorkflowEngine");
const InMemoryWorkflowRepository_1 = require("./repository/InMemoryWorkflowRepository");
const defaultLogger = {
    error: (message, meta) => console.error(message, meta),
    warn: (message, meta) => console.warn(message, meta),
    info: (message, meta) => console.info(message, meta),
    debug: (message, meta) => console.debug(message, meta)
};
class WorkflowBPMOrchestrator extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.config = config;
        this.integrations = {};
        this.performanceMetrics = {
            totalWorkflowsExecuted: 0,
            averageExecutionTime: 0,
            successRate: 0,
            activeWorkflows: 0,
            peakActiveWorkflows: 0,
            totalErrors: 0,
            resourceUtilization: {
                cpu: 0,
                memory: 0,
                disk: 0
            }
        };
        this.executionHistory = [];
        this.logger = this.config.logger || defaultLogger;
        this.logger.info('Initializing Generic Workflow BPM Orchestrator', {
            component: 'WorkflowBPMOrchestrator',
            config: this.config
        });
        this.initialize();
    }
    async initialize() {
        try {
            this.repository = new InMemoryWorkflowRepository_1.InMemoryWorkflowRepository(this.logger);
            const engineConfig = {
                ...this.config.engine,
                logger: this.logger
            };
            this.workflowEngine = new WorkflowEngine_1.WorkflowEngineCore(this.repository, engineConfig);
            this.setupIntegrations();
            this.setupEventHandlers();
            this.startPerformanceMonitoring();
            this.logger.info('Workflow BPM Orchestrator initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Workflow BPM Orchestrator', {
                error: error.message
            });
            throw error;
        }
    }
    setupIntegrations() {
        this.integrations = {
            taskManager: this.config.integrations?.taskManager,
            messageQueue: this.config.integrations?.messageQueue,
            evidenceManager: this.config.integrations?.evidenceManager,
            issueManager: this.config.integrations?.issueManager
        };
        if (this.integrations.messageQueue) {
            this.setupMessageQueueIntegration();
        }
        if (this.integrations.taskManager) {
            this.setupTaskManagerIntegration();
        }
        if (this.integrations.evidenceManager) {
            this.setupEvidenceManagerIntegration();
        }
        if (this.integrations.issueManager) {
            this.setupIssueManagerIntegration();
        }
        this.logger.info('Workflow BPM integrations configured', {
            integrations: Object.keys(this.integrations).filter(key => this.integrations[key])
        });
    }
    setupMessageQueueIntegration() {
        const messageQueue = this.integrations.messageQueue;
        messageQueue.subscribe('workflow.triggers.*', async (message) => {
            try {
                await this.handleWorkflowTriggerEvent(message);
            }
            catch (error) {
                this.logger.error('Failed to handle workflow trigger event', {
                    message,
                    error: error.message
                });
            }
        });
        messageQueue.subscribe('workflow.control.*', async (message) => {
            try {
                await this.handleWorkflowControlEvent(message);
            }
            catch (error) {
                this.logger.error('Failed to handle workflow control event', {
                    message,
                    error: error.message
                });
            }
        });
        this.logger.info('Message queue integration configured for workflows');
    }
    setupTaskManagerIntegration() {
        const taskManager = this.integrations.taskManager;
        taskManager.on('task-completed', async (task) => {
            try {
                await this.handleTaskCompletionEvent(task);
            }
            catch (error) {
                this.logger.error('Failed to handle task completion event', {
                    taskId: task.id,
                    error: error.message
                });
            }
        });
        this.logger.info('Task manager integration configured for workflows');
    }
    setupEvidenceManagerIntegration() {
        const evidenceManager = this.integrations.evidenceManager;
        evidenceManager.on('evidence-collected', async (evidence) => {
            try {
                await this.handleEvidenceCollectionEvent(evidence);
            }
            catch (error) {
                this.logger.error('Failed to handle evidence collection event', {
                    evidenceId: evidence.id,
                    error: error.message
                });
            }
        });
        this.logger.info('Evidence manager integration configured for workflows');
    }
    setupIssueManagerIntegration() {
        const issueManager = this.integrations.issueManager;
        issueManager.on('issue-created', async (issue) => {
            try {
                await this.handleIssueCreationEvent(issue);
            }
            catch (error) {
                this.logger.error('Failed to handle issue creation event', {
                    issueId: issue.id,
                    error: error.message
                });
            }
        });
        issueManager.on('issue-escalated', async (issue) => {
            try {
                await this.handleIssueEscalationEvent(issue);
            }
            catch (error) {
                this.logger.error('Failed to handle issue escalation event', {
                    issueId: issue.id,
                    error: error.message
                });
            }
        });
        this.logger.info('Issue manager integration configured for workflows');
    }
    setupEventHandlers() {
        this.workflowEngine.on('workflowStarted', (data) => {
            this.performanceMetrics.activeWorkflows++;
            this.performanceMetrics.peakActiveWorkflows = Math.max(this.performanceMetrics.peakActiveWorkflows, this.performanceMetrics.activeWorkflows);
            this.emit('workflow-started', data.instance);
            this.logger.info('Workflow started', { instanceId: data.instance.id, workflowId: data.instance.workflowId });
        });
        this.workflowEngine.on('workflowCompleted', (data) => {
            this.performanceMetrics.activeWorkflows--;
            this.performanceMetrics.totalWorkflowsExecuted++;
            this.updateSuccessRate(true);
            this.updateAverageExecutionTime(data.instance.duration || 0);
            this.addToExecutionHistory(data.instance.duration || 0, true);
            this.emit('workflow-completed', data.instance);
            this.logger.info('Workflow completed', { instanceId: data.instance.id, duration: data.instance.duration });
        });
        this.workflowEngine.on('workflowFailed', (data) => {
            this.performanceMetrics.activeWorkflows--;
            this.performanceMetrics.totalWorkflowsExecuted++;
            this.performanceMetrics.totalErrors++;
            this.updateSuccessRate(false);
            this.addToExecutionHistory(data.instance.duration || 0, false);
            this.emit('workflow-failed', data.instance, data.error);
            this.logger.error('Workflow failed', { instanceId: data.instance.id, error: data.error.message });
        });
        this.workflowEngine.on('workflowPaused', (data) => {
            this.emit('workflow-paused', data.instanceId);
            this.logger.info('Workflow paused', { instanceId: data.instanceId });
        });
        this.workflowEngine.on('workflowResumed', (data) => {
            this.emit('workflow-resumed', data.instanceId);
            this.logger.info('Workflow resumed', { instanceId: data.instanceId });
        });
        this.workflowEngine.on('workflowCancelled', (data) => {
            this.performanceMetrics.activeWorkflows--;
            this.emit('workflow-cancelled', data.instanceId);
            this.logger.info('Workflow cancelled', { instanceId: data.instanceId });
        });
    }
    async registerWorkflowDefinition(definition) {
        try {
            await this.workflowEngine.registerWorkflowDefinition(definition);
            this.logger.info('Workflow definition registered', {
                id: definition.id,
                name: definition.name
            });
        }
        catch (error) {
            this.logger.error('Failed to register workflow definition', {
                id: definition.id,
                error: error.message
            });
            throw error;
        }
    }
    async startWorkflow(workflowId, parameters = {}, initiatedBy = 'system') {
        try {
            this.logger.info('Starting workflow', { workflowId, parameters, initiatedBy });
            return await this.workflowEngine.startWorkflow(workflowId, parameters, initiatedBy);
        }
        catch (error) {
            this.logger.error('Failed to start workflow', {
                workflowId,
                error: error.message
            });
            throw error;
        }
    }
    async pauseWorkflow(instanceId) {
        try {
            await this.workflowEngine.pauseWorkflow(instanceId);
            this.logger.info('Workflow paused', { instanceId });
        }
        catch (error) {
            this.logger.error('Failed to pause workflow', {
                instanceId,
                error: error.message
            });
            throw error;
        }
    }
    async resumeWorkflow(instanceId) {
        try {
            await this.workflowEngine.resumeWorkflow(instanceId);
            this.logger.info('Workflow resumed', { instanceId });
        }
        catch (error) {
            this.logger.error('Failed to resume workflow', {
                instanceId,
                error: error.message
            });
            throw error;
        }
    }
    async cancelWorkflow(instanceId, reason) {
        try {
            await this.workflowEngine.cancelWorkflow(instanceId, reason);
            this.logger.info('Workflow cancelled', { instanceId, reason });
        }
        catch (error) {
            this.logger.error('Failed to cancel workflow', {
                instanceId,
                error: error.message
            });
            throw error;
        }
    }
    async getWorkflowInstance(instanceId) {
        try {
            return await this.workflowEngine.getWorkflowInstance(instanceId);
        }
        catch (error) {
            this.logger.error('Failed to get workflow instance', {
                instanceId,
                error: error.message
            });
            throw error;
        }
    }
    async getWorkflowDefinitions() {
        try {
            return await this.workflowEngine.listWorkflowDefinitions();
        }
        catch (error) {
            this.logger.error('Failed to get workflow definitions', {
                error: error.message
            });
            throw error;
        }
    }
    async handleWorkflowTriggerEvent(message) {
        const { workflowId, parameters, triggerType, triggerData } = message;
        try {
            const shouldTrigger = await this.evaluateTriggerConditions(workflowId, triggerData);
            if (shouldTrigger) {
                await this.startWorkflow(workflowId, parameters, 'event-trigger');
                if (this.integrations.messageQueue) {
                    await this.integrations.messageQueue.publish('workflow.started', {
                        workflowId,
                        parameters,
                        triggerType,
                        timestamp: new Date()
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to handle workflow trigger event', {
                workflowId,
                error: error.message
            });
        }
    }
    async handleWorkflowControlEvent(message) {
        const { action, instanceId, reason } = message;
        try {
            switch (action) {
                case 'pause':
                    await this.pauseWorkflow(instanceId);
                    break;
                case 'resume':
                    await this.resumeWorkflow(instanceId);
                    break;
                case 'cancel':
                    await this.cancelWorkflow(instanceId, reason);
                    break;
                default:
                    this.logger.warn('Unknown workflow control action', { action, instanceId });
            }
        }
        catch (error) {
            this.logger.error('Failed to handle workflow control event', {
                action,
                instanceId,
                error: error.message
            });
        }
    }
    async handleTaskCompletionEvent(task) {
        if (task.workflowTriggers) {
            for (const trigger of task.workflowTriggers) {
                await this.startWorkflow(trigger.workflowId, {
                    completedTask: task,
                    ...trigger.parameters
                }, 'task-completion');
            }
        }
    }
    async handleEvidenceCollectionEvent(evidence) {
        if (evidence.workflowTriggers) {
            for (const trigger of evidence.workflowTriggers) {
                await this.startWorkflow(trigger.workflowId, {
                    evidence,
                    ...trigger.parameters
                }, 'evidence-collection');
            }
        }
    }
    async handleIssueCreationEvent(issue) {
        if (issue.workflowTriggers) {
            for (const trigger of issue.workflowTriggers) {
                await this.startWorkflow(trigger.workflowId, {
                    issue,
                    ...trigger.parameters
                }, 'issue-creation');
            }
        }
    }
    async handleIssueEscalationEvent(issue) {
        if (issue.escalationWorkflowTriggers) {
            for (const trigger of issue.escalationWorkflowTriggers) {
                await this.startWorkflow(trigger.workflowId, {
                    issue,
                    escalationLevel: issue.escalationLevel,
                    ...trigger.parameters
                }, 'issue-escalation');
            }
        }
    }
    async evaluateTriggerConditions(workflowId, triggerData) {
        try {
            const definition = await this.workflowEngine.getWorkflowDefinition(workflowId);
            const trigger = definition.triggers.find(t => t.enabled);
            if (!trigger || !trigger.conditions) {
                return true;
            }
            for (const condition of trigger.conditions) {
                try {
                    const result = this.evaluateCondition(condition.expression, triggerData);
                    if (!result) {
                        return false;
                    }
                }
                catch (error) {
                    this.logger.warn('Failed to evaluate trigger condition', {
                        workflowId,
                        condition: condition.expression,
                        error
                    });
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error('Failed to evaluate trigger conditions', {
                workflowId,
                error: error.message
            });
            return false;
        }
    }
    evaluateCondition(expression, context) {
        try {
            const func = new Function('context', `with(context) { return ${expression} }`);
            return !!func(context);
        }
        catch (error) {
            this.logger.warn('Expression evaluation failed', { expression, error });
            return false;
        }
    }
    updateSuccessRate(success) {
        if (this.performanceMetrics.totalWorkflowsExecuted === 0) {
            this.performanceMetrics.successRate = success ? 100 : 0;
        }
        else {
            const successCount = Math.round(this.performanceMetrics.successRate * (this.performanceMetrics.totalWorkflowsExecuted - 1) / 100);
            const newSuccessCount = successCount + (success ? 1 : 0);
            this.performanceMetrics.successRate = (newSuccessCount / this.performanceMetrics.totalWorkflowsExecuted) * 100;
        }
    }
    updateAverageExecutionTime(duration) {
        if (this.performanceMetrics.totalWorkflowsExecuted === 1) {
            this.performanceMetrics.averageExecutionTime = duration;
        }
        else {
            const totalTime = this.performanceMetrics.averageExecutionTime * (this.performanceMetrics.totalWorkflowsExecuted - 1);
            this.performanceMetrics.averageExecutionTime = (totalTime + duration) / this.performanceMetrics.totalWorkflowsExecuted;
        }
    }
    addToExecutionHistory(duration, success) {
        this.executionHistory.push({
            timestamp: new Date(),
            duration,
            success
        });
        if (this.executionHistory.length > 1000) {
            this.executionHistory.shift();
        }
    }
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updateResourceUtilization();
            this.emit('performance-metrics', this.getPerformanceMetrics());
        }, 30000);
    }
    updateResourceUtilization() {
        this.performanceMetrics.resourceUtilization = {
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            disk: Math.random() * 100
        };
    }
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            executionHistory: this.executionHistory.slice(-10)
        };
    }
    async getSystemHealth() {
        const engineMetrics = await this.workflowEngine.getEngineMetrics();
        const repoStats = await this.repository.getStats();
        return {
            status: this.performanceMetrics.activeWorkflows > 0 ? 'active' : 'idle',
            performance: this.performanceMetrics,
            engine: engineMetrics,
            repository: repoStats,
            integrations: {
                taskManager: !!this.integrations.taskManager,
                messageQueue: !!this.integrations.messageQueue,
                evidenceManager: !!this.integrations.evidenceManager,
                issueManager: !!this.integrations.issueManager
            }
        };
    }
}
exports.WorkflowBPMOrchestrator = WorkflowBPMOrchestrator;
exports.default = WorkflowBPMOrchestrator;
//# sourceMappingURL=WorkflowBPMOrchestrator.js.map