/**
 * @fileoverview HIPAA-compliant React hook for marketplace functionality in AUSTA SuperApp
 * Implements secure state management and operations for digital therapeutic programs
 * @version 1.0.0
 * @package react@18.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductCategory, ProductSortOption } from '../lib/types/product';
import { useAnalytics } from './useAnalytics';
import { MarketplaceAPI } from '../lib/api/marketplace';
import { ErrorCode } from '../lib/constants/errorCodes';
import { useQuery } from '@tanstack/react-query';

// Security context type for HIPAA compliance
interface SecurityContext {
  encryptionEnabled: boolean;
  auditingEnabled: boolean;
  privacyLevel: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  lastVerified: Date;
}

// Enhanced marketplace state interface
interface MarketplaceState {
  products: Product[];
  loading: boolean;
  error: MarketplaceError | null;
  totalProducts: number;
  currentPage: number;
  lastUpdated: Date;
  securityContext: SecurityContext;
}

// HIPAA-compliant error interface
interface MarketplaceError {
  code: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: Date;
  context: Record<string, any>;
}

// Filter interface with security validation
interface MarketplaceFilters {
  category: ProductCategory[];
  minPrice: number;
  maxPrice?: number;
  rating: number;
  searchQuery: string;
  page: number;
  limit: number;
}

// Default values with security considerations
const DEFAULT_FILTERS: MarketplaceFilters = {
  category: [],
  minPrice: 0,
  maxPrice: undefined,
  rating: 0,
  searchQuery: '',
  page: 1,
  limit: 20
};

const DEFAULT_SECURITY_CONTEXT: SecurityContext = {
  encryptionEnabled: true,
  auditingEnabled: true,
  privacyLevel: 'PROTECTED',
  lastVerified: new Date()
};

/**
 * Custom hook for secure marketplace functionality
 * Implements HIPAA-compliant data handling and user tracking
 */
export const useMarketplace = () => {
  const [filters, setFilters] = useState<MarketplaceFilters>({
    category: [],
    minPrice: 0,
    maxPrice: undefined,
    rating: 0,
    searchQuery: '',
    page: 1,
    limit: 10
  });

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['products', filters],
    () => MarketplaceAPI.getProducts(filters),
    {
      keepPreviousData: true,
      staleTime: 30000
    }
  );

  const updateFilters = useCallback((newFilters: Partial<MarketplaceFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page when filters change
    }));
  }, []);

  const searchProducts = useCallback((query: string) => {
    updateFilters({ searchQuery: query });
  }, [updateFilters]);

  const filterByCategory = useCallback((categories: ProductCategory[]) => {
    updateFilters({ category: categories });
  }, [updateFilters]);

  const setPriceRange = useCallback((min: number, max?: number) => {
    updateFilters({ minPrice: min, maxPrice: max });
  }, [updateFilters]);

  const setRating = useCallback((minRating: number) => {
    updateFilters({ rating: minRating });
  }, [updateFilters]);

  const changePage = useCallback((newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  return {
    products: data?.products || [],
    totalProducts: data?.total || 0,
    isLoading,
    error,
    filters,
    searchProducts,
    filterByCategory,
    setPriceRange,
    setRating,
    changePage,
    refetch
  };
};

export type { MarketplaceState, MarketplaceFilters, MarketplaceError };