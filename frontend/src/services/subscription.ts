import api from './api';

export interface Subscription {
  id: string;
  planName: string;
  status: string;
  price: number;
  trialEndsAt: string;
  currentPeriodEnd: string;
}

export const subscriptionService = {
  getMe: async (): Promise<Subscription> => {
    const response = await api.get<Subscription>('/subscription/me');
    return response.data;
  },
};
