// API functions for XDR Management

import { 
  XDRSystemStatus, 
  ThreatDetectionRequest, 
  IncidentInvestigationRequest, 
  ThreatHuntRequest 
} from './types';

export const fetchXDRStatus = async (): Promise<XDRSystemStatus> => {
  const response = await fetch('/api/phantom-cores/xdr?operation=status');
  return response.json();
};

export const performThreatDetection = async (analysisData: ThreatDetectionRequest) => {
  const response = await fetch('/api/phantom-cores/xdr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'detect-threats',
      analysisData
    })
  });
  return response.json();
};

export const investigateIncident = async (incidentData: IncidentInvestigationRequest) => {
  const response = await fetch('/api/phantom-cores/xdr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'investigate-incident',
      incidentData
    })
  });
  return response.json();
};

export const conductThreatHunt = async (huntParameters: ThreatHuntRequest) => {
  const response = await fetch('/api/phantom-cores/xdr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'threat-hunt',
      huntParameters
    })
  });
  return response.json();
};
