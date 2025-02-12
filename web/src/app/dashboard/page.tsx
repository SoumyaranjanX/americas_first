'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Container, Typography, Skeleton, Box, Paper, useTheme, useMediaQuery, Card, CardContent, LinearProgress, Divider, Avatar, IconButton, Tooltip, Button } from '@mui/material'; // v5.0.0
import { useAuthContext } from '../../contexts/AuthContext';
import { ErrorBoundary } from 'react-error-boundary'; // v4.0.0
import { Analytics } from '../../lib/utils/analytics';
import { AccessLevel, ThemePreference } from '../../components/dashboard/types';
import { UserRole, UserStatus } from '../../lib/types/user';
import { AuthState } from '../../lib/types/auth';
import { 
  TrendingUp, 
  CalendarToday, 
  Notifications,
  ArrowForward,
  Favorite,
  DirectionsRun,
  LocalHospital,
  Bedtime,
  VideoCall,
  Cancel,
  Schedule
} from '@mui/icons-material';

// Internal components
import HealthMetrics from '../../components/dashboard/HealthMetrics';
import AppointmentCard from '../../components/dashboard/AppointmentCard';
import QuickActions from '../../components/dashboard/QuickActions';

// Hooks
import useAnalytics from '../../hooks/useAnalytics';

// Types
import { HealthRecordType, SecurityClassification } from '../../lib/types/healthRecord';
import { 
  IConsultation, 
  ConnectionQuality, 
  ConsultationType,
  ConsultationStatus 
} from '../../lib/types/consultation';
import { IUser } from '../../lib/types/auth';

// Constants for refresh intervals and security
const METRICS_REFRESH_INTERVAL = 30000; // 30 seconds
const APPOINTMENTS_REFRESH_INTERVAL = 60000; // 1 minute
const MAX_APPOINTMENTS_DISPLAY = 3;

// Mock data for development
const MOCK_METRICS = {
  vitals: {
    heartRate: { value: 75, unit: 'bpm', isNormal: true },
    bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', isNormal: true },
    temperature: { value: 98.6, unit: '°F', isNormal: true },
    oxygenSaturation: { value: 98, unit: '%', isNormal: true }
  },
  activity: {
    steps: 8432,
    caloriesBurned: 1250,
    activeMinutes: 45
  },
  medications: {
    adherenceRate: 95,
    nextDue: new Date(Date.now() + 3600000).toISOString(),
    missedDoses: 1
  },
  trends: {
    sleepQuality: [
      { date: '2024-03-01', value: 85 },
      { date: '2024-03-02', value: 90 },
      { date: '2024-03-03', value: 88 }
    ],
    stressLevel: [
      { date: '2024-03-01', value: 3 },
      { date: '2024-03-02', value: 2 },
      { date: '2024-03-03', value: 1 }
    ]
  }
};

const MOCK_APPOINTMENTS: IConsultation[] = [
  {
    id: '1',
    type: ConsultationType.VIDEO,
    patientId: 'patient123',
    providerId: 'provider1',
    scheduledStartTime: new Date(Date.now() + 86400000), // Tomorrow
    actualStartTime: null,
    endTime: null,
    status: ConsultationStatus.SCHEDULED,
    participants: [],
    healthRecordId: null,
    roomSid: null,
    metadata: {
      providerName: 'Dr. Sarah Johnson',
      providerSpecialty: 'Cardiologist',
      providerImageUrl: 'https://example.com/doctor1.jpg',
      notes: 'Regular checkup',
      location: 'Virtual'
    },
    securityMetadata: {},
    auditLog: [],
    isEmergency: false
  },
  {
    id: '2',
    type: ConsultationType.VIDEO,
    patientId: 'patient123',
    providerId: 'provider2',
    scheduledStartTime: new Date(Date.now() + 172800000), // Day after tomorrow
    actualStartTime: null,
    endTime: null,
    status: ConsultationStatus.SCHEDULED,
    participants: [],
    healthRecordId: null,
    roomSid: null,
    metadata: {
      providerName: 'Dr. Michael Chen',
      providerSpecialty: 'General Physician',
      providerImageUrl: 'https://example.com/doctor2.jpg',
      notes: 'Follow-up appointment',
      location: 'Main Clinic'
    },
    securityMetadata: {},
    auditLog: [],
    isEmergency: false
  },
  {
    id: '3',
    type: ConsultationType.VIDEO,
    patientId: 'patient123',
    providerId: 'provider3',
    scheduledStartTime: new Date(Date.now() + 259200000), // 3 days from now
    actualStartTime: null,
    endTime: null,
    status: ConsultationStatus.SCHEDULED,
    participants: [],
    healthRecordId: null,
    roomSid: null,
    metadata: {
      providerName: 'Dr. Emily Brown',
      providerSpecialty: 'Dermatologist',
      providerImageUrl: 'https://example.com/doctor3.jpg',
      notes: 'Skin condition review',
      location: 'Virtual'
    },
    securityMetadata: {},
    auditLog: [],
    isEmergency: false
  }
];

/**
 * Error Fallback component for graceful error handling
 */
const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <Container>
    <Typography variant="h6" color="error" role="alert">
      An error occurred while loading the dashboard. Please try refreshing the page.
    </Typography>
  </Container>
);

/**
 * Main Dashboard Page Component
 * Implements HIPAA-compliant interface with role-based access control
 */
const DashboardPage: React.FC = () => {
  const { user, tokens } = useAuthContext();
  const { logEvent, logError } = useAnalytics();
  const [metrics, setMetrics] = useState<any>(MOCK_METRICS);
  const [appointments, setAppointments] = useState<IConsultation[]>(MOCK_APPOINTMENTS);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Security context for analytics and audit logging
  const securityContext = {
    sessionId: tokens?.accessToken || '',
    authToken: tokens?.accessToken || '',
    ipAddress: '[REDACTED]',
    deviceId: window.navigator.userAgent
  };

  /**
   * Fetches user metrics with security logging
   */
  const fetchUserMetrics = useCallback(async () => {
    // Simulating API call with mock data
    setMetrics(MOCK_METRICS);
    /* Commented out actual API call
    if (!user || !user._id) return;
    try {
      const response = await fetch(`/api/metrics/${user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      logEvent({
        name: 'fetch_metrics_error',
        category: Analytics.AnalyticsCategory.ERROR,
        properties: {
          message: 'Failed to fetch user metrics',
          userId: user._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now(),
        userConsent: true,
        privacyLevel: Analytics.PrivacyLevel.INTERNAL,
        auditInfo: {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          userId: user._id,
          ipAddress: '',
          actionType: 'API_ERROR'
        }
      });
    }
    */
  }, []);

  /**
   * Fetches user appointments with security logging
   */
  const fetchAppointments = useCallback(async () => {
    // Simulating API call with mock data
    setAppointments(MOCK_APPOINTMENTS);
    /* Commented out actual API call
    if (!user || !user._id) return;
    try {
      const response = await fetch(`/api/appointments/${user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      logEvent({
        name: 'fetch_appointments_error',
        category: Analytics.AnalyticsCategory.ERROR,
        properties: {
          message: 'Failed to fetch appointments',
          userId: user._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now(),
        userConsent: true,
        privacyLevel: Analytics.PrivacyLevel.INTERNAL,
        auditInfo: {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          userId: user._id,
          ipAddress: '',
          actionType: 'API_ERROR'
        }
      });
    }
    */
  }, []);

  /**
   * Handles secure data refresh with error boundary
   */
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshKey(prev => prev + 1);
      await Promise.all([
        fetchUserMetrics(),
        fetchAppointments()
      ]);
      
      await logEvent({
        name: 'dashboard_refresh',
        category: Analytics.AnalyticsCategory.USER_INTERACTION,
        properties: {
          userId: user?._id,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        userConsent: true,
        privacyLevel: Analytics.PrivacyLevel.INTERNAL,
        auditInfo: {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          userId: user?._id || 'anonymous',
          ipAddress: '[REDACTED]',
          actionType: 'dashboard_refresh'
        }
      });
    } catch (error) {
      await logError(error as Error, {
        context: 'dashboard_refresh',
        userId: user?._id
      }, Analytics.PrivacyLevel.INTERNAL);
    }
  }, [user, logEvent, logError, fetchUserMetrics, fetchAppointments]);

  /**
   * Handles appointment updates with security logging
   */
  const handleAppointmentUpdate = async (appointment: IConsultation) => {
    // Simulating API call with local state update
    const updatedAppointments = appointments.map(app => 
      app.id === appointment.id ? appointment : app
    );
    setAppointments(updatedAppointments);
    /* Commented out actual API call
    if (!user || !user._id) return;
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`
        },
        body: JSON.stringify(appointment)
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      await fetchAppointments();
    } catch (error) {
      logEvent({
        name: 'update_appointment_error',
        category: Analytics.AnalyticsCategory.ERROR,
        properties: {
          message: 'Failed to update appointment',
          userId: user._id,
          appointmentId: appointment.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now(),
        userConsent: true,
        privacyLevel: Analytics.PrivacyLevel.INTERNAL,
        auditInfo: {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          userId: user._id,
          ipAddress: '',
          actionType: 'API_ERROR'
        }
      });
    }
    */
  };

  // Track initial dashboard load
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await Promise.all([
          fetchUserMetrics(),
          fetchAppointments()
        ]);

        await logEvent({
          name: 'dashboard_view',
          category: Analytics.AnalyticsCategory.USER_INTERACTION,
          properties: {
            userId: user?._id,
            userRole: user?.role,
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          userConsent: true,
          privacyLevel: Analytics.PrivacyLevel.INTERNAL,
          auditInfo: {
            eventId: crypto.randomUUID(),
            timestamp: Date.now(),
            userId: user?._id || 'anonymous',
            ipAddress: '[REDACTED]',
            actionType: 'page_view'
          }
        });
        setLoading(false);
      } catch (error) {
        await logError(error as Error, {
          context: 'dashboard_view',
          userId: user?._id
        }, Analytics.PrivacyLevel.INTERNAL);
      }
    };

    // Simulate initial load delay
    setTimeout(() => {
      trackPageView();
    }, 1000);
  }, [user, logEvent, logError, fetchUserMetrics, fetchAppointments]);

  // Setup automatic refresh intervals
  useEffect(() => {
    const metricsInterval = setInterval(handleRefresh, METRICS_REFRESH_INTERVAL);
    const appointmentsInterval = setInterval(handleRefresh, APPOINTMENTS_REFRESH_INTERVAL);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(appointmentsInterval);
    };
  }, [handleRefresh]);

  // Show loading state
  if (loading) {
    return (
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
            Welcome back, {user?.profile?.firstName || 'User'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's your health overview for today
          </Typography>
        </Box>

        {/* Health Metrics Section */}
        <Grid container spacing={3} mb={4}>
          {/* Heart Rate Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Favorite sx={{ mr: 1 }} />
                <Typography variant="h6">Heart Rate</Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold">
                    {metrics.vitals.heartRate.value}
                    <Typography component="span" variant="h6"> bpm</Typography>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} 
                  />
                </>
              )}
            </Paper>
          </Grid>

          {/* Activity Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <DirectionsRun sx={{ mr: 1 }} />
                <Typography variant="h6">Daily Activity</Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold">
                    {metrics.activity.steps.toLocaleString()}
                    <Typography component="span" variant="h6"> steps</Typography>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.activity.steps / 10000) * 100} 
                    sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} 
                  />
                </>
              )}
            </Paper>
          </Grid>

          {/* Medication Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <LocalHospital sx={{ mr: 1 }} />
                <Typography variant="h6">Medication</Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold">
                    {metrics.medications.adherenceRate}
                    <Typography component="span" variant="h6">%</Typography>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.medications.adherenceRate} 
                    sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} 
                  />
                </>
              )}
            </Paper>
          </Grid>

          {/* Sleep Quality Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'info.light',
                color: 'info.contrastText',
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Bedtime sx={{ mr: 1 }} />
                <Typography variant="h6">Sleep Quality</Typography>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" />
              ) : (
                <>
                  <Typography variant="h3" fontWeight="bold">
                    {metrics.trends.sleepQuality[metrics.trends.sleepQuality.length - 1].value}
                    <Typography component="span" variant="h6">%</Typography>
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.trends.sleepQuality[metrics.trends.sleepQuality.length - 1].value} 
                    sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)' }} 
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Upcoming Appointments Section */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Upcoming Appointments
            </Typography>
            <Tooltip title="View all appointments">
              <IconButton color="primary">
                <ArrowForward />
              </IconButton>
            </Tooltip>
          </Box>
          <Grid container spacing={3}>
            {loading ? (
              [...Array(3)].map((_, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            ) : (
              appointments.slice(0, 3).map((appointment) => (
                <Grid item xs={12} md={4} key={appointment.id}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                          src={appointment.metadata?.providerImageUrl as string} 
                          sx={{ width: 48, height: 48, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {appointment.metadata?.providerName as string}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appointment.metadata?.providerSpecialty as string}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(appointment.scheduledStartTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Notifications sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(appointment.scheduledStartTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        {appointment.status === ConsultationStatus.SCHEDULED && (
                          <>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<VideoCall />}
                              onClick={() => handleAppointmentUpdate({
                                ...appointment,
                                status: ConsultationStatus.IN_PROGRESS,
                                actualStartTime: new Date()
                              })}
                              sx={{ flex: 1, mr: 1 }}
                            >
                              Join
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => handleAppointmentUpdate({
                                ...appointment,
                                status: ConsultationStatus.CANCELLED
                              })}
                              sx={{ flex: 1, mr: 1 }}
                            >
                              Cancel
                            </Button>
                            <Tooltip title="Reschedule appointment">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => {
                                  // Here you would typically open a date picker dialog
                                  // For now, we'll just update the status to WAITING
                                  handleAppointmentUpdate({
                                    ...appointment,
                                    status: ConsultationStatus.WAITING,
                                    scheduledStartTime: new Date(Date.now() + 86400000) // +1 day
                                  });
                                }}
                                sx={{ 
                                  bgcolor: 'background.paper',
                                  '&:hover': {
                                    bgcolor: 'action.hover'
                                  }
                                }}
                              >
                                <Schedule />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {appointment.status === ConsultationStatus.IN_PROGRESS && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<VideoCall />}
                            onClick={() => handleAppointmentUpdate({
                              ...appointment,
                              status: ConsultationStatus.IN_PROGRESS
                            })}
                            fullWidth
                          >
                            Rejoin Call
                          </Button>
                        )}
                        {appointment.status === ConsultationStatus.WAITING && (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<Schedule />}
                            onClick={() => handleAppointmentUpdate({
                              ...appointment,
                              status: ConsultationStatus.SCHEDULED
                            })}
                            fullWidth
                          >
                            Confirm New Time
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Quick Actions Section */}
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Quick Actions
          </Typography>
          <QuickActions 
            userRole={user?.role as UserRole}
            securityContext={securityContext}
          />
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

export default DashboardPage;