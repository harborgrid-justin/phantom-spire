// API functions for Attribution Management

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';
import {
  AttributionStatus,
  AttributionAnalysisRequest,
  ThreatActorProfileRequest,
  TTPAnalysisRequest,
  CampaignProfileRequest
} from './types';

export const fetchAttributionStatus = async (): Promise<AttributionStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/attribution?operation=status');
  return response.json();
};

export const analyzeAttribution = async (analysisData: AttributionAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/attribution', {
    operation: 'analyze-attribution',
    analysisData
  });
  return response.json();
};

export const profileThreatActor = async (actorData: ThreatActorProfileRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/attribution', {
    operation: 'profile-actor',
    actorData
  });
  return response.json();
};

export const analyzeTTP = async (ttpData: TTPAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/attribution', {
    operation: 'analyze-ttp',
    ttpData
  });
  return response.json();
};

export const generateCampaignProfile = async (campaignData: CampaignProfileRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/attribution', {
    operation: 'generate-campaign-profile',
    campaignData
  });
  return response.json();
};
