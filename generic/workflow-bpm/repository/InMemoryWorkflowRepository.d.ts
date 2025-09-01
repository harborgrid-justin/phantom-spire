import { IWorkflowRepository, IWorkflowDefinition, IWorkflowInstance, IWorkflowInstanceFilter, ILogger } from '../interfaces/IWorkflowEngine';
export declare class InMemoryWorkflowRepository implements IWorkflowRepository {
    private definitions;
    private instances;
    private logger;
    constructor(logger?: ILogger);
    saveDefinition(definition: IWorkflowDefinition): Promise<void>;
    getDefinition(id: string, version?: string): Promise<IWorkflowDefinition>;
    getDefinitions(filters?: any): Promise<IWorkflowDefinition[]>;
    deleteDefinition(id: string, version?: string): Promise<void>;
    saveInstance(instance: IWorkflowInstance): Promise<void>;
    getInstance(id: string): Promise<IWorkflowInstance>;
    getInstances(filters?: IWorkflowInstanceFilter): Promise<IWorkflowInstance[]>;
    updateInstance(id: string, updates: Partial<IWorkflowInstance>): Promise<void>;
    clear(): Promise<void>;
    getStats(): Promise<{
        definitionsCount: number;
        instancesCount: number;
        definitions: Array<{
            id: string;
            versionsCount: number;
        }>;
    }>;
}
//# sourceMappingURL=InMemoryWorkflowRepository.d.ts.map