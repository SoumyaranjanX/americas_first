import styled from '@emotion/styled';
import { css } from '@emotion/react';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption';
type TextColor = 'primary' | 'secondary' | 'success' | 'error' | 'textSecondary';

interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  mt?: number;
  mb?: number;
}

const variantStyles = {
  h1: css`
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
  `,
  h2: css`
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.3;
  `,
  h3: css`
    font-size: 1.75rem;
    font-weight: 600;
    line-height: 1.3;
  `,
  h4: css`
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1.4;
  `,
  body1: css`
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
  `,
  body2: css`
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
  `,
  caption: css`
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.5;
  `,
};

const colorStyles = {
  primary: css`
    color: var(--color-text-primary);
  `,
  secondary: css`
    color: var(--color-text-secondary);
  `,
  success: css`
    color: var(--color-success);
  `,
  error: css`
    color: var(--color-error);
  `,
  textSecondary: css`
    color: var(--color-text-secondary);
  `,
};

export const Text = styled.div<TextProps>`
  margin: 0;
  ${({ variant = 'body1' }) => variantStyles[variant]};
  ${({ color = 'primary' }) => colorStyles[color]};
  ${({ mt }) => mt !== undefined && css`margin-top: ${mt}rem;`};
  ${({ mb }) => mb !== undefined && css`margin-bottom: ${mb}rem;`};
`; 