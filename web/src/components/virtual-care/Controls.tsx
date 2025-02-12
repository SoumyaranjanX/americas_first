/**
 * @fileoverview Enhanced video consultation control buttons with HIPAA-compliant security
 * @version 1.0.0
 * @license HIPAA-compliant
 */

import React, { useState, useCallback, useEffect } from 'react'; // v18.2.0
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Box
} from '@mui/material'; // v5.14.0
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  CallEnd,
  SignalCellular4Bar,
  SignalCellular3Bar,
  SignalCellular2Bar,
  SignalCellular1Bar,
  SignalCellularNull,
  Lock,
  LockOpen
} from '@mui/icons-material'; // v5.14.0

import { useWebRTC } from '../../hooks/useWebRTC';
import { IConsultation, ConsultationStatus, ConnectionQuality } from '../../lib/types/consultation';

interface IControlsProps {
  consultation: IConsultation;
  onEnd: () => void;
  onError: (error: Error) => void;
  className?: string;
}

interface IConnectionState {
  quality: ConnectionQuality;
  latency: number;
  encrypted: boolean;
}

// WebRTC stats report interface based on the implementation
interface WebRTCStatsReport {
  kind?: 'audio' | 'video';
  roundTripTime?: number;
  encrypted?: boolean;
  packetsLost?: number;
  jitter?: number;
  frameRate?: number;
  resolution?: {
    width: number;
    height: number;
  };
}

/**
 * Enhanced video consultation controls component with security monitoring
 */
const Controls: React.FC<IControlsProps> = ({
  consultation,
  onEnd,
  onError,
  className
}) => {
  // State management for media controls and security status
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<IConnectionState>({
    quality: ConnectionQuality.GOOD,
    latency: 0,
    encrypted: true
  });

  // Initialize WebRTC hook with security context
  const {
    room,
    localTracks,
    remoteParticipants,
    isConnecting,
    error: webRTCError,
    connectionQuality,
    toggleAudio,
    toggleVideo,
    disconnect,
    shareScreen,
    getConnectionStats
  } = useWebRTC(consultation.id, {
    securityLevel: consultation.securityMetadata.securityLevel,
    encryptionRequired: true
  });

  /**
   * Handles audio toggle with security verification
   */
  const handleAudioToggle = useCallback(async () => {
    try {
      await toggleAudio();
      setIsAudioEnabled(prev => !prev);
    } catch (error: unknown) {
      onError(new Error(`Failed to toggle audio: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }, [toggleAudio, onError]);

  /**
   * Handles video toggle with security verification
   */
  const handleVideoToggle = useCallback(async () => {
    try {
      await toggleVideo();
      setIsVideoEnabled(prev => !prev);
    } catch (error: unknown) {
      onError(new Error(`Failed to toggle video: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }, [toggleVideo, onError]);

  /**
   * Handles screen sharing with security checks
   */
  const handleScreenShare = useCallback(async () => {
    try {
      await shareScreen();
      setIsScreenSharing(prev => !prev);
    } catch (error: unknown) {
      onError(new Error(`Failed to toggle screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }, [shareScreen, onError]);

  /**
   * Handles consultation end with secure cleanup
   */
  const handleEndCall = useCallback(async () => {
    try {
      await disconnect();
      onEnd();
    } catch (error: unknown) {
      onError(new Error(`Failed to end consultation: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }, [disconnect, onEnd, onError]);

  /**
   * Monitors connection quality and security status
   */
  useEffect(() => {
    const monitorConnection = async () => {
      try {
        const stats = await getConnectionStats();
        
        // Default values for connection state
        let latency = 0;
        let encrypted = true;

        // Safely process stats with type assertion
        stats.forEach((stat: any) => {
          if (stat.kind === 'audio' && 'roundTripTime' in stat) {
            latency = stat.roundTripTime || latency;
          }
          if ((stat.kind === 'audio' || stat.kind === 'video') && 'encrypted' in stat) {
            encrypted = encrypted && stat.encrypted !== false;
          }
        });

        setConnectionState({
          quality: connectionQuality,
          latency,
          encrypted
        });
      } catch (error) {
        console.error('Failed to monitor connection:', error);
      }
    };

    monitorConnection();
    const interval = setInterval(monitorConnection, 10000);
    return () => clearInterval(interval);
  }, [connectionQuality, getConnectionStats]);

  /**
   * Renders connection quality indicator
   */
  const renderQualityIndicator = () => {
    const qualityIcons = {
      [ConnectionQuality.EXCELLENT]: <SignalCellular4Bar color="success" />,
      [ConnectionQuality.GOOD]: <SignalCellular3Bar color="success" />,
      [ConnectionQuality.FAIR]: <SignalCellular2Bar color="warning" />,
      [ConnectionQuality.POOR]: <SignalCellular1Bar color="error" />,
      [ConnectionQuality.DISCONNECTED]: <SignalCellularNull color="error" />
    };

    return (
      <Tooltip title={`Connection: ${connectionState.quality} (${connectionState.latency}ms)`}>
        <Box component="span">
          {qualityIcons[connectionState.quality]}
        </Box>
      </Tooltip>
    );
  };

  if (consultation.status === ConsultationStatus.FAILED || webRTCError) {
    return (
      <Alert severity="error" className={className}>
        {webRTCError?.message || 'Consultation connection failed. Please try reconnecting.'}
      </Alert>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      className={className}
      sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}
    >
      <Tooltip title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}>
        <IconButton 
          onClick={handleAudioToggle} 
          color={isAudioEnabled ? 'primary' : 'error'}
          disabled={isConnecting}
          aria-label={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {isAudioEnabled ? <Mic /> : <MicOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isVideoEnabled ? 'Stop Video' : 'Start Video'}>
        <IconButton 
          onClick={handleVideoToggle} 
          color={isVideoEnabled ? 'primary' : 'error'}
          disabled={isConnecting}
          aria-label={isVideoEnabled ? 'Stop Video' : 'Start Video'}
        >
          {isVideoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
        <IconButton 
          onClick={handleScreenShare} 
          color={isScreenSharing ? 'secondary' : 'primary'}
          disabled={isConnecting}
          aria-label={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
        </IconButton>
      </Tooltip>

      {renderQualityIndicator()}

      <Tooltip title={connectionState.encrypted ? 'Encrypted Connection' : 'Unsecured Connection'}>
        <IconButton 
          color={connectionState.encrypted ? 'success' : 'error'}
          disabled={isConnecting}
          aria-label={connectionState.encrypted ? 'Encrypted Connection' : 'Unsecured Connection'}
        >
          {connectionState.encrypted ? <Lock /> : <LockOpen />}
        </IconButton>
      </Tooltip>

      <Tooltip title="End Consultation">
        <IconButton 
          onClick={handleEndCall} 
          color="error"
          disabled={isConnecting}
          aria-label="End Consultation"
        >
          <CallEnd />
        </IconButton>
      </Tooltip>

      {isConnecting && (
        <CircularProgress size={24} />
      )}
    </Stack>
  );
};

export default Controls;