import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

// Request interceptor to add the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Auto-refresh mechanism
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = localStorage.getItem('jwt_token');
        if (token) {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { token });
          if (res.data.token) {
            localStorage.setItem('jwt_token', res.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Fallthrough below
      }
      
      // Se falhar o refresh ou não tiver token original
      localStorage.removeItem('jwt_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    if (error.code === 'ERR_NETWORK' || !error.response) {
      window.dispatchEvent(new Event('api-offline'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
