import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  Badge,
  Chip,
  useTheme
} from '@mui/material';
import {
  Emergency,
  Search,
  Visibility,
  BugReport,
  Science,
  AssignmentTurnedIn,
  ExpandLess,
  ExpandMore,
  FiberManualRecord
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
  isNew?: boolean;
}

interface NavigationCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  count: number;
  pages: NavigationItem[];
}

const SecOpsNavigation: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['incident-response']);

  const navigationData: NavigationCategory[] = [
    {
      id: 'incident-response',
      label: 'Incident Response',
      icon: <Emergency />,
      description: 'Advanced incident response and forensic capabilities',
      count: 10,
      pages: [
        { id: 'advanced-playbook-orchestrator', label: 'Advanced Playbook Orchestrator', path: '/secops/incident-response/advanced-playbook-orchestrator', isNew: true },
        { id: 'automated-response-workflow', label: 'Automated Response Workflow', path: '/secops/incident-response/automated-response-workflow', isNew: true },
        { id: 'escalation-management-system', label: 'Escalation Management System', path: '/secops/incident-response/escalation-management-system', isNew: true },
        { id: 'forensic-timeline-analyzer', label: 'Forensic Timeline Analyzer', path: '/secops/incident-response/forensic-timeline-analyzer', isNew: true },
        { id: 'evidence-collection-manager', label: 'Evidence Collection Manager', path: '/secops/incident-response/evidence-collection-manager', isNew: true },
        { id: 'containment-procedure-engine', label: 'Containment Procedure Engine', path: '/secops/incident-response/containment-procedure-engine', isNew: true },
        { id: 'recovery-planning-center', label: 'Recovery Planning Center', path: '/secops/incident-response/recovery-planning-center', isNew: true },
        { id: 'post-incident-analysis-hub', label: 'Post Incident Analysis Hub', path: '/secops/incident-response/post-incident-analysis-hub', isNew: true },
        { id: 'lessons-learned-repository', label: 'Lessons Learned Repository', path: '/secops/incident-response/lessons-learned-repository', isNew: true },
        { id: 'compliance-report-generator', label: 'Compliance Report Generator', path: '/secops/incident-response/compliance-report-generator', isNew: true }
      ]
    },
    {
      id: 'threat-hunting',
      label: 'Threat Hunting',
      icon: <Search />,
      description: 'Advanced threat hunting and detection capabilities',
      count: 8,
      pages: [
        { id: 'advanced-hunting-query-builder', label: 'Advanced Hunting Query Builder', path: '/secops/threat-hunting/advanced-hunting-query-builder', isNew: true },
        { id: 'ioc-tracking-dashboard', label: 'IOC Tracking Dashboard', path: '/secops/threat-hunting/ioc-tracking-dashboard', isNew: true },
        { id: 'behavioral-analysis-engine', label: 'Behavioral Analysis Engine', path: '/secops/threat-hunting/behavioral-analysis-engine', isNew: true },
        { id: 'threat-actor-profiling-center', label: 'Threat Actor Profiling Center', path: '/secops/threat-hunting/threat-actor-profiling-center', isNew: true },
        { id: 'campaign-tracking-system', label: 'Campaign Tracking System', path: '/secops/threat-hunting/campaign-tracking-system', isNew: true },
        { id: 'ttaps-analysis-platform', label: 'TTPs Analysis Platform', path: '/secops/threat-hunting/ttaps-analysis-platform', isNew: true },
        { id: 'threat-landscape-mapper', label: 'Threat Landscape Mapper', path: '/secops/threat-hunting/threat-landscape-mapper', isNew: true },
        { id: 'hunting-metrics-dashboard', label: 'Hunting Metrics Dashboard', path: '/secops/threat-hunting/hunting-metrics-dashboard', isNew: true }
      ]
    },
    {
      id: 'security-monitoring',
      label: 'Security Monitoring',
      icon: <Visibility />,
      description: 'Real-time security monitoring and alerting',
      count: 8,
      pages: [
        { id: 'realtime-security-dashboard', label: 'Real-time Security Dashboard', path: '/secops/security-monitoring/realtime-security-dashboard', isNew: true },
        { id: 'alert-correlation-engine', label: 'Alert Correlation Engine', path: '/secops/security-monitoring/alert-correlation-engine', isNew: true },
        { id: 'siem-integration-hub', label: 'SIEM Integration Hub', path: '/secops/security-monitoring/siem-integration-hub', isNew: true },
        { id: 'log-analysis-workbench', label: 'Log Analysis Workbench', path: '/secops/security-monitoring/log-analysis-workbench', isNew: true },
        { id: 'anomaly-detection-center', label: 'Anomaly Detection Center', path: '/secops/security-monitoring/anomaly-detection-center', isNew: true },
        { id: 'baseline-monitoring-system', label: 'Baseline Monitoring System', path: '/secops/security-monitoring/baseline-monitoring-system', isNew: true },
        { id: 'compliance-monitoring-dashboard', label: 'Compliance Monitoring Dashboard', path: '/secops/security-monitoring/compliance-monitoring-dashboard', isNew: true },
        { id: 'security-kpi-dashboard', label: 'Security KPI Dashboard', path: '/secops/security-monitoring/security-kpi-dashboard', isNew: true }
      ]
    },
    {
      id: 'vulnerability-management',
      label: 'Vulnerability Management',
      icon: <BugReport />,
      description: 'Comprehensive vulnerability assessment and management',
      count: 8,
      pages: [
        { id: 'asset-discovery-platform', label: 'Asset Discovery Platform', path: '/secops/vulnerability-management/asset-discovery-platform', isNew: true },
        { id: 'vulnerability-scanning-orchestrator', label: 'Vulnerability Scanning Orchestrator', path: '/secops/vulnerability-management/vulnerability-scanning-orchestrator', isNew: true },
        { id: 'risk-scoring-engine', label: 'Risk Scoring Engine', path: '/secops/vulnerability-management/risk-scoring-engine', isNew: true },
        { id: 'patch-management-center', label: 'Patch Management Center', path: '/secops/vulnerability-management/patch-management-center', isNew: true },
        { id: 'remediation-tracking-system', label: 'Remediation Tracking System', path: '/secops/vulnerability-management/remediation-tracking-system', isNew: true },
        { id: 'compliance-validation-hub', label: 'Compliance Validation Hub', path: '/secops/vulnerability-management/compliance-validation-hub', isNew: true },
        { id: 'threat-correlation-analyzer', label: 'Threat Correlation Analyzer', path: '/secops/vulnerability-management/threat-correlation-analyzer', isNew: true },
        { id: 'vulnerability-analytics-dashboard', label: 'Vulnerability Analytics Dashboard', path: '/secops/vulnerability-management/vulnerability-analytics-dashboard', isNew: true }
      ]
    },
    {
      id: 'digital-forensics',
      label: 'Digital Forensics',
      icon: <Science />,
      description: 'Advanced digital forensics and analysis tools',
      count: 7,
      pages: [
        { id: 'evidence-acquisition-workflow', label: 'Evidence Acquisition Workflow', path: '/secops/digital-forensics/evidence-acquisition-workflow', isNew: true },
        { id: 'forensic-imaging-platform', label: 'Forensic Imaging Platform', path: '/secops/digital-forensics/forensic-imaging-platform', isNew: true },
        { id: 'timeline-analysis-workbench', label: 'Timeline Analysis Workbench', path: '/secops/digital-forensics/timeline-analysis-workbench', isNew: true },
        { id: 'malware-analysis-lab', label: 'Malware Analysis Lab', path: '/secops/digital-forensics/malware-analysis-lab', isNew: true },
        { id: 'network-forensics-center', label: 'Network Forensics Center', path: '/secops/digital-forensics/network-forensics-center', isNew: true },
        { id: 'mobile-forensics-workbench', label: 'Mobile Forensics Workbench', path: '/secops/digital-forensics/mobile-forensics-workbench', isNew: true },
        { id: 'cloud-forensics-analyzer', label: 'Cloud Forensics Analyzer', path: '/secops/digital-forensics/cloud-forensics-analyzer', isNew: true }
      ]
    },
    {
      id: 'compliance-audit',
      label: 'Compliance & Audit',
      icon: <AssignmentTurnedIn />,
      description: 'Compliance management and audit capabilities',
      count: 8,
      pages: [
        { id: 'framework-mapping-center', label: 'Framework Mapping Center', path: '/secops/compliance-audit/framework-mapping-center', isNew: true },
        { id: 'control-validation-system', label: 'Control Validation System', path: '/secops/compliance-audit/control-validation-system', isNew: true },
        { id: 'audit-trail-analyzer', label: 'Audit Trail Analyzer', path: '/secops/compliance-audit/audit-trail-analyzer', isNew: true },
        { id: 'compliance-reporting-hub', label: 'Compliance Reporting Hub', path: '/secops/compliance-audit/compliance-reporting-hub', isNew: true },
        { id: 'risk-assessment-platform', label: 'Risk Assessment Platform', path: '/secops/compliance-audit/risk-assessment-platform', isNew: true },
        { id: 'policy-management-center', label: 'Policy Management Center', path: '/secops/compliance-audit/policy-management-center', isNew: true },
        { id: 'certification-tracking-system', label: 'Certification Tracking System', path: '/secops/compliance-audit/certification-tracking-system', isNew: true },
        { id: 'remediation-planning-workbench', label: 'Remediation Planning Workbench', path: '/secops/compliance-audit/remediation-planning-workbench', isNew: true }
      ]
    }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const isCategoryActive = (categoryId: string) => {
    return location.pathname.includes(`/secops/${categoryId}/`);
  };

  const totalPages = navigationData.reduce((sum, category) => sum + category.count, 0);

  return (
    <Box sx={{ width: 320, height: '100%', borderRight: 1, borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          SecOps Platform
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip 
            label={`${totalPages} Pages`} 
            color="primary" 
            size="small" 
            variant="outlined"
          />
          <Chip 
            label="Business Ready" 
            color="success" 
            size="small" 
          />
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ p: 1, height: 'calc(100% - 120px)', overflow: 'auto' }}>
        {navigationData.map((category) => (
          <Box key={category.id}>
            {/* Category Header */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleCategoryToggle(category.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: isCategoryActive(category.id) 
                    ? theme.palette.primary.main + '15' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '25'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isCategoryActive(category.id) ? 'primary.main' : 'text.secondary' }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {category.label}
                      </Typography>
                      <Badge badgeContent={category.count} color="primary" />
                    </Box>
                  }
                  secondary={category.description}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: { fontSize: '0.75rem' }
                  }}
                />
                {expandedCategories.includes(category.id) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            {/* Category Pages */}
            <Collapse in={expandedCategories.includes(category.id)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ pl: 2 }}>
                {category.pages.map((page) => (
                  <ListItem key={page.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigate(page.path)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.25,
                        backgroundColor: isCurrentPath(page.path) 
                          ? theme.palette.primary.main + '20' 
                          : 'transparent',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main + '15'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FiberManualRecord 
                          sx={{ 
                            fontSize: 8, 
                            color: isCurrentPath(page.path) ? 'primary.main' : 'text.disabled' 
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: isCurrentPath(page.path) ? 600 : 400,
                                color: isCurrentPath(page.path) ? 'primary.main' : 'text.primary'
                              }}
                            >
                              {page.label}
                            </Typography>
                            {page.isNew && (
                              <Chip 
                                label="NEW" 
                                color="success" 
                                size="small" 
                                sx={{ 
                                  height: 16, 
                                  fontSize: '0.65rem',
                                  '& .MuiChip-label': { 
                                    px: 0.5 
                                  }
                                }} 
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          49 Business-Ready SecOps Pages
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Complete Frontend-Backend Integration
        </Typography>
      </Box>
    </Box>
  );
};

export default SecOpsNavigation;