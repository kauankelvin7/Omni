import api from './api';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  telegramChatId?: number;
}

export interface PatientPayload {
  name: string;
  phone: string;
  email?: string;
}

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  create: async (payload: PatientPayload): Promise<Patient> => {
    const response = await api.post<Patient>('/patients', payload);
    return response.data;
  },

  update: async (id: string, payload: PatientPayload): Promise<Patient> => {
    const response = await api.put<Patient>(`/patients/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};
