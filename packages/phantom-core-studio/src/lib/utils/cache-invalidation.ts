'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * P.34: Cache invalidation for prefetched content using Next.js strategies
 * Provides centralized cache management for prefetched routes and data
 */

// Cache tags for different types of content
export const CACHE_TAGS = {
  MODELS: 'models',
  EXPERIMENTS: 'experiments',
  DATASETS: 'datasets',
  DEPLOYMENTS: 'deployments',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  NAVIGATION: 'navigation',
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

/**
 * P.34: Invalidate specific cache tags
 */
export async function invalidateCacheTag(tag: CacheTag) {
  try {
    revalidateTag(tag);
    console.log(`[Cache Invalidation] Invalidated tag: ${tag}`);
  } catch (error) {
    console.error(`[Cache Invalidation] Failed to invalidate tag ${tag}:`, error);
    throw error;
  }
}

/**
 * P.34: Invalidate multiple cache tags
 */
export async function invalidateMultipleTags(tags: CacheTag[]) {
  const results = await Promise.allSettled(
    tags.map(tag => invalidateCacheTag(tag))
  );

  const failed = results
    .map((result, index) => ({ result, tag: tags[index] }))
    .filter(({ result }) => result.status === 'rejected');

  if (failed.length > 0) {
    console.error('[Cache Invalidation] Some tags failed to invalidate:', failed);
  }

  return {
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: failed.length,
    failedTags: failed.map(f => f.tag),
  };
}

/**
 * P.34: Invalidate specific paths (for route-based invalidation)
 */
export async function invalidatePath(path: string) {
  try {
    revalidatePath(path);
    console.log(`[Cache Invalidation] Invalidated path: ${path}`);
  } catch (error) {
    console.error(`[Cache Invalidation] Failed to invalidate path ${path}:`, error);
    throw error;
  }
}

/**
 * P.34: Invalidate layout and all nested pages
 */
export async function invalidateLayout(layoutPath: string) {
  try {
    revalidatePath(layoutPath, 'layout');
    console.log(`[Cache Invalidation] Invalidated layout: ${layoutPath}`);
  } catch (error) {
    console.error(`[Cache Invalidation] Failed to invalidate layout ${layoutPath}:`, error);
    throw error;
  }
}

/**
 * P.34: Smart invalidation based on content type
 */
export async function smartInvalidate(contentType: string, id?: string) {
  const invalidationMap: Record<string, () => Promise<void>> = {
    model: async () => {
      await invalidateMultipleTags([CACHE_TAGS.MODELS, CACHE_TAGS.DASHBOARD]);
      if (id) await invalidatePath(`/models/${id}`);
    },
    experiment: async () => {
      await invalidateMultipleTags([CACHE_TAGS.EXPERIMENTS, CACHE_TAGS.DASHBOARD]);
      if (id) await invalidatePath(`/experiments/${id}`);
    },
    dataset: async () => {
      await invalidateMultipleTags([CACHE_TAGS.DATASETS, CACHE_TAGS.DASHBOARD]);
      if (id) await invalidatePath(`/datasets/${id}`);
    },
    deployment: async () => {
      await invalidateMultipleTags([CACHE_TAGS.DEPLOYMENTS, CACHE_TAGS.DASHBOARD]);
      if (id) await invalidatePath(`/deployments/${id}`);
    },
    settings: async () => {
      await invalidateMultipleTags([CACHE_TAGS.SETTINGS, CACHE_TAGS.NAVIGATION]);
      await invalidatePath('/settings');
    },
    navigation: async () => {
      await invalidateCacheTag(CACHE_TAGS.NAVIGATION);
      await invalidateLayout('/');
    },
  };

  const invalidator = invalidationMap[contentType];
  if (invalidator) {
    await invalidator();
    console.log(`[Smart Invalidation] Completed for ${contentType}${id ? ` (${id})` : ''}`);
  } else {
    console.warn(`[Smart Invalidation] Unknown content type: ${contentType}`);
  }
}

/**
 * P.34: Emergency cache clear (use sparingly)
 */
export async function emergencyCacheClear() {
  const allTags = Object.values(CACHE_TAGS);
  const criticalPaths = ['/', '/dashboard', '/models', '/experiments'];

  console.warn('[Emergency Cache Clear] Clearing all caches - this may impact performance');

  await Promise.all([
    invalidateMultipleTags(allTags),
    ...criticalPaths.map(path => invalidatePath(path)),
  ]);

  console.log('[Emergency Cache Clear] Completed');
}

/**
 * P.34: Cache health check
 */
export function getCacheHealthStatus() {
  // This would ideally integrate with monitoring systems
  return {
    timestamp: new Date().toISOString(),
    tags: Object.values(CACHE_TAGS),
    status: 'healthy', // In real implementation, this would check actual cache status
    lastInvalidation: 'Not implemented', // Track last invalidation times
  };
}