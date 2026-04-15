import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generationApi } from '../api/generation';
import { GenerateTemplateRequest } from '../types/api';

// Query keys
export const generationKeys = {
  all: ['generation-jobs'] as const,
  lists: () => [...generationKeys.all, 'list'] as const,
  list: (params: { limit?: number; offset?: number }) => [...generationKeys.lists(), params] as const,
  details: () => [...generationKeys.all, 'detail'] as const,
  detail: (id: string) => [...generationKeys.details(), id] as const,
};

// Get generation jobs list
export const useGenerationJobsQuery = (params: { limit?: number; offset?: number } = {}) => {
  return useQuery({
    queryKey: generationKeys.list(params),
    queryFn: () => generationApi.getGenerationJobs(params),
    placeholderData: (previousData) => previousData,
    retry: false,
  });
};

// Get single generation job
export const useGenerationJobQuery = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: generationKeys.detail(id),
    queryFn: () => generationApi.getGenerationJob(id),
    enabled: options?.enabled ?? !!id,
    retry: false,
  });
};

// Generate template mutation
export const useGenerateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateTemplateRequest) => 
      generationApi.generateTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: generationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};