import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vcm_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    if (res.data.token) {
      localStorage.setItem('vcm_token', res.data.token);
    }
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    if (res.data.token) {
      localStorage.setItem('vcm_token', res.data.token);
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },
  updateHandles: async (handles) => {
    const res = await api.patch('/auth/me/', handles);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('vcm_token');
  }
};

export const contestApi = {
  createContest: async (payload) => {
    const res = await api.post('/contests/create/', payload);
    return res.data;
  },
  getContest: async (id) => {
    const res = await api.get(`/contests/${id}/`);
    return res.data;
  },
  getParticipation: async (participationId) => {
    const res = await api.get(`/contests/participations/${participationId}/`);
    return res.data;
  },
  syncSubmissions: async (participationId) => {
    const res = await api.post(`/contests/participations/${participationId}/sync/`);
    return res.data;
  },
  finishContest: async (participationId) => {
    const res = await api.post(`/contests/participations/${participationId}/finish/`);
    return res.data;
  },
  manualMarkSolved: async (participationId, contestProblemId) => {
    const res = await api.post(`/contests/participations/${participationId}/manual-mark/`, {
      contest_problem_id: contestProblemId,
    });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/contests/history/');
    return res.data;
  }
};

export const problemApi = {
  getProblems: async (params = {}) => {
    const res = await api.get('/problems/', { params });
    return res.data;
  },
  convertRating: async (platform, original_rating) => {
    const res = await api.post('/problems/convert-rating/', { platform, original_rating });
    return res.data;
  }
};

export default api;
