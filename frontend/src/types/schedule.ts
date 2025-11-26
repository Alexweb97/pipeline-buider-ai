/**
 * Schedule Types
 */

export type ScheduleFrequency =
  | 'once'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export type ScheduleStatus = 'active' | 'paused' | 'expired';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Schedule {
  id: string;
  name: string;
  description: string;
  pipeline_id: string;
  pipeline_name: string;
  frequency: ScheduleFrequency;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  next_run_at: string;
  last_run_at?: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  cron_expression?: string;
  timezone: string;
  start_date?: string;
  end_date?: string;
  config: ScheduleConfig;
  is_airflow_synced?: boolean;
  airflow_dag_id?: string;
}

export interface ScheduleConfig {
  // Pour hourly
  minute?: number;

  // Pour daily
  hour?: number;

  // Pour weekly
  days_of_week?: DayOfWeek[];

  // Pour monthly
  day_of_month?: number;

  // Pour custom (cron)
  cron_expression?: string;

  // Options communes
  max_retries?: number;
  retry_delay_minutes?: number;
  timeout_minutes?: number;
  send_notifications?: boolean;
  notification_emails?: string[];
}

export interface ScheduleCreateData {
  name: string;
  description: string;
  pipeline_id: string;
  frequency: ScheduleFrequency;
  timezone?: string;
  start_date?: string;
  end_date?: string;
  config: ScheduleConfig;
}

export interface ScheduleUpdateData {
  name?: string;
  description?: string;
  frequency?: ScheduleFrequency;
  status?: ScheduleStatus;
  config?: Partial<ScheduleConfig>;
  start_date?: string;
  end_date?: string;
}

export interface ScheduleRun {
  id: string;
  schedule_id: string;
  pipeline_id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
  logs?: string;
}

export interface ScheduleStats {
  total_schedules: number;
  active_schedules: number;
  paused_schedules: number;
  runs_today: number;
  success_rate: number;
  upcoming_runs: ScheduleUpcoming[];
}

export interface ScheduleUpcoming {
  schedule_id: string;
  schedule_name: string;
  pipeline_name: string;
  next_run_at: string;
  frequency: ScheduleFrequency;
}
