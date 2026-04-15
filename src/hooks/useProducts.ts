import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { ProductsQueryParams } from '../types/api';

export const useProducts = (params: ProductsQueryParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};