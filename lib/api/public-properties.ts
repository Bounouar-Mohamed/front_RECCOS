import { apiClient, getErrorMessage } from './client';
import type {
  PaginatedPropertyResponse,
  PropertyListParams,
} from './properties';

function unwrapPublicPaginatedResponse(payload: any): PaginatedPropertyResponse {
  if (!payload) {
    return { properties: [], total: 0, page: 1, limit: 20 };
  }

  const normalized = payload?.data ?? payload;

  if (Array.isArray(normalized.properties)) {
    return {
      properties: normalized.properties,
      total: Number((normalized.total ?? normalized.properties.length) ?? 0),
      page: Number(normalized.page ?? 1),
      limit: Number((normalized.limit ?? normalized.properties.length) ?? 20),
    };
  }

  if (Array.isArray(normalized.data)) {
    return {
      properties: normalized.data,
      total: Number((normalized.total ?? normalized.data.length) ?? 0),
      page: Number(normalized.page ?? 1),
      limit: Number((normalized.limit ?? normalized.data.length) ?? 20),
    };
  }

  return {
    properties: [],
    total: 0,
    page: 1,
    limit: 20,
  };
}

export const publicPropertiesApi = {
  async list(params?: PropertyListParams): Promise<PaginatedPropertyResponse> {
    try {
      const response = await apiClient.get('/properties/public', {
        params,
        requiresAuth: false,
        skipAuthRedirect: true,
      });
      return unwrapPublicPaginatedResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

