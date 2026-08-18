// src/types/order.ts

/**
 * Represents an order in the system
 */
export interface Order {
  id: string;
  orderNumber: string;
  
  // Customer info
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Order items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  
  // Status
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  
  // Delivery
  deliveryAddress: DeliveryAddress;
  deliveryInstructions?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  
  // Delivery partner
  deliveryPartner?: DeliveryPartner;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

/**
 * Individual item in an order
 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  farmerId: string;
  farmerName: string;
  farmerCity: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  isOrganic: boolean;
}

/**
 * Order status options
 */
export type OrderStatus =
  | 'pending'      // Order placed, awaiting farmer confirmation
  | 'confirmed'    // Farmer confirmed the order
  | 'processing'   // Order is being prepared
  | 'shipped'      // Order has been dispatched
  | 'out_for_delivery' // With delivery partner
  | 'delivered'    // Successfully delivered
  | 'cancelled'    // Order cancelled
  | 'refunded';    // Refund processed

/**
 * Order status change history entry
 */
export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

/**
 * Delivery address for an order
 */
export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

/**
 * Delivery partner information
 */
export interface DeliveryPartner {
  name: string;
  phone: string;
  trackingId?: string;
  vehicleNumber?: string;
}

/**
 * Timeline event for order tracking display
 */
export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}
