/**
 * @fileoverview Mock implementation of the Marketplace API for development
 */

import { Product, ProductCategory, ProductSortOption, ProductStatus } from '../types/product';

// Mock data for marketplace products
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Digital Therapy Program - Stress Management',
    description: 'A comprehensive digital therapy program designed to help manage stress and anxiety through evidence-based techniques.',
    category: ProductCategory.DIGITAL_THERAPY,
    price: 9900, // $99.00
    providerId: 'provider-123',
    images: ['/images/products/stress-management.jpg'],
    details: {
      duration: 60,
      format: 'Self-paced digital program',
      prerequisites: [],
      outcomes: ['Reduced stress levels', 'Better coping mechanisms', 'Improved mental well-being'],
      sessionCount: 12,
      deliveryMethod: 'Web',
      languages: ['English'],
      certifications: ['HIPAA Compliant', 'FDA Registered']
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    status: ProductStatus.ACTIVE,
    tags: ['stress', 'anxiety', 'mental health', 'digital therapy'],
    rating: 4.5,
    reviewCount: 128,
    insuranceCovered: true,
    badges: ['Best Seller', 'Insurance Covered']
  },
  {
    id: 'prod-002',
    name: 'Wellness Program - Sleep Improvement',
    description: 'A holistic wellness program focused on improving sleep quality through behavioral changes and relaxation techniques.',
    category: ProductCategory.WELLNESS_PROGRAM,
    price: 7900, // $79.00
    providerId: 'provider-456',
    images: ['/images/products/sleep-improvement.jpg'],
    details: {
      duration: 45,
      format: 'Guided program with weekly sessions',
      prerequisites: [],
      outcomes: ['Better sleep quality', 'Reduced insomnia', 'Improved daily energy'],
      sessionCount: 8,
      deliveryMethod: 'Mobile',
      languages: ['English', 'Spanish'],
      certifications: ['Sleep Science Certified']
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    status: ProductStatus.ACTIVE,
    tags: ['sleep', 'wellness', 'relaxation'],
    rating: 4.8,
    reviewCount: 89,
    insuranceCovered: false,
    badges: ['Top Rated']
  },
  {
    id: 'prod-003',
    name: 'Provider Consultation - Mental Health',
    description: 'Virtual consultation with licensed mental health professionals for personalized care and support.',
    category: ProductCategory.PROVIDER_SERVICE,
    price: 15000, // $150.00
    providerId: 'provider-789',
    images: ['/images/products/mental-health-consultation.jpg'],
    details: {
      duration: 50,
      format: 'One-on-one video consultation',
      prerequisites: ['Initial assessment form'],
      outcomes: ['Personalized treatment plan', 'Professional mental health assessment'],
      sessionCount: 1,
      deliveryMethod: 'Video',
      languages: ['English'],
      certifications: ['Licensed Therapist', 'Telehealth Certified']
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    status: ProductStatus.ACTIVE,
    tags: ['mental health', 'therapy', 'consultation'],
    rating: 4.9,
    reviewCount: 45,
    insuranceCovered: true,
    badges: ['Insurance Covered', 'Expert Provider']
  }
];

interface GetProductsParams {
  category: ProductCategory[];
  minPrice: number;
  maxPrice?: number;
  rating: number;
  searchQuery: string;
  page: number;
  limit: number;
}

interface GetProductsResponse {
  products: Product[];
  total: number;
}

interface PurchaseResponse {
  transactionId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: Date;
}

export const MarketplaceAPI = {
  /**
   * Get products with filtering and pagination
   */
  getProducts: async (params: GetProductsParams): Promise<GetProductsResponse> => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await fetch(`/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Purchase product
   */
  purchaseProduct: async (
    productId: string,
    paymentDetails: { paymentMethodId: string; encryptedData: string; validationToken: string }
  ): Promise<PurchaseResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate product exists
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return {
      transactionId: `tr-${Date.now()}`,
      status: 'SUCCESS',
      timestamp: new Date()
    };
  }
};