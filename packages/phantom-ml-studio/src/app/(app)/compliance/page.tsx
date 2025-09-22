/**
 * Enterprise Security & Compliance Dashboard - Main Component
 * Phantom Spire Enterprise ML Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Gavel as ComplianceIcon,
  Assessment as AuditIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// Component imports
import ComplianceOverviewCards from './_components/components/ComplianceOverviewCards';
import ComplianceCharts from './_components/components/ComplianceCharts';
import FrameworkSummary from './_components/components/FrameworkSummary';

// Type imports
import type {
  ComplianceFramework,
  SecurityMetrics,
  // AuditReport, // For future implementation
  TabValue
} from './_lib/types';

export default function EnterpriseSecurityCompliancePage() {
  // State management
  const [activeTab, setActiveTab] = useState<TabValue>(0);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  // Future use for audit reports tab
  // const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Notification states
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Effects
  useEffect(() => {
    fetchComplianceData();
  }, []);

  // Data fetching functions
  const fetchComplianceData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockFrameworks: ComplianceFramework[] = [
        {
          id: 'gdpr',
          name: 'GDPR',
          fullName: 'General Data Protection Regulation',
          version: '2018',
          status: 'compliant',
          overallScore: 92,
          lastAudit: '2024-01-15',
          nextAudit: '2024-07-15',
          categories: [],
          riskLevel: 'low',
          remediation: {
            required: 2,
            inProgress: 1,
            completed: 15
          }
        },
        {
          id: 'sox',
          name: 'SOX',
          fullName: 'Sarbanes-Oxley Act',
          version: '2002',
          status: 'partial',
          overallScore: 78,
          lastAudit: '2024-02-01',
          nextAudit: '2024-08-01',
          categories: [],
          riskLevel: 'medium',
          remediation: {
            required: 5,
            inProgress: 3,
            completed: 12
          }
        },
        {
          id: 'nist',
          name: 'NIST',
          fullName: 'NIST Cybersecurity Framework',
          version: '1.1',
          status: 'in-progress',
          overallScore: 65,
          lastAudit: '2024-01-30',
          nextAudit: '2024-07-30',
          categories: [],
          riskLevel: 'high',
          remediation: {
            required: 8,
            inProgress: 5,
            completed: 7
          }
        },
        {
          id: 'iso27001',
          name: 'ISO 27001',
          fullName: 'ISO/IEC 27001:2013',
          version: '2013',
          status: 'non-compliant',
          overallScore: 45,
          lastAudit: '2024-01-10',
          nextAudit: '2024-06-10',
          categories: [],
          riskLevel: 'critical',
          remediation: {
            required: 12,
            inProgress: 2,
            completed: 5
          }
        }
      ];

      const mockSecurityMetrics: SecurityMetrics = {
        overallSecurityScore: 78,
        vulnerabilities: {
          critical: 2,
          high: 8,
          medium: 15,
          low: 23
        },
        threats: {
          blocked: 145,
          mitigated: 23,
          investigating: 5,
          resolved: 167
        },
        accessControl: {
          activeUsers: 245,
          privilegedAccounts: 12,
          failedLogins: 34,
          mfaEnabled: 89
        },
        dataProtection: {
          encryptedData: 95,
          backupStatus: 'healthy',
          retentionCompliance: 92,
          dataClassification: {
            public: 25,
            internal: 45,
            confidential: 23,
            restricted: 7
          }
        },
        incidentResponse: {
          averageResponseTime: 15,
          resolvedIncidents: 23,
          openIncidents: 3,
          escalatedIncidents: 1
        }
      };

      // Mock audit reports for future implementation
      /*
      const mockAuditReports: AuditReport[] = [
        {
          id: 'audit_2024_q1',
          framework: 'GDPR',
          type: 'internal',
          date: '2024-01-15',
          auditor: 'Internal Compliance Team',
          status: 'completed',
          findings: [],
          overallRating: 'satisfactory',
          nextReview: '2024-07-15',
          recommendations: ['Enhance data retention policies', 'Update privacy notices']
        },
        {
          id: 'audit_2024_q2',
          framework: 'SOX',
          type: 'external',
          date: '2024-02-01',
          auditor: 'External Audit Firm',
          status: 'remediation',
          findings: [],
          overallRating: 'needs-improvement',
          nextReview: '2024-08-01',
          recommendations: ['Strengthen financial controls', 'Improve documentation']
        }
      ];
      */

      setFrameworks(mockFrameworks);
      setSecurityMetrics(mockSecurityMetrics);
      // setAuditReports(mockAuditReports); // Future implementation
      setSelectedFramework(mockFrameworks[0] || null);
      setLoading(false);
    } catch {
      setError('Failed to fetch compliance data');
      setLoading(false);
    }
  };

  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const handleFrameworkSelect = (framework: ComplianceFramework) => {
    setSelectedFramework(framework);
    setActiveTab(1); // Switch to framework details tab
  };

  const handleRefreshData = () => {
    setLoading(true);
    fetchComplianceData();
    setSuccessMessage('Data refreshed successfully');
    setShowSuccess(true);
  };

  const handleGenerateReport = (frameworkId: string) => {
    setSuccessMessage('Report generation started');
    setShowSuccess(true);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading compliance data...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" data-cy="compliance-title">
          Enterprise Security & Compliance
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          Monitor compliance frameworks, security posture, and audit requirements
        </Typography>
      </Box>

      {/* Critical Alerts */}
      <Box sx={{ mb: 3 }}>
        {frameworks.some(f => f.riskLevel === 'critical') && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Critical Compliance Issues</AlertTitle>
            {frameworks.filter(f => f.riskLevel === 'critical').length} framework(s) require immediate attention
          </Alert>
        )}
        {frameworks.some(f => f.riskLevel === 'high') && (
          <Alert severity="warning">
            <AlertTitle>High Priority Items</AlertTitle>
            {frameworks.filter(f => f.riskLevel === 'high').length} framework(s) have high priority remediation items
          </Alert>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="compliance tabs">
          <Tab 
            icon={<ComplianceIcon />} 
            label="Overview" 
            data-cy="overview-tab"
          />
          <Tab 
            icon={<ShieldIcon />} 
            label="Framework Details" 
            data-cy="framework-details-tab"
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Security Metrics" 
            data-cy="security-metrics-tab"
          />
          <Tab 
            icon={<AuditIcon />} 
            label="Audit Reports" 
            data-cy="audit-reports-tab"
          />
          <Tab 
            icon={<TimelineIcon />} 
            label="Risk Assessment" 
            data-cy="risk-assessment-tab"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ComplianceOverviewCards 
              frameworks={frameworks} 
              securityMetrics={securityMetrics} 
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ComplianceCharts frameworks={frameworks} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FrameworkSummary
              frameworks={frameworks}
              onFrameworkSelect={handleFrameworkSelect}
              onRefreshData={handleRefreshData}
              onGenerateReport={handleGenerateReport}
            />
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Framework Details
          </Typography>
          {selectedFramework ? (
            <Typography>
              Selected Framework: {selectedFramework.fullName}
            </Typography>
          ) : (
            <Typography color="text.secondary">
              Select a framework from the overview to view details
            </Typography>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Security Metrics
          </Typography>
          <Typography>Security metrics dashboard will be displayed here</Typography>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Audit Reports
          </Typography>
          <Typography>Audit reports and findings will be displayed here</Typography>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Risk Assessment
          </Typography>
          <Typography>Risk assessment dashboard will be displayed here</Typography>
        </Box>
      )}

      {/* Success Notification */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
    </Box>
  );
}
