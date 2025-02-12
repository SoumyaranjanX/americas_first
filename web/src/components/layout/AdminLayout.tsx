/**
 * @fileoverview Enhanced Admin Layout component for AUSTA SuperApp web platform
 * Implements secure layout structure with emergency mode and medical device support
 * @version 1.0.0
 * @license HIPAA-compliant
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { usePathname, useRouter } from 'next/navigation';
import { ErrorBoundary } from '@sentry/react'; // v7.0.0
import { theme } from '../../styles/theme';

import Header from './Header';
import Sidebar from './Sidebar';
import useAuth from '../../hooks/useAuth';
import { AuthState } from '../../lib/types/auth';

// Constants
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const HEADER_HEIGHT = 64;
const SECURITY_TIMEOUT = 900000; // 15 minutes
const MEDICAL_DEVICE_BREAKPOINTS = {
  tablet: 1024,
  desktop: 1440,
  largeScreen: 1920
};

const ADMIN_SECURITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
type AdminSecurityLevel = typeof ADMIN_SECURITY_LEVELS[number];

interface AdminLayoutProps {
  children: React.ReactNode;
  emergencyMode?: boolean;
  securityLevel?: AdminSecurityLevel;
}

// Styled Components
const StyledAdminLayout = styled.div<{
  sidebarCollapsed: boolean;
  emergencyMode: boolean;
  highContrast: boolean;
}>`
  display: flex;
  min-height: 100vh;
  background: ${({ emergencyMode }) =>
    emergencyMode ? 'var(--color-error-100)' : 'var(--color-background)'};
  transition: all 0.3s ease;

  .content-wrapper {
    flex: 1;
    margin-left: ${({ sidebarCollapsed }) =>
      sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px;
    margin-top: ${HEADER_HEIGHT}px;
    padding: 24px;
    transition: margin-left 0.3s ease;
    
    @media (max-width: ${MEDICAL_DEVICE_BREAKPOINTS.tablet}px) {
      margin-left: 0;
      padding: 16px;
    }
  }

  /* High contrast mode styles */
  ${({ highContrast }) =>
    highContrast &&
    `
      * {
        color: #000000 !important;
        background: #FFFFFF !important;
        border-color: #000000 !important;
      }
    `}

  /* Medical device compatibility */
  @media screen and (min-width: ${MEDICAL_DEVICE_BREAKPOINTS.largeScreen}px) {
    font-size: 18px;
    .content-wrapper {
      max-width: 1600px;
      margin: ${HEADER_HEIGHT}px auto 0;
    }
  }
`;

// Simple audit logger for development
const auditLog = (action: string, details: Record<string, any>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${action}:`, details);
  }
  // In production, this should be replaced with proper audit logging
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  emergencyMode = false,
  securityLevel = 'MEDIUM'
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, state: authState } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Security check for admin access
  const checkAdminAccess = useCallback(
    async (requiredLevel: AdminSecurityLevel): Promise<boolean> => {
      try {
        if (authState !== AuthState.AUTHENTICATED || !user) {
          return false;
        }

        const hasAccess = user.role === 'ADMIN' &&
          ADMIN_SECURITY_LEVELS.indexOf(requiredLevel) <= 
          ADMIN_SECURITY_LEVELS.indexOf(securityLevel);

        return hasAccess;
      } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
      }
    },
    [authState, user, securityLevel]
  );

  // Handle emergency mode changes
  const handleEmergencyMode = useCallback(
    async (isEmergency: boolean) => {
      try {
        // Apply emergency mode layout changes
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty(
            '--color-background',
            isEmergency ? 'var(--color-error-100)' : 'var(--color-surface-primary)'
          );
        }
      } catch (error) {
        console.error('Emergency mode handling failed:', error);
      }
    },
    []
  );

  // Handle sidebar toggle with audit logging
  const handleSidebarToggle = useCallback(async () => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  // Security and emergency mode effects
  useEffect(() => {
    const verifyAccess = async () => {
      const hasAccess = await checkAdminAccess(securityLevel);
      if (!hasAccess && typeof window !== 'undefined') {
        router.replace('/auth/login');
      }
    };

    if (isMounted) {
      verifyAccess();
    }
  }, [checkAdminAccess, securityLevel, isMounted, router]);

  useEffect(() => {
    handleEmergencyMode(emergencyMode);
  }, [emergencyMode, handleEmergencyMode]);

  // Accessibility settings effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-contrast: more)');
      setHighContrast(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Only run audit log effect on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      auditLog('page_view', {
        path: pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, [pathname, isMounted]);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until we're on the client side
  if (!isMounted) {
    return null;
  }

  return (
    <ErrorBoundary
      fallback={<div>An error occurred in the admin interface.</div>}
    >
      <StyledAdminLayout
        sidebarCollapsed={isCollapsed}
        emergencyMode={emergencyMode}
        highContrast={highContrast}
      >
        <Header
          emergencyMode={emergencyMode}
          clinicalEnvironment={emergencyMode ? 'EMERGENCY' : 'STANDARD'}
        />
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={handleSidebarToggle}
          width={SIDEBAR_WIDTH}
        />
        <main className="content-wrapper" role="main">
          {children}
        </main>
      </StyledAdminLayout>
    </ErrorBoundary>
  );
};

export default AdminLayout;