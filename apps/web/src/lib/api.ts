/**
 * API client for PolarSetu
 * Handles all communication with FastAPI backend
 */
import axios from 'axios';

let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}
const API_URL = rawUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('polar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('polar_token');
        localStorage.removeItem('polar_user');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (email: string, password: string, full_name?: string) =>
    api.post('/api/auth/register', { email, password, full_name }),
  me: () => api.get('/api/auth/me'),
};

// ─── Stats ───
export const statsApi = {
  getStats: () => api.get('/api/stats'),
};

// ─── Documents ───
export const documentsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/api/documents', { params }),
  get: (id: string) => api.get(`/api/documents/${id}`),
  upload: (formData: FormData) =>
    api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Search ───
export const searchApi = {
  search: (query: string, searchType: string = 'hybrid', filters?: Record<string, unknown>, page = 1) =>
    api.post('/api/search', { query, search_type: searchType, filters, page, page_size: 20 }),
};

// ─── AI Assistant ───
export const assistantApi = {
  query: (question: string, session_id?: string) =>
    api.post('/api/assistant/query', { question, session_id }),
  status: () => api.get('/api/assistant/status'),
};

// ─── Expeditions ───
export const expeditionsApi = {
  list: (region?: string) => api.get('/api/expeditions', { params: { region } }),
  get: (id: string) => api.get(`/api/expeditions/${id}`),
  getFeatured: () => api.get('/api/expeditions/featured'),
};

// ─── Stations ───
export const stationsApi = {
  list: (params?: Record<string, unknown>) => api.get('/api/stations', { params }),
  get: (id: string) => api.get(`/api/stations/${id}`),
  telemetry: () => api.get('/api/stations/telemetry'),
};

// ─── Datasets ───
export const datasetsApi = {
  list: (params?: Record<string, unknown>) => api.get('/api/datasets', { params }),
  get: (id: string) => api.get(`/api/datasets/${id}`),
};

// ─── Media ───
export const mediaApi = {
  list: (params?: Record<string, unknown>) => api.get('/api/media', { params }),
};

// ─── Classroom ───
export const classroomApi = {
  listTopics: () => api.get('/api/classroom/topics'),
  getTopic: (slug: string) => api.get(`/api/classroom/topics/${slug}`),
  getQuiz: (slug: string) => api.get(`/api/classroom/topics/${slug}/quiz`),
};

// ─── Content Studio ───
export const contentApi = {
  generate: (data: {
    content_type: string;
    source_document_id?: string;
    source_expedition_id?: string;
    source_dataset_id?: string;
    language?: string;
  }) => api.post('/api/content/generate', data),
  list: (params?: Record<string, unknown>) => api.get('/api/content', { params }),
  approve: (id: string, status: 'approved' | 'rejected', review_notes?: string) =>
    api.post(`/api/content/${id}/approve`, { status, review_notes }),
};

// ─── Admin / Ingestion ───
export const ingestionApi = {
  startCrawl: (url: string, config?: Record<string, unknown>, source_id?: string) =>
    api.post('/api/ingestion/crawl', { url, config, source_id }),
  listJobs: () => api.get('/api/ingestion/jobs'),
  getJob: (id: string) => api.get(`/api/ingestion/jobs/${id}`),
  getPendingResources: () => api.get('/api/ingestion/resources/pending'),
  approveResource: (doc_id: string, action: 'approve' | 'reject') =>
    api.post(`/api/ingestion/resources/${doc_id}/approve?action=${action}`),
  stopJob: (id: string) => api.post(`/api/ingestion/jobs/${id}/stop`),
};

export const adminApi = {
  getStats: () => api.get('/api/admin/stats'),
};

export const sourcesApi = {
  list: () => api.get('/api/sources'),
};
