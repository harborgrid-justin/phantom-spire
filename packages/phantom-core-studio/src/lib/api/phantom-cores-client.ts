/**
 * Phantom Cores API Client
 * Handles API calls to Phantom Cores endpoints with proper URL mapping
 */

/**
 * Makes API calls to Phantom Cores endpoints, automatically mapping
 * /api/phantom-cores to /api/v1/phantom/phantom-cores
 */
export async function phantomCoresApi(endpoint: string, options?: RequestInit): Promise<Response> {
  // Transform the endpoint to use the correct v1 path
  const transformedEndpoint = endpoint.replace('/api/phantom-cores', '/api/v1/phantom/phantom-cores');
  
  return fetch(transformedEndpoint, options);
}

/**
 * Convenience methods for common HTTP methods
 */
export const phantomCoresClient = {
  get: (endpoint: string, options?: Omit<RequestInit, 'method'>) => 
    phantomCoresApi(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>) =>
    phantomCoresApi(endpoint, { 
      ...options, 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : null
    }),
    
  put: (endpoint: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>) =>
    phantomCoresApi(endpoint, { 
      ...options, 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : null
    }),
    
  delete: (endpoint: string, options?: Omit<RequestInit, 'method'>) =>
    phantomCoresApi(endpoint, { ...options, method: 'DELETE' })
};
