import React, { useCallback, useState, memo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { Product } from '../../lib/types/product';

// Constants
const MAX_DESCRIPTION_LENGTH = 150;
const IMAGE_PLACEHOLDER = '/images/product-placeholder.png';
const MIN_TOUCH_TARGET_SIZE = 44;

// Types
interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  clinicalMode?: boolean;
}

interface CardProps {
  clinicalMode?: boolean;
  elevation?: number;
  isHovered?: boolean;
}

// Styled Components
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => !['clinicalMode', 'isHovered'].includes(prop as string),
})<CardProps>(({ theme, clinicalMode, isHovered }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[isHovered ? 4 : 1],
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transform: isHovered ? 'translateY(-4px)' : 'none',
  ...(clinicalMode && {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.default,
  })
}));

const StyledCardMedia = styled(CardMedia)({
  height: 200,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const ProductTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1)
}));

const Description = styled(Typography)(({ theme }) => ({
  margin: '0 0 16px 0',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.5
}));

const PriceContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: MIN_TOUCH_TARGET_SIZE
});

const Price = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'insuranceCovered',
})<{ insuranceCovered: boolean }>(({ theme, insuranceCovered }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: insuranceCovered ? theme.palette.success.main : theme.palette.text.primary
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100);
};

const truncateText = (text: string): string => {
  if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
  return `${text.substring(0, MAX_DESCRIPTION_LENGTH - 3)}...`;
};

const ProductCard: React.FC<ProductCardProps> = memo(({ 
  product, 
  onClick, 
  clinicalMode = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    onClick?.(product);
  }, [onClick, product]);

  return (
    <StyledCard
      elevation={1}
      clinicalMode={clinicalMode}
      isHovered={isHovered}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="article"
      aria-label={`${product.name} - ${formatPrice(product.price)}`}
    >
      <StyledCardMedia
        image={imageError ? IMAGE_PLACEHOLDER : product.images[0]}
        title={product.name}
      />
      <StyledCardContent>
        <ProductTitle variant="h6">
          {product.name}
        </ProductTitle>
        <Description variant="body2" aria-label={product.description}>
          {truncateText(product.description)}
        </Description>
        <PriceContainer>
          <Price 
            variant="h6"
            insuranceCovered={product.insuranceCovered}
            aria-label={`Price: ${formatPrice(product.price)}`}
          >
            {formatPrice(product.price)}
          </Price>
        </PriceContainer>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={() => {
            // Implement the add to cart logic here
          }}
          fullWidth
        >
          Add to Cart
        </ActionButton>
      </StyledCardContent>
    </StyledCard>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;