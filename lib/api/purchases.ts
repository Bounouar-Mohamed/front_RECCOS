import { apiClient } from './client';

export interface CreatePurchaseParams {
  email: string;
  propertyId: string;
  shares: number;
  totalAmount: number;
  currency?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyImage?: string;
  locale?: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId: string;
}

// Backend wraps response in { data, statusCode, message }
interface BackendResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export const purchasesApi = {
  async create(params: CreatePurchaseParams): Promise<PurchaseResult> {
    const response = await apiClient.post<BackendResponse<PurchaseResult>>('/purchases', params);
    // Extract nested data from backend response wrapper
    const result = response.data?.data ?? response.data;
    return result as PurchaseResult;
  },
};

