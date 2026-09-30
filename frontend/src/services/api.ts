import axios, { AxiosError } from 'axios';

// ─── Simple 30-second request cache for GET requests ──────────────────────────
interface CacheEntry { data: unknown; expiresAt: number; }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30 seconds
let lastAccessToken = localStorage.getItem('jwt_token');
const cacheablePaths = ['/patients', '/appointments'];

const readAccessToken = (): string | null => {
  const token = localStorage.getItem('jwt_token');
  if (lastAccessToken !== token) {
    cache.clear();
    lastAccessToken = token;
  }
  return token;
};

export const invalidateCache = (pattern?: string) => {
  if (!pattern) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
};

const getCached = (url: string): unknown | null => {
  const entry = cache.get(url);
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  cache.delete(url);
  return null;
};

// ─── Loading event bus (used by LoadingContext) ────────────────────────────────
export const loadingBus = {
  listeners: new Set<(delta: number) => void>(),
  emit(delta: number) { this.listeners.forEach((fn) => fn(delta)); },
};

// ─── Friendly error messages per status code ───────────────────────────────────
const friendlyMessage: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Acesso negado. Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Este registro já existe.',
  422: 'Dados inválidos. Verifique os campos e tente novamente.',
  429: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
  502: 'Serviço temporariamente indisponível.',
  503: 'Serviço temporariamente indisponível. Tente em instantes.',
};

// ─── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30_000,
});

// Request interceptor — inject JWT + loading + cache hit
api.interceptors.request.use((config) => {
  const token = readAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Cache check for safe methods
  if (config.method === 'get' && config.url && token &&
      cacheablePaths.some((p) => config.url === p || config.url?.startsWith(p + '/'))) {
    const cached = getCached(token + ':' + config.url);
    if (cached !== null) {
      // axios-cache-hit: abort the real request and return cached data
      config.adapter = () =>
        Promise.resolve({ data: cached, status: 200, statusText: 'OK (cached)', headers: {}, config, request: {} });
    }
  }

  // Invalidate cache on mutations
  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    if (config.url) {
      const base = config.url.split('/')[1];
      invalidateCache(base);
    }
  }

  loadingBus.emit(1);
  return config;
});

// Response interceptor — save cache + loading + error handling
api.interceptors.response.use(
  (response) => {
    loadingBus.emit(-1);

    // Cache successful GET responses for cacheable paths
    const url = response.config.url;
    const method = response.config.method;
    const token = readAccessToken();
    if (method === 'get' && url && token &&
        cacheablePaths.some((p) => url === p || url.startsWith(p + '/')) &&
        response.config.headers?.Authorization === `Bearer ${token}`) {
      cache.set(token + ':' + url, { data: response.data, expiresAt: Date.now() + CACHE_TTL });
    }

    return response;
  },
  async (error: AxiosError) => {
    loadingBus.emit(-1);

    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const status = error.response?.status;

    // Only a dedicated, signed and unexpired refresh token can extend a session.
    // Requests to public endpoints must not redirect away during registration/login.
    const isProtected = originalRequest &&
      !['/auth/login', '/auth/refresh', '/tenants/register'].includes(originalRequest.url ?? '');
    if (status === 401 && originalRequest && !originalRequest._retry && isProtected) {
      originalRequest._retry = true;
      try {
        const refreshToken = sessionStorage.getItem('jwt_refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
          if (res.data.token && res.data.refreshToken) {
            localStorage.setItem('jwt_token', res.data.token);
            sessionStorage.setItem('jwt_refresh_token', res.data.refreshToken);
            invalidateCache();
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        }
      } catch {
        // Expired/revoked refresh credentials require reauthentication.
      }
      localStorage.removeItem('jwt_token');
      sessionStorage.removeItem('jwt_refresh_token');
      invalidateCache();
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 403 — clear token only if it looks like a bad token (not just permission)
    if (status === 403) {
      const msg = (error.response?.data as { message?: string })?.message;
      if (!msg || msg.toLowerCase().includes('token')) {
        localStorage.removeItem('jwt_token');
        sessionStorage.removeItem('jwt_refresh_token');
        invalidateCache();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // No connection
    if (error.code === 'ERR_NETWORK' || !error.response) {
      window.dispatchEvent(new Event('api-offline'));
      const offline = Object.assign(new Error('Verifique sua conexão com a internet.'), {
        _friendly: true,
        message: 'Verifique sua conexão com a internet.',
      });
      return Promise.reject(offline);
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      const timeout = Object.assign(new Error('A requisição demorou muito. Tente novamente.'), {
        _friendly: true,
        message: 'A requisição demorou muito. Tente novamente.',
      });
      return Promise.reject(timeout);
    }

    // Attach friendly message to the error for components to display
    const serverMsg = (error.response?.data as { message?: string })?.message;
    const friendly = serverMsg || (status ? friendlyMessage[status] : undefined) || 'Erro inesperado. Tente novamente.';
    (error as AxiosError & { _friendly?: boolean; _friendlyMessage?: string })._friendly = true;
    (error as AxiosError & { _friendly?: boolean; _friendlyMessage?: string })._friendlyMessage = friendly;

    return Promise.reject(error);
  }
);

export default api;
