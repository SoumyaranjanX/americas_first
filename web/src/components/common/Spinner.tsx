import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const sizeMap = {
  small: '16px',
  medium: '24px',
  large: '32px',
};

export const Spinner = styled.div<SpinnerProps>`
  width: ${({ size = 'medium' }) => sizeMap[size]};
  height: ${({ size = 'medium' }) => sizeMap[size]};
  border: 2px solid var(--color-surface);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`; 