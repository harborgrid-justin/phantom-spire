/**
 * Data Privacy Controls
 * Privacy management and data protection controls for information sharing
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { 
  Shield, 
  Lock as Privacy, 
  Lock, 
  Visibility,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Warning,  Error as ErrorIcon,
  Settings,
  Person,
  Business,
  Security,
  VpnKey,
  ExpandMore,
  Timeline,
  Assessment,
  Gavel
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface PrivacyPolicy {
  id: string;
  name: string;
  type: 'data-classification' | 'retention' | 'access-control' | 'consent' | 'anonymization';
  description: string;
  applicableData: string[];
  enforcement: 'automatic' | 'manual' | 'hybrid';
  status: 'active' | 'draft' | 'disabled';
  lastModified: string;
  modifiedBy: string;
  complianceFrameworks: string[];
}

interface DataClassification {
  id: string;
  name: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted' | 'top-secret';
  description: string;
  handlingRequirements: string[];
  sharingRestrictions: string[];
  retentionPeriod: string;
  encryptionRequired: boolean;
  approvalRequired: boolean;
  auditLevel: 'none' | 'basic' | 'detailed' | 'comprehensive';
}

interface ConsentRecord {
  id: string;
  dataSubject: string;
  dataType: string;
  purpose: string;
  consentDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'withdrawn' | 'pending';
  source: string;
  lawfulBasis: string;
  withdrawalRights: boolean;
}

interface PrivacyMetrics {
  totalDataSubjects: number;
  activeConsents: number;
  dataBreaches: number;
  privacyRequests: number;
  complianceScore: number;
  automatedProtections: number;
}

export const DataPrivacyControls: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('data-privacy');

  const [currentTab, setCurrentTab] = useState(0);
  const [createPolicyOpen, setCreatePolicyOpen] = useState(false);

  const [privacyMetrics, setPrivacyMetrics] = useState<PrivacyMetrics>({
    totalDataSubjects: 12450,
    activeConsents: 8790,
    dataBreaches: 0,
    privacyRequests: 23,
    complianceScore: 96.2,
    automatedProtections: 15
  });

  const [privacyPolicies, setPrivacyPolicies] = useState<PrivacyPolicy[]>([
    {
      id: 'policy-001',
      name: 'Automatic PII Detection and Masking',
      type: 'anonymization',
      description: 'Automatically detect and mask personally identifiable information in threat intelligence data',
      applicableData: ['IOCs', 'Log files', 'Network data', 'Email headers'],
      enforcement: 'automatic',
      status: 'active',
      lastModified: '2024-01-10T14:30:00Z',
      modifiedBy: 'Privacy Officer',
      complianceFrameworks: ['GDPR', 'CCPA', 'PIPEDA']
    },
    {
      id: 'policy-002',
      name: 'Threat Intelligence Data Retention',
      type: 'retention',
      description: 'Define retention periods for different types of threat intelligence data',
      applicableData: ['Threat reports', 'IOCs', 'Incident data', 'Attribution data'],
      enforcement: 'automatic',
      status: 'active',
      lastModified: '2024-01-05T09:15:00Z',
      modifiedBy: 'Compliance Manager',
      complianceFrameworks: ['GDPR', 'ISO27001']
    },
    {
      id: 'policy-003',
      name: 'Cross-Border Data Transfer Controls',
      type: 'access-control',
      description: 'Control and monitor cross-border transfer of sensitive threat intelligence',
      applicableData: ['Classified intelligence', 'Attribution data', 'Source information'],
      enforcement: 'manual',
      status: 'active',
      lastModified: '2023-12-20T16:45:00Z',
      modifiedBy: 'Legal Counsel',
      complianceFrameworks: ['GDPR', 'ITAR', 'EAR']
    },
    {
      id: 'policy-004',
      name: 'Partner Consent Management',
      type: 'consent',
      description: 'Manage consent for sharing intelligence data with partner organizations',
      applicableData: ['Partner shared data', 'Collaborative intelligence'],
      enforcement: 'hybrid',
      status: 'draft',
      lastModified: '2024-01-12T11:20:00Z',
      modifiedBy: 'Data Protection Officer',
      complianceFrameworks: ['GDPR', 'CCPA']
    }
  ]);

  const [dataClassifications, setDataClassifications] = useState<DataClassification[]>([
    {
      id: 'class-001',
      name: 'Public Threat Intelligence',
      level: 'public',
      description: 'Publicly available threat intelligence that can be shared without restrictions',
      handlingRequirements: ['Standard logging', 'Basic attribution'],
      sharingRestrictions: ['None'],
      retentionPeriod: '5 years',
      encryptionRequired: false,
      approvalRequired: false,
      auditLevel: 'basic'
    },
    {
      id: 'class-002',
      name: 'Partner Shared Intelligence',
      level: 'confidential',
      description: 'Intelligence shared by partner organizations under specific agreements',
      handlingRequirements: ['Enhanced logging', 'Source attribution', 'Access controls'],
      sharingRestrictions: ['Partner approval required', 'No public sharing'],
      retentionPeriod: '3 years',
      encryptionRequired: true,
      approvalRequired: true,
      auditLevel: 'detailed'
    },
    {
      id: 'class-003',
      name: 'Government Source Intelligence',
      level: 'restricted',
      description: 'Intelligence from government sources with special handling requirements',
      handlingRequirements: ['Maximum security logging', 'Need-to-know access', 'Source protection'],
      sharingRestrictions: ['Government approval only', 'Cleared personnel only'],
      retentionPeriod: '7 years',
      encryptionRequired: true,
      approvalRequired: true,
      auditLevel: 'comprehensive'
    }
  ]);

  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([
    {
      id: 'consent-001',
      dataSubject: 'Financial Services ISAC',
      dataType: 'Banking threat indicators',
      purpose: 'Multi-sector threat intelligence sharing',
      consentDate: '2023-06-15',
      expirationDate: '2024-06-15',
      status: 'active',
      source: 'Partnership Agreement',
      lawfulBasis: 'Legitimate interest',
      withdrawalRights: true
    },
    {
      id: 'consent-002',
      dataSubject: 'EU Cyber Security Agency',
      dataType: 'Critical infrastructure threats',
      purpose: 'Cross-border threat intelligence cooperation',
      consentDate: '2023-09-01',
      expirationDate: '2025-09-01',
      status: 'active',
      source: 'Government MOU',
      lawfulBasis: 'Public task',
      withdrawalRights: false
    },
    {
      id: 'consent-003',
      dataSubject: 'Regional Healthcare ISAC',
      dataType: 'Healthcare sector threats',
      purpose: 'Sector-specific threat intelligence',
      consentDate: '2023-11-20',
      status: 'pending',
      source: 'Data Sharing Agreement',
      lawfulBasis: 'Consent',
      withdrawalRights: true
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('data-privacy-controls', {
      continuous: true,
      position: 'bottom-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'disabled': return 'default';
      case 'pending': return 'info';
      case 'expired': return 'error';
      case 'withdrawn': return 'error';
      default: return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'success';
      case 'internal': return 'info';
      case 'confidential': return 'warning';
      case 'restricted': return 'error';
      case 'top-secret': return 'error';
      default: return 'default';
    }
  };

  const getEnforcementColor = (enforcement: string) => {
    switch (enforcement) {
      case 'automatic': return 'success';
      case 'manual': return 'warning';
      case 'hybrid': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield color="primary" />
        🔒 Data Privacy Controls
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Comprehensive privacy management and data protection controls for threat intelligence sharing.
      </Typography>

      {/* Privacy Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" color="primary">
                {(privacyMetrics.totalDataSubjects / 1000).toFixed(1)}k
              </Typography>
              <Typography variant="caption">
                Data Subjects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" color="success.main">
                {(privacyMetrics.activeConsents / 1000).toFixed(1)}k
              </Typography>
              <Typography variant="caption">
                Active Consents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h5" color="error.main">
                {privacyMetrics.dataBreaches}
              </Typography>
              <Typography variant="caption">
                Data Breaches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Lock sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" color="warning.main">
                {privacyMetrics.privacyRequests}
              </Typography>
              <Typography variant="caption">
                Privacy Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" color="info.main">
                {privacyMetrics.complianceScore}%
              </Typography>
              <Typography variant="caption">
                Compliance Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Settings sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h5" color="secondary.main">
                {privacyMetrics.automatedProtections}
              </Typography>
              <Typography variant="caption">
                Auto Protections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Privacy Status Alert */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Privacy Status:</strong> All systems compliant • {privacyMetrics.automatedProtections} automated protections active • Zero breaches reported
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Privacy Policies" />
          <Tab label="Data Classification" />
          <Tab label="Consent Management" />
          <Tab label="Privacy Impact" />
        </Tabs>
      </Paper>

      {/* Privacy Policies Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Privacy Protection Policies
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setCreatePolicyOpen(true)}
                >
                  Create Policy
                </Button>
              </Box>
              
              <List>
                {privacyPolicies.map((policy) => (
                  <ListItem key={policy.id} divider>
                    <ListItemIcon>
                      <Privacy color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{policy.name}</Typography>
                          <Chip label={policy.type} variant="outlined" size="small" />
                          <Chip 
                            label={policy.enforcement} 
                            color={getEnforcementColor(policy.enforcement)}
                            size="small"
                          />
                          <Chip 
                            label={policy.status} 
                            color={getStatusColor(policy.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {policy.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Applicable to: {policy.applicableData.join(', ')}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            Frameworks: {policy.complianceFrameworks.join(', ')} • 
                            Modified by: {policy.modifiedBy} • 
                            {new Date(policy.lastModified).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={<Switch checked={policy.status === 'active'} />}
                        label=""
                      />
                      <Button variant="outlined" startIcon={<Edit />} size="small">
                        Edit
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Data Classification Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Data Classification Levels
              </Typography>
              
              {dataClassifications.map((classification) => (
                <Accordion key={classification.id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Lock color="primary" />
                      <Typography variant="subtitle1">{classification.name}</Typography>
                      <Chip 
                        label={classification.level.toUpperCase()} 
                        color={getLevelColor(classification.level)}
                        size="small"
                      />
                      {classification.encryptionRequired && (
                        <Chip label="Encryption Required" color="warning" size="small" />
                      )}
                      {classification.approvalRequired && (
                        <Chip label="Approval Required" color="error" size="small" />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="body2">
                        {classification.description}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" gutterBottom>
                            Handling Requirements:
                          </Typography>
                          <List dense>
                            {classification.handlingRequirements.map((req, index) => (
                              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                                <ListItemText 
                                  primary={
                                    <Typography variant="caption">
                                      • {req}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" gutterBottom>
                            Sharing Restrictions:
                          </Typography>
                          <List dense>
                            {classification.sharingRestrictions.map((restriction, index) => (
                              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                                <ListItemText 
                                  primary={
                                    <Typography variant="caption">
                                      • {restriction}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" gutterBottom>
                            Additional Controls:
                          </Typography>
                          <Typography variant="caption" display="block">
                            Retention: {classification.retentionPeriod}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Audit Level: {classification.auditLevel}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Consent Management Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Data Sharing Consent Records
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data Subject</TableCell>
                      <TableCell>Data Type</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Lawful Basis</TableCell>
                      <TableCell>Expiration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Typography variant="subtitle2">{record.dataSubject}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Source: {record.source}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.dataType}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.purpose}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status} 
                            color={getStatusColor(record.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.lawfulBasis}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {record.expirationDate 
                              ? new Date(record.expirationDate).toLocaleDateString()
                              : 'No expiration'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            {record.withdrawalRights && (
                              <IconButton size="small" color="error">
                                <Delete />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Create Policy Dialog */}
      <Dialog open={createPolicyOpen} onClose={() => setCreatePolicyOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Privacy Policy</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Policy Name"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Policy Type</InputLabel>
              <Select label="Policy Type">
                <MenuItem value="data-classification">Data Classification</MenuItem>
                <MenuItem value="retention">Data Retention</MenuItem>
                <MenuItem value="access-control">Access Control</MenuItem>
                <MenuItem value="consent">Consent Management</MenuItem>
                <MenuItem value="anonymization">Data Anonymization</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Enforcement</InputLabel>
              <Select label="Enforcement">
                <MenuItem value="automatic">Automatic</MenuItem>
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Applicable Data Types"
              multiline
              rows={2}
              fullWidth
              variant="outlined"
              placeholder="Enter data types, one per line"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePolicyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreatePolicyOpen(false)}>
            Create Policy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};