import { Metadata } from 'next';

interface PageProps {
  params: {
    claimId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Claim Details - ${params.claimId}`,
    description: 'Secure claim information view',
    other: {
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  };
} 