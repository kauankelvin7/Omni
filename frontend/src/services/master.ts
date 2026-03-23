import axios from 'axios';

const masterApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/master`,
});

masterApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('master_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

masterApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('master_token');
      window.location.href = '/master/login';
    }
    return Promise.reject(error);
  }
);

export const masterAuth = {
  login: (email: string, password: string) =>
    masterApi.post('/auth/login', { email, password }),
};

export const masterDashboard = {
  getMetrics: () => masterApi.get('/dashboard'),
  getTenants: (params?: object) => masterApi.get('/tenants', { params }),
  getTenant: (id: string) => masterApi.get(`/tenants/${id}`),
  updateStatus: (id: string, status: string) =>
    masterApi.put(`/tenants/${id}/status`, { status }),
  getRevenue: () => masterApi.get('/revenue'),
  getSubscriptions: () => masterApi.get('/subscriptions'),
};

export default masterApi;
