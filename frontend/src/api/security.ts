/**
 * Security API Client
 */
import { apiClient } from './client';

export interface LoginHistoryItem {
  id: string;
  username: string;
  email: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  status: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user_id: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  ip_address: string;
  details: Record<string, any>;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  username: string;
  email: string;
  started_at: string;
  last_activity: string;
  ip_address: string;
  user_agent: string;
  location: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  resource_type: string;
  resource_id: string;
  resource_name: string;
  status: string;
}

export interface UserActivity {
  user_id: string;
  username: string;
  email: string;
  role: string;
  last_login: string;
  pipelines_created: number;
  last_activity: string;
  is_active: boolean;
}

export interface SecurityStatistics {
  security_score: number;
  total_pipelines: number;
  total_users: number;
  active_users: number;
  security_issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  compliance: {
    gdpr: string;
    hipaa: string;
    soc2: string;
    pci_dss: string;
  };
  trends: {
    logins_last_7_days: number;
    failed_logins_last_7_days: number;
    security_events_last_7_days: number;
    resolved_issues_last_7_days: number;
  };
}

const securityApi = {
  /**
   * Get login history
   */
  getLoginHistory: async (limit = 50, days = 7) => {
    return apiClient.get<{
      logins: LoginHistoryItem[];
      total: number;
      summary: {
        total_attempts: number;
        successful: number;
        failed: number;
        unique_users: number;
        unique_ips: number;
      };
    }>('/api/v1/security/login-history', {
      params: { limit, days },
    });
  },

  /**
   * Get audit log
   */
  getAuditLog: async (resourceType?: string, action?: string, limit = 50, days = 7) => {
    return apiClient.get<{
      events: AuditEvent[];
      total: number;
      summary: {
        total_events: number;
        by_action: Record<string, number>;
        by_resource: Record<string, number>;
      };
    }>('/api/v1/security/audit-log', {
      params: { resource_type: resourceType, action, limit, days },
    });
  },

  /**
   * Get active sessions
   */
  getActiveSessions: async () => {
    return apiClient.get<{
      sessions: ActiveSession[];
      total: number;
    }>('/api/v1/security/active-sessions');
  },

  /**
   * Get security events
   */
  getSecurityEvents: async (severity?: string, limit = 50, days = 7) => {
    return apiClient.get<{
      events: SecurityEvent[];
      total: number;
      summary: {
        total_events: number;
        by_severity: Record<string, number>;
        by_status: Record<string, number>;
      };
    }>('/api/v1/security/security-events', {
      params: { severity, limit, days },
    });
  },

  /**
   * Get user activity
   */
  getUserActivity: async (userId?: string, limit = 50, days = 7) => {
    return apiClient.get<{
      activities: UserActivity[];
      total: number;
      summary: {
        total_users: number;
        active_users: number;
        inactive_users: number;
        admin_users: number;
      };
    }>('/api/v1/security/user-activity', {
      params: { user_id: userId, limit, days },
    });
  },

  /**
   * Get security statistics
   */
  getStatistics: async (days = 7) => {
    return apiClient.get<SecurityStatistics>('/api/v1/security/statistics', {
      params: { days },
    });
  },
};

export default securityApi;
