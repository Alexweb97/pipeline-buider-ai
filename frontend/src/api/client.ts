/**
 * API Client Configuration using native fetch
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem('access_token');
  } catch (error) {
    console.warn('Cannot access localStorage for token:', error);
    return null;
  }
}

/**
 * Set authentication token in localStorage
 */
function setAuthToken(token: string): void {
  try {
    localStorage.setItem('access_token', token);
  } catch (error) {
    console.warn('Cannot store token in localStorage:', error);
  }
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  try {
    return localStorage.getItem('refresh_token');
  } catch (error) {
    console.warn('Cannot access localStorage for refresh token:', error);
    return null;
  }
}

/**
 * Clear all auth tokens
 */
function clearAuthTokens(): void {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.warn('Cannot clear localStorage:', error);
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    setAuthToken(data.access_token);

    try {
      localStorage.setItem('refresh_token', data.refresh_token);
    } catch (e) {
      console.warn('Cannot store refresh token:', e);
    }

    return data.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuthTokens();
    return null;
  }
}

/**
 * Request options type
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

/**
 * Make API request with automatic token refresh
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, timeout = 30000, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Setup headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Make request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status,
            retryResponse.statusText,
            await retryResponse.json().catch(() => null)
          );
        }

        return retryResponse.json();
      } else {
        // Token refresh failed, redirect to login
        clearAuthTokens();
        window.location.href = '/login';
        throw new ApiError(401, 'Unauthorized');
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // Parse and return response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    // Re-throw API errors
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * API Client with HTTP methods
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
