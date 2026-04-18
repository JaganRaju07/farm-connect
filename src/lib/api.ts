// src/lib/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios';

// API base URL - will be configured from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '[localhost](http://localhost:8000/api)';

/**
 * Configured Axios instance for API calls
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (will be replaced with proper auth)
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

/**
 * API helper functions (to be used after backend integration)
 */
export const productApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const farmerApi = {
  getDashboard: () => api.get('/farmer/dashboard'),
  getOrders: (params?: Record<string, unknown>) => api.get('/farmer/orders', { params }),
  updateOrderStatus: (orderId: string, status: string) => 
    api.patch(`/farmer/orders/${orderId}/status`, { status }),
  getProducts: () => api.get('/farmer/products'),
};

export const orderApi = {
  create: (data: unknown) => api.post('/orders', data),
  getById: (id: string) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my-orders'),
  cancel: (id: string, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (data: unknown) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};
