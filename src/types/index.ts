// src/types/index.ts

export * from './product';
export * from './farmer';
export * from './order';
export * from './user';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
