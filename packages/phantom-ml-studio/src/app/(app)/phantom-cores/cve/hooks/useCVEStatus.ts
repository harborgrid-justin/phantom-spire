// Custom hook for CVE status management

import { useQuery } from '@tanstack/react-query';
import { fetchCVEStatus } from '../api';
import { CVEStatus } from '../types';

export const useCVEStatus = () => {
  return useQuery<CVEStatus>({
    queryKey: ['cve-status'],
    queryFn: fetchCVEStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Data is fresh for 25 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
