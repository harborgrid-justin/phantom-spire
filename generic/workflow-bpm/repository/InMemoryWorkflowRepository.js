"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryWorkflowRepository = void 0;
const defaultLogger = {
    error: (message, meta) => console.error(message, meta),
    warn: (message, meta) => console.warn(message, meta),
    info: (message, meta) => console.info(message, meta),
    debug: (message, meta) => console.debug(message, meta)
};
class InMemoryWorkflowRepository {
    constructor(logger) {
        this.definitions = new Map();
        this.instances = new Map();
        this.logger = logger || defaultLogger;
    }
    async saveDefinition(definition) {
        try {
            const key = definition.id;
            const versions = this.definitions.get(key) || [];
            const existingIndex = versions.findIndex(d => d.version === definition.version);
            if (existingIndex >= 0) {
                versions[existingIndex] = definition;
            }
            else {
                versions.push(definition);
            }
            this.definitions.set(key, versions);
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
            const versions = this.definitions.get(id);
            if (!versions || versions.length === 0) {
                throw new Error(`Workflow definition not found: ${id}`);
            }
            let definition;
            if (version) {
                const versionMatch = versions.find(d => d.version === version);
                if (!versionMatch) {
                    throw new Error(`Workflow definition version not found: ${id} (version: ${version})`);
                }
                definition = versionMatch;
            }
            else {
                const sortedVersions = versions.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
                if (sortedVersions.length === 0) {
                    throw new Error(`No valid workflow definition found: ${id}`);
                }
                definition = sortedVersions[0];
            }
            return { ...definition };
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
            const allDefinitions = [];
            for (const versions of Array.from(this.definitions.values())) {
                const latest = versions.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())[0];
                if (latest) {
                    allDefinitions.push({ ...latest });
                }
            }
            let filteredDefinitions = allDefinitions;
            if (filters?.category) {
                filteredDefinitions = filteredDefinitions.filter(def => def.category === filters.category);
            }
            if (filters?.tags && Array.isArray(filters.tags)) {
                filteredDefinitions = filteredDefinitions.filter(def => filters.tags.some((tag) => def.tags.includes(tag)));
            }
            if (filters?.author) {
                filteredDefinitions = filteredDefinitions.filter(def => def.metadata.author === filters.author);
            }
            return filteredDefinitions;
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
            if (version) {
                const versions = this.definitions.get(id);
                if (versions) {
                    const filteredVersions = versions.filter(d => d.version !== version);
                    if (filteredVersions.length === 0) {
                        this.definitions.delete(id);
                    }
                    else {
                        this.definitions.set(id, filteredVersions);
                    }
                }
            }
            else {
                this.definitions.delete(id);
            }
            this.logger.info('Workflow definition deleted', { id, version });
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
            this.instances.set(instance.id, { ...instance });
            this.logger.info('Workflow instance saved', {
                instanceId: instance.id,
                workflowId: instance.workflowId,
                status: instance.status
            });
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
            const instance = this.instances.get(id);
            if (!instance) {
                throw new Error(`Workflow instance not found: ${id}`);
            }
            return { ...instance };
        }
        catch (error) {
            this.logger.error('Failed to get workflow instance', {
                id,
                error: error.message
            });
            throw error;
        }
    }
    async getInstances(filters) {
        try {
            let instances = Array.from(this.instances.values());
            if (filters?.workflowId) {
                instances = instances.filter(instance => instance.workflowId === filters.workflowId);
            }
            if (filters?.status && filters.status.length > 0) {
                instances = instances.filter(instance => filters.status.includes(instance.status));
            }
            if (filters?.priority && filters.priority.length > 0) {
                instances = instances.filter(instance => filters.priority.includes(instance.priority));
            }
            if (filters?.initiatedBy) {
                instances = instances.filter(instance => instance.initiatedBy === filters.initiatedBy);
            }
            if (filters?.startedAfter) {
                instances = instances.filter(instance => instance.startedAt >= filters.startedAfter);
            }
            if (filters?.startedBefore) {
                instances = instances.filter(instance => instance.startedAt <= filters.startedBefore);
            }
            instances.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
            if (filters?.offset) {
                instances = instances.slice(filters.offset);
            }
            if (filters?.limit) {
                instances = instances.slice(0, filters.limit);
            }
            return instances.map(instance => ({ ...instance }));
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
            const existing = this.instances.get(id);
            if (!existing) {
                throw new Error(`Workflow instance not found: ${id}`);
            }
            const updated = { ...existing, ...updates };
            this.instances.set(id, updated);
            this.logger.debug('Workflow instance updated', {
                instanceId: id,
                updates: Object.keys(updates)
            });
        }
        catch (error) {
            this.logger.error('Failed to update workflow instance', {
                id,
                updates,
                error: error.message
            });
            throw error;
        }
    }
    async clear() {
        this.definitions.clear();
        this.instances.clear();
        this.logger.info('Repository cleared');
    }
    async getStats() {
        const definitionStats = Array.from(this.definitions.entries()).map(([id, versions]) => ({
            id,
            versionsCount: versions.length
        }));
        return {
            definitionsCount: this.definitions.size,
            instancesCount: this.instances.size,
            definitions: definitionStats
        };
    }
}
exports.InMemoryWorkflowRepository = InMemoryWorkflowRepository;
//# sourceMappingURL=InMemoryWorkflowRepository.js.map