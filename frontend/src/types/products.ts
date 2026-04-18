// src/types/product.ts

/**
 * Represents a product listing in the marketplace
 */
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  unit: ProductUnit;
  stockAvailable: number;
  minimumOrderQuantity: number;
  imageUrl: string;
  images?: string[]; // Additional product images
  isOrganic: boolean;
  isActive: boolean;
  farmerId: string;
  farmerName: string;
  farmerCity: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Product categories available in the marketplace
 */
export type ProductCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'spices'
  | 'pulses'
  | 'other';

/**
 * Units of measurement for products
 */
export type ProductUnit = 'kg' | 'g' | 'L' | 'ml' | 'piece' | 'bunch' | 'dozen';

/**
 * Filter options for marketplace search
 */
export interface ProductFilter {
  city?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  inStockOnly?: boolean;
  search?: string;
  sortBy?: ProductSortOption;
  page?: number;
  limit?: number;
}

/**
 * Sort options for product listings
 */
export type ProductSortOption =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'rating'
  | 'popularity';

/**
 * Response format for paginated product listings
 */
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Product form data for creating/updating products
 */
export interface ProductFormData {
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  unit: ProductUnit;
  stockAvailable: number;
  minimumOrderQuantity: number;
  isOrganic: boolean;
  images?: File[];
}
