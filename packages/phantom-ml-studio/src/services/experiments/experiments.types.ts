// src/services/experiments.types.ts

import { BusinessLogicRequest, BusinessLogicResponse } from '../core';
import { ModelConfig, AutoMLResult } from '../model-builder/modelBuilder.types';

export interface ExperimentRun {
    runId: string;
    startTime: string;
    endTime: string;
    parameters: ModelConfig;
    results: AutoMLResult;
    status: 'running' | 'completed' | 'failed';
}

export interface Experiment {
    experimentId: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    runs: ExperimentRun[];
    bestRunId?: string;
}

export type CreateExperimentRequest = BusinessLogicRequest<{ name: string; description: string }>;
export type CreateExperimentResponse = BusinessLogicResponse<Experiment>;

export type GetExperimentsRequest = BusinessLogicRequest;
export type GetExperimentsResponse = BusinessLogicResponse<{ experiments: Experiment[] }>;

export type GetExperimentRequest = BusinessLogicRequest<{ experimentId: string }>;
export type GetExperimentResponse = BusinessLogicResponse<Experiment>;

export type StartExperimentRunRequest = BusinessLogicRequest<{ experimentId: string; parameters: ModelConfig }>;
export type StartExperimentRunResponse = BusinessLogicResponse<ExperimentRun>;

export type LogExperimentRunResultsRequest = BusinessLogicRequest<{ experimentId: string; runId: string; results: AutoMLResult }>;
export type LogExperimentRunResultsResponse = BusinessLogicResponse<ExperimentRun>;