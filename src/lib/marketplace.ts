/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './api';

// Types for Browse Marketplace
export interface MarketplaceInvoice {
  invoiceId: string;
  amount: number;
  currency: string;
  issueDate?: string;
  dueDate?: string;
  daysUntilDue: number;
  description: string;
  seller: {
    name: string;
    email: string;
  };
  anchor: {
    name: string;
    email?: string;
  };
  fundingTerms: {
    maxFundingAmount: number;
    recommendedInterestRate: number;
    maxTenure: number;
  };
  marketplace: {
    listedAt: string;
    offerCount: number;
    bestCompetitiveRate: number;
    hasMyOffer: boolean;
  };
}

export interface BrowseFilters {
  page?: number;
  limit?: number;
  minAmount?: number;
  maxAmount?: number;
  minDaysUntilDue?: number;
  maxDaysUntilDue?: number;
  anchorId?: string;
  sortBy?: "createdAt" | "interestRate" | "amount" | "expiresAt" | "effectiveAnnualRate";
  sortOrder?: "asc" | "desc";
}

export interface MarketplaceBrowseResponse {
  success: boolean;
  message: string;
  data: {
    invoices: MarketplaceInvoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalInvoices: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Helper to build query string
const buildQueryString = (params: Record<string, any>): string => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  
  return filteredParams.length > 0 ? `?${filteredParams.join('&')}` : '';
};

export const marketplaceAPI = {
  // Browse marketplace (Lender only)
  browseMarketplace: (accessToken: string, filters: BrowseFilters = {}): Promise<MarketplaceBrowseResponse> => {
    const queryString = buildQueryString(filters);
    return apiClient.get(`/marketplace/browse${queryString}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  },
};

// Utility functions
export const formatCurrency = (amount: number, currency = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};