// src/services/settings.types.ts

import { BusinessLogicRequest, BusinessLogicResponse } from '..\..\..\lib\core';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'es' | 'fr';
    defaultDashboard: string;
}

export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    modelTrainingComplete: boolean;
    deploymentStatusChanges: boolean;
}

export interface ApiKey {
    key: string;
    label: string;
    createdAt: string;
    lastUsed: string;
}

export interface Settings {
    preferences: UserPreferences;
    notifications: NotificationSettings;
    apiKeys: ApiKey[];
}

export type GetSettingsRequest = BusinessLogicRequest;
export type GetSettingsResponse = BusinessLogicResponse<Settings>;

export type UpdateSettingsRequest = BusinessLogicRequest<{ updates: Partial<Settings> }>;
export type UpdateSettingsResponse = BusinessLogicResponse<Settings>;

export type CreateApiKeyRequest = BusinessLogicRequest<{ label: string }>;
export type CreateApiKeyResponse = BusinessLogicResponse<ApiKey>;

export type DeleteApiKeyRequest = BusinessLogicRequest<{ key: string }>;
export type DeleteApiKeyResponse = BusinessLogicResponse<{ success: boolean }>;