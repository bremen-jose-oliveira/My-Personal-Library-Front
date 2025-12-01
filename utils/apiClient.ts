import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

/**
 * Centralized API client that handles authentication and error responses
 */
export const apiClient = {
  /**
   * Makes an authenticated API request
   * Automatically handles 401 errors by logging out the user
   */
  async request(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear token and redirect to login
      await AsyncStorage.removeItem('token');
      // Only redirect if we're not already on the login page
      if (router.canGoBack()) {
        router.replace('/');
      }
      throw new Error('Session expired. Please login again.');
    }

    return response;
  },

  /**
   * GET request
   */
  async get(url: string, options?: RequestInit): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  async post(url: string, body?: any, options?: RequestInit): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request
   */
  async put(url: string, body?: any, options?: RequestInit): Promise<Response> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  async delete(url: string, options?: RequestInit): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};

