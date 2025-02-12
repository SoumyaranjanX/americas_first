'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SecurityMonitor from '../../../lib/utils/security-monitor';
import { Box, Typography, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PageParams {
  sessionId: string;
}

const VideoContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const SecurityStatus = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export default function VirtualCarePage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [securityStatus, setSecurityStatus] = useState(SecurityMonitor.getSecurityStatus());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Invalid session ID');
      return;
    }

    const initializeSession = async () => {
      try {
        const isValid = await SecurityMonitor.validateSession(sessionId);
        if (!isValid) {
          setError('Session validation failed. Please ensure you have a secure connection.');
          return;
        }

        SecurityMonitor.logSecurityEvent({
          type: 'SESSION_START',
          sessionId,
          details: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }
        });

        // Update security status periodically
        const interval = setInterval(() => {
          setSecurityStatus(SecurityMonitor.getSecurityStatus());
        }, 5000);

        return () => {
          clearInterval(interval);
          SecurityMonitor.logSecurityEvent({
            type: 'SESSION_END',
            sessionId,
          });
        };
      } catch (err) {
        setError('Failed to initialize virtual care session');
        console.error(err);
      }
    };

    initializeSession();
  }, [sessionId]);

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <VideoContainer>
      <Typography variant="h4" gutterBottom>
        Virtual Care Session
      </Typography>
      
      <SecurityStatus>
        <Typography variant="h6" gutterBottom>
          Security Status
        </Typography>
        <Typography>
          Connection: {securityStatus.isSecure ? 'Secure' : 'Not Secure'}
        </Typography>
        <Typography>
          Encryption: {securityStatus.encryption.enabled ? securityStatus.encryption.strength : 'Disabled'}
        </Typography>
        <Typography>
          Network: {securityStatus.network.isStable ? 'Stable' : 'Unstable'} 
          (Latency: {securityStatus.network.latency.toFixed(0)}ms)
        </Typography>
        <Typography>
          Permissions:
          {' Camera: '}{securityStatus.permissions.camera ? '✓' : '✗'},
          {' Microphone: '}{securityStatus.permissions.microphone ? '✓' : '✗'},
          {' Notifications: '}{securityStatus.permissions.notifications ? '✓' : '✗'}
        </Typography>
      </SecurityStatus>

      {/* Video components will be added here */}
      <Box flex={1} bgcolor="grey.200" borderRadius={1} />
    </VideoContainer>
  );
}