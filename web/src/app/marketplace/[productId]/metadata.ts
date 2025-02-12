import { Metadata } from 'next';

interface PageProps {
  params: {
    productId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Product Details - ${params.productId}`,
    description: 'Digital health product details and purchasing options',
    other: {
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  };
} 