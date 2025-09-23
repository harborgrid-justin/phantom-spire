// Custom hook for MITRE status management

import { useQuery } from '@tanstack/react-query';
import { fetchMitreStatus } from '../api';
import { MitreStatus } from '../types';

export const useMitreStatus = () => {
  return useQuery<MitreStatus>({
    queryKey: ['mitre-status'],
    queryFn: fetchMitreStatus,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
