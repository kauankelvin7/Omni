import api from './api';
import { Patient } from './patient';

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED';

export interface Appointment {
  id: string;
  patient: Patient;
  appointmentDate: string;
  status: AppointmentStatus;
}

export interface AppointmentPayload {
  patient: { id: string };
  appointmentDate: string;
  status?: AppointmentStatus;
}

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  getByPatient: async (patientId: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments/patient/${patientId}`);
    return response.data;
  },

  create: async (payload: AppointmentPayload): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', payload);
    return response.data;
  },

  updateStatus: async (id: string, status: AppointmentStatus): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, { status });
    return response.data;
  },
};
