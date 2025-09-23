// Custom hook for Intel status management

import { useQuery } from '@tanstack/react-query';
import { fetchIntelStatus } from '../api';
import { IntelStatus } from '../types';

export const useIntelStatus = () => {
  return useQuery<IntelStatus>({
    queryKey: ['intel-status'],
    queryFn: fetchIntelStatus,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
