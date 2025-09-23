// API functions for XDR Management

import { 
  XDRSystemStatus, 
  ThreatDetectionRequest, 
  IncidentInvestigationRequest, 
  ThreatHuntRequest 
} from './types';
import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';

export const fetchXDRStatus = async (): Promise<XDRSystemStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/xdr?operation=status');
  return response.json();
};

export const performThreatDetection = async (analysisData: ThreatDetectionRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/xdr', {
    operation: 'detect-threats',
    analysisData
  });
  return response.json();
};

export const investigateIncident = async (incidentData: IncidentInvestigationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/xdr', {
    operation: 'investigate-incident',
    incidentData
  });
  return response.json();
};

export const conductThreatHunt = async (huntParameters: ThreatHuntRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/xdr', {
    operation: 'threat-hunt',
    huntParameters
  });
  return response.json();
};
