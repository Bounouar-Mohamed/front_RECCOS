import { apiClient, getErrorMessage } from './client';

export type PropertyStatus =
  | 'draft'
  | 'pending'
  | 'upcoming'
  | 'published'
  | 'sold'
  | 'rejected'
  | 'archived';

export interface PropertyRecord {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  emirate: string;
  zone: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pricePerShare: number;
  totalShares: number;
  soldShares: number;
  totalArea: number;
  builtArea?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  features?: string[] | null;
  images?: string[] | null;
  mainImage?: string | null;
  documents?: string[] | null;
  yearBuilt?: number | null;
  status: PropertyStatus;
  publishedAt?: string | null;
  availableAt?: string | null;
  rejectionReason?: string | null;
  rentalYield?: number | null;
  expectedROI?: number | null;
  monthlyRental?: number | null;
  metadata?: Record<string, any> | null;
  developer?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  developerBrand?: {
    id: string | null;
    name: string;
    logoUrl?: string | null;
  } | null;
  publishedBy?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  listingType?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedPropertyResponse {
  properties: PropertyRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface PropertyStats {
  total: number;
  byStatus: Record<string, number>;
  byEmirate: Record<string, number>;
}

export interface PropertyListParams {
  page?: number;
  limit?: number;
  status?: string;
  propertyType?: string;
  emirate?: string;
  search?: string;
  locale?: string;
}

export type PropertyPayload = {
  title: string;
  description: string;
  propertyType: string;
  emirate: string;
  zone: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  pricePerShare: number;
  totalShares: number;
  totalArea: number;
  brandDeveloperId?: string;
  [key: string]: any;
};

export type UpdatePropertyPayload = Partial<PropertyPayload> & {
  status?: PropertyStatus;
  metadata?: Record<string, any>;
};

function unwrapPaginatedResponse(payload: any): PaginatedPropertyResponse {
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

function unwrapEntity<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

export const propertiesApi = {
  async list(params?: PropertyListParams): Promise<PaginatedPropertyResponse> {
    try {
      const response = await apiClient.get('/properties', { params });
      return unwrapPaginatedResponse(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async get(id: string): Promise<PropertyRecord> {
    try {
      const response = await apiClient.get(`/properties/${id}`);
      return unwrapEntity<PropertyRecord>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(payload: PropertyPayload): Promise<PropertyRecord> {
    try {
      const response = await apiClient.post('/properties', payload);
      return unwrapEntity<PropertyRecord>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id: string, payload: UpdatePropertyPayload): Promise<PropertyRecord> {
    try {
      const response = await apiClient.patch(`/properties/${id}`, payload);
      return unwrapEntity<PropertyRecord>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async publish(id: string, notes?: string): Promise<PropertyRecord> {
    try {
      const response = await apiClient.post(`/properties/${id}/publish`, { notes });
      return unwrapEntity<PropertyRecord>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async reject(id: string, reason: string): Promise<PropertyRecord> {
    try {
      const response = await apiClient.post(`/properties/${id}/reject`, { reason });
      return unwrapEntity<PropertyRecord>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/properties/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async stats(): Promise<PropertyStats> {
    try {
      const response = await apiClient.get('/properties/admin/stats');
      return unwrapEntity<PropertyStats>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export async function getProperties(params?: PropertyListParams): Promise<PaginatedPropertyResponse> {
  return propertiesApi.list(params);
}

export async function getPropertyById(id: string): Promise<PropertyRecord> {
  return propertiesApi.get(id);
}




