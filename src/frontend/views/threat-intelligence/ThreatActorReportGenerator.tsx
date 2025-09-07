/**
 * Threat Actor Report Generator Component
 * Automated report generation and customization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  DatePicker,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';

import {
  Assessment,
  Description,
  PictureAsPdf,
  TableChart,
  Email,
  Schedule,
  Download,
  Send,
  Preview,
  Settings,
  CheckCircle,
  Pending,
  Error
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'technical' | 'tactical' | 'custom';
  sections: string[];
  format: 'pdf' | 'word' | 'html' | 'excel';
  audience: string;
  estimatedTime: number;
}

interface GeneratedReport {
  id: string;
  name: string;
  template: string;
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  recipients: string[];
  size: number;
  pages: number;
}

const ThreatActorReportGenerator: React.FC = () => {
  const theme = useTheme();
  
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-reports');

  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportConfig, setReportConfig] = useState({
    actors: [] as string[],
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    sections: [] as string[],
    format: 'pdf',
    recipients: [] as string[],
    schedule: false
  });

  const generateMockData = useCallback(() => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: 'exec-summary',
        name: 'Executive Summary',
        description: 'High-level overview for executive leadership',
        type: 'executive',
        sections: ['Threat Landscape', 'Key Findings', 'Risk Assessment', 'Recommendations'],
        format: 'pdf',
        audience: 'C-Suite, Board Members',
        estimatedTime: 5
      },
      {
        id: 'technical-deep-dive',
        name: 'Technical Deep Dive',
        description: 'Detailed technical analysis for security teams',
        type: 'technical',
        sections: ['TTPs Analysis', 'IOC Details', 'Attribution Evidence', 'Technical Recommendations'],
        format: 'pdf',
        audience: 'Security Analysts, SOC Teams',
        estimatedTime: 15
      },
      {
        id: 'tactical-intelligence',
        name: 'Tactical Intelligence Brief',
        description: 'Actionable intelligence for immediate response',
        type: 'tactical',
        sections: ['Current Threats', 'IOCs', 'Defensive Measures', 'Hunt Queries'],
        format: 'html',
        audience: 'Threat Hunters, Incident Responders',
        estimatedTime: 8
      },
      {
        id: 'custom-report',
        name: 'Custom Report',
        description: 'Fully customizable report template',
        type: 'custom',
        sections: ['Custom Sections'],
        format: 'pdf',
        audience: 'Various',
        estimatedTime: 10
      }
    ];

    const mockReports: GeneratedReport[] = [
      {
        id: 'report-1',
        name: 'Executive Summary - Q4 2024',
        template: 'Executive Summary',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        downloadUrl: '/reports/exec-summary-q4-2024.pdf',
        recipients: ['ceo@company.com', 'ciso@company.com'],
        size: 2.5,
        pages: 12
      },
      {
        id: 'report-2',
        name: 'APT29 Technical Analysis',
        template: 'Technical Deep Dive',
        status: 'generating',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        recipients: ['analyst@company.com'],
        size: 0,
        pages: 0
      },
      {
        id: 'report-3',
        name: 'Weekly Threat Brief',
        template: 'Tactical Intelligence Brief',
        status: 'scheduled',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        recipients: ['soc@company.com'],
        size: 0,
        pages: 0
      }
    ];

    setTemplates(mockTemplates);
    setReports(mockReports);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        generateMockData();
        addUIUXEvaluation('report-generator-loaded', 'success', {
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading report data:', error);
        addNotification('error', 'Failed to load report generator');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockData, addNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'generating': return 'info';
      case 'failed': return 'error';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'generating': return <CircularProgress size={20} />;
      case 'failed': return <Error />;
      case 'scheduled': return <Pending />;
      default: return <Description />;
    }
  };

  const steps = [
    'Select Template',
    'Configure Report',
    'Review & Generate'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" />
          Threat Actor Report Generator
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Generate automated reports and intelligence summaries
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Report Generator */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate New Report
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>Select Template</StepLabel>
                  <StepContent>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Report Template</InputLabel>
                      <Select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        label="Report Template"
                      >
                        {templates.map(template => (
                          <MenuItem key={template.id} value={template.id}>
                            {template.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {selectedTemplate && (
                      <Paper sx={{ p: 2, mb: 2 }}>
                        {(() => {
                          const template = templates.find(t => t.id === selectedTemplate);
                          return template ? (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                {template.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" paragraph>
                                {template.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={template.type} size="small" />
                                <Chip label={template.format.toUpperCase()} size="small" variant="outlined" />
                                <Chip label={`~${template.estimatedTime} min`} size="small" variant="outlined" />
                              </Box>
                            </Box>
                          ) : null;
                        })()}
                      </Paper>
                    )}
                    
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      disabled={!selectedTemplate}
                    >
                      Next
                    </Button>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>Configure Report</StepLabel>
                  <StepContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Report Sections</Typography>
                        <FormGroup>
                          {templates.find(t => t.id === selectedTemplate)?.sections.map(section => (
                            <FormControlLabel
                              key={section}
                              control={<Checkbox defaultChecked />}
                              label={section}
                            />
                          ))}
                        </FormGroup>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Output Format</Typography>
                        <FormControl fullWidth size="small">
                          <Select value="pdf">
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="word">Word Document</MenuItem>
                            <MenuItem value="html">HTML</MenuItem>
                            <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>Recipients</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="email1@company.com, email2@company.com"
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button onClick={() => setActiveStep(0)}>
                        Back
                      </Button>
                      <Button variant="contained" onClick={() => setActiveStep(2)}>
                        Next
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
                
                <Step>
                  <StepLabel>Review & Generate</StepLabel>
                  <StepContent>
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Report Summary</Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Template" secondary={templates.find(t => t.id === selectedTemplate)?.name} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Format" secondary="PDF" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Estimated Time" secondary="5-10 minutes" />
                        </ListItem>
                      </List>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button onClick={() => setActiveStep(1)}>
                        Back
                      </Button>
                      <Button 
                        variant="contained" 
                        startIcon={<Description />}
                        onClick={() => {
                          addNotification('success', 'Report generation started');
                          setActiveStep(0);
                          setSelectedTemplate('');
                        }}
                      >
                        Generate Report
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Report History */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report History ({reports.length})
              </Typography>
              
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List>
                  {reports.map(report => (
                    <ListItem
                      key={report.id}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(report.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">{report.name}</Typography>
                            <Chip 
                              label={report.status} 
                              size="small" 
                              color={getStatusColor(report.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Template: {report.template}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Created: {report.createdAt.toLocaleString()}
                            </Typography>
                            {report.completedAt && (
                              <Typography variant="caption" display="block">
                                Completed: {report.completedAt.toLocaleString()}
                              </Typography>
                            )}
                            {report.status === 'completed' && (
                              <Typography variant="caption" display="block">
                                Size: {report.size} MB • {report.pages} pages
                              </Typography>
                            )}
                            <Typography variant="caption" color="textSecondary">
                              Recipients: {report.recipients.join(', ')}
                            </Typography>
                          </Box>
                        }
                      />
                      {report.status === 'completed' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Button size="small" startIcon={<Download />}>
                            Download
                          </Button>
                          <Button size="small" startIcon={<Send />}>
                            Resend
                          </Button>
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Templates Overview */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Available Templates</Typography>
        </Grid>
        {templates.map(template => (
          <Grid item xs={12} md={6} lg={3} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {template.format === 'pdf' && <PictureAsPdf color="error" />}
                  {template.format === 'excel' && <TableChart color="success" />}
                  {template.format === 'html' && <Description color="info" />}
                  <Typography variant="h6">{template.name}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={template.type} size="small" color="primary" />
                  <Chip label={template.format.toUpperCase()} size="small" variant="outlined" />
                </Box>
                <Typography variant="caption" color="textSecondary" display="block">
                  Audience: {template.audience}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Est. Time: {template.estimatedTime} minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ThreatActorReportGenerator;