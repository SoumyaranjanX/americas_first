import { Metadata } from 'next';

interface PageProps {
  params: {
    recordId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Health Record Details - AUSTA SuperApp',
    description: 'Secure health record viewer with HIPAA compliance',
    other: {
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  };
} 