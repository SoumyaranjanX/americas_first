/**
 * @fileoverview Account verification page component
 * Handles email verification token validation and account activation
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { verifyAccount } from '../../../lib/api/auth';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Text } from '../../../components/common/Text';
import { Spinner } from '../../../components/common/Spinner';

const VerifyAccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: var(--color-background);
`;

const StyledCard = styled(Card)`
  max-width: 480px;
  width: 100%;
  padding: 2rem;
  text-align: center;
`;

const StyledButton = styled(Button)`
  margin-top: 1rem;
`;

const VerifyAccountPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const params = new URLSearchParams(searchParams?.toString() || '');
        const token = params.get('token');
        const userId = params.get('userId');

        if (!token || !userId) {
          setStatus('error');
          setError('Invalid verification link. Please request a new one.');
          return;
        }

        await verifyAccount(token, userId);
        setStatus('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An error occurred during verification');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Spinner size="large" />
            <Text variant="h2" mt={4}>Verifying your account...</Text>
            <Text variant="body1" color="textSecondary" mt={2}>
              Please wait while we verify your account.
            </Text>
          </>
        );
      case 'success':
        return (
          <>
            <Text variant="h2" color="success">Account Verified!</Text>
            <Text variant="body1" mt={2}>
              Your account has been successfully verified.
            </Text>
            <Text variant="body2" color="textSecondary" mt={2}>
              Redirecting to login page...
            </Text>
          </>
        );
      case 'error':
        return (
          <>
            <Text variant="h2" color="error">Verification Failed</Text>
            <Text variant="body1" mt={2}>{error}</Text>
            <StyledButton
              variant="primary"
              onClick={() => router.push('/auth/login')}
            >
              Return to Login
            </StyledButton>
          </>
        );
    }
  };

  return (
    <VerifyAccountContainer>
      <StyledCard>
        {renderContent()}
      </StyledCard>
    </VerifyAccountContainer>
  );
};

export default VerifyAccountPage; 