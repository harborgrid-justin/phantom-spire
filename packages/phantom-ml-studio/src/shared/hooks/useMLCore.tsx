import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PerformanceStats, Model } from '../lib/ml-core/types'

const ML_QUERY_KEYS = {
  performance: ['ml-core', 'performance'] as const,
  models: ['ml-core', 'models'] as const,
  status: ['ml-core', 'status'] as const,
  activity: ['ml-core', 'activity'] as const,
} as const

// API functions
async function fetchPerformanceStats(): Promise<PerformanceStats> {
  const response = await fetch('/api/ml-core/performance', {
    cache: 'no-store'
  })
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch performance stats')
  }

  return data.data
}

async function fetchModels(): Promise<Model[]> {
  const response = await fetch('/api/ml-core/models', {
    cache: 'no-store'
  })
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch models')
  }

  return data.data
}

async function fetchMLCoreStatus() {
  const response = await fetch('/api/ml-core/status', {
    cache: 'no-store'
  })
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch ML Core status')
  }

  return data.data
}

async function fetchRecentActivity() {
  const response = await fetch('/api/ml-core/activity', {
    cache: 'no-store'
  })
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch recent activity')
  }

  return data.data
}

// React Query hooks
export function usePerformanceStats(options?: {
  refetchInterval?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ML_QUERY_KEYS.performance,
    queryFn: fetchPerformanceStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval || 30000, // 30 seconds
    enabled: options?.enabled !== false,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    }
  })
}

export function useModels(options?: {
  refetchInterval?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ML_QUERY_KEYS.models,
    queryFn: fetchModels,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: options?.refetchInterval || 60000, // 1 minute
    enabled: options?.enabled !== false,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status
        if (status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    }
  })
}

export function useMLCoreStatus(options?: {
  refetchInterval?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ML_QUERY_KEYS.status,
    queryFn: fetchMLCoreStatus,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: options?.refetchInterval || 15000, // 15 seconds
    enabled: options?.enabled !== false,
    retry: 1 // Only retry once for status checks
  })
}

export function useRecentActivity(options?: {
  refetchInterval?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ML_QUERY_KEYS.activity,
    queryFn: fetchRecentActivity,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options?.refetchInterval || 10000, // 10 seconds
    enabled: options?.enabled !== false,
    retry: 2
  })
}

// Mutation hooks for write operations
export function useStarModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ modelId, starred }: { modelId: string, starred: boolean }) => {
      const response = await fetch(`/api/ml-core/models/${modelId}/star`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ starred })
      })

      if (!response.ok) {
        throw new Error('Failed to update model star status')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate models query to refresh the list
      queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.models })
    }
  })
}

// Utility hook for refreshing all ML Core data
export function useRefreshMLCore() {
  const queryClient = useQueryClient()

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['ml-core'] })
    },
    refreshPerformance: () => {
      queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.performance })
    },
    refreshModels: () => {
      queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.models })
    },
    refreshStatus: () => {
      queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.status })
    },
    refreshActivity: () => {
      queryClient.invalidateQueries({ queryKey: ML_QUERY_KEYS.activity })
    }
  }
}

// Combined hook for dashboard data
export function useDashboardData(options?: {
  refetchInterval?: number
  enabled?: boolean
}) {
  const performanceQuery = usePerformanceStats(options)
  const modelsQuery = useModels(options)
  const statusQuery = useMLCoreStatus(options)
  const activityQuery = useRecentActivity(options)

  return {
    performance: performanceQuery,
    models: modelsQuery,
    status: statusQuery,
    activity: activityQuery,
    isLoading: performanceQuery.isLoading || modelsQuery.isLoading || statusQuery.isLoading,
    hasError: performanceQuery.error || modelsQuery.error || statusQuery.error || activityQuery.error,
    refetch: () => {
      performanceQuery.refetch()
      modelsQuery.refetch()
      statusQuery.refetch()
      activityQuery.refetch()
    }
  }
}