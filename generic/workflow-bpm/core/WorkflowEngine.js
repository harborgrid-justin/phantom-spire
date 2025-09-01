"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineCore = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const IWorkflowEngine_1 = require("../interfaces/IWorkflowEngine");
const defaultLogger = {
    error: (message, meta) => console.error(message, meta),
    warn: (message, meta) => console.warn(message, meta),
    info: (message, meta) => console.info(message, meta),
    debug: (message, meta) => console.debug(message, meta)
};
class WorkflowEngineCore extends events_1.EventEmitter {
    constructor(repository, config = {}) {
        super();
        this.repository = repository;
        this.config = config;
        this.stepHandlers = new Map();
        this.activeInstances = new Map();
        this.runningExecutions = new Map();
        this.metrics = {
            activeInstances: 0,
            totalExecutions: 0,
            averageExecutionTime: 0,
            successRate: 0,
            failureRate: 0,
            resourceUtilization: {
                cpu: 0,
                memory: 0,
                disk: 0,
                network: 0
            },
            performance: {
                throughput: 0,
                latency: 0,
                queueDepth: 0
            }
        };
        this.executionStats = [];
        this.logger = this.config.logger || defaultLogger;
        this.config = {
            maxConcurrentWorkflows: 50000,
            memoryLimit: '8GB',
            executionTimeout: 24 * 60 * 60 * 1000,
            checkpointInterval: 5000,
            optimization: {
                enabled: true,
                mlOptimization: true,
                dynamicScaling: true
            },
            ...config
        };
        this.logger = this.config.logger || defaultLogger;
        this.initializeEngine();
        this.startMetricsCollection();
    }
    initializeEngine() {
        this.logger.info('Initializing Generic Workflow Engine', {
            component: 'WorkflowEngine',
            config: this.config
        });
        this.registerDefaultStepHandlers();
        if (this.config.checkpointInterval && this.config.checkpointInterval > 0) {
            setInterval(() => {
                this.createCheckpoints();
            }, this.config.checkpointInterval);
        }
    }
    registerDefaultStepHandlers() {
        this.registerStepHandler({
            type: IWorkflowEngine_1.StepType.TASK,
            execute: async (step, context) => {
                const { services, stepInputs } = context;
                try {
                    if (services.taskManager && context.workflowDefinition.integrations.taskManagement.enabled) {
                        const taskResult = await services.taskManager.createTask({
                            name: step.name,
                            description: step.description,
                            parameters: stepInputs,
                            priority: context.workflowDefinition.integrations.taskManagement.taskPriority,
                            workflowInstanceId: context.workflowInstance.id,
                            stepId: step.id
                        });
                        return {
                            success: true,
                            outputs: { taskId: taskResult.id, taskResult },
                            metadata: { executionTime: Date.now() }
                        };
                    }
                    return {
                        success: true,
                        outputs: stepInputs,
                        metadata: { executionTime: Date.now() }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error,
                        metadata: { executionTime: Date.now() }
                    };
                }
            }
        });
        this.registerStepHandler({
            type: IWorkflowEngine_1.StepType.DECISION,
            execute: async (step, context) => {
                try {
                    const { variables, stepInputs } = context;
                    const condition = step.conditions?.[0]?.expression;
                    if (!condition) {
                        throw new Error('Decision step requires condition expression');
                    }
                    const evaluationContext = { ...variables, ...stepInputs };
                    const result = this.evaluateExpression(condition, evaluationContext);
                    const nextSteps = result ? step.nextSteps : step.configuration.falseSteps || [];
                    return {
                        success: true,
                        outputs: { decision: result },
                        nextSteps,
                        metadata: { condition, result }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error
                    };
                }
            }
        });
        this.registerStepHandler({
            type: IWorkflowEngine_1.StepType.PARALLEL,
            execute: async (step, context) => {
                try {
                    const parallelSteps = step.configuration.parallelSteps || step.nextSteps;
                    const results = {};
                    await Promise.all(parallelSteps.map(async (stepId) => {
                        const parallelStep = context.workflowDefinition.steps.find(s => s.id === stepId);
                        if (parallelStep) {
                            const handler = this.stepHandlers.get(parallelStep.type);
                            if (handler) {
                                const result = await handler.execute(parallelStep, context);
                                results[stepId] = result;
                            }
                        }
                    }));
                    return {
                        success: true,
                        outputs: { parallelResults: results },
                        metadata: { parallelSteps }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error
                    };
                }
            }
        });
        this.registerStepHandler({
            type: IWorkflowEngine_1.StepType.SCRIPT,
            execute: async (step, context) => {
                try {
                    const { variables, stepInputs } = context;
                    const script = step.configuration.script;
                    if (!script) {
                        throw new Error('Script step requires script configuration');
                    }
                    const executionContext = {
                        ...variables,
                        ...stepInputs,
                        stepId: step.id,
                        workflowId: context.workflowInstance.workflowId
                    };
                    const result = this.evaluateExpression(script, executionContext);
                    return {
                        success: true,
                        outputs: { result },
                        metadata: { script }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error
                    };
                }
            }
        });
        this.registerStepHandler({
            type: IWorkflowEngine_1.StepType.TIMER,
            execute: async (step, context) => {
                try {
                    const duration = step.configuration.duration || step.timeout || '1m';
                    const durationMs = this.parseDuration(duration);
                    await new Promise(resolve => setTimeout(resolve, durationMs));
                    return {
                        success: true,
                        outputs: { waitTime: durationMs },
                        metadata: { duration }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error
                    };
                }
            }
        });
        this.registerStepHandler({
            type: IWorkflowEngine_1.StepType.HUMAN,
            execute: async (step, context) => {
                try {
                    this.logger.info('Human task created', {
                        stepId: step.id,
                        stepName: step.name,
                        workflowInstanceId: context.workflowInstance.id
                    });
                    return {
                        success: true,
                        outputs: {
                            humanTaskId: (0, uuid_1.v4)(),
                            status: 'pending',
                            assignee: step.humanTask?.assignee
                        },
                        metadata: { taskType: 'human' }
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error
                    };
                }
            }
        });
    }
    evaluateExpression(expression, context) {
        try {
            const func = new Function(...Object.keys(context), `return ${expression}`);
            return func(...Object.values(context));
        }
        catch (error) {
            this.logger.error('Expression evaluation failed', { expression, error });
            return false;
        }
    }
    parseDuration(duration) {
        const units = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000
        };
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error(`Invalid duration format: ${duration}`);
        }
        const value = parseInt(match[1]);
        const unit = match[2];
        return value * units[unit];
    }
    async registerWorkflowDefinition(definition) {
        try {
            await this.repository.saveDefinition(definition);
            this.logger.info('Workflow definition registered', {
                id: definition.id,
                version: definition.version
            });
            this.emit('workflowDefinitionRegistered', { definition });
        }
        catch (error) {
            this.logger.error('Failed to register workflow definition', {
                id: definition.id,
                error: error.message
            });
            throw error;
        }
    }
    async unregisterWorkflowDefinition(workflowId) {
        try {
            await this.repository.deleteDefinition(workflowId);
            this.logger.info('Workflow definition unregistered', { id: workflowId });
            this.emit('workflowDefinitionUnregistered', { workflowId });
        }
        catch (error) {
            this.logger.error('Failed to unregister workflow definition', {
                id: workflowId,
                error: error.message
            });
            throw error;
        }
    }
    async getWorkflowDefinition(workflowId) {
        try {
            return await this.repository.getDefinition(workflowId);
        }
        catch (error) {
            this.logger.error('Failed to get workflow definition', {
                id: workflowId,
                error: error.message
            });
            throw error;
        }
    }
    async listWorkflowDefinitions() {
        try {
            return await this.repository.getDefinitions();
        }
        catch (error) {
            this.logger.error('Failed to list workflow definitions', {
                error: error.message
            });
            throw error;
        }
    }
    async startWorkflow(workflowId, parameters = {}, initiatedBy = 'system') {
        try {
            if (this.activeInstances.size >= (this.config.maxConcurrentWorkflows || 50000)) {
                throw new Error('Maximum concurrent workflows limit reached');
            }
            const definition = await this.getWorkflowDefinition(workflowId);
            const instanceId = (0, uuid_1.v4)();
            const instance = {
                id: instanceId,
                workflowId: definition.id,
                version: definition.version,
                status: IWorkflowEngine_1.WorkflowStatus.PENDING,
                priority: IWorkflowEngine_1.WorkflowPriority.MEDIUM,
                variables: { ...definition.variables },
                parameters,
                startedAt: new Date(),
                currentSteps: [],
                completedSteps: [],
                failedSteps: [],
                initiatedBy,
                history: [{
                        id: (0, uuid_1.v4)(),
                        timestamp: new Date(),
                        type: 'step_started',
                        data: { workflowId, parameters, initiatedBy }
                    }],
                metrics: {
                    executionTime: 0,
                    stepExecutionTimes: {},
                    resourceUsage: { cpu: 0, memory: 0, network: 0 },
                    performanceScore: 0,
                    slaCompliance: true
                }
            };
            await this.repository.saveInstance(instance);
            this.activeInstances.set(instanceId, instance);
            const executionPromise = this.executeWorkflow(instance, definition);
            this.runningExecutions.set(instanceId, executionPromise);
            this.metrics.activeInstances = this.activeInstances.size;
            this.metrics.totalExecutions++;
            this.logger.info('Workflow started', {
                instanceId,
                workflowId,
                initiatedBy
            });
            this.emit('workflowStarted', { instance, definition });
            return instance;
        }
        catch (error) {
            this.logger.error('Failed to start workflow', {
                workflowId,
                error: error.message
            });
            throw error;
        }
    }
    async executeWorkflow(instance, definition) {
        try {
            instance.status = IWorkflowEngine_1.WorkflowStatus.RUNNING;
            await this.repository.updateInstance(instance.id, { status: IWorkflowEngine_1.WorkflowStatus.RUNNING });
            const initialSteps = definition.steps.filter(step => step.nextSteps.length > 0 || definition.triggers.some(t => t.configuration.initialStep === step.id));
            if (initialSteps.length === 0) {
                initialSteps.push(definition.steps[0]);
            }
            instance.currentSteps = initialSteps.map(s => s.id);
            await this.executeSteps(instance, definition, instance.currentSteps);
            instance.status = IWorkflowEngine_1.WorkflowStatus.COMPLETED;
            instance.completedAt = new Date();
            instance.duration = instance.completedAt.getTime() - instance.startedAt.getTime();
            await this.repository.updateInstance(instance.id, {
                status: IWorkflowEngine_1.WorkflowStatus.COMPLETED,
                completedAt: instance.completedAt,
                duration: instance.duration
            });
            this.activeInstances.delete(instance.id);
            this.runningExecutions.delete(instance.id);
            this.updateExecutionStats(instance.duration, true);
            this.logger.info('Workflow completed', {
                instanceId: instance.id,
                duration: instance.duration
            });
            this.emit('workflowCompleted', { instance, definition });
        }
        catch (error) {
            instance.status = IWorkflowEngine_1.WorkflowStatus.FAILED;
            instance.error = {
                code: 'EXECUTION_ERROR',
                message: error.message,
                stepId: instance.currentSteps[0] || 'unknown',
                timestamp: new Date(),
                stack: error.stack
            };
            await this.repository.updateInstance(instance.id, {
                status: IWorkflowEngine_1.WorkflowStatus.FAILED,
                error: instance.error
            });
            this.activeInstances.delete(instance.id);
            this.runningExecutions.delete(instance.id);
            const duration = Date.now() - instance.startedAt.getTime();
            this.updateExecutionStats(duration, false);
            this.logger.error('Workflow execution failed', {
                instanceId: instance.id,
                error: error.message
            });
            this.emit('workflowFailed', { instance, definition, error });
            throw error;
        }
    }
    async executeSteps(instance, definition, stepIds) {
        for (const stepId of stepIds) {
            const step = definition.steps.find(s => s.id === stepId);
            if (!step) {
                this.logger.warn('Step not found', { stepId, instanceId: instance.id });
                continue;
            }
            const handler = this.stepHandlers.get(step.type);
            if (!handler) {
                throw new Error(`No handler registered for step type: ${step.type}`);
            }
            const stepStartTime = Date.now();
            try {
                const context = {
                    workflowInstance: instance,
                    workflowDefinition: definition,
                    variables: instance.variables,
                    parameters: instance.parameters,
                    stepInputs: this.resolveStepInputs(step, instance),
                    services: {
                        logger: this.logger
                    }
                };
                const result = await handler.execute(step, context);
                const stepDuration = Date.now() - stepStartTime;
                if (result.success) {
                    if (result.outputs) {
                        Object.assign(instance.variables, result.outputs);
                    }
                    instance.completedSteps.push(stepId);
                    instance.metrics.stepExecutionTimes[stepId] = stepDuration;
                    instance.history.push({
                        id: (0, uuid_1.v4)(),
                        timestamp: new Date(),
                        type: 'step_completed',
                        stepId,
                        data: { outputs: result.outputs, metadata: result.metadata }
                    });
                    if (result.nextSteps && result.nextSteps.length > 0) {
                        await this.executeSteps(instance, definition, result.nextSteps);
                    }
                    else if (step.nextSteps.length > 0) {
                        await this.executeSteps(instance, definition, step.nextSteps);
                    }
                }
                else {
                    instance.failedSteps.push(stepId);
                    instance.history.push({
                        id: (0, uuid_1.v4)(),
                        timestamp: new Date(),
                        type: 'step_failed',
                        stepId,
                        data: { error: result.error?.message, metadata: result.metadata }
                    });
                    if (step.errorHandling.strategy === 'fail') {
                        throw result.error || new Error(`Step ${stepId} failed`);
                    }
                    else if (step.errorHandling.strategy === 'skip') {
                        if (step.nextSteps.length > 0) {
                            await this.executeSteps(instance, definition, step.nextSteps);
                        }
                    }
                }
            }
            catch (error) {
                instance.failedSteps.push(stepId);
                throw error;
            }
        }
    }
    resolveStepInputs(step, instance) {
        const inputs = {};
        for (const [inputKey, inputExpression] of Object.entries(step.inputs)) {
            try {
                if (inputExpression.startsWith('variables.')) {
                    const variableName = inputExpression.replace('variables.', '');
                    inputs[inputKey] = instance.variables[variableName];
                }
                else if (inputExpression.startsWith('parameters.')) {
                    const parameterName = inputExpression.replace('parameters.', '');
                    inputs[inputKey] = instance.parameters[parameterName];
                }
                else {
                    inputs[inputKey] = inputExpression;
                }
            }
            catch (error) {
                this.logger.warn('Failed to resolve step input', {
                    stepId: step.id,
                    inputKey,
                    inputExpression,
                    error
                });
                inputs[inputKey] = null;
            }
        }
        return inputs;
    }
    async pauseWorkflow(instanceId) {
        const instance = this.activeInstances.get(instanceId);
        if (instance) {
            instance.status = IWorkflowEngine_1.WorkflowStatus.PAUSED;
            await this.repository.updateInstance(instanceId, { status: IWorkflowEngine_1.WorkflowStatus.PAUSED });
            this.emit('workflowPaused', { instanceId });
        }
    }
    async resumeWorkflow(instanceId) {
        const instance = this.activeInstances.get(instanceId);
        if (instance) {
            instance.status = IWorkflowEngine_1.WorkflowStatus.RUNNING;
            await this.repository.updateInstance(instanceId, { status: IWorkflowEngine_1.WorkflowStatus.RUNNING });
            this.emit('workflowResumed', { instanceId });
        }
    }
    async cancelWorkflow(instanceId, reason) {
        const instance = this.activeInstances.get(instanceId);
        if (instance) {
            instance.status = IWorkflowEngine_1.WorkflowStatus.CANCELLED;
            await this.repository.updateInstance(instanceId, { status: IWorkflowEngine_1.WorkflowStatus.CANCELLED });
            this.activeInstances.delete(instanceId);
            this.runningExecutions.delete(instanceId);
            this.emit('workflowCancelled', { instanceId, reason });
        }
    }
    async retryFailedStep(instanceId, stepId) {
        this.logger.info('Retrying failed step', { instanceId, stepId });
    }
    async getWorkflowInstance(instanceId) {
        return await this.repository.getInstance(instanceId);
    }
    async listWorkflowInstances(filters) {
        return await this.repository.getInstances(filters);
    }
    async handleWorkflowEvent(event) {
        this.logger.info('Handling workflow event', { event });
    }
    async getWorkflowMetrics(instanceId) {
        const instance = await this.repository.getInstance(instanceId);
        return instance.metrics;
    }
    async getEngineMetrics() {
        return { ...this.metrics };
    }
    registerStepHandler(handler) {
        this.stepHandlers.set(handler.type, handler);
        this.logger.info('Step handler registered', { type: handler.type });
    }
    updateExecutionStats(duration, success) {
        const stat = { duration, success, timestamp: new Date() };
        this.executionStats.push(stat);
        if (this.executionStats.length > 1000) {
            this.executionStats.shift();
        }
        this.metrics.averageExecutionTime =
            this.executionStats.reduce((sum, s) => sum + s.duration, 0) / this.executionStats.length;
        this.metrics.successRate =
            this.executionStats.filter(s => s.success).length / this.executionStats.length;
        this.metrics.failureRate = 1 - this.metrics.successRate;
    }
    createCheckpoints() {
        this.logger.debug('Creating workflow checkpoints', {
            activeInstances: this.activeInstances.size
        });
    }
    startMetricsCollection() {
        setInterval(() => {
            this.metrics.activeInstances = this.activeInstances.size;
            this.metrics.performance.queueDepth = this.runningExecutions.size;
            const recentStats = this.executionStats.filter(s => Date.now() - s.timestamp.getTime() < 60000);
            this.metrics.performance.throughput = recentStats.length / 60;
            this.emit('metricsUpdated', this.metrics);
        }, 10000);
    }
}
exports.WorkflowEngineCore = WorkflowEngineCore;
//# sourceMappingURL=WorkflowEngine.js.map