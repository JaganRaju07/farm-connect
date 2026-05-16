// frontend/src/types/index.ts

/**
 * Centralized type definitions for the entire application.
 * Having types in one place makes it easier to maintain consistency
 * and helps TypeScript catch errors during development.
 */

// ============ LOCATION TYPES ============

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// ============ PRODUCT TYPES ============

export interface Product {
  id: number;
  farmer_id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stock_available: number;
  minimum_order_quantity: number;
  image_url: string | null;
  is_organic: boolean;
  is_active: boolean;
  
  // Joined from farmer table
  farmer_name: string;
  farmer_phone: string;
  farmer_latitude: number;
  farmer_longitude: number;
  farmer_address: string;
  farmer_city: string;
  farmer_verified: boolean;
  
  // Calculated field - distance from consumer
  distance_km: number;
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

// ============ CART TYPES ============

export interface CartItem {
  product: Product;
  quantity: number;
}

// ============ ORDER TYPES ============

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  farmerId: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  latitude: number;
  longitude: number;
  consumerNotes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  consumer_id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  items: string; // JSON string of OrderItem[]
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_address: string;
  delivery_city: string;
  delivery_pincode: string;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_distance_km: number;
  consumer_notes: string | null;
  
  // Timestamps for tracking
  created_at: string;
  confirmed_at: string | null;
  packed_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';
