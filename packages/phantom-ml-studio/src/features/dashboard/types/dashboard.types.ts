// src/services/dashboard.types.ts

import { BusinessLogicRequest, BusinessLogicResponse } from '../../../lib/core';

export interface PerformanceMetric {
    name: string;
    value: number;
    change: number; // Percentage change
}

export interface RecentActivity {
    id: string;
    type: 'model_trained' | 'deployment_created' | 'data_uploaded';
    description: string;
    timestamp: string;
}

export interface ResourceUtilization {
    name: 'CPU' | 'Memory' | 'GPU';
    usage: number; // Percentage
    limit: number;
}

export interface DashboardData {
    performanceMetrics: PerformanceMetric[];
    recentActivity: RecentActivity[];
    resourceUtilization: ResourceUtilization[];
    modelsInProduction: number;
    activeExperiments: number;
}

export type GetDashboardDataRequest = BusinessLogicRequest;
export type GetDashboardDataResponse = BusinessLogicResponse<DashboardData>;