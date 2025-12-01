import { create } from 'zustand';
import { pharmacyApi } from '../utils/api';
import type { PharmacyUploadResponse } from '../types/api';

type UploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

interface PharmacyUploadState {
  status: UploadStatus;
  selectedFiles: File[];
  result: PharmacyUploadResponse | null;
  error: string | null;
}

interface PharmacyUploadActions {
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  uploadFiles: () => Promise<void>;
  reset: () => void;
}

type PharmacyUploadStore = PharmacyUploadState & PharmacyUploadActions;

const MAX_FILES = 10;
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export const usePharmacyUploadStore = create<PharmacyUploadStore>((set, get) => ({
  // State
  status: 'idle',
  selectedFiles: [],
  result: null,
  error: null,

  // Actions
  addFiles: (files: File[]) => {
    const { selectedFiles } = get();
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!['.xlsx', '.xls'].includes(ext)) {
        errors.push(`${file.name}: Invalid file type`);
      } else if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: Exceeds 25MB limit`);
      } else {
        validFiles.push(file);
      }
    });

    const combined = [...selectedFiles, ...validFiles].slice(0, MAX_FILES);

    set({
      selectedFiles: combined,
      error: errors.length > 0 ? errors.join('\n') : null,
    });
  },

  removeFile: (index: number) => {
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((_, i) => i !== index),
      error: null,
    }));
  },

  clearFiles: () => {
    set({ selectedFiles: [], error: null });
  },

  uploadFiles: async () => {
    const { selectedFiles } = get();
    if (selectedFiles.length === 0) return;

    set({ status: 'uploading', error: null });

    try {
      const result = await pharmacyApi.uploadFiles(selectedFiles);
      set({
        status: 'complete',
        result,
        selectedFiles: [],
      });
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: string } } };
      set({
        status: 'error',
        error: error.response?.data?.error || 'Upload failed',
      });
    }
  },

  reset: () => {
    set({
      status: 'idle',
      selectedFiles: [],
      result: null,
      error: null,
    });
  },
}));
