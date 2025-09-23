/**
 * Path Validation Utilities
 * Provides validation and helper functions for application paths
 */

import {
  PATHS,
  AUTH_PATHS,
  CONTENT_PATHS,
  EXTERNAL_URLS,
  isExternalUrl,
  isResourceHeavyPath,
  type PathValue,
  type AuthPathValue,
  type ExternalUrlValue
} from '@/config/paths';

// ============================================================================
// PATH VALIDATION
// ============================================================================

/**
 * Validates if a given string is a valid internal application path
 */
export const isValidInternalPath = (path: string): boolean => {
  const allPaths = [
    ...Object.values(PATHS),
    ...Object.values(AUTH_PATHS),
    ...Object.values(CONTENT_PATHS),
  ];

  // Check direct matches
  if (allPaths.includes(path)) {
    return true;
  }

  // Check dynamic route patterns
  const dynamicRoutePatterns = [
    /^\/projects\/[^\/]+$/,                          // /projects/[projectId]
    /^\/projects\/[^\/]+\/models\/[^\/]+$/,         // /projects/[projectId]/models/[modelId]
    /^\/phantom-cores\/[^\/]+$/,                    // /phantom-cores/[corePath]
    /^\/apps\/ecommerce\/detail\/[^\/]+$/,          // /apps/ecommerce/detail/[id]
    /^\/apps\/invoice\/detail\/[^\/]+$/,            // /apps/invoice/detail/[id]
    /^\/apps\/invoice\/edit\/[^\/]+$/,              // /apps/invoice/edit/[id]
  ];

  return dynamicRoutePatterns.some(pattern => pattern.test(path));
};

/**
 * Validates if a given string is a valid external URL
 */
export const isValidExternalUrl = (url: string): boolean => {
  try {
    new URL(url);
    return isExternalUrl(url);
  } catch {
    return false;
  }
};

/**
 * Validates any path or URL
 */
export const isValidPath = (path: string): boolean => {
  return isValidInternalPath(path) || isValidExternalUrl(path);
};

// ============================================================================
// PATH CATEGORIZATION
// ============================================================================

/**
 * Categorizes a path by its type
 */
export const getPathCategory = (path: string): string => {
  if (isExternalUrl(path)) return 'external';
  if (Object.values(AUTH_PATHS).includes(path as AuthPathValue)) return 'auth';
  if (Object.values(CONTENT_PATHS).includes(path)) return 'content';
  if (Object.values(PATHS).includes(path as PathValue)) return 'app';
  if (path.startsWith('/projects/')) return 'project';
  if (path.startsWith('/phantom-cores/')) return 'phantom-core';
  return 'unknown';
};

/**
 * Checks if a path requires authentication
 */
export const requiresAuthentication = (path: string): boolean => {
  const publicPaths = [
    PATHS.HOME,
    ...Object.values(CONTENT_PATHS),
    ...Object.values(EXTERNAL_URLS),
  ];

  return !publicPaths.includes(path) && !isExternalUrl(path);
};

/**
 * Checks if a path is accessible to anonymous users
 */
export const isPublicPath = (path: string): boolean => {
  return !requiresAuthentication(path);
};

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

/**
 * Determines optimal prefetch settings for a given path
 */
export const getPrefetchSettings = (path: string) => {
  return {
    shouldPrefetch: !isResourceHeavyPath(path) && !isExternalUrl(path),
    priority: isResourceHeavyPath(path) ? 'low' : 'normal',
    isResourceHeavy: isResourceHeavyPath(path),
    reason: isResourceHeavyPath(path)
      ? 'Resource-heavy path'
      : isExternalUrl(path)
      ? 'External URL'
      : 'Lightweight internal path'
  };
};

/**
 * Gets all resource-heavy paths for prefetch control
 */
export const getResourceHeavyPaths = (): string[] => {
  const allPaths = Object.values(PATHS);
  return allPaths.filter(path => isResourceHeavyPath(path));
};

// ============================================================================
// NAVIGATION UTILITIES
// ============================================================================

/**
 * Extracts parameters from dynamic routes
 */
export const extractRouteParams = (path: string): Record<string, string> => {
  const params: Record<string, string> = {};

  // Project routes: /projects/[projectId]/models/[modelId]
  const projectModelMatch = path.match(/^\/projects\/([^\/]+)\/models\/([^\/]+)$/);
  if (projectModelMatch) {
    return { projectId: projectModelMatch[1], modelId: projectModelMatch[2] };
  }

  // Project routes: /projects/[projectId]
  const projectMatch = path.match(/^\/projects\/([^\/]+)$/);
  if (projectMatch) {
    return { projectId: projectMatch[1] };
  }

  // Phantom cores: /phantom-cores/[corePath]
  const coreMatch = path.match(/^\/phantom-cores\/([^\/]+)$/);
  if (coreMatch) {
    return { corePath: coreMatch[1] };
  }

  return params;
};

/**
 * Builds a path with parameters
 */
export const buildPath = (template: string, params: Record<string, string>): string => {
  let path = template;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, value);
  });
  return path;
};

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Gets security attributes for external links
 */
export const getSecurityAttributes = (url: string) => {
  if (isExternalUrl(url)) {
    return {
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }
  return {};
};

/**
 * Sanitizes a path to prevent injection attacks
 */
export const sanitizePath = (path: string): string => {
  // Remove any potentially dangerous characters
  return path.replace(/[<>\"']/g, '');
};

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Gets all available paths for development/debugging
 */
export const getAllPaths = () => {
  return {
    core: PATHS,
    auth: AUTH_PATHS,
    content: CONTENT_PATHS,
    external: EXTERNAL_URLS,
  };
};

/**
 * Validates the entire path configuration for consistency
 */
export const validatePathConfiguration = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const allPaths = [
    ...Object.values(PATHS),
    ...Object.values(AUTH_PATHS),
    ...Object.values(CONTENT_PATHS),
  ];

  // Check for duplicates
  const duplicates = allPaths.filter((path, index) => allPaths.indexOf(path) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate paths found: ${duplicates.join(', ')}`);
  }

  // Check for invalid path formats
  allPaths.forEach(path => {
    if (typeof path === 'string' && !path.startsWith('/')) {
      errors.push(`Invalid path format (should start with /): ${path}`);
    }
  });

  // Check external URLs
  Object.values(EXTERNAL_URLS).forEach(url => {
    if (!isValidExternalUrl(url)) {
      errors.push(`Invalid external URL: ${url}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for internal paths
 */
export const isInternalPath = (path: string): path is PathValue => {
  return Object.values(PATHS).includes(path as PathValue);
};

/**
 * Type guard for auth paths
 */
export const isAuthPath = (path: string): path is AuthPathValue => {
  return Object.values(AUTH_PATHS).includes(path as AuthPathValue);
};

/**
 * Type guard for external URLs
 */
export const isExternalUrlValue = (url: string): url is ExternalUrlValue => {
  return Object.values(EXTERNAL_URLS).includes(url as ExternalUrlValue);
};