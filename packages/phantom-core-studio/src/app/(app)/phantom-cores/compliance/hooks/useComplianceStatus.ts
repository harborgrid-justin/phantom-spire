// Custom hook for Compliance status management

import { useQuery } from '@tanstack/react-query';
import { fetchComplianceStatus } from '../api';
import { ComplianceStatus } from '../types';

export const useComplianceStatus = () => {
  return useQuery<ComplianceStatus>({
    queryKey: ['compliance-status'],
    queryFn: fetchComplianceStatus,
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
