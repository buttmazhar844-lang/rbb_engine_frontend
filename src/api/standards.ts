import { apiClient } from './client';
import { Standard, PaginatedResponse, StandardsQueryParams } from '../types/api';

export const standardsApi = {
  // Get paginated list of standards
  getStandards: async (params: StandardsQueryParams = {}): Promise<PaginatedResponse<Standard>> => {
    console.log('Fetching standards with params:', params);
    const response = await apiClient.get('/v1/standards', { params });
    console.log('Standards API response:', response.data);
    // Backend returns { data: { standards: [...], pagination: {...} } }
    // We need to transform it to { data: [...], pagination: {...} }
    if (response.data?.data?.standards) {
      return {
        data: response.data.data.standards,
        pagination: response.data.data.pagination
      };
    }
    return response.data.data;
  },

  // Get single standard by ID
  getStandard: async (id: number): Promise<Standard> => {
    const response = await apiClient.get(`/v1/standards/${id}`);
    return response.data.data;
  },
};