'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Gavel as ComplianceIcon,
  Assessment as AuditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TimelineIcon,
  Policy as PolicyIcon,
  VerifiedUser as VerifiedIcon,
  ReportProblem as RiskIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';

interface ComplianceFramework {
  id: string;
  name: string;
  fullName: string;
  version: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'in-progress';
  overallScore: number;
  lastAudit: string;
  nextAudit: string;
  categories: ComplianceCategory[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  remediation: {
    required: number;
    inProgress: number;
    completed: number;
  };
}

interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  score: number;
  requirements: ComplianceRequirement[];
  riskAssessment: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'met' | 'partial' | 'not-met' | 'not-applicable';
  evidence: string[];
  lastReview: string;
  assignedTo: string;
  dueDate: string;
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  mlModelImpact: 'none' | 'low' | 'medium' | 'high';
}

interface SecurityMetrics {
  dataProtection: {
    encryptionCoverage: number;
    dataClassification: number;
    accessControl: number;
    dataRetention: number;
  };
  modelSecurity: {
    adversarialTesting: number;
    biasDetection: number;
    modelValidation: number;
    deploymentSecurity: number;
  };
  operationalSecurity: {
    auditLogging: number;
    incidentResponse: number;
    vulnerabilityManagement: number;
    securityTraining: number;
  };
}

const EnterpriseSecurityCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    // Initialize with mock compliance data
    const mockFrameworks: ComplianceFramework[] = [
      {
        id: 'gdpr',
        name: 'GDPR',
        fullName: 'General Data Protection Regulation',
        version: '2018',
        status: 'compliant',
        overallScore: 92.5,
        lastAudit: '2024-01-15',
        nextAudit: '2024-04-15',
        riskLevel: 'low',
        remediation: {
          required: 2,
          inProgress: 1,
          completed: 45
        },
        categories: [
          {
            id: 'data-protection',
            name: 'Data Protection',
            description: 'Personal data processing and protection measures',
            score: 95.2,
            priority: 'high',
            riskAssessment: 'Low risk with current encryption and access controls',
            requirements: [
              {
                id: 'gdpr-art-25',
                title: 'Data Protection by Design',
                description: 'Implement privacy by design in ML model development',
                status: 'met',
                evidence: ['Privacy impact assessment', 'Data minimization documentation'],
                lastReview: '2024-01-10',
                assignedTo: 'Privacy Team',
                dueDate: '2024-03-10',
                automationLevel: 'semi-automated',
                mlModelImpact: 'high'
              }
            ]
          },
          {
            id: 'consent-management',
            name: 'Consent Management',
            description: 'Lawful basis and consent for data processing',
            score: 88.7,
            priority: 'high',
            riskAssessment: 'Medium risk due to model training data consent tracking',
            requirements: [
              {
                id: 'gdpr-art-6',
                title: 'Lawful Basis for Processing',
                description: 'Document lawful basis for ML training data',
                status: 'partial',
                evidence: ['Consent records', 'Legitimate interest assessment'],
                lastReview: '2024-01-08',
                assignedTo: 'Legal Team',
                dueDate: '2024-02-15',
                automationLevel: 'manual',
                mlModelImpact: 'high'
              }
            ]
          }
        ]
      },
      {
        id: 'soc2',
        name: 'SOC 2',
        fullName: 'Service Organization Control 2',
        version: '2017',
        status: 'compliant',
        overallScore: 89.3,
        lastAudit: '2024-01-20',
        nextAudit: '2024-07-20',
        riskLevel: 'low',
        remediation: {
          required: 3,
          inProgress: 2,
          completed: 28
        },
        categories: [
          {
            id: 'security',
            name: 'Security',
            description: 'Information security policies and controls',
            score: 91.4,
            priority: 'critical',
            riskAssessment: 'Low risk with comprehensive security controls',
            requirements: [
              {
                id: 'soc2-cc6.1',
                title: 'Logical Access Controls',
                description: 'Restrict logical access to ML systems',
                status: 'met',
                evidence: ['Access control matrix', 'User access reviews'],
                lastReview: '2024-01-15',
                assignedTo: 'Security Team',
                dueDate: '2024-04-15',
                automationLevel: 'fully-automated',
                mlModelImpact: 'medium'
              }
            ]
          }
        ]
      },
      {
        id: 'nist',
        name: 'NIST CSF',
        fullName: 'NIST Cybersecurity Framework',
        version: '1.1',
        status: 'partial',
        overallScore: 78.6,
        lastAudit: '2023-12-10',
        nextAudit: '2024-03-10',
        riskLevel: 'medium',
        remediation: {
          required: 8,
          inProgress: 5,
          completed: 18
        },
        categories: [
          {
            id: 'identify',
            name: 'Identify',
            description: 'Asset management and risk assessment',
            score: 82.1,
            priority: 'high',
            riskAssessment: 'Medium risk due to incomplete AI asset inventory',
            requirements: [
              {
                id: 'nist-id.am-1',
                title: 'Asset Inventory',
                description: 'Maintain inventory of ML models and data assets',
                status: 'partial',
                evidence: ['Asset register', 'Data flow diagrams'],
                lastReview: '2023-12-05',
                assignedTo: 'IT Security',
                dueDate: '2024-02-28',
                automationLevel: 'semi-automated',
                mlModelImpact: 'high'
              }
            ]
          }
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001',
        fullName: 'ISO/IEC 27001 Information Security Management',
        version: '2022',
        status: 'in-progress',
        overallScore: 65.4,
        lastAudit: '2023-11-15',
        nextAudit: '2024-05-15',
        riskLevel: 'high',
        remediation: {
          required: 12,
          inProgress: 8,
          completed: 15
        },
        categories: [
          {
            id: 'isms',
            name: 'ISMS',
            description: 'Information Security Management System',
            score: 68.9,
            priority: 'critical',
            riskAssessment: 'High risk due to incomplete ISMS implementation',
            requirements: [
              {
                id: 'iso-a.8.2',
                title: 'Information Classification',
                description: 'Classify ML training data and model outputs',
                status: 'not-met',
                evidence: [],
                lastReview: '2023-11-10',
                assignedTo: 'CISO Office',
                dueDate: '2024-03-30',
                automationLevel: 'manual',
                mlModelImpact: 'high'
              }
            ]
          }
        ]
      }
    ];

    const mockSecurityMetrics: SecurityMetrics = {
      dataProtection: {
        encryptionCoverage: 94.2,
        dataClassification: 78.5,
        accessControl: 91.7,
        dataRetention: 86.3
      },
      modelSecurity: {
        adversarialTesting: 82.1,
        biasDetection: 89.4,
        modelValidation: 95.6,
        deploymentSecurity: 88.9
      },
      operationalSecurity: {
        auditLogging: 96.8,
        incidentResponse: 84.2,
        vulnerabilityManagement: 79.6,
        securityTraining: 92.3
      }
    };

    setFrameworks(mockFrameworks);
    setSelectedFramework(mockFrameworks[0]);
    setSecurityMetrics(mockSecurityMetrics);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'partial': return 'warning';
      case 'non-compliant': return 'error';
      case 'in-progress': return 'info';
      case 'met': return 'success';
      case 'not-met': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'met':
        return <CheckIcon />;
      case 'partial': return <WarningIcon />;
      case 'non-compliant':
      case 'not-met':
        return <ErrorIcon />;
      case 'in-progress': return <TimelineIcon />;
      default: return <InfoIcon />;
    }
  };

  const complianceOverviewData = frameworks.map(framework => ({
    name: framework.name,
    score: framework.overallScore,
    status: framework.status,
  }));

  const securityMetricsData = securityMetrics ? [
    { name: 'Data Protection', value: Object.values(securityMetrics.dataProtection).reduce((a, b) => a + b, 0) / 4 },
    { name: 'Model Security', value: Object.values(securityMetrics.modelSecurity).reduce((a, b) => a + b, 0) / 4 },
    { name: 'Operational Security', value: Object.values(securityMetrics.operationalSecurity).reduce((a, b) => a + b, 0) / 4 },
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!selectedFramework || !securityMetrics) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🏢 Enterprise Security Compliance Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive compliance monitoring with ML-specific security controls
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AuditIcon />}
            onClick={() => setShowAuditDialog(true)}
          >
            Schedule Audit
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setShowReportDialog(true)}
          >
            Generate Report
          </Button>
          <Button variant="contained" startIcon={<RefreshIcon />}>
            Refresh Status
          </Button>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🏆 H2O.ai Competitive Edge</AlertTitle>
        <Typography variant="body2">
          <strong>ML-specific compliance monitoring:</strong> Specialized frameworks for AI/ML compliance (GDPR AI, SOC 2 ML), 
          automated evidence collection, bias monitoring, and model governance - enterprise compliance features H2O.ai doesn&apos;t provide!
        </Typography>
      </Alert>

      {/* Compliance Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ComplianceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {frameworks.filter(f => f.status === 'compliant').length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Compliant Frameworks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {frameworks.reduce((sum, f) => sum + f.remediation.required, 0)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Actions Required
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {(frameworks.reduce((sum, f) => sum + f.overallScore, 0) / frameworks.length).toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Average Compliance Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShieldIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {frameworks.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical').length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                High Risk Areas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Compliance Overview" />
        <Tab label="Framework Details" />
        <Tab label="Security Metrics" />
        <Tab label="ML Governance" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Compliance Status Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Framework Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip />
                    <Bar dataKey="score" fill="#2196f3" name="Compliance Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Framework Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Framework Summary
                </Typography>
                <List>
                  {frameworks.map((framework) => (
                    <ListItem key={framework.id} onClick={() => setSelectedFramework(framework)}>
                      <ListItemIcon>
                        {getStatusIcon(framework.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={framework.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Score: {framework.overallScore}%
                            </Typography>
                            <Chip
                              label={framework.status.toUpperCase()}
                              color={getStatusColor(framework.status) as 'success' | 'warning' | 'error' | 'info' | 'default'}
                              size="small"
                            />
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Compliance Activities
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Framework</TableCell>
                        <TableCell>Activity</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>GDPR</TableCell>
                        <TableCell>Data Protection Impact Assessment</TableCell>
                        <TableCell>
                          <Chip label="COMPLETED" color="success" size="small" />
                        </TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>Privacy Team</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>SOC 2</TableCell>
                        <TableCell>Access Control Review</TableCell>
                        <TableCell>
                          <Chip label="IN PROGRESS" color="warning" size="small" />
                        </TableCell>
                        <TableCell>2024-01-10</TableCell>
                        <TableCell>Security Team</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>NIST CSF</TableCell>
                        <TableCell>AI Asset Inventory Update</TableCell>
                        <TableCell>
                          <Chip label="OVERDUE" color="error" size="small" />
                        </TableCell>
                        <TableCell>2023-12-20</TableCell>
                        <TableCell>IT Security</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Framework
                </Typography>
                <List>
                  {frameworks.map((framework) => (
                    <ListItem
                      key={framework.id}
                      
                      onClick={() => setSelectedFramework(framework)}
                    >
                      <ListItemIcon>
                        <Badge
                          badgeContent={framework.remediation.required}
                          color="error"
                          
                        >
                          {getStatusIcon(framework.status)}
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={framework.fullName}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Score: {framework.overallScore}% • Risk: {framework.riskLevel.toUpperCase()}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={framework.overallScore}
                              sx={{ mt: 0.5 }}
                              color={framework.overallScore > 90 ? 'success' : framework.overallScore > 70 ? 'primary' : 'error'}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedFramework.fullName}
                  </Typography>
                  <Chip
                    label={selectedFramework.status.toUpperCase()}
                    color={getStatusColor(selectedFramework.status) as 'success' | 'warning' | 'error' | 'info' | 'default'}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Overall Score
                    </Typography>
                    <Typography variant="h5">
                      {selectedFramework.overallScore}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Risk Level
                    </Typography>
                    <Chip
                      label={selectedFramework.riskLevel.toUpperCase()}
                      color={getRiskColor(selectedFramework.riskLevel) as 'success' | 'warning' | 'error' | 'info' | 'default'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Last Audit
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedFramework.lastAudit).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Next Audit
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedFramework.nextAudit).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom>
                  Compliance Categories
                </Typography>
                
                {selectedFramework.categories.map((category) => (
                  <Accordion key={category.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="subtitle1">{category.name}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={category.score}
                          sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          color={category.score > 90 ? 'success' : category.score > 70 ? 'primary' : 'error'}
                        />
                        <Typography variant="body2">{category.score.toFixed(1)}%</Typography>
                        <Chip
                          label={category.priority.toUpperCase()}
                          color={category.priority === 'critical' ? 'error' : category.priority === 'high' ? 'warning' : 'info'}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {category.description}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Risk Assessment:</strong> {category.riskAssessment}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Requirements:
                      </Typography>
                      <List dense>
                        {category.requirements.map((req) => (
                          <ListItem key={req.id}>
                            <ListItemIcon>
                              {getStatusIcon(req.status)}
                            </ListItemIcon>
                            <ListItemText
                              primary={req.title}
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    {req.description}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Chip label={`ML Impact: ${req.mlModelImpact}`} size="small" />
                                    <Chip label={req.automationLevel} size="small" variant="outlined" />
                                    <Chip label={`Due: ${new Date(req.dueDate).toLocaleDateString()}`} size="small" />
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Security Metrics Overview
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={securityMetricsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {securityMetricsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Data Protection Metrics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Encryption Coverage"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={securityMetrics.dataProtection.encryptionCoverage}
                            sx={{ flexGrow: 1, height: 8 }}
                            color="success"
                          />
                          <Typography variant="body2">
                            {securityMetrics.dataProtection.encryptionCoverage}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Data Classification"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={securityMetrics.dataProtection.dataClassification}
                            sx={{ flexGrow: 1, height: 8 }}
                            color="warning"
                          />
                          <Typography variant="body2">
                            {securityMetrics.dataProtection.dataClassification}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Access Control"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={securityMetrics.dataProtection.accessControl}
                            sx={{ flexGrow: 1, height: 8 }}
                            color="success"
                          />
                          <Typography variant="body2">
                            {securityMetrics.dataProtection.accessControl}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Data Retention"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={securityMetrics.dataProtection.dataRetention}
                            sx={{ flexGrow: 1, height: 8 }}
                            color="primary"
                          />
                          <Typography variant="body2">
                            {securityMetrics.dataProtection.dataRetention}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Security & Operational Security Metrics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Model Security
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Adversarial Testing"
                          secondary={`${securityMetrics.modelSecurity.adversarialTesting}%`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={securityMetrics.modelSecurity.adversarialTesting}
                          sx={{ width: 100, height: 6 }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Bias Detection"
                          secondary={`${securityMetrics.modelSecurity.biasDetection}%`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={securityMetrics.modelSecurity.biasDetection}
                          sx={{ width: 100, height: 6 }}
                          color="success"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Model Validation"
                          secondary={`${securityMetrics.modelSecurity.modelValidation}%`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={securityMetrics.modelSecurity.modelValidation}
                          sx={{ width: 100, height: 6 }}
                          color="success"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Operational Security
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Audit Logging"
                          secondary={`${securityMetrics.operationalSecurity.auditLogging}%`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={securityMetrics.operationalSecurity.auditLogging}
                          sx={{ width: 100, height: 6 }}
                          color="success"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Incident Response"
                          secondary={`${securityMetrics.operationalSecurity.incidentResponse}%`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={securityMetrics.operationalSecurity.incidentResponse}
                          sx={{ width: 100, height: 6 }}
                          color="primary"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Vulnerability Management"
                          secondary={`${securityMetrics.operationalSecurity.vulnerabilityManagement}%`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={securityMetrics.operationalSecurity.vulnerabilityManagement}
                          sx={{ width: 100, height: 6 }}
                          color="warning"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>🤖 ML-Specific Governance</AlertTitle>
              Specialized compliance controls for machine learning and AI systems
            </Alert>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Governance Checklist
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Model Inventory & Documentation"
                      secondary="All ML models cataloged with metadata"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Bias Testing & Monitoring"
                      secondary="Automated bias detection in production"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Explainability Requirements"
                      secondary="70% of models have explanation capabilities"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data Lineage Tracking"
                      secondary="Incomplete data provenance documentation"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Ethics & Responsible AI
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ethics Review Board"
                      secondary="AI Ethics Committee established"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PolicyIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Responsible AI Policies"
                      secondary="Comprehensive AI governance policies"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AnalyticsIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Impact Assessments"
                      secondary="Algorithmic impact assessments required"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RiskIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Risk Management"
                      secondary="AI risk framework implementation"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ML Compliance Dashboard
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Model Name</TableCell>
                        <TableCell>Risk Level</TableCell>
                        <TableCell>Bias Score</TableCell>
                        <TableCell>Explainability</TableCell>
                        <TableCell>Data Compliance</TableCell>
                        <TableCell>Last Review</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Threat Detection v3.1</TableCell>
                        <TableCell>
                          <Chip label="MEDIUM" color="warning" size="small" />
                        </TableCell>
                        <TableCell>91.2%</TableCell>
                        <TableCell>
                          <CheckIcon color="success" />
                        </TableCell>
                        <TableCell>
                          <Chip label="GDPR" color="success" size="small" />
                        </TableCell>
                        <TableCell>2024-01-15</TableCell>
                        <TableCell>
                          <Chip label="COMPLIANT" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Anomaly Detector v2.0</TableCell>
                        <TableCell>
                          <Chip label="LOW" color="success" size="small" />
                        </TableCell>
                        <TableCell>88.7%</TableCell>
                        <TableCell>
                          <WarningIcon color="warning" />
                        </TableCell>
                        <TableCell>
                          <Chip label="SOC2" color="info" size="small" />
                        </TableCell>
                        <TableCell>2024-01-10</TableCell>
                        <TableCell>
                          <Chip label="REVIEW" color="warning" size="small" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Audit Dialog */}
      <Dialog open={showAuditDialog} onClose={() => setShowAuditDialog(false)}>
        <DialogTitle>Schedule Compliance Audit</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Schedule a comprehensive compliance audit for selected frameworks.
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              Automated audit will include ML-specific security controls, bias testing, and data governance validation.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAuditDialog(false)}>Cancel</Button>
          <Button variant="contained">Schedule Audit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnterpriseSecurityCompliance;
