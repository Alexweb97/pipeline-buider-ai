/**
 * Pipeline Store - Zustand state management for pipelines
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  PipelineResponse,
  ModuleResponse,
  ValidationResult,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  ExecutionResponse,
} from '../types/api';
import pipelinesApi from '../api/pipelines';
import modulesApi from '../api/modules';
import executionsApi from '../api/executions';

interface PipelineStore {
  // State
  pipelines: PipelineResponse[];
  currentPipeline: PipelineResponse | null;
  modules: ModuleResponse[];
  modulesByType: {
    extractors: ModuleResponse[];
    transformers: ModuleResponse[];
    loaders: ModuleResponse[];
  };
  currentExecution: ExecutionResponse | null;
  loading: boolean;
  error: string | null;

  // Pipeline Actions
  fetchPipelines: () => Promise<void>;
  fetchPipeline: (id: string) => Promise<void>;
  createPipeline: (data: CreatePipelineRequest) => Promise<string>;
  updatePipeline: (id: string, data: UpdatePipelineRequest) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  executePipeline: (id: string, params?: Record<string, any>) => Promise<string>;
  validatePipeline: (id: string) => Promise<ValidationResult>;
  setCurrentPipeline: (pipeline: PipelineResponse | null) => void;

  // Module Actions
  fetchModules: () => Promise<void>;
  fetchModulesByType: () => Promise<void>;
  getModuleById: (id: string) => ModuleResponse | undefined;

  // Execution Actions
  fetchExecution: (id: string) => Promise<void>;
  subscribeToExecution: (id: string) => (() => void) | null;

  // Utility Actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  pipelines: [],
  currentPipeline: null,
  modules: [],
  modulesByType: {
    extractors: [],
    transformers: [],
    loaders: [],
  },
  currentExecution: null,
  loading: false,
  error: null,
};

export const usePipelineStore = create<PipelineStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Pipeline Actions
      fetchPipelines: async () => {
        set({ loading: true, error: null });
        try {
          const response = await pipelinesApi.list();
          set({ pipelines: response.pipelines, loading: false });
        } catch (error: any) {
          set({
            error: error.data?.detail || error.message || 'Failed to fetch pipelines',
            loading: false,
          });
          throw error;
        }
      },

      fetchPipeline: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const pipeline = await pipelinesApi.get(id);
          set({ currentPipeline: pipeline, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to fetch pipeline',
            loading: false,
          });
          throw error;
        }
      },

      createPipeline: async (data: CreatePipelineRequest) => {
        set({ loading: true, error: null });
        try {
          const pipeline = await pipelinesApi.create(data);
          set((state) => ({
            pipelines: [...state.pipelines, pipeline],
            currentPipeline: pipeline,
            loading: false,
          }));
          return pipeline.id;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to create pipeline',
            loading: false,
          });
          throw error;
        }
      },

      updatePipeline: async (id: string, data: UpdatePipelineRequest) => {
        set({ loading: true, error: null });
        try {
          const pipeline = await pipelinesApi.update(id, data);
          set((state) => ({
            pipelines: state.pipelines.map((p) => (p.id === id ? pipeline : p)),
            currentPipeline: state.currentPipeline?.id === id ? pipeline : state.currentPipeline,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to update pipeline',
            loading: false,
          });
          throw error;
        }
      },

      deletePipeline: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await pipelinesApi.delete(id);
          set((state) => ({
            pipelines: state.pipelines.filter((p) => p.id !== id),
            currentPipeline: state.currentPipeline?.id === id ? null : state.currentPipeline,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to delete pipeline',
            loading: false,
          });
          throw error;
        }
      },

      executePipeline: async (id: string, params?: Record<string, any>) => {
        set({ loading: true, error: null });
        try {
          const response = await pipelinesApi.execute(id, params);
          set({ loading: false });
          return response.execution_id;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to execute pipeline',
            loading: false,
          });
          throw error;
        }
      },

      validatePipeline: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const result = await pipelinesApi.validate(id);
          set({ loading: false });
          return result;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to validate pipeline',
            loading: false,
          });
          throw error;
        }
      },

      setCurrentPipeline: (pipeline: PipelineResponse | null) => {
        set({ currentPipeline: pipeline });
      },

      // Module Actions
      fetchModules: async () => {
        set({ loading: true, error: null });
        try {
          const response = await modulesApi.list({ is_active: true });
          set({ modules: response.modules, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to fetch modules',
            loading: false,
          });
          throw error;
        }
      },

      fetchModulesByType: async () => {
        set({ loading: true, error: null });
        try {
          const grouped = await modulesApi.getGrouped();
          set({
            modulesByType: grouped,
            modules: [...grouped.extractors, ...grouped.transformers, ...grouped.loaders],
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to fetch modules',
            loading: false,
          });
          throw error;
        }
      },

      getModuleById: (id: string) => {
        return get().modules.find((m) => m.id === id || m.name === id);
      },

      // Execution Actions
      fetchExecution: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const execution = await executionsApi.get(id);
          set({ currentExecution: execution, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to fetch execution',
            loading: false,
          });
          throw error;
        }
      },

      subscribeToExecution: (id: string) => {
        try {
          const unsubscribe = executionsApi.subscribeToUpdates(
            id,
            (execution) => {
              set({ currentExecution: execution });
            },
            (log) => {
              // Append log to current execution
              set((state) => {
                if (state.currentExecution && state.currentExecution.id === id) {
                  return {
                    currentExecution: {
                      ...state.currentExecution,
                      logs: [...state.currentExecution.logs, log],
                    },
                  };
                }
                return state;
              });
            }
          );
          return unsubscribe;
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to subscribe to execution',
          });
          return null;
        }
      },

      // Utility Actions
      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'PipelineStore' }
  )
);

export default usePipelineStore;
