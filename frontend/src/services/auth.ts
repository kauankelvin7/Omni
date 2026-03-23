import api from './api';

export interface AuthRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}

export const authService = {
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
};
