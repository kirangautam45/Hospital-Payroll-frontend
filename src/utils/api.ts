import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, RefreshResponse, LoginRequest, RegisterRequest, GetAllUsersResponse } from '../types/auth';
import type { UploadResponse, PersonResponse, PersonSummary, AllSalaryRecordsResponse, AllPersonsResponse, PharmacyUploadResponse, AllPharmacyRecordsResponse, PharmacyRecord } from '../types/api';
import type {
  DashboardStatsAPI,
  DepartmentSummaryAPI,
  MonthlyReportAPI,
  YearlyDataAPI,
  TopEarnerAPI,
  SearchResultAPI,
} from '../types/analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage helpers
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      clearTokens();
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await api.post('/auth/logout-all');
    } finally {
      clearTokens();
    }
  },

  getAllUsers: async (page = 1, limit = 10): Promise<GetAllUsersResponse> => {
    const response = await api.get<GetAllUsersResponse>('/auth/users', {
      params: { page, limit },
    });
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  uploadFiles: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Person API
export const personApi = {
  search: async (q: string, limit = 10): Promise<{ results: SearchResultAPI[] }> => {
    const response = await api.get<{ results: SearchResultAPI[] }>('/person/search', {
      params: { q, limit },
    });
    return response.data;
  },

  getByPan: async (
    pan: string,
    page = 1,
    limit = 20,
    from?: string,
    to?: string
  ): Promise<PersonResponse> => {
    const response = await api.get<PersonResponse>(`/person/${pan}`, {
      params: { page, limit, from, to },
    });
    return response.data;
  },

  getSummary: async (pan: string): Promise<PersonSummary> => {
    const response = await api.get<PersonSummary>(`/person/${pan}/summary`);
    return response.data;
  },

  export: async (pan: string, format: 'json' | 'csv' | 'excel' = 'json'): Promise<Blob | PersonResponse> => {
    if (format === 'csv' || format === 'excel') {
      const response = await api.get(`/person/${pan}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    }
    const response = await api.get<PersonResponse>(`/person/${pan}/export`, {
      params: { format },
    });
    return response.data;
  },

  getAllSalaryRecords: async (
    page = 1,
    limit = 50,
    search?: string
  ): Promise<AllSalaryRecordsResponse> => {
    const response = await api.get<AllSalaryRecordsResponse>('/person/salary-records', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getAllPersons: async (
    page = 1,
    limit = 50,
    search?: string
  ): Promise<AllPersonsResponse> => {
    const response = await api.get<AllPersonsResponse>('/person/list', {
      params: { page, limit, search },
    });
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboard: async (): Promise<DashboardStatsAPI> => {
    const response = await api.get<DashboardStatsAPI>('/analytics/dashboard');
    return response.data;
  },

  getDepartments: async (): Promise<{ departments: string[] }> => {
    const response = await api.get<{ departments: string[] }>('/analytics/departments');
    return response.data;
  },

  getDepartmentSummary: async (
    from?: string,
    to?: string
  ): Promise<{ departments: DepartmentSummaryAPI[] }> => {
    const response = await api.get<{ departments: DepartmentSummaryAPI[] }>(
      '/analytics/departments/summary',
      { params: { from, to } }
    );
    return response.data;
  },

  getMonthlyReport: async (year?: number): Promise<MonthlyReportAPI> => {
    const response = await api.get<MonthlyReportAPI>('/analytics/reports/monthly', {
      params: { year },
    });
    return response.data;
  },

  getYearlyReport: async (): Promise<{ years: YearlyDataAPI[] }> => {
    const response = await api.get<{ years: YearlyDataAPI[] }>('/analytics/reports/yearly');
    return response.data;
  },

  getTopEarners: async (
    limit?: number,
    department?: string
  ): Promise<{ topEarners: TopEarnerAPI[] }> => {
    const response = await api.get<{ topEarners: TopEarnerAPI[] }>(
      '/analytics/reports/top-earners',
      { params: { limit, department } }
    );
    return response.data;
  },

  exportReport: async (
    type: 'department' | 'monthly',
    format: 'excel' | 'pdf',
    year?: number
  ): Promise<Blob> => {
    const response = await api.get('/analytics/reports/export', {
      params: { type, format, year },
      responseType: 'blob',
    });
    return response.data;
  },
};

// Pharmacy API
export const pharmacyApi = {
  uploadFiles: async (files: File[]): Promise<PharmacyUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<PharmacyUploadResponse>('/pharmacy/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (
    page = 1,
    limit = 50,
    search?: string
  ): Promise<AllPharmacyRecordsResponse> => {
    const response = await api.get<AllPharmacyRecordsResponse>('/pharmacy', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getByPan: async (pan: string): Promise<PharmacyRecord> => {
    const response = await api.get<PharmacyRecord>(`/pharmacy/${pan}`);
    return response.data;
  },

  delete: async (pan: string): Promise<void> => {
    await api.delete(`/pharmacy/${pan}`);
  },
};

export default api;
