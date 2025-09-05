/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = {
  get: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    
    return data;
  },

  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      // Handle validation errors with detailed field messages
      if (result.data?.errors && Array.isArray(result.data.errors)) {
        const errorMessage = result.data.errors.map((err: any) => err.message).join('. ');
        throw new Error(errorMessage);
      }
      throw new Error(result.error || result.message || 'Request failed');
    }
    
    return result;
  },

  put: async (endpoint: string, data?: any, options?: RequestInit) => {
    const requestBody = data ? JSON.stringify(data) : undefined;
    console.log('PUT request details:', {
      url: `${API_BASE_URL}${endpoint}`,
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      }
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: requestBody,
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      // Handle validation errors with detailed field messages
      if (result.data?.errors && Array.isArray(result.data.errors)) {
        const errorMessage = result.data.errors.map((err: any) => err.message).join('. ');
        throw new Error(errorMessage);
      }
      throw new Error(result.error || result.message || 'Request failed');
    }
    
    return result;
  },

  delete: async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      // Handle validation errors with detailed field messages
      if (result.data?.errors && Array.isArray(result.data.errors)) {
        const errorMessage = result.data.errors.map((err: any) => err.message).join('. ');
        throw new Error(errorMessage);
      }
      throw new Error(result.error || result.message || 'Request failed');
    }
    
    return result;
  },
};

export const getAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export default API_BASE_URL;