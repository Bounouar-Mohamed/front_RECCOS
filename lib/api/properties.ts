/**
 * API service for properties
 * This file provides methods to interact with the properties API endpoints
 */

import { apiClient } from './client';

export interface Property {
  id: string;
  name: string;
  description?: string;
  address?: string;
  price?: number;
  images?: string[];
  [key: string]: any;
}

export interface PropertiesResponse {
  data: Property[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Get all properties
 */
export async function getProperties(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PropertiesResponse> {
  try {
    const response = await apiClient.get<PropertiesResponse>('/properties', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('[propertiesService] Error fetching properties:', error);
    throw error;
  }
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string): Promise<Property> {
  try {
    const response = await apiClient.get<Property>(`/properties/${id}`);
    return response.data;
  } catch (error) {
    console.error('[propertiesService] Error fetching property:', error);
    throw error;
  }
}




