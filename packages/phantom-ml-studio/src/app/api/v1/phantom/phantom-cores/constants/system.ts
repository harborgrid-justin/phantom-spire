// System Status and Health Constants
// Comprehensive constants for system monitoring and health assessment

export const SYSTEM_STATUS = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
  ERROR: 'error',
  INITIALIZING: 'initializing',
  SHUTDOWN: 'shutdown',
  RESTARTING: 'restarting',
  UPDATING: 'updating',
  SUSPENDED: 'suspended'
} as const;

export const HEALTH_STATUS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  CRITICAL: 'critical',
  UNKNOWN: 'unknown',
  WARNING: 'warning',
  EMERGENCY: 'emergency'
} as const;

export const COMPONENT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  DEGRADED: 'degraded',
  MAINTENANCE: 'maintenance',
  UNKNOWN: 'unknown',
  STARTING: 'starting',
  STOPPING: 'stopping',
  FAILED: 'failed',
  RECOVERING: 'recovering',
  STANDBY: 'standby'
} as const;

export const SERVICE_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  STARTING: 'starting',
  STOPPING: 'stopping',
  ERROR: 'error',
  DISABLED: 'disabled',
  PAUSED: 'paused',
  PENDING: 'pending'
} as const;

export const PERFORMANCE_LEVELS = {
  OPTIMAL: 'optimal',
  GOOD: 'good',
  AVERAGE: 'average',
  BELOW_AVERAGE: 'below_average',
  POOR: 'poor',
  CRITICAL: 'critical'
} as const;

export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  UNAVAILABLE: 'unavailable',
  PARTIALLY_AVAILABLE: 'partially_available',
  MAINTENANCE_MODE: 'maintenance_mode',
  RATE_LIMITED: 'rate_limited'
} as const;

export const RESOURCE_STATUS = {
  NORMAL: 'normal',
  HIGH_USAGE: 'high_usage',
  OVERLOADED: 'overloaded',
  EXHAUSTED: 'exhausted',
  RECOVERING: 'recovering',
  SCALING: 'scaling'
} as const;

export const CONNECTIVITY_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  RECONNECTING: 'reconnecting',
  TIMEOUT: 'timeout',
  UNSTABLE: 'unstable'
} as const;

export const ALERT_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
} as const;

export const MAINTENANCE_TYPES = {
  SCHEDULED: 'scheduled',
  EMERGENCY: 'emergency',
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  UPGRADE: 'upgrade'
} as const;

export const UPTIME_CATEGORIES = {
  EXCELLENT: { min: 99.95, label: 'Excellent (99.95%+)' },
  GOOD: { min: 99.9, label: 'Good (99.9%+)' },
  ACCEPTABLE: { min: 99.5, label: 'Acceptable (99.5%+)' },
  POOR: { min: 95.0, label: 'Poor (95%+)' },
  UNACCEPTABLE: { min: 0, label: 'Unacceptable (<95%)' }
} as const;

export const RESPONSE_TIME_CATEGORIES = {
  EXCELLENT: { max: 100, label: 'Excellent (<100ms)' },
  GOOD: { max: 300, label: 'Good (<300ms)' },
  ACCEPTABLE: { max: 1000, label: 'Acceptable (<1s)' },
  SLOW: { max: 3000, label: 'Slow (<3s)' },
  VERY_SLOW: { max: 10000, label: 'Very Slow (<10s)' },
  TIMEOUT: { max: Infinity, label: 'Timeout (>10s)' }
} as const;

export const SYSTEM_METRICS = {
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  DISK_USAGE: 'disk_usage',
  NETWORK_IO: 'network_io',
  RESPONSE_TIME: 'response_time',
  THROUGHPUT: 'throughput',
  ERROR_RATE: 'error_rate',
  UPTIME: 'uptime'
} as const;

export const MONITORING_INTERVALS = {
  REAL_TIME: 1000,      // 1 second
  HIGH_FREQUENCY: 5000,  // 5 seconds
  NORMAL: 30000,        // 30 seconds
  LOW_FREQUENCY: 300000, // 5 minutes
  HOURLY: 3600000,      // 1 hour
  DAILY: 86400000       // 24 hours
} as const;

// Type definitions
export type SystemStatus = typeof SYSTEM_STATUS[keyof typeof SYSTEM_STATUS];
export type HealthStatus = typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS];
export type ComponentStatus = typeof COMPONENT_STATUS[keyof typeof COMPONENT_STATUS];
export type ServiceStatus = typeof SERVICE_STATUS[keyof typeof SERVICE_STATUS];
export type PerformanceLevel = typeof PERFORMANCE_LEVELS[keyof typeof PERFORMANCE_LEVELS];
export type AvailabilityStatus = typeof AVAILABILITY_STATUS[keyof typeof AVAILABILITY_STATUS];
export type ResourceStatus = typeof RESOURCE_STATUS[keyof typeof RESOURCE_STATUS];
export type ConnectivityStatus = typeof CONNECTIVITY_STATUS[keyof typeof CONNECTIVITY_STATUS];
export type AlertLevel = typeof ALERT_LEVELS[keyof typeof ALERT_LEVELS];
export type MaintenanceType = typeof MAINTENANCE_TYPES[keyof typeof MAINTENANCE_TYPES];
export type SystemMetric = typeof SYSTEM_METRICS[keyof typeof SYSTEM_METRICS];
