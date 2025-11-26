/**
 * Schedule Store - Zustand state management for schedules
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Schedule,
  ScheduleCreateData,
  ScheduleUpdateData,
  ScheduleStats,
  ScheduleStatus,
} from '../types/schedule';
import schedulesApi from '../api/schedules';

interface ScheduleStore {
  // State
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  stats: ScheduleStats | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;

  // Actions
  fetchSchedules: (params?: {
    page?: number;
    page_size?: number;
    status?: ScheduleStatus;
    pipeline_id?: string;
    search?: string;
  }) => Promise<void>;
  fetchSchedule: (id: string) => Promise<void>;
  createSchedule: (data: ScheduleCreateData) => Promise<string>;
  updateSchedule: (id: string, data: ScheduleUpdateData) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  toggleStatus: (id: string, status: ScheduleStatus) => Promise<void>;
  fetchStats: () => Promise<void>;
  triggerSchedule: (id: string) => Promise<string>;
  syncToAirflow: (id: string) => Promise<void>;
  setCurrentSchedule: (schedule: Schedule | null) => void;

  // Utility Actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  schedules: [],
  currentSchedule: null,
  stats: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,
};

export const useScheduleStore = create<ScheduleStore>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchSchedules: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await schedulesApi.list(params);
          set({
            schedules: response.schedules,
            total: response.total,
            page: response.page,
            pageSize: response.page_size,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to fetch schedules',
            loading: false,
          });
          throw error;
        }
      },

      fetchSchedule: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const schedule = await schedulesApi.get(id);
          set({ currentSchedule: schedule, loading: false });
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to fetch schedule',
            loading: false,
          });
          throw error;
        }
      },

      createSchedule: async (data: ScheduleCreateData) => {
        set({ loading: true, error: null });
        try {
          const schedule = await schedulesApi.create(data);
          set((state) => ({
            schedules: [schedule, ...state.schedules],
            currentSchedule: schedule,
            loading: false,
          }));
          return schedule.id;
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to create schedule',
            loading: false,
          });
          throw error;
        }
      },

      updateSchedule: async (id: string, data: ScheduleUpdateData) => {
        set({ loading: true, error: null });
        try {
          const schedule = await schedulesApi.update(id, data);
          set((state) => ({
            schedules: state.schedules.map((s) => (s.id === id ? schedule : s)),
            currentSchedule: state.currentSchedule?.id === id ? schedule : state.currentSchedule,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to update schedule',
            loading: false,
          });
          throw error;
        }
      },

      deleteSchedule: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await schedulesApi.delete(id);
          set((state) => ({
            schedules: state.schedules.filter((s) => s.id !== id),
            currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to delete schedule',
            loading: false,
          });
          throw error;
        }
      },

      toggleStatus: async (id: string, status: ScheduleStatus) => {
        set({ loading: true, error: null });
        try {
          await schedulesApi.toggleStatus(id, status);
          set((state) => ({
            schedules: state.schedules.map((s) =>
              s.id === id ? { ...s, status } : s
            ),
            currentSchedule:
              state.currentSchedule?.id === id
                ? { ...state.currentSchedule, status }
                : state.currentSchedule,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to toggle schedule status',
            loading: false,
          });
          throw error;
        }
      },

      fetchStats: async () => {
        try {
          const stats = await schedulesApi.getStats();
          set({ stats });
        } catch (error: any) {
          console.error('Failed to fetch schedule stats:', error);
        }
      },

      triggerSchedule: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await schedulesApi.trigger(id);
          set({ loading: false });
          // Refresh the schedule to get updated stats
          const schedule = await schedulesApi.get(id);
          set((state) => ({
            schedules: state.schedules.map((s) => (s.id === id ? schedule : s)),
            currentSchedule: state.currentSchedule?.id === id ? schedule : state.currentSchedule,
          }));
          return response.celery_task_id;
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to trigger schedule',
            loading: false,
          });
          throw error;
        }
      },

      syncToAirflow: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await schedulesApi.syncAirflow(id);
          // Refresh the schedule to get updated airflow status
          const schedule = await schedulesApi.get(id);
          set((state) => ({
            schedules: state.schedules.map((s) => (s.id === id ? schedule : s)),
            currentSchedule: state.currentSchedule?.id === id ? schedule : state.currentSchedule,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to sync to Airflow',
            loading: false,
          });
          throw error;
        }
      },

      setCurrentSchedule: (schedule: Schedule | null) => {
        set({ currentSchedule: schedule });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'ScheduleStore' }
  )
);

export default useScheduleStore;
