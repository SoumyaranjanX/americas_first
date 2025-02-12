'use client';

import { useState } from 'react';
import * as yup from 'yup';
import Input from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { logger } from '@/lib/utils/logger';
import AuthAPI from '@/lib/api/auth';
import { Analytics, AnalyticsCategory } from '@/lib/utils/analytics';

// Initialize secure logger for password reset events
const securityLogger = {
  info: (message: string, metadata: Record<string, any>) => {
    logger.info(message, metadata);
  }
};

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required')
});

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (value: string, isValid: boolean) => {
    setEmail(value);
    if (!isValid) {
      setError('Please enter a valid email address');
    } else {
      setError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      // Validate email
      await validationSchema.validate({ email });

      // Log security event
      securityLogger.info('Password Reset Security Event', {
        event: 'password_reset_requested',
        email
      });

      // Send password reset email
      await AuthAPI.sendPasswordResetEmail({ email });

      // Track analytics
      Analytics.trackEvent({
        name: 'password_reset_requested',
        category: AnalyticsCategory.USER_INTERACTION,
        properties: {
          email
        }
      });

      setSuccess(true);
    } catch (error) {
      // Handle validation errors
      if (error instanceof yup.ValidationError) {
        setError(error.message);
      } else {
        setError('An error occurred. Please try again later.');
        
        // Track error
        Analytics.trackEvent({
          name: 'password_reset_failed',
          category: AnalyticsCategory.ERROR,
          properties: {
            email,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  If an account exists for {email}, you will receive password reset instructions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={email}
                onChange={handleEmailChange}
                error={error}
                fullWidth
                required
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="outline"
                size="large"
                loading={loading}
                fullWidth
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}