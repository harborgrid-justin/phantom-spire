import {
  IOC,
  MITRETechnique,
  MITRETactic,
  MITREGroup,
  Issue,
  Organization,
  Evidence,
  Task,
  ApiInfo,
  CreateIOCRequest,
  CreateIssueRequest,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        message: data.message,
        error: response.ok ? undefined : data.error || data.message,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Specific API methods
  async getApiInfo() {
    return this.get('/');
  }

  // IOC methods
  async getIOCs() {
    return this.get('/iocs');
  }

  async getIOC(id: string) {
    return this.get(`/iocs/${id}`);
  }

  async createIOC(ioc: CreateIOCRequest) {
    return this.post<IOC>('/iocs', ioc);
  }

  // MITRE methods
  async getMITRETechniques() {
    return this.get('/mitre/techniques');
  }

  async getMITRETactics() {
    return this.get('/mitre/tactics');
  }

  async getMITREGroups() {
    return this.get('/mitre/groups');
  }

  // Issues methods
  async getIssues() {
    return this.get('/issues');
  }

  async getIssue(id: string) {
    return this.get(`/issues/${id}`);
  }

  async createIssue(issue: CreateIssueRequest) {
    return this.post<Issue>('/issues', issue);
  }

  // Organizations methods
  async getOrganizations() {
    return this.get('/organizations');
  }

  async getOrganization(id: string) {
    return this.get(`/organizations/${id}`);
  }

  // Evidence methods
  async getEvidence() {
    return this.get('/evidence');
  }

  // Tasks methods
  async getTasks() {
    return this.get('/tasks');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
