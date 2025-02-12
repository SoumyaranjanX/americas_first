'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, CircularProgress, Alert, Snackbar, Box, Paper, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { 
  Mic, MicOff,
  Videocam, VideocamOff,
  ScreenShare, StopScreenShare,
  Security,
  SignalCellular4Bar,
} from '@mui/icons-material';

import VideoConsultation from '../../components/virtual-care/VideoConsultation';
import { virtualCareApi } from '../../lib/api/virtualCare';
import { 
  ConsultationStatus, 
  ConnectionQuality,
  isSecureRoom,
  ConsultationType,
  IConsultation
} from '../../lib/types/consultation';

// Security violation types for monitoring
type SecurityViolation = 'ENCRYPTION_FAILED' | 'CONNECTION_INSECURE' | 'QUALITY_DEGRADED';

// Interface for security status tracking
interface SecurityStatus {
  isVerified: boolean;
  lastVerification: Date;
  violations: SecurityViolation[];
  encryptionStatus: 'verified' | 'pending' | 'failed';
}

// Mock consultation data
const MOCK_CONSULTATION: IConsultation = {
  id: 'mock-consultation-1',
  type: ConsultationType.VIDEO,
  patientId: 'patient-123',
  providerId: 'provider-456',
  scheduledStartTime: new Date(),
  actualStartTime: new Date(),
  endTime: null,
  status: ConsultationStatus.IN_PROGRESS,
  participants: [],
  healthRecordId: 'health-record-789',
  roomSid: 'room-sid-123',
  metadata: {
    providerName: 'Dr. John Smith',
    providerSpecialty: 'Cardiologist',
    providerImageUrl: 'https://example.com/doctor.jpg',
    notes: 'Regular checkup',
    location: 'Virtual'
  },
  securityMetadata: {
    encryptionType: 'AES-256-GCM',
    securityLevel: 'HIPAA-COMPLIANT'
  },
  auditLog: [],
  isEmergency: false
};

/**
 * Virtual Care Page Component
 * Implements HIPAA-compliant video consultations with enhanced security monitoring
 */
const VirtualCarePage: React.FC = () => {
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isVerified: false,
    lastVerification: new Date(),
    violations: [],
    encryptionStatus: 'pending'
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  /**
   * Handles security violations with appropriate responses
   */
  const handleSecurityViolation = useCallback((violation: SecurityViolation) => {
    setSecurityStatus(prev => ({
      ...prev,
      violations: [...prev.violations, violation],
      isVerified: false
    }));

    const violationMessages = {
      ENCRYPTION_FAILED: 'Encryption verification failed. Attempting to re-establish secure connection.',
      CONNECTION_INSECURE: 'Insecure connection detected. Enhanced security measures activated.',
      QUALITY_DEGRADED: 'Connection quality degraded. Adjusting parameters for secure transmission.'
    };

    setAlertMessage(violationMessages[violation]);
    setShowAlert(true);

    // Log security violation
    console.error('Security violation detected:', {
      violation,
      timestamp: new Date().toISOString(),
      consultationId
    });
  }, [consultationId]);

  /**
   * Handles connection quality changes with security implications
   */
  const handleQualityChange = useCallback((quality: ConnectionQuality) => {
    if (quality === ConnectionQuality.POOR) {
      handleSecurityViolation('QUALITY_DEGRADED');
    }
  }, [handleSecurityViolation]);

  /**
   * Verifies security status of the consultation
   */
  const verifySecurityStatus = useCallback(async () => {
    if (!consultationId) return;

    try {
      // Simulate security verification with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecurityStatus(prev => ({
        ...prev,
        isVerified: true,
        lastVerification: new Date(),
        encryptionStatus: 'verified'
      }));
    } catch (error) {
      console.error('Security verification failed:', error);
      handleSecurityViolation('CONNECTION_INSECURE');
    }
  }, [consultationId, handleSecurityViolation]);

  /**
   * Initializes consultation with security context
   */
  const initializeConsultation = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConsultationId(MOCK_CONSULTATION.id);
      
      await verifySecurityStatus();
    } catch (error) {
      setError('Failed to initialize secure consultation. Please try again.');
      console.error('Consultation initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [verifySecurityStatus]);

  /**
   * Handles consultation end with security verification
   */
  const handleConsultationEnd = useCallback(async () => {
    if (!consultationId) return;

    try {
      // Simulate ending consultation
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to end consultation:', error);
      setError('Failed to end consultation securely. Please contact support.');
    }
  }, [consultationId, router]);

  // Initialize consultation and security monitoring
  useEffect(() => {
    initializeConsultation();

    // Set up periodic security verification
    const securityInterval = setInterval(verifySecurityStatus, 30000);

    return () => {
      clearInterval(securityInterval);
      if (consultationId) {
        handleConsultationEnd();
      }
    };
  }, [initializeConsultation, verifySecurityStatus, consultationId, handleConsultationEnd]);

  // Handle loading state
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" ml={2}>
          Establishing Secure Connection...
        </Typography>
      </Container>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Container>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      {/* Security Status Banner */}
      <Alert 
        severity={securityStatus.isVerified ? "success" : "warning"}
        sx={{ mb: 2 }}
      >
        {securityStatus.isVerified 
          ? "Secure HIPAA-compliant connection established"
          : "Verifying connection security..."}
      </Alert>

      {/* Video Consultation Component */}
      {consultationId && (
        <VideoConsultation
          consultation={MOCK_CONSULTATION}
          onEnd={handleConsultationEnd}
          onSecurityViolation={handleSecurityViolation}
          onQualityChange={handleQualityChange}
        />
      )}

      {/* Security Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
      >
        <Alert severity="warning" variant="filled">
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VirtualCarePage;