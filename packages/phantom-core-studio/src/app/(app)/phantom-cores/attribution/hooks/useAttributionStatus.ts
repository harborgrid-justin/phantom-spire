// Custom hook for Attribution status management

import { useQuery } from '@tanstack/react-query';
import { fetchAttributionStatus } from '../api';
import { AttributionStatus } from '../types';

export const useAttributionStatus = () => {
  return useQuery<AttributionStatus>({
    queryKey: ['attribution-status'],
    queryFn: fetchAttributionStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Data is fresh for 25 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
