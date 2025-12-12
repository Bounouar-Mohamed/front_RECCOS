import { apiClient, getErrorMessage } from './client';
import type { User } from './auth';

export interface AdminUser
  extends Pick<
    User,
    'id' | 'email' | 'firstName' | 'lastName' | 'username' | 'role' | 'emailVerified' | 'isActive'
  > {
  createdAt?: string;
}

export const adminService = {
  async listUsers(): Promise<AdminUser[]> {
    try {
      const response = await apiClient.get<any>('/admin/users');
      const wrapped = response.data as any;
      const data = wrapped?.data ?? wrapped;
      return data as AdminUser[];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateUserRole(id: string, role: string): Promise<AdminUser> {
    try {
      const response = await apiClient.patch<any>(`/admin/users/${id}/role`, { role });
      const wrapped = response.data as any;
      const data = wrapped?.data ?? wrapped;
      return data as AdminUser;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
    try {
      const response = await apiClient.patch<any>(`/admin/users/${id}/status`, {
        isActive,
      });
      const wrapped = response.data as any;
      const data = wrapped?.data ?? wrapped;
      return data as AdminUser;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};


