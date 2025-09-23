// Custom hook for IOC status management

import { useQuery } from '@tanstack/react-query';
import { fetchIOCStatus } from '../api';
import { IOCStatus } from '../types';

export const useIOCStatus = () => {
  return useQuery<IOCStatus>({
    queryKey: ['ioc-status'],
    queryFn: fetchIOCStatus,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
