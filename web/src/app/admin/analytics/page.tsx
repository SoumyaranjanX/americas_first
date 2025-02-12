'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { AdminAPI } from '../../../lib/api/admin';
import { Analytics, AnalyticsCategory, PrivacyLevel } from '../../../lib/utils/analytics';
import { captureError } from '../../../lib/utils/sentry';
import Table from '../../../components/common/Table';
import { emotionTheme } from '../../../styles/theme';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Styled Components with emotion theme
const DashboardContainer = styled.div`
  padding: ${props => props.theme.spacing(4)}px;
  background: ${props => props.theme.palette.background.default};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing(4)}px;
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.h1.fontSize};
  font-weight: ${props => props.theme.typography.h1.fontWeight};
  line-height: ${props => props.theme.typography.h1.lineHeight};
  color: ${props => props.theme.palette.text.primary};
`;

const Controls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing(2)}px;
  align-items: center;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing(3)}px;
  margin-bottom: ${props => props.theme.spacing(4)}px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.palette.background.paper};
  padding: ${props => props.theme.spacing(3)}px;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  box-shadow: ${props => props.theme.shadows[0]};
`;

function AnalyticsPage() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getAnalytics({
        startDate,
        endDate,
        metrics: ['users', 'sessions', 'claims'],
        granularity: 'day'
      });
      setData(response);

      // Track analytics view
      Analytics.trackEvent({
        name: 'admin_view_analytics',
        category: AnalyticsCategory.USER_INTERACTION,
        properties: {
          dateRange: { startDate, endDate },
          metrics: ['users', 'sessions', 'claims']
        },
        timestamp: Date.now(),
        userConsent: true,
        privacyLevel: PrivacyLevel.PUBLIC,
        auditInfo: {
          eventId: crypto.randomUUID(),
          timestamp: Date.now(),
          actionType: 'ANALYTICS_VIEW'
        }
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      Analytics.trackError(error, {
        operation: 'fetchAnalytics',
        dateRange: { startDate, endDate }
      });
      captureError(error, {
        operation: 'fetchAnalytics',
        component: 'AnalyticsPage',
        extra: {
          dateRange: { startDate, endDate }
        },
        tags: {
          page: 'analytics',
          action: 'fetch'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div>Error loading analytics: {error.message}</div>;
  }

  return (
    <DashboardContainer>
      <Header>
        <PageTitle>Analytics Dashboard</PageTitle>
        <Controls>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date || new Date())}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date || new Date())}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </Controls>
      </Header>

      {data && (
        <>
          <MetricsGrid>
            {/* Add your metric cards here */}
          </MetricsGrid>

          {/* Add your charts and tables here */}
        </>
      )}
    </DashboardContainer>
  );
}

export default AnalyticsPage;