import { apiClient } from './client';
import { Product, ProductDetail, PaginatedResponse, ProductsQueryParams } from '../types/api';

export const productsApi = {
  // Get paginated list of products
  getProducts: async (params: ProductsQueryParams = {}): Promise<PaginatedResponse<Product>> => {
    const { limit, offset, ...filters } = params;
    
    // Remove empty string values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    
    const response = await apiClient.get('/products', { 
      params: { ...cleanFilters, limit, offset } 
    });
    return {
      data: response.data.data.products,
      pagination: response.data.data.pagination
    };
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ProductDetail> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  // Update product status
  updateProductStatus: async (id: string, status: Product['status']): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}/status`, { status });
    return response.data.data;
  },

  // Delete a product
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Download product ZIP
  downloadProduct: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/products/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};