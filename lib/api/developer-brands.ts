import { apiClient, getErrorMessage } from './client';

export interface DeveloperBrand {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface CreateDeveloperBrandPayload {
  name: string;
  logoUrl?: string | null;
}

export interface UpdateDeveloperBrandPayload {
  name?: string;
  logoUrl?: string | null;
}

function unwrap<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

export const developerBrandsApi = {
  async list(): Promise<DeveloperBrand[]> {
    try {
      const response = await apiClient.get('/developer-brands');
      return unwrap<DeveloperBrand[]>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(payload: CreateDeveloperBrandPayload): Promise<DeveloperBrand> {
    try {
      const response = await apiClient.post('/developer-brands', payload);
      return unwrap<DeveloperBrand>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id: string, payload: UpdateDeveloperBrandPayload): Promise<DeveloperBrand> {
    try {
      const response = await apiClient.patch(`/developer-brands/${id}`, payload);
      return unwrap<DeveloperBrand>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};


