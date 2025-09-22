// src/services/model-builder/modelBuilderService.ts

import { BusinessLogicBase, ServiceDefinition, ServiceContext, BusinessLogicRequest, ProcessResult, ValidationResult, RuleEnforcementResult, InsightResult, MetricResult, TrendPrediction, IntegrationResult, FeatureEngineeringResult, FeatureSelectionResult, EngineeredFeature, SelectedFeature } from '..\..\..\lib\core';
import { ModelConfig, AutoMLResult, UploadedData, ParseDataRequest, ParseDataResponse, StartTrainingRequest, StartTrainingResponse, DataRow, AlgorithmType, ModelResult, EnsembleResult } from '..\..\..\lib\modelBuilder.types';
import { modelBuilderConfig } from './modelBuilder.config';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';
import { RandomForestRegression } from 'ml-random-forest';

const MODEL_BUILDER_SERVICE_DEFINITION: ServiceDefinition = {
    id: 'phantom-ml-studio-model-builder',
    name: 'Model Builder Service',
    version: '1.0.0',
    category: 'business-logic',
    description: 'Manages AutoML model building process.',
    dependencies: [],
    status: 'initializing',
    metadata: {
        author: 'Phantom Spire',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['automl', 'model-builder', 'ml'],
    },
    config: {
        enabled: true,
        autoStart: true,
        retryPolicy: {
            maxRetries: 3,
            baseDelay: 100,
            maxDelay: 1000,
            exponentialBackoff: true,
            jitter: true,
            retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
        },
        timeouts: {
            request: 30000,
            connection: 5000,
            idle: 60000,
        },
        caching: {
            enabled: false,
            provider: 'memory',
            ttl: 60000,
            maxSize: 1000,
            compressionEnabled: false,
        },
        monitoring: {
            metricsEnabled: true,
            tracingEnabled: true,
            healthCheckEnabled: true,
            alerting: {
                enabled: true,
                errorRate: { warning: 5, critical: 10, evaluationWindow: 60000 },
                responseTime: { warning: 500, critical: 1000, evaluationWindow: 60000 },
                throughput: { warning: 100, critical: 50, evaluationWindow: 60000 },
                availability: { warning: 99.9, critical: 99.5, evaluationWindow: 60000 },
            },
            sampling: {
                rate: 0.1,
                maxTracesPerSecond: 10,
                slowRequestThreshold: 500,
            },
        },
    },
};

class ModelBuilderService extends BusinessLogicBase {
    constructor() {
        super(MODEL_BUILDER_SERVICE_DEFINITION, 'ModelBuilder');
    }

    // --- Core Business Logic Interface Implementation ---
    async validateData(data: unknown, context?: ServiceContext): Promise<ValidationResult> {
        return Promise.resolve({ isValid: true, errors: [] });
    }
    async processCreation(data: unknown, context: ServiceContext): Promise<ProcessResult> { throw new Error('Method not implemented.'); }
    async processUpdate(id: string, data: unknown, context: ServiceContext): Promise<ProcessResult> { throw new Error('Method not implemented.'); }
    async processDeletion(id: string, context: ServiceContext): Promise<ProcessResult> { throw new Error('Method not implemented.'); }
    async enforceBusinessRules(data: unknown, context?: ServiceContext): Promise<RuleEnforcementResult> { return Promise.resolve({ passed: true, violations: [], warnings: [], appliedRules: [] }); }
    async validatePermissions(userId: string, operation: string, resource?: string): Promise<boolean> { return Promise.resolve(true); }
    async auditOperation(operation: string, data: unknown, userId: string): Promise<void> { console.log(`Auditing operation: ${operation} by user ${userId}`, data); return Promise.resolve(); }
    async generateInsights(timeframe?: string, filters?: Record<string, unknown>): Promise<InsightResult> { throw new Error('Method not implemented.'); }
    async calculateMetrics(filters?: Record<string, unknown>): Promise<MetricResult> { throw new Error('Method not implemented.'); }
    async predictTrends(data: unknown[]): Promise<TrendPrediction> { throw new Error('Method not implemented.'); }
    
    async performFeatureEngineering(data: DataRow[], context?: ServiceContext): Promise<FeatureEngineeringResult> {
        return this.executeWithContext(context, 'performFeatureEngineering', async () => {
            return this._performFeatureEngineering(data);
        });
    }

    async performFeatureSelection(features: EngineeredFeature[], data: DataRow[], context?: ServiceContext): Promise<FeatureSelectionResult> {
        return this.executeWithContext(context, 'performFeatureSelection', async () => {
            return this._performFeatureSelection(features, data);
        });
    }

    private _performFeatureSelection(features: EngineeredFeature[], data: DataRow[]): FeatureSelectionResult {
        const startTime = Date.now();
        const { varianceThreshold } = modelBuilderConfig.featureEngineering;
        
        const selectedFeatures: SelectedFeature[] = [];

        const numericColumns = this.getNumericColumns(data);

        for (const feature of features) {
            if (!numericColumns.includes(feature.name)) continue;

            const values = data.map(row => row[feature.name] as number);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / values.length;

            if (variance > varianceThreshold) {
                selectedFeatures.push({
                    name: feature.name,
                    importance: variance, // Using variance as importance score
                    selectionMethod: 'variance_threshold',
                });
            }
        }

        return {
            selectedFeatures,
            metadata: {
                totalFeaturesSelected: selectedFeatures.length,
                executionTime: Date.now() - startTime,
                algorithm: 'variance-threshold',
            },
        };
    }

    private _performFeatureEngineering(data: DataRow[]): FeatureEngineeringResult {
        const startTime = Date.now();
        const engineeredFeatures: EngineeredFeature[] = [];
        const transformedData = JSON.parse(JSON.stringify(data)); // Deep copy to avoid side effects

        const numericColumns = this.getNumericColumns(data);
        const categoricalColumns = this.getCategoricalColumns(data);

        // Apply transformations
        transformedData.forEach((_row: DataRow) => {
            // Polynomial features
            for (const col of numericColumns) {
                const newColName = `${col}^2`;
                row[newColName] = (row[col] as number) ** 2;
            }

            // Interaction features
            for (let i = 0; i < numericColumns.length; i++) {
                for (let j = i + 1; j < numericColumns.length; j++) {
                    const colA = numericColumns[i];
                    const colB = numericColumns[j];
                    const newColName = `${colA}*${colB}`;
                    row[newColName] = (row[colA] as number) * (row[colB] as number);
                }
            }

            // One-hot encoding
            for (const col of categoricalColumns) {
                const uniqueValues = [...new Set(data.map(r => r[col]))];
                for (const value of uniqueValues) {
                    const newColName = `${col}_${value}`;
                    row[newColName] = row[col] === value ? 1 : 0;
                }
            }
        });

        // Define engineered features (metadata)
        for (const col of numericColumns) {
            engineeredFeatures.push({ name: `${col}^2`, type: 'polynomial', sourceColumns: [col], description: `Square of ${col}` });
        }
        for (let i = 0; i < numericColumns.length; i++) {
            for (let j = i + 1; j < numericColumns.length; j++) {
                const colA = numericColumns[i];
                const colB = numericColumns[j];
                engineeredFeatures.push({ name: `${colA}*${colB}`, type: 'interaction', sourceColumns: [colA, colB], description: `Interaction of ${colA} and ${colB}` });
            }
        }
        for (const col of categoricalColumns) {
            const uniqueValues = [...new Set(data.map(r => r[col]))];
            for (const value of uniqueValues) {
                engineeredFeatures.push({ name: `${col}_${value}`, type: 'encoding', sourceColumns: [col], description: `One-hot encoding for ${col} = ${value}` });
            }
        }

        return {
            engineeredFeatures,
            transformedData,
            metadata: {
                totalFeatures: engineeredFeatures.length,
                executionTime: Date.now() - startTime,
                algorithm: 'standard-feature-engineering',
            },
        };
    }

    private getNumericColumns(data: DataRow[]): string[] {
        if (data.length === 0) return [];
        const firstRow = data[0];
        return Object.keys(firstRow).filter(key => typeof firstRow[key] === 'number');
    }

    private getCategoricalColumns(data: DataRow[]): string[] {
        if (data.length === 0) return [];
        const firstRow = data[0];
        return Object.keys(firstRow).filter(key => typeof firstRow[key] === 'string');
    }
    async triggerWorkflows(eventType: string, data: unknown): Promise<void> { console.log(`Triggering workflow for event: ${eventType}`, data); return Promise.resolve(); }
    async integrateWithExternalSystems(data: unknown): Promise<IntegrationResult> { throw new Error('Method not implemented.'); }
    async notifyStakeholders(event: string, data: unknown): Promise<void> { console.log(`Notifying stakeholders for event: ${event}`, data); return Promise.resolve(); }

    protected async processBusinessLogic(request: BusinessLogicRequest, context: ServiceContext): Promise<unknown> {
        switch (request.type) {
            case 'parseData':
                return this.parseData(request as ParseDataRequest, context);
            case 'startTraining':
                return this.startTraining(request as StartTrainingRequest, context, () => {});
            default:
                throw new Error(`Unsupported request type: ${request.type}`);
        }
    }

    // --- Public API Methods ---

    public async parseData(request: ParseDataRequest, context: ServiceContext): Promise<ParseDataResponse> {
        return this.executeWithContext(context, 'parseData', async () => {
            const { file } = request.data;
            const result = await this.parseCSVFile(file);
            return this.createSuccessResponse(request, result);
        }) as Promise<ParseDataResponse>;
    }

    public async startTraining(request: StartTrainingRequest, context: ServiceContext, onProgress: (_progress: number) => void): Promise<StartTrainingResponse> {
        return this.executeWithContext(context, 'startTraining', async () => {
            const { config, data } = request.data; // Use incoming data
            const startTime = Date.now();
            const { phases } = modelBuilderConfig.trainingPipeline;

            let finalData = data;
            let featureNames: string[] = Object.keys(finalData[0]).filter(c => c !== config.targetColumn);
            let engineeredFeaturesResult: FeatureEngineeringResult | undefined;
            let selectedFeaturesResult: FeatureSelectionResult | undefined;

            if (config.featureEngineering) {
                onProgress(phases[0].progress);
                engineeredFeaturesResult = await this.performFeatureEngineering(finalData, context);
                finalData = engineeredFeaturesResult.transformedData;
                
                onProgress(phases[1].progress);
                selectedFeaturesResult = await this.performFeatureSelection(engineeredFeaturesResult.engineeredFeatures, finalData, context);
                featureNames = selectedFeaturesResult.selectedFeatures.map(f => f.name);
            }

            onProgress(phases[2].progress);
            const leaderboard: ModelResult[] = [];
            for (const algorithm of config.algorithms) {
                const results = this._performHyperparameterTuning(algorithm, finalData, config.targetColumn, featureNames, config.crossValidationFolds);
                leaderboard.push(...results);
            }

            leaderboard.sort((a, b) => b.score - a.score);
            onProgress(phases[3].progress);

            let ensembleResult: EnsembleResult | undefined;
            if (config.ensembleMethods && leaderboard.length > 1) {
                ensembleResult = this._performEnsembling(leaderboard, finalData, config.targetColumn, featureNames);
            }
            onProgress(phases[4].progress);

            const bestModel = leaderboard.length > 0 ? leaderboard[0] : { modelId: 'N/A', algorithm: 'N/A', score: 0 };
            const trainingTimeSeconds = (Date.now() - startTime) / 1000;

            const results: AutoMLResult = {
                experimentId: `exp_${Date.now()}`,
                bestModelId: bestModel.modelId,
                bestAlgorithm: bestModel.algorithm,
                bestScore: bestModel.score,
                leaderboard,
                featureImportance: featureNames.map((feature) => ({
                  featureName: feature,
                  importance: Math.random(), // Placeholder importance
                  rank: 0
                })).sort((a, b) => b.importance - a.importance).map((f, i) => ({ ...f, rank: i + 1 })),
                engineeredFeatures: engineeredFeaturesResult?.engineeredFeatures,
                selectedFeatures: selectedFeaturesResult?.selectedFeatures,
                ensembleResult,
                trainingTimeSeconds,
                totalModelsTrained: leaderboard.length,
            };

            return this.createSuccessResponse(request, results);
        }) as Promise<StartTrainingResponse>;
    }

    private _performEnsembling(leaderboard: ModelResult[], data: DataRow[], targetColumn: string, featureColumns: string[]): EnsembleResult {
        const startTime = Date.now();
        const { topN, strategy } = modelBuilderConfig.ensembling;
        const topModels = leaderboard.slice(0, Math.min(leaderboard.length, topN));

        const allPredictions: number[][] = [];

        for (const modelResult of topModels) {
            const model = this._trainSingleModel(modelResult.algorithm as AlgorithmType, data, targetColumn, featureColumns, modelResult.hyperparameters);
            const predictions = this._predict(model, data, featureColumns);
            allPredictions.push(predictions);
        }

        // Averaging ensemble
        const ensemblePredictions: number[] = [];
        for (let i = 0; i < data.length; i++) {
            let sum = 0;
            for (let j = 0; j < topModels.length; j++) {
                sum += allPredictions[j][i];
            }
            ensemblePredictions.push(sum / topModels.length);
        }

        const actuals = data.map(row => row[targetColumn] as number);
        const score = this._calculateScore(ensemblePredictions, actuals);

        return {
            ensembleModelId: `ensemble_${Date.now()}`,
            baseModels: topModels.map(m => m.modelId),
            ensembleStrategy: strategy as 'averaging' | 'stacking',
            score,
            metadata: {
                executionTime: Date.now() - startTime,
            },
        };
    }

    private _performHyperparameterTuning(algorithm: AlgorithmType, data: DataRow[], targetColumn: string, featureColumns: string[], cvFolds: number): ModelResult[] {
        const results: ModelResult[] = [];
        const hyperparametersGrid = modelBuilderConfig.hyperparameterTuning.grid[algorithm];

        for (const params of hyperparametersGrid) {
            const { score, scores } = this._performCrossValidation(algorithm, data, targetColumn, featureColumns, params, cvFolds);
            results.push({
                modelId: `${algorithm}_${Date.now()}`,
                algorithm,
                score,
                trainingTime: 0, // Simplified for now
                hyperparameters: params,
                crossValidationScores: scores,
            });
        }
        return results;
    }

    private _performCrossValidation(algorithm: AlgorithmType, data: DataRow[], targetColumn: string, featureColumns: string[], hyperparameters: Record<string, any>, cvFolds: number): { score: number, scores: number[] } {
        const foldSize = Math.floor(data.length / cvFolds);
        const scores: number[] = [];

        for (let i = 0; i < cvFolds; i++) {
            const startIndex = i * foldSize;
            const endIndex = startIndex + foldSize;
            
            const testSet = data.slice(startIndex, endIndex);
            const trainSet = [...data.slice(0, startIndex), ...data.slice(endIndex)];

            const model = this._trainSingleModel(algorithm, trainSet, targetColumn, featureColumns, hyperparameters);
            
            const predictions = this._predict(model, testSet, featureColumns);
            const actuals = testSet.map(row => row[targetColumn] as number);
            
            const score = this._calculateScore(predictions, actuals);
            scores.push(score);
        }

        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { score: averageScore, scores };
    }

    private _trainSingleModel(algorithm: AlgorithmType, data: DataRow[], targetColumn: string, featureColumns: string[], hyperparameters: Record<string, any>): any {
        const x = data.map(row => featureColumns.map(col => row[col] as number));
        const y = data.map(row => row[targetColumn] as number);

        if (algorithm === 'random_forest_regression') {
            return new RandomForestRegression({ ...hyperparameters, nEstimators: hyperparameters.nEstimators || 10 }).train(x, y);
        } else { // simple_linear_regression
            return new SimpleLinearRegression(x.map(r => r[0]), y);
        }
    }

    private _predict(model: any, data: DataRow[], featureColumns: string[]): number[] {
        const x = data.map(row => featureColumns.map(col => row[col] as number));
        if (model instanceof RandomForestRegression) {
            return model.predict(x);
        } else { // SimpleLinearRegression
            return x.map(row => model.predict(row[0]));
        }
    }

    private _calculateScore(predictions: number[], actuals: number[]): number {
        const residuals = actuals.map((val, i) => val - predictions[i]);
        const mse = residuals.reduce((sum, val) => sum + val * val, 0) / residuals.length;
        return 1 - mse; // Simplified score, not R^2
    }

    private parseCSVFile(file: File): Promise<UploadedData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const errors: string[] = [];
            
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    if (!text || text.trim().length === 0) {
                        reject(new Error('File is empty or corrupted'));
                        return;
                    }
        
                    const lines = text.split('\n').filter(line => line.trim().length > 0);
                    if (lines.length < 2) {
                        errors.push('File must contain at least header and one data row');
                    }
        
                    const headers = lines[0].split(',').map(h => h.trim());
                    if (headers.length === 0) {
                        errors.push('No headers found in CSV file');
                    }
        
                    const data: DataRow[] = [];
                    for (let i = 1; i < Math.min(lines.length, 21); i++) {
                        const values = lines[i].split(',').map(v => v.trim());
                        if (values.length !== headers.length) {
                            errors.push(`Row ${i} has ${values.length} columns, expected ${headers.length}`);
                            continue;
                        }
        
                        const row: DataRow = {};
                        headers.forEach((header, index) => {
                            const value = values[index];
                            const numValue = Number(value);
                            row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
                        });
                        data.push(row);
                    }
        
                    resolve({ headers, data, errors });
                } catch (error) {
                    reject(error);
                }
            };
        
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // --- Lifecycle Methods ---
    protected async onBusinessLogicInitialize(): Promise<void> { console.log('ModelBuilderService initialized.'); }
    protected async onBusinessLogicStart(): Promise<void> { console.log('ModelBuilderService started.'); }
    protected async onBusinessLogicStop(): Promise<void> { console.log('ModelBuilderService stopped.'); }
    protected async onBusinessLogicDestroy(): Promise<void> { console.log('ModelBuilderService destroyed.'); }
}

export const modelBuilderService = new ModelBuilderService();
