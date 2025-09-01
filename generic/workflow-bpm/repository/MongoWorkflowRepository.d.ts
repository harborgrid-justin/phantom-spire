import { IWorkflowRepository, IWorkflowDefinition, IWorkflowInstance, IWorkflowInstanceFilter, ILogger } from '../interfaces/IWorkflowEngine';
export declare class MongoWorkflowRepository implements IWorkflowRepository {
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
    private buildDefinitionQuery;
    private buildInstanceQuery;
}
//# sourceMappingURL=MongoWorkflowRepository.d.ts.map