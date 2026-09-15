// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Indian Rupees
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-IN', options || defaultOptions);
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get relative time string for harvest date
 */
export function getRelativeHarvestDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const harvest = new Date(date);
  harvest.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - harvest.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null; // Invalid if harvested in the future
  if (diffDays === 0) return 'Harvested today';
  if (diffDays === 1) return 'Harvested yesterday';
  return `Harvested ${diffDays} days ago`;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate placeholder image URL
 */
export function getPlaceholderImage(
  type: 'product' | 'farmer' | 'category'
): string {
  const placeholders = {
    product: '/images/placeholder-product.jpg',
    farmer: '/images/placeholder-farmer.jpg',
    category: '/images/placeholder-category.jpg',
  };
  return placeholders[type];
}

/**
 * Get order status color and label
 */
export function getOrderStatusInfo(status: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    confirmed: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    processing: { label: 'Processing', color: 'text-purple-700', bgColor: 'bg-purple-100' },
    shipped: { label: 'Shipped', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
    delivered: { label: 'Delivered', color: 'text-success-700', bgColor: 'bg-success-100' },
    cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
    refunded: { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  };
  
  return statusMap[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
}
