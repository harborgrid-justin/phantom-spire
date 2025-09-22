// Main exports - client-safe dashboard service
export * from './dashboardService';
export * from './dashboard.types';

// Enhanced service with NAPI bindings is available but not auto-exported
// Import it explicitly when needed on server-side:
// import { enhancedDashboardService } from '@/services/dashboard/enhancedDashboardService';
