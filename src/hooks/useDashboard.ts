import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};