// Custom hook for Forensics status management

import { useQuery } from '@tanstack/react-query';
import { fetchForensicsStatus } from '../api';
import { ForensicsStatus } from '../types';

export const useForensicsStatus = () => {
  return useQuery<ForensicsStatus>({
    queryKey: ['forensics-status'],
    queryFn: fetchForensicsStatus,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
