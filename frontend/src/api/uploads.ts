/**
 * Uploads API Client
 */
import { apiClient } from './client';

export interface UploadedFile {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_extension: string;
  uploaded_by: string;
  created_at: string;
  is_deleted: boolean;
  file_metadata: string | null;
}

export interface UploadedFileList {
  files: UploadedFile[];
  total: number;
}

const uploadsApi = {
  /**
   * Upload a file
   */
  uploadFile: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  },

  /**
   * List uploaded files
   */
  listFiles: async (page = 1, pageSize = 20): Promise<UploadedFileList> => {
    return apiClient.get<UploadedFileList>('/api/v1/uploads', {
      params: { page, page_size: pageSize },
    });
  },

  /**
   * Get file details
   */
  getFile: async (fileId: string): Promise<UploadedFile> => {
    return apiClient.get<UploadedFile>(`/api/v1/uploads/${fileId}`);
  },

  /**
   * Download file
   */
  downloadFile: (fileId: string): string => {
    const token = localStorage.getItem('access_token');
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/uploads/${fileId}/download?token=${token}`;
  },

  /**
   * Delete file
   */
  deleteFile: async (fileId: string): Promise<void> => {
    return apiClient.delete(`/api/v1/uploads/${fileId}`);
  },
};

export default uploadsApi;
