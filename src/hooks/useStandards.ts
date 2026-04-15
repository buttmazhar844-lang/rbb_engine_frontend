import { useQuery } from '@tanstack/react-query';
import { standardsApi } from '../api/standards';
import { StandardsQueryParams } from '../types/api';

export const useStandards = (params: StandardsQueryParams = {}) => {
  return useQuery({
    queryKey: ['standards', params],
    queryFn: () => standardsApi.getStandards(params),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
};