/**
 * Information Sharing Agreements
 * Platform for managing legal agreements and compliance for information sharing
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
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  LinearProgress,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Gavel, 
  Security, 
  Description, 
  Business,
  Add,
  Edit,
  Visibility,
  Download,
  Upload,
  CheckCircle,
  Warning,
  Schedule,
  Assignment,
  Person,
  Lock,
  Public
} from '@mui/icons-material';
import { addUIUXEvaluation } from '../../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../../services/business-logic/hooks/useBusinessLogic';

interface SharingAgreement {
  id: string;
  title: string;
  type: 'Bilateral' | 'Multilateral' | 'Community' | 'Commercial' | 'NDA';
  parties: string[];
  status: 'active' | 'pending' | 'expired' | 'draft' | 'terminated';
  effectiveDate: string;
  expirationDate: string;
  classification: 'TLP:WHITE' | 'TLP:GREEN' | 'TLP:AMBER' | 'TLP:RED';
  sharingScope: string[];
  restrictions: string[];
  signedBy: string[];
  coordinator: string;
  lastModified: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  framework: 'GDPR' | 'CCPA' | 'NIST' | 'ISO27001' | 'SOX' | 'HIPAA' | 'Custom';
  description: string;
  applicableRegions: string[];
  requirements: string[];
  implementation: 'mandatory' | 'recommended' | 'optional';
  status: 'compliant' | 'non-compliant' | 'in-progress' | 'not-applicable';
  lastAudit: string;
  nextReview: string;
}

interface LegalTemplate {
  id: string;
  name: string;
  type: 'NDA' | 'DPA' | 'SLA' | 'Partnership' | 'Vendor' | 'ISAC';
  description: string;
  jurisdiction: string;
  version: string;
  lastUpdated: string;
  isApproved: boolean;
  usageCount: number;
}

export const InformationSharingAgreements: React.FC = () => {
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('sharing-agreements');

  const [currentTab, setCurrentTab] = useState(0);
  const [createAgreementOpen, setCreateAgreementOpen] = useState(false);

  const [agreements, setAgreements] = useState<SharingAgreement[]>([
    {
      id: 'agreement-001',
      title: 'Financial ISAC Bilateral Intelligence Sharing',
      type: 'Bilateral',
      parties: ['Our Organization', 'Financial Services ISAC'],
      status: 'active',
      effectiveDate: '2023-06-15',
      expirationDate: '2024-06-15',
      classification: 'TLP:AMBER',
      sharingScope: ['IOCs', 'Threat reports', 'Attack patterns'],
      restrictions: ['No attribution data', 'Limited to financial sector'],
      signedBy: ['Legal Director', 'ISAC Representative'],
      coordinator: 'Sarah Johnson',
      lastModified: '2024-01-10T09:30:00Z'
    },
    {
      id: 'agreement-002',
      title: 'Multi-Government Cyber Threat Sharing MOU',
      type: 'Multilateral',
      parties: ['Our Organization', 'US-CERT', 'NCSC-UK', 'CERT-EU'],
      status: 'active',
      effectiveDate: '2023-09-01',
      expirationDate: '2025-09-01',
      classification: 'TLP:GREEN',
      sharingScope: ['Critical infrastructure threats', 'Nation-state indicators'],
      restrictions: ['Government use only', 'No commercial sharing'],
      signedBy: ['CTO', 'Government Liaisons'],
      coordinator: 'Dr. Michael Chen',
      lastModified: '2024-01-05T14:20:00Z'
    },
    {
      id: 'agreement-003',
      title: 'Commercial Threat Intelligence Partnership',
      type: 'Commercial',
      parties: ['Our Organization', 'CyberVendor Inc', 'ThreatSec Solutions'],
      status: 'pending',
      effectiveDate: '2024-02-01',
      expirationDate: '2025-02-01',
      classification: 'TLP:WHITE',
      sharingScope: ['Public indicators', 'Vendor reports', 'Best practices'],
      restrictions: ['Non-competitive use', 'Attribution required'],
      signedBy: ['Our Organization'],
      coordinator: 'Alex Rodriguez',
      lastModified: '2024-01-15T11:45:00Z'
    }
  ]);

  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([
    {
      id: 'rule-001',
      name: 'Personal Data Protection',
      framework: 'GDPR',
      description: 'Ensure no personal data is shared without proper consent',
      applicableRegions: ['EU', 'UK'],
      requirements: ['Data anonymization', 'Consent tracking', 'Right to erasure'],
      implementation: 'mandatory',
      status: 'compliant',
      lastAudit: '2024-01-01',
      nextReview: '2024-04-01'
    },
    {
      id: 'rule-002',
      name: 'Cross-Border Data Transfer',
      framework: 'NIST',
      description: 'Controls for international threat intelligence sharing',
      applicableRegions: ['US', 'Global'],
      requirements: ['Classification marking', 'Transfer agreements', 'Audit trails'],
      implementation: 'mandatory',
      status: 'compliant',
      lastAudit: '2023-12-15',
      nextReview: '2024-03-15'
    },
    {
      id: 'rule-003',
      name: 'Financial Data Handling',
      framework: 'SOX',
      description: 'Special handling requirements for financial sector data',
      applicableRegions: ['US'],
      requirements: ['Financial data marking', 'Restricted access', 'Enhanced logging'],
      implementation: 'mandatory',
      status: 'in-progress',
      lastAudit: '2024-01-10',
      nextReview: '2024-02-10'
    }
  ]);

  const [legalTemplates, setLegalTemplates] = useState<LegalTemplate[]>([
    {
      id: 'template-001',
      name: 'Standard Bilateral NDA',
      type: 'NDA',
      description: 'Non-disclosure agreement for bilateral threat intelligence sharing',
      jurisdiction: 'US',
      version: '2.1',
      lastUpdated: '2023-11-15',
      isApproved: true,
      usageCount: 12
    },
    {
      id: 'template-002',
      name: 'ISAC Partnership Agreement',
      type: 'ISAC',
      description: 'Standard agreement template for ISAC partnerships',
      jurisdiction: 'International',
      version: '1.8',
      lastUpdated: '2023-12-01',
      isApproved: true,
      usageCount: 8
    },
    {
      id: 'template-003',
      name: 'Data Processing Agreement',
      type: 'DPA',
      description: 'GDPR-compliant data processing agreement',
      jurisdiction: 'EU',
      version: '3.2',
      lastUpdated: '2024-01-05',
      isApproved: true,
      usageCount: 15
    }
  ]);

  useEffect(() => {
    const evaluationController = addUIUXEvaluation('sharing-agreements', {
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
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'draft': return 'info';
      case 'terminated': return 'default';
      default: return 'default';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non-compliant': return 'error';
      case 'in-progress': return 'warning';
      case 'not-applicable': return 'default';
      default: return 'default';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'TLP:WHITE': return 'default';
      case 'TLP:GREEN': return 'success';
      case 'TLP:AMBER': return 'warning';
      case 'TLP:RED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Gavel color="primary" />
        📋 Information Sharing Agreements
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage legal agreements, compliance requirements, and governance for information sharing activities.
      </Typography>

      {/* Compliance Status */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Compliance Status:</strong> 8 active agreements • 94% compliance score • Next audit in 45 days
        </Typography>
      </Alert>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary">
          <Tab label="Active Agreements" />
          <Tab label="Compliance Rules" />
          <Tab label="Legal Templates" />
          <Tab label="Audit Trail" />
        </Tabs>
      </Paper>

      {/* Active Agreements Tab */}
      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Information Sharing Agreements
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setCreateAgreementOpen(true)}
                >
                  Create Agreement
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Agreement</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Parties</TableCell>
                      <TableCell>Classification</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Expiration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agreements.map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{agreement.title}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Coordinator: {agreement.coordinator}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={agreement.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {agreement.parties.length} organizations
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Signed by {agreement.signedBy.length}/{agreement.parties.length}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={agreement.classification} 
                            color={getClassificationColor(agreement.classification)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={agreement.status} 
                            color={getStatusColor(agreement.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(agreement.expirationDate).toLocaleDateString()}
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
                            <IconButton size="small">
                              <Download />
                            </IconButton>
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

      {/* Compliance Rules Tab */}
      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Compliance Framework Rules
              </Typography>
              <List>
                {complianceRules.map((rule) => (
                  <ListItem key={rule.id} divider>
                    <ListItemIcon>
                      <Security color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{rule.name}</Typography>
                          <Chip label={rule.framework} variant="outlined" size="small" />
                          <Chip 
                            label={rule.status} 
                            color={getComplianceColor(rule.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {rule.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Regions: {rule.applicableRegions.join(', ')} • 
                            Implementation: {rule.implementation} • 
                            Next review: {new Date(rule.nextReview).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              Requirements: {rule.requirements.slice(0, 2).join(', ')}
                              {rule.requirements.length > 2 && ` +${rule.requirements.length - 2} more`}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="outlined" size="small">
                        Review
                      </Button>
                      <Button variant="outlined" startIcon={<Assignment />} size="small">
                        Audit
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Overview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Overall Score
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={94} 
                      sx={{ height: 8, borderRadius: 4, mt: 1 }}
                      color="success"
                    />
                    <Typography variant="h4" color="success.main">
                      94%
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Active Rules
                    </Typography>
                    <Typography variant="h4" color="primary">
                      12
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Non-Compliant
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      1
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Legal Templates Tab */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Legal Document Templates
                </Typography>
                <Button variant="contained" startIcon={<Upload />}>
                  Upload Template
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {legalTemplates.map((template) => (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6">{template.name}</Typography>
                          {template.isApproved && (
                            <CheckCircle color="success" fontSize="small" />
                          )}
                        </Box>
                        
                        <Chip label={template.type} variant="outlined" size="small" sx={{ mb: 1 }} />
                        
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Version {template.version}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Used {template.usageCount} times
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary">
                          Jurisdiction: {template.jurisdiction}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          Updated: {new Date(template.lastUpdated).toLocaleDateString()}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button variant="outlined" startIcon={<Visibility />} size="small">
                            Preview
                          </Button>
                          <Button variant="outlined" startIcon={<Download />} size="small">
                            Use
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Create Agreement Dialog */}
      <Dialog open={createAgreementOpen} onClose={() => setCreateAgreementOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Sharing Agreement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Agreement Title"
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Agreement Type</InputLabel>
              <Select label="Agreement Type">
                <MenuItem value="Bilateral">Bilateral</MenuItem>
                <MenuItem value="Multilateral">Multilateral</MenuItem>
                <MenuItem value="Community">Community</MenuItem>
                <MenuItem value="Commercial">Commercial</MenuItem>
                <MenuItem value="NDA">Non-Disclosure Agreement</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Classification Level</InputLabel>
              <Select label="Classification Level">
                <MenuItem value="TLP:WHITE">TLP:WHITE</MenuItem>
                <MenuItem value="TLP:GREEN">TLP:GREEN</MenuItem>
                <MenuItem value="TLP:AMBER">TLP:AMBER</MenuItem>
                <MenuItem value="TLP:RED">TLP:RED</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Participating Organizations"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Enter organization names, one per line"
            />
            <TextField
              label="Sharing Scope"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              placeholder="Define what information can be shared"
            />
            <FormControlLabel
              control={<Switch />}
              label="Require legal review before activation"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAgreementOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateAgreementOpen(false)}>
            Create Draft Agreement
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