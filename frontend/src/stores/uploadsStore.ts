/**
 * Uploads Store
 * Zustand store for managing file uploads state
 */
import { create } from 'zustand';
import uploadsApi, { UploadedFile } from '../api/uploads';

interface UploadsState {
  files: UploadedFile[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  total: number;

  // Actions
  fetchFiles: (page?: number, pageSize?: number) => Promise<void>;
  uploadFile: (file: File) => Promise<UploadedFile>;
  deleteFile: (fileId: string) => Promise<void>;
  clearError: () => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
  files: [],
  loading: false,
  uploading: false,
  error: null,
  total: 0,

  fetchFiles: async (page = 1, pageSize = 20) => {
    set({ loading: true, error: null });
    try {
      const response = await uploadsApi.listFiles(page, pageSize);
      set({
        files: response.files,
        total: response.total,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch files',
        loading: false,
      });
    }
  },

  uploadFile: async (file: File) => {
    set({ uploading: true, error: null });
    try {
      const uploadedFile = await uploadsApi.uploadFile(file);
      set((state) => ({
        files: [uploadedFile, ...state.files],
        total: state.total + 1,
        uploading: false,
      }));
      return uploadedFile;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to upload file',
        uploading: false,
      });
      throw error;
    }
  },

  deleteFile: async (fileId: string) => {
    set({ loading: true, error: null });
    try {
      await uploadsApi.deleteFile(fileId);
      set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
        total: state.total - 1,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete file',
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
