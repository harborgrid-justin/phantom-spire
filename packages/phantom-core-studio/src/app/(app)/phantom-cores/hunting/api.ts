// API functions for Phantom Hunting Core
import type { HuntingStatus, HuntData, HypothesisData, IOCData, ReportData } from './types';

export const fetchHuntingStatus = async (): Promise<HuntingStatus> => {
  const response = await fetch('/api/phantom-cores/hunting?operation=status');
  return response.json();
};

export const conductHunt = async (huntData: HuntData) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'conduct-hunt',
      huntData
    })
  });
  return response.json();
};

export const analyzeHypothesis = async (hypothesisData: HypothesisData) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'analyze-hypothesis',
      hypothesisData
    })
  });
  return response.json();
};

export const trackIOCs = async (iocData: IOCData) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'track-iocs',
      iocData
    })
  });
  return response.json();
};

export const generateHuntReport = async (reportData: ReportData) => {
  const response = await fetch('/api/phantom-cores/hunting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'generate-hunt-report',
      reportData
    })
  });
  return response.json();
};
