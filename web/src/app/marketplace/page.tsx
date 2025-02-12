'use client';

import React, { useCallback, useState, Suspense } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import ProductGrid from '../../components/marketplace/ProductGrid';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Product } from '../../lib/types/product';
import { AnalyticsCategory, PrivacyLevel } from '../../lib/utils/analytics';

const Container = styled.div`
  padding: 2rem;
  background-color: var(--background);
`;

const Header = styled.header`
  margin-bottom: 2rem;
  color: var(--text-primary);
`;

const Title = styled.h1`
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const Description = styled.p`
  font-size: 1.125rem;
  line-height: 1.5;
  color: var(--text-secondary);
  max-width: 800px;
`;

const ClinicalModeToggle = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 8px 16px;
  background-color: var(--clinical-main);
  color: var(--clinical-contrast);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 100;
  
  &:focus-visible {
    outline: 3px solid var(--primary-main);
    outline-offset: 2px;
  }
`;

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
`;

export default function MarketplacePage() {
  const router = useRouter();
  const { logEvent } = useAnalytics();
  const { products, isLoading, error, filters, filterByCategory, searchProducts } = useMarketplace();
  const [clinicalMode, setClinicalMode] = useState(false);

  const handleProductClick = async (product: Product) => {
    await logEvent({
      name: 'marketplace_product_selected',
      category: AnalyticsCategory.USER_INTERACTION,
      properties: {
        productId: product.id,
        productName: product.name,
        productCategory: product.category
      },
      timestamp: Date.now(),
      userConsent: true,
      privacyLevel: PrivacyLevel.PUBLIC,
      auditInfo: {
        eventId: `product_click_${Date.now()}`,
        timestamp: Date.now(),
        actionType: 'PRODUCT_SELECTION'
      }
    });

    router.push(`/marketplace/${product.id}`);
  };

  const toggleClinicalMode = useCallback(() => {
    setClinicalMode(prev => !prev);
    
    logEvent({
      name: 'marketplace_clinical_mode_toggle',
      category: AnalyticsCategory.USER_INTERACTION,
      properties: {
        enabled: !clinicalMode
      },
      timestamp: Date.now(),
      userConsent: true,
      privacyLevel: PrivacyLevel.INTERNAL,
      auditInfo: {
        eventId: `clinical_mode_${Date.now()}`,
        timestamp: Date.now(),
        actionType: 'CLINICAL_MODE_TOGGLE'
      }
    });
  }, [clinicalMode, logEvent]);

  return (
    <ErrorBoundary>
      <Container>
        <Header>
          <Title>Digital Health Marketplace</Title>
          <Description>
            Discover curated digital therapeutic programs, wellness resources, and healthcare provider services.
          </Description>
        </Header>

        <ClinicalModeToggle
          onClick={toggleClinicalMode}
          aria-pressed={clinicalMode}
          aria-label="Toggle clinical mode"
        >
          {clinicalMode ? 'Exit Clinical Mode' : 'Enter Clinical Mode'}
        </ClinicalModeToggle>

        <Suspense fallback={<LoadingFallback>Loading marketplace...</LoadingFallback>}>
          <ProductGrid
            products={products}
            onProductClick={handleProductClick}
            loading={isLoading}
            clinicalMode={clinicalMode}
          />
        </Suspense>
      </Container>
    </ErrorBoundary>
  );
}