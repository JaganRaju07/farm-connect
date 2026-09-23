// frontend/src/lib/api/products.ts

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Product {
  id: number;
  farmerId: number;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stockAvailable: number;
  minimumOrderQuantity: number;
  imageUrl: string | null;
  isOrganic: boolean;
  isActive: boolean;
  farmerName: string;
  farmerCity: string;
  farmerLat: string;
  farmerLon: string;
  distance_km: number;
  rating?: number;
  reviews_count?: number;
  harvestDate?: string;
  createdAt: string;
}

export interface ProductFilters {
  latitude: number;
  longitude: number;
  radius?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
}

export async function getProducts(filters: ProductFilters): Promise<Product[]> {
  const response = await axios.get(`${API_BASE}/products`, {
    params: {
      lat: filters.latitude,
      lon: filters.longitude,
      radius: filters.radius || 10,
      category: filters.category || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      isOrganic: filters.isOrganic,
    },
  });
  return response.data.data.products;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await axios.get(`${API_BASE}/products/${id}`);
  return response.data.data.product;
}

export function getCategories(): string[] {
  return ['vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'other'];
}
