/**
 * Type definitions for Threat Intelligence Marketplace
 * Supports enterprise CTI feed management and threat data analysis
 */

export interface ThreatFeed {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: 'malware' | 'phishing' | 'botnet' | 'apt' | 'vulnerability' | 'ioc';
  pricing: 'free' | 'freemium' | 'paid';
  price?: string;
  confidence: number;
  coverage: string[];
  updates: string;
  lastUpdate: Date;
  format: 'json' | 'xml' | 'csv' | 'stix';
  subscribed: boolean;
  subscribers: number;
  rating: number;
}

export interface ThreatData {
  id: string;
  type: 'File Hash' | 'IP Address' | 'Domain' | 'URL' | 'Email' | 'Registry Key';
  indicator: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
  attributes?: Record<string, string | number | boolean>;
  relationships?: ThreatRelationship[];
}

export interface ThreatRelationship {
  id: string;
  type: 'related' | 'derived' | 'variant' | 'uses';
  targetId: string;
  confidence: number;
  description?: string;
}

export interface FilterOptions {
  searchTerm: string;
  categoryFilter: string;
  pricingFilter: string;
}

export interface SubscriptionAction {
  feedId: string;
  action: 'subscribe' | 'unsubscribe';
}

export interface FeedCardProps {
  feed: ThreatFeed;
  onSubscribe: (feedId: string) => void;
  onUnsubscribe: (feedId: string) => void;
  onViewDetails: (feed: ThreatFeed) => void;
}

export interface ThreatDataTableProps {
  threatData: ThreatData[];
  loading?: boolean;
}

export interface FilterBarProps {
  searchTerm: string;
  categoryFilter: string;
  pricingFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPricingChange: (value: string) => void;
}

export interface FeedDetailsDialogProps {
  feed: ThreatFeed | null;
  open: boolean;
  onClose: () => void;
  onSubscribe: (feedId: string) => void;
}

export interface SubscriptionCardProps {
  feed: ThreatFeed;
  onUnsubscribe: (feedId: string) => void;
}

// Category and severity color mappings
export const CATEGORY_COLORS = {
  'malware': 'error',
  'phishing': 'warning', 
  'botnet': 'info',
  'apt': 'secondary',
  'vulnerability': 'primary',
  'ioc': 'success'
} as const;

export const SEVERITY_COLORS = {
  'critical': 'error',
  'high': 'warning',
  'medium': 'info', 
  'low': 'success'
} as const;

export type CategoryColor = keyof typeof CATEGORY_COLORS;
export type SeverityColor = keyof typeof SEVERITY_COLORS;