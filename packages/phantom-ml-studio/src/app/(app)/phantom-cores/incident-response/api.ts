// API functions for Incident Response Management

import { phantomCoresClient } from '../../../../lib/api/phantom-cores-client';
import {
  IncidentResponseStatus,
  IncidentAnalysisRequest,
  ResponseInitiationRequest,
  TeamCoordinationRequest,
  IncidentReportRequest
} from './types';

export const fetchIncidentResponseStatus = async (): Promise<IncidentResponseStatus> => {
  const response = await phantomCoresClient.get('/api/phantom-cores/incident-response?operation=status');
  return response.json();
};

export const analyzeIncident = async (incidentData: IncidentAnalysisRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/incident-response', {
    operation: 'analyze-incident',
    incidentData
  });
  return response.json();
};

export const initiateResponse = async (responseData: ResponseInitiationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/incident-response', {
    operation: 'initiate-response',
    responseData
  });
  return response.json();
};

export const coordinateTeam = async (teamData: TeamCoordinationRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/incident-response', {
    operation: 'coordinate-team',
    teamData
  });
  return response.json();
};

export const generateIncidentReport = async (reportData: IncidentReportRequest) => {
  const response = await phantomCoresClient.post('/api/phantom-cores/incident-response', {
    operation: 'generate-incident-report',
    reportData
  });
  return response.json();
};
