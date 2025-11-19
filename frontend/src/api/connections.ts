/**
 * Connections API Client
 */
import { apiClient } from './client';

export interface ConnectionConfig {
  [key: string]: any;
}

export interface Connection {
  id: string;
  name: string;
  description?: string;
  type: string;
  config: ConnectionConfig;
  is_active: boolean;
  created_by: string;
  last_tested_at?: string;
  test_status?: 'success' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ConnectionCreate {
  name: string;
  description?: string;
  type: string;
  config: ConnectionConfig;
}

export interface ConnectionUpdate {
  name?: string;
  description?: string;
  type?: string;
  config?: ConnectionConfig;
  is_active?: boolean;
}

export interface ConnectionTest {
  type: string;
  config: ConnectionConfig;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface ConnectionType {
  type: string;
  name: string;
  description: string;
  required_fields: string[];
  optional_fields: string[];
}

/**
 * List all connections
 */
export const listConnections = async (params?: {
  skip?: number;
  limit?: number;
  connection_type?: string;
}): Promise<Connection[]> => {
  return apiClient.get<Connection[]>('/api/v1/connections', { params });
};

/**
 * Get a specific connection
 */
export const getConnection = async (id: string): Promise<Connection> => {
  return apiClient.get<Connection>(`/api/v1/connections/${id}`);
};

/**
 * Create a new connection
 */
export const createConnection = async (data: ConnectionCreate): Promise<Connection> => {
  return apiClient.post<Connection>('/api/v1/connections', data);
};

/**
 * Update an existing connection
 */
export const updateConnection = async (
  id: string,
  data: ConnectionUpdate
): Promise<Connection> => {
  return apiClient.put<Connection>(`/api/v1/connections/${id}`, data);
};

/**
 * Delete a connection
 */
export const deleteConnection = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/api/v1/connections/${id}`);
};

/**
 * Test a saved connection
 */
export const testConnection = async (id: string): Promise<ConnectionTestResult> => {
  return apiClient.post<ConnectionTestResult>(`/api/v1/connections/${id}/test`);
};

/**
 * Test a connection configuration without saving
 */
export const testConnectionConfig = async (
  data: ConnectionTest
): Promise<ConnectionTestResult> => {
  return apiClient.post<ConnectionTestResult>('/api/v1/connections/test', data);
};

/**
 * Get available connection types
 */
export const getConnectionTypes = async (): Promise<ConnectionType[]> => {
  return apiClient.get<ConnectionType[]>('/api/v1/connections/types/available');
};
