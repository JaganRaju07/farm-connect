// src/types/user.ts

/**
 * Base user type
 */
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User roles in the system
 */
export type UserRole = 'consumer' | 'farmer' | 'admin';

/**
 * Authentication response from login/register
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Consumer registration data
 */
export interface ConsumerRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Saved address for a user
 */
export interface SavedAddress {
  id: string;
  userId: string;
  label: string; // e.g., "Home", "Office"
  isDefault: boolean;
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
