// API functions for Threat Actor Management

import { 
  ThreatActorStatus, 
  ProfileThreatActorRequest, 
  CampaignTrackingRequest, 
  AttributionAnalysisRequest,
  ThreatIntelligenceRequest
} from './types';

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';

export const fetchThreatActorStatus = async (): Promise<ThreatActorStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/threat-actor?operation=status');
  return response.json();
};

export const profileThreatActor = async (profileData: ProfileThreatActorRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/threat-actor', {
    operation: 'profile-actor',
    profileData
  });
  return response.json();
};

export const trackCampaign = async (campaignData: CampaignTrackingRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/threat-actor', {
    operation: 'track-campaign',
    campaignData
  });
  return response.json();
};

export const analyzeAttribution = async (attributionData: AttributionAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/threat-actor', {
    operation: 'analyze-attribution',
    attributionData
  });
  return response.json();
};

export const generateThreatIntelligence = async (intelligenceData: ThreatIntelligenceRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/threat-actor', {
    operation: 'generate-intelligence',
    ...intelligenceData
  });
  return response.json();
};
