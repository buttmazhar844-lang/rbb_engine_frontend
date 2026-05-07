import { apiClient } from './client';
import { GenerationJob, GenerateTemplateRequest, GenerateTemplateResponse, PaginatedResponse, BundleContext } from '../types/api';

export const generationApi = {
  generateTemplate: async (data: GenerateTemplateRequest): Promise<GenerateTemplateResponse> => {
    const response = await apiClient.post('/generate-template', data);
    return response.data;
  },

  getGenerationJobs: async (params: { limit?: number; offset?: number } = {}): Promise<PaginatedResponse<GenerationJob>> => {
    const response = await apiClient.get('/v1/generation-jobs', { params });
    return {
      data: response.data.data.jobs,
      pagination: response.data.data.pagination
    };
  },

  getGenerationJob: async (id: string): Promise<GenerationJob> => {
    const response = await apiClient.get(`/v1/generation-jobs/${id}`);
    return response.data.data || response.data;
  },

  getBundleContext: async (standardId: number): Promise<BundleContext | null> => {
    const response = await apiClient.get(`/v1/bundle-context/${standardId}`);
    return response.data.data || null;
  },
};