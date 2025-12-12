import { apiClient, getErrorMessage } from './client';

export type NotificationTiming = '1h' | '1d' | 'launch';

export interface SubscribeLaunchPayload {
  email: string;
  propertyId: string;
  timing?: NotificationTiming;
  locale?: string;
}

export interface SubscribeLaunchResponse {
  message: string;
}

export const launchNotificationsApi = {
  async subscribe(payload: SubscribeLaunchPayload): Promise<SubscribeLaunchResponse> {
    try {
      const response = await apiClient.post('/launch-notifications/subscribe', payload);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      // Gérer les erreurs spécifiques
      if (error.response?.status === 409) {
        throw new Error('ALREADY_SUBSCRIBED');
      }
      throw new Error(getErrorMessage(error));
    }
  },
};


