// API Response Types
export interface IOC {
  id: string;
  type: string;
  value: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MITRETechnique {
  id: string;
  techniqueId: string;
  name: string;
  description: string;
  tactics: string[];
  platforms: string[];
  dataSource?: string[];
}

export interface MITRETactic {
  id: string;
  tacticId: string;
  name: string;
  description: string;
  techniques: string[];
}

export interface MITREGroup {
  id: string;
  groupId: string;
  name: string;
  description: string;
  aliases?: string[];
  techniques: string[];
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  type: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  type: string;
  description: string;
  filePath?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface ApiInfo {
  message: string;
  version: string;
  status: string;
  endpoints: Record<string, string>;
  features: Record<string, boolean>;
}

// Request Types
export interface CreateIOCRequest {
  type: string;
  value: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  tags?: string[];
}
