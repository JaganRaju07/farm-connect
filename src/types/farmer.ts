// src/types/farmer.ts

/**
 * Represents a farmer/seller on the platform
 */
export interface Farmer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  
  // Location
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  
  // Farm details
  farmName?: string;
  farmSize?: number; // in acres
  farmSizeUnit?: 'acres' | 'hectares';
  primaryCrops: string[];
  isOrganicCertified: boolean;
  organicCertificationNumber?: string;
  
  // Verification
  verificationStatus: FarmerVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  
  // Documents
  documents: FarmerDocument[];
  
  // Stats
  rating: number;
  totalReviews: number;
  totalOrders: number;
  totalProducts: number;
  joinedAt: string;
  
  // Bank details (for payouts)
  bankDetails?: BankDetails;
}

/**
 * Farmer verification status
 */
export type FarmerVerificationStatus = 
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected';

/**
 * Document submitted by farmer for verification
 */
export interface FarmerDocument {
  id: string;
  type: FarmerDocumentType;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

/**
 * Types of documents required for farmer verification
 */
export type FarmerDocumentType =
  | 'aadhaar'
  | 'land_record'
  | 'farm_license'
  | 'organic_certificate'
  | 'bank_statement';

/**
 * Bank details for farmer payouts
 */
export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

/**
 * Dashboard statistics for farmers
 */
export interface FarmerDashboardStats {
  revenue: {
    total: number;
    thisWeek: number;
    percentageChange: number;
  };
  orders: {
    total: number;
    pending: number;
    newToday: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  rating: {
    average: number;
    totalReviews: number;
  };
}

/**
 * Farmer registration form data
 */
export interface FarmerRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  farmName?: string;
  farmSize?: number;
  primaryCrops: string[];
  isOrganicCertified: boolean;
}
