import { apiClient, getErrorMessage } from './client';
import type { User } from '../types/user';

export interface UpdateProfilePayload {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bankAccountHolder?: string | null;
  bankName?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
  payoutMethod?: string | null;
}

interface AvatarUploadResponse {
  avatarUrl: string;
  user: User;
}

const unwrap = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  return payload as T;
};

export const userService = {
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get('/users/profile');
      return unwrap<User>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    try {
      const response = await apiClient.put('/users/profile', payload);
      return unwrap<User>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return unwrap<AvatarUploadResponse>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
