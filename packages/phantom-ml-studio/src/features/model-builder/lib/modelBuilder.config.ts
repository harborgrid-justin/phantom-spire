// src/services/modelBuilder.config.ts

import { AlgorithmType } from '..\..\..\lib\modelBuilder.types';

export const modelBuilderConfig = {
    featureEngineering: {
        varianceThreshold: 0.1,
    },
    hyperparameterTuning: {
        grid: {
            'random_forest_regression': [
                { nEstimators: 10, maxDepth: 5 },
                { nEstimators: 20, maxDepth: 5 },
                { nEstimators: 10, maxDepth: 10 },
                { nEstimators: 30, maxDepth: 15 },
            ],
            'simple_linear_regression': [{}],
        } as Record<AlgorithmType, Record<string, any>[]>,
    },
    ensembling: {
        topN: 3,
        strategy: 'averaging',
    },
    mockData: [
        { 'col1': 1, 'col2': 2, 'cat1': 'A', 'target': 3 },
        { 'col1': 2, 'col2': 3, 'cat1': 'B', 'target': 5 },
        { 'col1': 3, 'col2': 4, 'cat1': 'A', 'target': 7 },
        { 'col1': 4, 'col2': 5, 'cat1': 'C', 'target': 9 },
        { 'col1': 5, 'col2': 6, 'cat1': 'B', 'target': 11 },
        { 'col1': 6, 'col2': 7, 'cat1': 'C', 'target': 13 },
        { 'col1': 7, 'col2': 8, 'cat1': 'A', 'target': 15 },
        { 'col1': 8, 'col2': 9, 'cat1': 'B', 'target': 17 },
    ],
    trainingPipeline: {
        phases: [
            { name: 'Feature Engineering', progress: 10 },
            { name: 'Feature Selection', progress: 20 },
            { name: 'Hyperparameter Tuning', progress: 30 },
            { name: 'Model Training', progress: 90 },
            { name: 'Ensembling', progress: 100 },
        ],
    },
};
