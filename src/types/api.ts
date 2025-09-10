export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'analyst' | 'viewer';
}

// Enhanced Threat Actor API Types
export interface AttributionAnalysisRequest {
  indicators: string[];
  context?: Record<string, string>;
  confidence_threshold?: number;
}

export interface CampaignTrackingRequest {
  campaign_name: string;
  actor_id?: string;
  objectives?: string[];
  targets?: any[];
}

export interface ReputationAnalysisRequest {
  factors: Record<string, number>;
}

export interface RiskAssessmentRequest {
  assessment_type: string;
  assets: any[];
  threat_actors?: string[];
}

export interface ComplianceReportRequest {
  compliance_framework: string;
  report_type: string;
  scope?: any;
}

export interface ThreatHuntingRequest {
  hunt_type: string;
  indicators?: string[];
  timeframe?: string;
}

export interface IntelligenceSharingRequest {
  protocol: string;
  recipients: string[];
  data: any;
}

export interface AlertConfigurationRequest {
  alert_types: string[];
  notification_channels: string[];
  criteria?: any;
}

export interface CreateThreatActorRequest {
  name: string;
  aliases?: string[];
  actor_type: string;
  sophistication_level: string;
  motivation: string[];
  origin_country?: string;
  capabilities?: any[];
  targets?: any[];
}

export interface UpdateThreatActorRequest extends Partial<CreateThreatActorRequest> {
  status?: string;
}

export interface ThreatActorQuery {
  page?: string;
  limit?: string;
  actor_type?: string;
  sophistication_level?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateIOCRequest {
  value: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  source: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateIOCRequest extends Partial<CreateIOCRequest> {
  isActive?: boolean;
}

export interface CreateAlertRequest {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'malware'
    | 'phishing'
    | 'apt'
    | 'botnet'
    | 'vulnerability'
    | 'other';
  iocs?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAlertRequest extends Partial<CreateAlertRequest> {
  status?: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
}

export interface CreateThreatFeedRequest {
  name: string;
  description?: string;
  url: string;
  feedType: 'rss' | 'json' | 'csv' | 'stix' | 'misp';
  fetchInterval?: number;
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  headers?: Record<string, string>;
  parser: {
    format: string;
    mapping: Record<string, string>;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IOCQuery extends PaginationQuery {
  type?: string;
  severity?: string;
  confidence_min?: string;
  confidence_max?: string;
  tags?: string;
  isActive?: string;
  search?: string;
}

export interface AlertQuery extends PaginationQuery {
  status?: string;
  severity?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
}

// User authentication and session types
export interface User {
  id: string;
  email: string;
  role: string;
  organizationId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

// Extend Express Request type with user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
