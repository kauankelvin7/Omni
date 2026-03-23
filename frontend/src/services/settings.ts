import api from './api';

export interface ClinicSettings {
  id?: string;
  name: string;
  email: string;
  phone: string;
  openTime: string;
  closeTime: string;
  workDays: string[];
}

export const settingsService = {
  getSettings: async (): Promise<ClinicSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings: ClinicSettings): Promise<ClinicSettings> => {
    const response = await api.put('/settings', settings);
    return response.data;
  },
};
