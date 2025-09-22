// src/services/models.types.ts

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../core';
import { ModelResult } from '../../../model-builder/modelBuilder.types';

export type ModelVersionStatus = 'registered' | 'staging' | 'production' | 'archived';

export interface ModelVersion {
    versionId: string;
    versionNumber: number;
    status: ModelVersionStatus;
    createdAt: string;
    description: string;
    trainingResults: ModelResult;
}

export interface RegisteredModel {
    modelId: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    versions: ModelVersion[];
    latestVersion: number;
    tags: string[];
}

export type RegisterModelRequest = BusinessLogicRequest<{ name: string; description: string; trainingResults: ModelResult; tags?: string[] }>;
export type RegisterModelResponse = BusinessLogicResponse<RegisteredModel>;

export type GetModelsRequest = BusinessLogicRequest;
export type GetModelsResponse = BusinessLogicResponse<{ models: RegisteredModel[] }>;

export type GetModelRequest = BusinessLogicRequest<{ modelId: string }>;
export type GetModelResponse = BusinessLogicResponse<RegisteredModel>;

export type CreateModelVersionRequest = BusinessLogicRequest<{ modelId: string; description: string; trainingResults: ModelResult }>;
export type CreateModelVersionResponse = BusinessLogicResponse<ModelVersion>;

export type UpdateModelVersionStatusRequest = BusinessLogicRequest<{ modelId: string; versionId: string; status: ModelVersionStatus }>;
export type UpdateModelVersionStatusResponse = BusinessLogicResponse<ModelVersion>;