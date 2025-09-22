// API functions for Threat Actor Management

import { 
  ThreatActorStatus, 
  ProfileThreatActorRequest, 
  CampaignTrackingRequest, 
  AttributionAnalysisRequest,
  ThreatIntelligenceRequest
} from './types';

export const fetchThreatActorStatus = async (): Promise<ThreatActorStatus> => {
  const response = await fetch('/api/phantom-cores/threat-actor?operation=status');
  return response.json();
};

export const profileThreatActor = async (profileData: ProfileThreatActorRequest) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'profile-actor',
      profileData
    })
  });
  return response.json();
};

export const trackCampaign = async (campaignData: CampaignTrackingRequest) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'track-campaign',
      campaignData
    })
  });
  return response.json();
};

export const analyzeAttribution = async (attributionData: AttributionAnalysisRequest) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-attribution',
      attributionData
    })
  });
  return response.json();
};

export const generateThreatIntelligence = async (intelligenceData: ThreatIntelligenceRequest) => {
  const response = await fetch('/api/phantom-cores/threat-actor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-intelligence',
      ...intelligenceData
    })
  });
  return response.json();
};
