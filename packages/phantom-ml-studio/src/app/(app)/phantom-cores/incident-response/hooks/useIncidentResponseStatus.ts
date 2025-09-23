// Custom hook for Incident Response status management

import { useQuery } from '@tanstack/react-query';
import { fetchIncidentResponseStatus } from '../api';
import { IncidentResponseStatus } from '../types';

export const useIncidentResponseStatus = () => {
  return useQuery<IncidentResponseStatus>({
    queryKey: ['incident-response-status'],
    queryFn: fetchIncidentResponseStatus,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
