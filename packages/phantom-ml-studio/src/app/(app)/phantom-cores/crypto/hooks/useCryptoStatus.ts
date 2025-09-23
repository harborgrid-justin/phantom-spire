// Custom hook for Crypto status management

import { useQuery } from '@tanstack/react-query';
import { fetchCryptoStatus } from '../api';
import { CryptoStatus } from '../types';

export const useCryptoStatus = () => {
  return useQuery<CryptoStatus>({
    queryKey: ['crypto-status'],
    queryFn: fetchCryptoStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Data is fresh for 25 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
