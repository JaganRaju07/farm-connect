// frontend/src/lib/api/orders.ts

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  farmerId: number;
}

export interface PlaceOrderData {
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
  consumer_name?: string;
  farmer_id: number;
  farmer_name: string;
  farmer_phone: string;
  items: string; // JSON string
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_distance_km: number;
  delivery_address: string;
  delivery_city: string;
  delivery_pincode: string;
  delivery_latitude: number;
  delivery_longitude: number;
  order_status: string;
  payment_status: string;
  consumer_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  packed_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
}

export async function placeOrder(data: PlaceOrderData): Promise<Order> {
  const response = await axios.post(`${API_BASE}/orders`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('farmconnect_token')}`,
    },
  });
  return response.data.data.order;
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await axios.get(`${API_BASE}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('farmconnect_token')}`,
    },
  });
  return response.data.data.order;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await axios.get(`${API_BASE}/orders/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('farmconnect_token')}`,
    },
  });
  return response.data.data.orders;
}
