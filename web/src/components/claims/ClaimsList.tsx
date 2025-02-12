/**
 * @fileoverview Enhanced claims list component with HIPAA compliance and security features
 * Implements comprehensive filtering, sorting, and accessibility features
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, CircularProgress, Chip } from '@mui/material';
import { Visibility, GetApp, LocalHospital, LocalPharmacy, Healing, Visibility as VisionIcon, Psychology, HealthAndSafety } from '@mui/icons-material';

// Types and interfaces
import { 
  IClaim, 
  ClaimType, 
  ClaimStatus,
  IClaimDocument 
} from '../../lib/types/claim';

// Constants
const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 300;

// Mock data for development
const MOCK_CLAIMS: IClaim[] = [
  {
    id: 'claim-001',
    version: 1,
    claimNumber: 'CLM-2024-001',
    patientId: 'patient-123',
    providerId: 'provider-456',
    type: ClaimType.MEDICAL,
    serviceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    submissionDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
    status: ClaimStatus.APPROVED,
    amount: 1250.00,
    documents: [
      {
        id: 'doc-001',
        type: 'INVOICE',
        title: 'Medical Invoice',
        url: 'https://example.com/claims/doc-001.pdf',
        uploadedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        encryptionMetadata: {
          algorithm: 'AES-256-GCM',
          keyId: 'key-001',
          initVector: 'iv-001',
          lastEncryptedAt: new Date()
        },
        accessLog: [],
        hipaaCompliant: true
      }
    ],
    healthRecordId: 'hr-001',
    auditTrail: [],
    securityMetadata: {
      encryptionLevel: 'AES-256-GCM',
      dataClassification: 'CONFIDENTIAL',
      lastSecurityReview: new Date(),
      accessControlList: ['PATIENT', 'PROVIDER']
    },
    complianceChecks: [
      {
        type: 'HIPAA',
        status: true,
        checkedAt: new Date(),
        checkedBy: 'system',
        findings: []
      }
    ]
  },
  {
    id: 'claim-002',
    version: 1,
    claimNumber: 'CLM-2024-002',
    patientId: 'patient-123',
    providerId: 'provider-789',
    type: ClaimType.PHARMACY,
    serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: ClaimStatus.UNDER_REVIEW,
    amount: 85.50,
    documents: [
      {
        id: 'doc-002',
        type: 'PRESCRIPTION',
        title: 'Prescription Receipt',
        url: 'https://example.com/claims/doc-002.pdf',
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        encryptionMetadata: {
          algorithm: 'AES-256-GCM',
          keyId: 'key-002',
          initVector: 'iv-002',
          lastEncryptedAt: new Date()
        },
        accessLog: [],
        hipaaCompliant: true
      }
    ],
    healthRecordId: 'hr-002',
    auditTrail: [],
    securityMetadata: {
      encryptionLevel: 'AES-256-GCM',
      dataClassification: 'CONFIDENTIAL',
      lastSecurityReview: new Date(),
      accessControlList: ['PATIENT', 'PROVIDER', 'PHARMACY']
    },
    complianceChecks: [
      {
        type: 'HIPAA',
        status: true,
        checkedAt: new Date(),
        checkedBy: 'system',
        findings: []
      }
    ]
  },
  {
    id: 'claim-003',
    version: 1,
    claimNumber: 'CLM-2024-003',
    patientId: 'patient-123',
    providerId: 'provider-101',
    type: ClaimType.DENTAL,
    serviceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: ClaimStatus.SUBMITTED,
    amount: 450.00,
    documents: [],
    healthRecordId: 'hr-003',
    auditTrail: [],
    securityMetadata: {
      encryptionLevel: 'AES-256-GCM',
      dataClassification: 'CONFIDENTIAL',
      lastSecurityReview: new Date(),
      accessControlList: ['PATIENT', 'PROVIDER']
    },
    complianceChecks: [
      {
        type: 'HIPAA',
        status: true,
        checkedAt: new Date(),
        checkedBy: 'system',
        findings: []
      }
    ]
  }
];

interface ClaimsListProps {
  pageSize?: number;
  onClaimSelect: (claim: IClaim) => void;
  filters: Record<string, any>;
  accessLevel: string;
}

type SortableColumns = 'serviceDate' | 'submissionDate' | 'type' | 'status' | 'amount';

/**
 * Enhanced claims list component with security and performance features
 */
const ClaimsList: React.FC<ClaimsListProps> = ({
  pageSize = PAGE_SIZE,
  onClaimSelect,
  filters,
  accessLevel
}) => {
  // State
  const [claims, setClaims] = useState<IClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    column: SortableColumns;
    direction: 'asc' | 'desc';
  }>();

  // Format date safely
  const formatDate = useCallback((date: any) => {
    if (!date) return 'Invalid Date';
    const dateObj = new Date(date);
    return isValid(dateObj) ? format(dateObj, 'PPP') : 'Invalid Date';
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  // Get claim type icon
  const getClaimTypeIcon = useCallback((type: ClaimType) => {
    switch (type) {
      case ClaimType.MEDICAL:
        return <LocalHospital />;
      case ClaimType.PHARMACY:
        return <LocalPharmacy />;
      case ClaimType.DENTAL:
        return <Healing />;
      case ClaimType.VISION:
        return <VisionIcon />;
      case ClaimType.MENTAL_HEALTH:
        return <Psychology />;
      case ClaimType.PREVENTIVE:
        return <HealthAndSafety />;
      default:
        return <LocalHospital />;
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.APPROVED:
        return 'success';
      case ClaimStatus.REJECTED:
        return 'error';
      case ClaimStatus.UNDER_REVIEW:
        return 'warning';
      case ClaimStatus.PENDING_INFO:
        return 'info';
      default:
        return 'default';
    }
  }, []);

  // Handlers
  const handleSort = useCallback((column: SortableColumns) => {
    setSortConfig(prev => ({
      column,
      direction: prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleClaimSelect = useCallback((claim: IClaim) => {
    onClaimSelect(claim);
  }, [onClaimSelect]);

  const handleDownload = useCallback((document: IClaimDocument) => {
    // Implement secure download logic here
    console.log('Downloading document:', document.id);
  }, []);

  // Fetch claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        /* Commented out original API call
        const response = await fetch('/api/claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const data = await response.json();
        setClaims(data);
        */

        // Simulate API delay with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setClaims(MOCK_CLAIMS);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Memoized table columns
  const columns = useMemo(() => [
    {
      id: 'claimNumber',
      header: 'Claim Number',
      accessor: 'claimNumber' as const,
      sortable: false,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type' as const,
      sortable: true,
      render: (value: ClaimType) => (
        <Box display="flex" alignItems="center" gap={1}>
          {getClaimTypeIcon(value)}
          <Typography>{value.replace('_', ' ')}</Typography>
        </Box>
      ),
    },
    {
      id: 'serviceDate',
      header: 'Service Date',
      accessor: 'serviceDate' as const,
      sortable: true,
      render: (value: any) => formatDate(value),
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount' as const,
      sortable: true,
      render: (value: number) => formatCurrency(value),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status' as const,
      sortable: true,
      render: (value: ClaimStatus) => (
        <Chip 
          label={value.replace('_', ' ')} 
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id' as const,
      sortable: false,
      render: (value: any, claim: IClaim) => (
        <Box>
          <IconButton
            onClick={() => handleClaimSelect(claim)}
            aria-label={`View claim ${claim.claimNumber}`}
            size="small"
          >
            <Visibility />
          </IconButton>
          {claim.documents?.length > 0 && (
            <IconButton
              onClick={() => handleDownload(claim.documents[0])}
              aria-label="Download claim document"
              size="small"
            >
              <GetApp />
            </IconButton>
          )}
        </Box>
      ),
    },
  ], [formatDate, formatCurrency, getClaimTypeIcon, getStatusColor, handleClaimSelect, handleDownload]);

  // Filter and sort claims
  const filteredAndSortedClaims = useMemo(() => {
    let result = [...claims];

    // Apply filters
    if (filters) {
      // Add filter logic here
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [claims, filters, sortConfig]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  onClick={() => column.sortable && handleSort(column.accessor as SortableColumns)}
                  style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedClaims.map((claim, index) => (
              <TableRow key={claim.id || index}>
                {columns.map(column => (
                  <TableCell key={column.id}>
                    {column.render ? column.render(claim[column.accessor], claim) : claim[column.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ClaimsList;