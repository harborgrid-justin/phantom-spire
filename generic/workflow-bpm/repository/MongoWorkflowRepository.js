"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoWorkflowRepository = void 0;
const mongoose_1 = require("mongoose");
const workflowDefinitionSchema = new mongoose_1.Schema({
    workflowId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    version: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    metadata: {
        author: { type: String, required: true },
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: true },
        approvedBy: { type: String },
        approvedAt: { type: Date }
    },
    triggers: [{
            id: { type: String, required: true },
            type: {
                type: String,
                enum: ['event', 'schedule', 'manual', 'api', 'message', 'timer'],
                required: true
            },
            name: { type: String, required: true },
            description: { type: String, required: true },
            enabled: { type: Boolean, default: true },
            configuration: { type: mongoose_1.Schema.Types.Mixed, default: {} },
            conditions: [{
                    expression: { type: String, required: true },
                    description: { type: String, required: true }
                }],
            rateLimiting: {
                maxExecutions: { type: Number },
                timeWindow: { type: String }
            }
        }],
    steps: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            type: {
                type: String,
                enum: ['task', 'decision', 'parallel', 'sequential', 'subprocess', 'timer', 'message', 'script', 'human'],
                required: true
            },
            description: { type: String, required: true },
            position: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 }
            },
            configuration: { type: mongoose_1.Schema.Types.Mixed, default: {} },
            inputs: { type: mongoose_1.Schema.Types.Mixed, default: {} },
            outputs: { type: mongoose_1.Schema.Types.Mixed, default: {} },
            nextSteps: [{ type: String }],
            errorHandling: {
                strategy: { type: String, enum: ['retry', 'skip', 'fail', 'compensate'], required: true },
                maxRetries: { type: Number },
                retryDelay: { type: String },
                onError: [{ type: String }],
                compensationSteps: [{ type: String }]
            },
            conditions: [{
                    expression: { type: String, required: true },
                    description: { type: String, required: true }
                }],
            retry: {
                maxAttempts: { type: Number, required: true },
                backoffStrategy: { type: String, enum: ['fixed', 'exponential', 'linear'], required: true },
                initialDelay: { type: String, required: true },
                maxDelay: { type: String },
                multiplier: { type: Number }
            },
            timeout: { type: String },
            humanTask: {
                assignee: { type: String },
                candidateGroups: [{ type: String }],
                candidateUsers: [{ type: String }],
                priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
                dueDate: { type: Date },
                form: {
                    fields: [{
                            id: { type: String, required: true },
                            name: { type: String, required: true },
                            type: {
                                type: String,
                                enum: ['text', 'number', 'boolean', 'date', 'select', 'multiselect'],
                                required: true
                            },
                            label: { type: String, required: true },
                            required: { type: Boolean, default: false },
                            options: [{
                                    value: { type: mongoose_1.Schema.Types.Mixed },
                                    label: { type: String }
                                }],
                            validation: { type: mongoose_1.Schema.Types.Mixed }
                        }],
                    validation: { type: mongoose_1.Schema.Types.Mixed }
                }
            }
        }],
    variables: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    parameters: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    sla: {
        responseTime: { type: String },
        resolutionTime: { type: String },
        maxExecutionTime: { type: String },
        availabilityTarget: { type: Number },
        performanceTargets: { type: mongoose_1.Schema.Types.Mixed }
    },
    security: {
        classification: {
            type: String,
            enum: ['public', 'internal', 'confidential', 'restricted'],
            default: 'internal'
        },
        requiredRoles: [{ type: String }],
        requiredPermissions: [{ type: String }],
        dataEncryption: { type: Boolean, default: false },
        auditLevel: {
            type: String,
            enum: ['none', 'basic', 'detailed', 'comprehensive'],
            default: 'basic'
        }
    },
    integrations: {
        taskManagement: {
            enabled: { type: Boolean, default: false },
            createTasks: { type: Boolean, default: false },
            updateTaskStatus: { type: Boolean, default: false },
            taskPriority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' }
        },
        messageQueue: {
            enabled: { type: Boolean, default: false },
            publishEvents: { type: Boolean, default: false },
            subscribeToEvents: { type: Boolean, default: false },
            deadLetterQueue: { type: Boolean, default: false }
        },
        evidence: {
            enabled: { type: Boolean, default: false },
            collectEvidence: { type: Boolean, default: false },
            preserveChainOfCustody: { type: Boolean, default: false },
            evidenceRetention: { type: String, default: '7d' }
        },
        issues: {
            enabled: { type: Boolean, default: false },
            createIssues: { type: Boolean, default: false },
            linkToIssues: { type: Boolean, default: false },
            escalationRules: [{ type: mongoose_1.Schema.Types.Mixed }]
        }
    },
    monitoring: {
        enabled: { type: Boolean, default: true },
        collectMetrics: { type: Boolean, default: true },
        alerting: {
            enabled: { type: Boolean, default: false },
            channels: [{ type: String }],
            conditions: [{ type: mongoose_1.Schema.Types.Mixed }]
        },
        logging: {
            level: { type: String, enum: ['error', 'warn', 'info', 'debug'], default: 'info' },
            includeStepDetails: { type: Boolean, default: true },
            includeVariables: { type: Boolean, default: false }
        }
    }
}, {
    timestamps: true,
    collection: 'workflow_definitions'
});
const workflowInstanceSchema = new mongoose_1.Schema({
    instanceId: { type: String, required: true, unique: true, index: true },
    workflowId: { type: String, required: true, index: true },
    version: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled', 'suspended'],
        required: true,
        index: true
    },
    priority: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        required: true,
        index: true
    },
    variables: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    parameters: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    startedAt: { type: Date, required: true, index: true },
    completedAt: { type: Date, index: true },
    duration: { type: Number },
    currentSteps: [{ type: String }],
    completedSteps: [{ type: String }],
    failedSteps: [{ type: String }],
    initiatedBy: { type: String, required: true, index: true },
    parentInstanceId: { type: String, index: true },
    error: {
        code: { type: String },
        message: { type: String },
        stepId: { type: String },
        timestamp: { type: Date },
        stack: { type: String },
        context: { type: mongoose_1.Schema.Types.Mixed }
    },
    history: [{
            id: { type: String, required: true },
            timestamp: { type: Date, required: true },
            type: {
                type: String,
                enum: ['step_started', 'step_completed', 'step_failed', 'workflow_paused', 'workflow_resumed', 'variable_updated'],
                required: true
            },
            stepId: { type: String },
            data: { type: mongoose_1.Schema.Types.Mixed },
            userId: { type: String }
        }],
    metrics: {
        executionTime: { type: Number, default: 0 },
        stepExecutionTimes: { type: mongoose_1.Schema.Types.Mixed, default: {} },
        resourceUsage: {
            cpu: { type: Number, default: 0 },
            memory: { type: Number, default: 0 },
            network: { type: Number, default: 0 }
        },
        performanceScore: { type: Number, default: 0 },
        slaCompliance: { type: Boolean, default: true }
    }
}, {
    timestamps: true,
    collection: 'workflow_instances'
});
workflowDefinitionSchema.index({ category: 1, tags: 1 });
workflowDefinitionSchema.index({ 'metadata.author': 1, 'metadata.createdAt': -1 });
workflowDefinitionSchema.index({ workflowId: 1, version: 1 }, { unique: true });
workflowInstanceSchema.index({ workflowId: 1, status: 1 });
workflowInstanceSchema.index({ initiatedBy: 1, startedAt: -1 });
workflowInstanceSchema.index({ status: 1, priority: 1 });
workflowInstanceSchema.index({ startedAt: 1, completedAt: 1 });
const WorkflowDefinition = (0, mongoose_1.model)('WorkflowDefinition', workflowDefinitionSchema);
const WorkflowInstance = (0, mongoose_1.model)('WorkflowInstance', workflowInstanceSchema);
const defaultLogger = {
    error: (message, meta) => console.error(message, meta),
    warn: (message, meta) => console.warn(message, meta),
    info: (message, meta) => console.info(message, meta),
    debug: (message, meta) => console.debug(message, meta)
};
class MongoWorkflowRepository {
    constructor(logger) {
        this.logger = logger || defaultLogger;
    }
    async saveDefinition(definition) {
        try {
            const docData = {
                ...definition,
                workflowId: definition.id
            };
            delete docData.id;
            await WorkflowDefinition.findOneAndUpdate({ workflowId: definition.id, version: definition.version }, docData, { upsert: true, new: true });
            this.logger.info('Workflow definition saved', {
                id: definition.id,
                version: definition.version
            });
        }
        catch (error) {
            this.logger.error('Failed to save workflow definition', {
                id: definition.id,
                error: error.message
            });
            throw error;
        }
    }
    async getDefinition(id, version) {
        try {
            const query = { workflowId: id };
            if (version) {
                query.version = version;
            }
            const definition = await WorkflowDefinition.findOne(query).sort({ 'metadata.createdAt': -1 });
            if (!definition) {
                throw new Error(`Workflow definition not found: ${id}${version ? ` (version: ${version})` : ''}`);
            }
            const result = definition.toObject();
            result.id = result.workflowId;
            delete result.workflowId;
            delete result._id;
            delete result.__v;
            return result;
        }
        catch (error) {
            this.logger.error('Failed to get workflow definition', {
                id,
                version,
                error: error.message
            });
            throw error;
        }
    }
    async getDefinitions(filters) {
        try {
            const query = this.buildDefinitionQuery(filters);
            const definitions = await WorkflowDefinition.find(query).sort({ 'metadata.createdAt': -1 });
            return definitions.map(def => {
                const obj = def.toObject();
                obj.id = obj.workflowId;
                delete obj.workflowId;
                delete obj._id;
                delete obj.__v;
                return obj;
            });
        }
        catch (error) {
            this.logger.error('Failed to get workflow definitions', {
                filters,
                error: error.message
            });
            throw error;
        }
    }
    async deleteDefinition(id, version) {
        try {
            const query = { workflowId: id };
            if (version) {
                query.version = version;
            }
            else {
            }
            const result = await WorkflowDefinition.deleteMany(query);
            if (result.deletedCount === 0) {
                throw new Error(`Workflow definition not found: ${id}${version ? ` (version: ${version})` : ''}`);
            }
            this.logger.info('Workflow definition deleted', {
                id,
                version,
                deletedCount: result.deletedCount
            });
        }
        catch (error) {
            this.logger.error('Failed to delete workflow definition', {
                id,
                version,
                error: error.message
            });
            throw error;
        }
    }
    async saveInstance(instance) {
        try {
            await WorkflowInstance.findOneAndUpdate({ instanceId: instance.id }, instance, { upsert: true, new: true });
            this.logger.debug('Workflow instance saved', { instanceId: instance.id });
        }
        catch (error) {
            this.logger.error('Failed to save workflow instance', {
                instanceId: instance.id,
                error: error.message
            });
            throw error;
        }
    }
    async getInstance(id) {
        try {
            const instance = await WorkflowInstance.findOne({ instanceId: id });
            if (!instance) {
                throw new Error(`Workflow instance not found: ${id}`);
            }
            const result = instance.toObject();
            result.id = result.instanceId;
            delete result.instanceId;
            delete result._id;
            delete result.__v;
            return result;
        }
        catch (error) {
            this.logger.error('Failed to get workflow instance', {
                instanceId: id,
                error: error.message
            });
            throw error;
        }
    }
    async getInstances(filters) {
        try {
            const query = this.buildInstanceQuery(filters);
            const limit = filters?.limit || 100;
            const offset = filters?.offset || 0;
            const instances = await WorkflowInstance
                .find(query)
                .sort({ startedAt: -1 })
                .limit(limit)
                .skip(offset);
            return instances.map(instance => {
                const obj = instance.toObject();
                obj.id = obj.instanceId;
                delete obj.instanceId;
                delete obj._id;
                delete obj.__v;
                return obj;
            });
        }
        catch (error) {
            this.logger.error('Failed to get workflow instances', {
                filters,
                error: error.message
            });
            throw error;
        }
    }
    async updateInstance(id, updates) {
        try {
            const result = await WorkflowInstance.findOneAndUpdate({ instanceId: id }, { $set: updates }, { new: true });
            if (!result) {
                throw new Error(`Workflow instance not found: ${id}`);
            }
            this.logger.debug('Workflow instance updated', { instanceId: id });
        }
        catch (error) {
            this.logger.error('Failed to update workflow instance', {
                instanceId: id,
                error: error.message
            });
            throw error;
        }
    }
    buildDefinitionQuery(filters) {
        const query = {};
        if (filters?.category) {
            query.category = filters.category;
        }
        if (filters?.tags && Array.isArray(filters.tags)) {
            query.tags = { $in: filters.tags };
        }
        if (filters?.author) {
            query['metadata.author'] = filters.author;
        }
        if (filters?.createdAfter) {
            query['metadata.createdAt'] = { ...query['metadata.createdAt'], $gte: filters.createdAfter };
        }
        if (filters?.createdBefore) {
            query['metadata.createdAt'] = { ...query['metadata.createdAt'], $lte: filters.createdBefore };
        }
        return query;
    }
    buildInstanceQuery(filters) {
        const query = {};
        if (filters?.workflowId) {
            query.workflowId = filters.workflowId;
        }
        if (filters?.status && filters.status.length > 0) {
            query.status = { $in: filters.status };
        }
        if (filters?.priority && filters.priority.length > 0) {
            query.priority = { $in: filters.priority };
        }
        if (filters?.initiatedBy) {
            query.initiatedBy = filters.initiatedBy;
        }
        if (filters?.startedAfter) {
            query.startedAt = { ...query.startedAt, $gte: filters.startedAfter };
        }
        if (filters?.startedBefore) {
            query.startedAt = { ...query.startedAt, $lte: filters.startedBefore };
        }
        return query;
    }
}
exports.MongoWorkflowRepository = MongoWorkflowRepository;
//# sourceMappingURL=MongoWorkflowRepository.js.map