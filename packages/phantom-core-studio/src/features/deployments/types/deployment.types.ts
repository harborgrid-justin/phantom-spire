// src/services/deployment.types.ts

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../lib/core';

export type DeploymentStatus = 'active' | 'inactive' | 'error' | 'updating';

export interface DeploymentConfig {
    modelId: string;
    environment: 'production' | 'staging';
    instanceType: 'cpu_small' | 'cpu_medium' | 'gpu_large';
    minReplicas: number;
    maxReplicas: number;
}

export interface Deployment {
    deploymentId: string;
    config: DeploymentConfig;
    status: DeploymentStatus;
    createdAt: string;
    updatedAt: string;
    endpointUrl: string;
    predictionCount: number;
    errorRate: number;
}

export type CreateDeploymentRequest = BusinessLogicRequest<{ config: DeploymentConfig }>;
export type CreateDeploymentResponse = BusinessLogicResponse<Deployment>;

export type GetDeploymentsRequest = BusinessLogicRequest;
export type GetDeploymentsResponse = BusinessLogicResponse<{ deployments: Deployment[] }>;

export type GetDeploymentRequest = BusinessLogicRequest<{ deploymentId: string }>;
export type GetDeploymentResponse = BusinessLogicResponse<Deployment>;

export type UpdateDeploymentRequest = BusinessLogicRequest<{ deploymentId: string, updates: Partial<DeploymentConfig> }>;
export type UpdateDeploymentResponse = BusinessLogicResponse<Deployment>;

export type DeleteDeploymentRequest = BusinessLogicRequest<{ deploymentId: string }>;
export type DeleteDeploymentResponse = BusinessLogicResponse<{ success: boolean }>;