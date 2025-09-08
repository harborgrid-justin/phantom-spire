/**
 * Network Management Dashboard
 * Central dashboard for all network management modules
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountTree as TopologyIcon,
  Storage as DeviceIcon,
  TrendingUp as AnalyticsIcon,
  Security as SecurityIcon,
  Settings as ConfigIcon,
  Speed as OptimizationIcon,
  Policy as ComplianceIcon,
  Router as RouterIcon,
  MonitorHeart as MonitorIcon,
  Shield as ShieldIcon,
  Engineering as EngineeringIcon,
  Analytics as ReportsIcon
} from '@mui/icons-material';

interface NetworkModule {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'maintenance';
  path: string;
  icon: React.ReactNode;
}

const networkModules: NetworkModule[] = [
  // Infrastructure Management
  { id: 'infrastructure-dashboard', name: 'Infrastructure Dashboard', description: 'Centralized network infrastructure monitoring and management', category: 'infrastructure', status: 'active', path: '/network-management/infrastructure-dashboard', icon: <DashboardIcon /> },
  { id: 'topology-visualizer', name: 'Topology Visualizer', description: 'Interactive network topology mapping and visualization', category: 'infrastructure', status: 'active', path: '/network-management/topology-visualizer', icon: <TopologyIcon /> },
  { id: 'device-inventory', name: 'Device Inventory', description: 'Comprehensive network device discovery and inventory', category: 'infrastructure', status: 'active', path: '/network-management/device-inventory', icon: <DeviceIcon /> },
  { id: 'asset-tracker', name: 'Asset Tracker', description: 'Real-time network asset tracking and lifecycle management', category: 'infrastructure', status: 'active', path: '/network-management/asset-tracker', icon: <RouterIcon /> },
  { id: 'capacity-planner', name: 'Capacity Planner', description: 'Advanced network capacity planning and forecasting', category: 'infrastructure', status: 'active', path: '/network-management/capacity-planner', icon: <AnalyticsIcon /> },
  { id: 'change-manager', name: 'Change Manager', description: 'Network change management and approval workflow', category: 'infrastructure', status: 'active', path: '/network-management/change-manager', icon: <EngineeringIcon /> },
  { id: 'deployment-automation', name: 'Deployment Automation', description: 'Automated network deployment and provisioning', category: 'infrastructure', status: 'active', path: '/network-management/deployment-automation', icon: <EngineeringIcon /> },
  { id: 'redundancy-analyzer', name: 'Redundancy Analyzer', description: 'Network redundancy analysis and high availability planning', category: 'infrastructure', status: 'active', path: '/network-management/redundancy-analyzer', icon: <AnalyticsIcon /> },
  { id: 'documentation-portal', name: 'Documentation Portal', description: 'Centralized network documentation and knowledge management', category: 'infrastructure', status: 'active', path: '/network-management/documentation-portal', icon: <ReportsIcon /> },
  { id: 'service-mapping', name: 'Service Mapping', description: 'Service dependency mapping and network service catalog', category: 'infrastructure', status: 'active', path: '/network-management/service-mapping', icon: <TopologyIcon /> },
  { id: 'lifecycle-manager', name: 'Lifecycle Manager', description: 'End-to-end network infrastructure lifecycle management', category: 'infrastructure', status: 'active', path: '/network-management/lifecycle-manager', icon: <EngineeringIcon /> },
  { id: 'integration-hub', name: 'Integration Hub', description: 'Network integration platform for third-party tools and systems', category: 'infrastructure', status: 'active', path: '/network-management/integration-hub', icon: <RouterIcon /> },

  // Monitoring & Analytics
  { id: 'performance-monitor', name: 'Performance Monitor', description: 'Real-time network performance monitoring and alerting', category: 'monitoring', status: 'active', path: '/network-management/performance-monitor', icon: <MonitorIcon /> },
  { id: 'traffic-analyzer', name: 'Traffic Analyzer', description: 'Deep packet inspection and traffic pattern analysis', category: 'monitoring', status: 'active', path: '/network-management/traffic-analyzer', icon: <AnalyticsIcon /> },
  { id: 'bandwidth-monitor', name: 'Bandwidth Monitor', description: 'Bandwidth utilization monitoring and optimization', category: 'monitoring', status: 'active', path: '/network-management/bandwidth-monitor', icon: <MonitorIcon /> },
  { id: 'latency-tracker', name: 'Latency Tracker', description: 'Network latency monitoring and troubleshooting', category: 'monitoring', status: 'active', path: '/network-management/latency-tracker', icon: <MonitorIcon /> },
  { id: 'health-dashboard', name: 'Health Dashboard', description: 'Comprehensive network health status and diagnostics', category: 'monitoring', status: 'active', path: '/network-management/health-dashboard', icon: <DashboardIcon /> },
  { id: 'anomaly-detector', name: 'Anomaly Detector', description: 'AI-powered network anomaly detection and incident response', category: 'monitoring', status: 'active', path: '/network-management/anomaly-detector', icon: <AnalyticsIcon /> },
  { id: 'metrics-collector', name: 'Metrics Collector', description: 'Centralized network metrics collection and aggregation', category: 'monitoring', status: 'active', path: '/network-management/metrics-collector', icon: <AnalyticsIcon /> },
  { id: 'alerting-engine', name: 'Alerting Engine', description: 'Intelligent network alerting and notification management', category: 'monitoring', status: 'active', path: '/network-management/alerting-engine', icon: <MonitorIcon /> },
  { id: 'reporting-suite', name: 'Reporting Suite', description: 'Executive network reporting and business intelligence', category: 'monitoring', status: 'active', path: '/network-management/reporting-suite', icon: <ReportsIcon /> },
  { id: 'predictive-analytics', name: 'Predictive Analytics', description: 'Predictive network analytics and trend forecasting', category: 'monitoring', status: 'active', path: '/network-management/predictive-analytics', icon: <AnalyticsIcon /> },

  // Security Management
  { id: 'security-dashboard', name: 'Security Dashboard', description: 'Unified network security monitoring and threat detection', category: 'security', status: 'active', path: '/network-management/security-dashboard', icon: <SecurityIcon /> },
  { id: 'firewall-manager', name: 'Firewall Manager', description: 'Centralized firewall policy management and orchestration', category: 'security', status: 'active', path: '/network-management/firewall-manager', icon: <ShieldIcon /> },
  { id: 'intrusion-detector', name: 'Intrusion Detector', description: 'Advanced network intrusion detection and prevention', category: 'security', status: 'active', path: '/network-management/intrusion-detector', icon: <SecurityIcon /> },
  { id: 'access-controller', name: 'Access Controller', description: 'Network access control and identity management', category: 'security', status: 'active', path: '/network-management/access-controller', icon: <SecurityIcon /> },
  { id: 'vulnerability-scanner', name: 'Vulnerability Scanner', description: 'Automated network vulnerability assessment and remediation', category: 'security', status: 'active', path: '/network-management/vulnerability-scanner', icon: <SecurityIcon /> },
  { id: 'threat-intelligence', name: 'Threat Intelligence', description: 'Network-focused threat intelligence and IOC management', category: 'security', status: 'active', path: '/network-management/threat-intelligence', icon: <SecurityIcon /> },
  { id: 'security-compliance', name: 'Security Compliance', description: 'Network security compliance monitoring and audit', category: 'security', status: 'active', path: '/network-management/security-compliance', icon: <ComplianceIcon /> },
  { id: 'incident-responder', name: 'Incident Responder', description: 'Network security incident response and forensics', category: 'security', status: 'active', path: '/network-management/incident-responder', icon: <SecurityIcon /> },

  // Configuration Management
  { id: 'config-manager', name: 'Config Manager', description: 'Centralized network device configuration management', category: 'configuration', status: 'active', path: '/network-management/config-manager', icon: <ConfigIcon /> },
  { id: 'config-backup', name: 'Config Backup', description: 'Automated network configuration backup and versioning', category: 'configuration', status: 'active', path: '/network-management/config-backup', icon: <ConfigIcon /> },
  { id: 'config-compliance', name: 'Config Compliance', description: 'Network configuration compliance monitoring and enforcement', category: 'configuration', status: 'active', path: '/network-management/config-compliance', icon: <ComplianceIcon /> },
  { id: 'template-manager', name: 'Template Manager', description: 'Network configuration template library and deployment', category: 'configuration', status: 'active', path: '/network-management/template-manager', icon: <ConfigIcon /> },
  { id: 'config-automation', name: 'Config Automation', description: 'Network configuration automation and orchestration', category: 'configuration', status: 'active', path: '/network-management/config-automation', icon: <EngineeringIcon /> },
  { id: 'config-validator', name: 'Config Validator', description: 'Network configuration validation and syntax checking', category: 'configuration', status: 'active', path: '/network-management/config-validator', icon: <ConfigIcon /> },
  { id: 'config-rollback', name: 'Config Rollback', description: 'Network configuration rollback and disaster recovery', category: 'configuration', status: 'active', path: '/network-management/config-rollback', icon: <ConfigIcon /> },

  // Performance Optimization
  { id: 'optimization-dashboard', name: 'Optimization Dashboard', description: 'Network performance optimization and tuning', category: 'optimization', status: 'active', path: '/network-management/optimization-dashboard', icon: <OptimizationIcon /> },
  { id: 'qos-manager', name: 'QoS Manager', description: 'Quality of Service management and policy enforcement', category: 'optimization', status: 'active', path: '/network-management/qos-manager', icon: <OptimizationIcon /> },
  { id: 'load-balancer', name: 'Load Balancer', description: 'Intelligent network load balancing and traffic distribution', category: 'optimization', status: 'active', path: '/network-management/load-balancer', icon: <OptimizationIcon /> },
  { id: 'performance-tuner', name: 'Performance Tuner', description: 'Automated network performance tuning and optimization', category: 'optimization', status: 'active', path: '/network-management/performance-tuner', icon: <OptimizationIcon /> },
  { id: 'congestion-manager', name: 'Congestion Manager', description: 'Network congestion detection and mitigation', category: 'optimization', status: 'active', path: '/network-management/congestion-manager', icon: <OptimizationIcon /> },
  { id: 'cache-optimizer', name: 'Cache Optimizer', description: 'Network caching optimization and content delivery', category: 'optimization', status: 'active', path: '/network-management/cache-optimizer', icon: <OptimizationIcon /> },
  { id: 'resource-optimizer', name: 'Resource Optimizer', description: 'Network resource allocation and utilization optimization', category: 'optimization', status: 'active', path: '/network-management/resource-optimizer', icon: <OptimizationIcon /> },

  // Compliance & Governance
  { id: 'compliance-dashboard', name: 'Compliance Dashboard', description: 'Network compliance monitoring and governance', category: 'compliance', status: 'active', path: '/network-management/compliance-dashboard', icon: <ComplianceIcon /> },
  { id: 'audit-manager', name: 'Audit Manager', description: 'Network audit management and regulatory compliance', category: 'compliance', status: 'active', path: '/network-management/audit-manager', icon: <ComplianceIcon /> },
  { id: 'policy-engine', name: 'Policy Engine', description: 'Network policy management and enforcement automation', category: 'compliance', status: 'active', path: '/network-management/policy-engine', icon: <PolicyIcon /> },
  { id: 'governance-portal', name: 'Governance Portal', description: 'Network governance framework and oversight management', category: 'compliance', status: 'active', path: '/network-management/governance-portal', icon: <ComplianceIcon /> },
  { id: 'compliance-reporter', name: 'Compliance Reporter', description: 'Automated network compliance reporting and documentation', category: 'compliance', status: 'active', path: '/network-management/compliance-reporter', icon: <ReportsIcon /> }
];

export const NetworkManagementDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Modules', icon: <DashboardIcon /> },
    { key: 'infrastructure', label: 'Infrastructure', icon: <RouterIcon /> },
    { key: 'monitoring', label: 'Monitoring', icon: <MonitorIcon /> },
    { key: 'security', label: 'Security', icon: <SecurityIcon /> },
    { key: 'configuration', label: 'Configuration', icon: <ConfigIcon /> },
    { key: 'optimization', label: 'Optimization', icon: <OptimizationIcon /> },
    { key: 'compliance', label: 'Compliance', icon: <ComplianceIcon /> }
  ];

  const filteredModules = selectedCategory === 'all' 
    ? networkModules 
    : networkModules.filter(module => module.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getModuleCountByCategory = (category: string) => {
    return networkModules.filter(module => module.category === category).length;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" component="h1">
          Network Management Platform
        </Typography>
        <Chip 
          label={`${networkModules.length} Modules Available`} 
          color="primary" 
          variant="outlined"
        />
      </Box>

      <Typography variant="body1" color="textSecondary" gutterBottom>
        Comprehensive network management platform with 49 business-ready modules covering infrastructure, monitoring, security, configuration, optimization, and compliance.
      </Typography>

      {/* Category Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {categories.slice(1).map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={category.key}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                bgcolor: selectedCategory === category.key ? 'primary.light' : 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => setSelectedCategory(category.key)}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                  {category.icon}
                </Avatar>
                <Typography variant="h6" component="div">
                  {getModuleCountByCategory(category.key)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {category.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={categories.findIndex(cat => cat.key === selectedCategory)}
          onChange={(_, newValue) => setSelectedCategory(categories[newValue].key)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((category) => (
            <Tab 
              key={category.key}
              label={`${category.label} (${category.key === 'all' ? networkModules.length : getModuleCountByCategory(category.key)})`}
              icon={category.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Modules Grid */}
      <Grid container spacing={3}>
        {filteredModules.map((module) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                    {module.icon}
                  </Avatar>
                  <Chip 
                    label={module.status} 
                    color={getStatusColor(module.status) as any} 
                    size="small"
                  />
                </Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {module.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  onClick={() => window.location.href = module.path}
                >
                  Open Module
                </Button>
                <Button size="small">
                  Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredModules.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No modules found in this category
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NetworkManagementDashboard;