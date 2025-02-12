'use client';

import React from 'react'; // ^18.0.0
import styled from '@emotion/styled'; // ^11.11.0
import { css } from '@emotion/react';
import { theme } from '../../styles/theme';

// Button size configurations with clinical touch targets
const BUTTON_SIZES = {
  small: {
    padding: '8px 16px',
    fontSize: '14px',
    height: '32px',
    touchTarget: '44px'
  },
  medium: {
    padding: '12px 24px',
    fontSize: '16px',
    height: '40px',
    touchTarget: '48px'
  },
  large: {
    padding: '16px 32px',
    fontSize: '18px',
    height: '48px',
    touchTarget: '56px'
  },
  'touch-optimized': {
    padding: '20px 40px',
    fontSize: '20px',
    height: '64px',
    touchTarget: '64px'
  }
} as const;

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  criticalAction?: boolean;
  highContrast?: boolean;
}

const variantStyles = {
  primary: css`
    background: var(--color-primary);
    color: var(--color-text-on-primary);
    border: none;
    &:hover {
      background: var(--color-primary-dark);
    }
    &:disabled {
      background: var(--color-disabled);
      cursor: not-allowed;
    }
  `,
  secondary: css`
    background: var(--color-secondary);
    color: var(--color-text-on-secondary);
    border: none;
    &:hover {
      background: var(--color-secondary-dark);
    }
    &:disabled {
      background: var(--color-disabled);
      cursor: not-allowed;
    }
  `,
  outline: css`
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    &:hover {
      background: var(--color-primary-light);
    }
    &:disabled {
      border-color: var(--color-disabled);
      color: var(--color-disabled);
      cursor: not-allowed;
    }
  `,
  text: css`
    background: transparent;
    color: var(--color-primary);
    border: none;
    padding: 0;
    &:hover {
      text-decoration: underline;
    }
    &:disabled {
      color: var(--color-disabled);
      cursor: not-allowed;
    }
  `,
};

const sizeStyles = {
  small: css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  `,
  medium: css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `,
  large: css`
    padding: 1rem 2rem;
    font-size: 1.125rem;
  `,
};

// Styled button component with clinical optimizations
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return '8px 16px';
      case 'large':
        return '16px 32px';
      default:
        return '12px 24px';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '14px';
      case 'large':
        return '18px';
      default:
        return '16px';
    }
  }};
  font-weight: 500;
  border-radius: ${theme.shape.borderRadius}px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  ${({ variant = 'primary' }) => variantStyles[variant]};
  ${({ size = 'medium' }) => sizeStyles[size]};

  ${props => props.highContrast && `
    filter: contrast(1.5);
  `}

  ${props => props.criticalAction && css`
    background: var(--color-error);
    color: var(--color-text-on-error);
    &:hover {
      background: var(--color-error-dark);
    }
  `}

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
`;

const LoadingSpinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Button component with clinical optimizations
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
});

Button.displayName = 'Button';

export default Button;