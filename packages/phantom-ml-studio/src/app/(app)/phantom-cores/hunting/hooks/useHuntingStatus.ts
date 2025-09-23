// Custom hook for Phantom Hunting Core status
import { useQuery } from '@tanstack/react-query';
import { fetchHuntingStatus } from '../api';

export const useHuntingStatus = () => {
  return useQuery({
    queryKey: ['hunting-status'],
    queryFn: fetchHuntingStatus,
    refetchInterval: 30000,
  });
};
