import { api } from './axios';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CreateProductRequest {
  title: string;
  price: number;
  brand: string;
  category: string;
  rating?: number;
  stock?: number;
}

export const productsApi = {
  getProducts: async (params: {
    limit?: number;
    skip?: number;
    q?: string;
  }): Promise<ProductsResponse> => {
    const { limit = 20, skip = 0, q } = params;

    if (q) {
      const response = await api.get<ProductsResponse>('/products/search', {
        params: { q, limit, skip },
      });
      return response.data;
    }

    const response = await api.get<ProductsResponse>('/products', {
      params: { limit, skip },
    });
    return response.data;
  },

  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products/add', product);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<{ isDeleted: boolean; id: number }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
