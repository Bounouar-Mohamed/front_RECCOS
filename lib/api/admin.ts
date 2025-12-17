import { apiClient, getErrorMessage } from './client';
import type { User } from './auth';
import type { AxiosError } from 'axios';

export type AdminUser = User & {
  lastLoginAt?: string | null;
};

export interface UserInvestmentInsight {
  propertyId: string;
  propertyTitle: string;
  amount: number;
  shares?: number | null;
  status?: string | null;
  investedAt?: string | null;
}

export interface UserActionInsight {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface UserInsights {
  stats: {
    totalInvestments: number;
    investedAmount: number;
    propertiesCount: number;
    averageTicket?: number | null;
    sessionsCount?: number | null;
    lastLoginAt?: string | null;
  };
  investments: UserInvestmentInsight[];
  activity: UserActionInsight[];
  placeholder?: boolean;
}

const emptyUserInsights: UserInsights = {
  stats: {
    totalInvestments: 0,
    investedAmount: 0,
    propertiesCount: 0,
    averageTicket: 0,
    sessionsCount: 0,
    lastLoginAt: null,
  },
  investments: [],
  activity: [],
  placeholder: true,
};

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

  async getUserInsights(id: string): Promise<UserInsights> {
    try {
      const response = await apiClient.get<any>(`/admin/users/${id}/insights`);
      const wrapped = response.data as any;
      const data = wrapped?.data ?? wrapped;
      return data as UserInsights;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        return emptyUserInsights;
      }
      throw new Error(getErrorMessage(error));
    }
  },
};


