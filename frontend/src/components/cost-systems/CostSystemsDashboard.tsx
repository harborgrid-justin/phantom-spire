/**
 * Cost Systems Dashboard Component
 * Unified dashboard for cost systems management and monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Security,
  Integration,
  MonetizationOn,
  Business,
  People,
  Engineering,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';

// TypeScript interfaces
interface CostSystemsAlignment {
  business: {
    tracking: BusinessCostMetrics;
    optimization: OptimizationRecommendation[];
    reporting: CostReport[];
  };
  customer: {
    analysis: CustomerCostAnalysis;
    insights: CostInsight[];
    recommendations: CustomerRecommendation[];
  };
  engineering: {
    standardization: StandardizationMetrics;
    integration: IntegrationStatus;
    architecture: ArchitectureHealth;
  };
}

interface BusinessCostMetrics {
  totalCost: number;
  operationalCost: number;
  infrastructureCost: number;
  efficiency: number;
  budgetUtilization: number;
  trends: {
    daily: TrendAnalysis;
    weekly: TrendAnalysis;
    monthly: TrendAnalysis;
  };
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'low' | 'medium' | 'high';
}

interface CustomerCostAnalysis {
  customerSegment: string;
  costPerCustomer: number;
  lifetimeValue: number;
  valueRatio: number;
  profitabilityScore: number;
}

interface CostInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

interface CustomerRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  estimatedSavings: number;
}

interface StandardizationMetrics {
  consistency: number;
  coverage: number;
  compliance: number;
  maturity: number;
}

interface IntegrationStatus {
  frontend: boolean;
  backend: boolean;
  businessLogic: boolean;
  apis: boolean;
  databases: boolean;
}

interface ArchitectureHealth {
  modularity: number;
  maintainability: number;
  scalability: number;
  performance: number;
  security: number;
}

interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number;
}

interface CostReport {
  id: string;
  type: string;
  period: string;
  metrics: Record<string, number>;
}

interface DashboardData {
  summary: {
    businessReadinessScore: number;
    customerReadinessScore: number;
    engineeringAlignmentScore: number;
    totalPotentialSavings: number;
    activeRecommendations: number;
  };
  business: {
    metrics: BusinessCostMetrics;
    topOptimizations: OptimizationRecommendation[];
  };
  customer: {
    analysis: CustomerCostAnalysis;
    topInsights: CostInsight[];
    topRecommendations: CustomerRecommendation[];
  };
  engineering: {
    standardization: StandardizationMetrics;
    integration: IntegrationStatus;
    architecture: ArchitectureHealth;
  };
}

export const CostSystemsDashboard: React.FC = () => {
  const [alignment, setAlignment] = useState<CostSystemsAlignment | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cost systems data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch alignment data
      const alignmentResponse = await fetch('/api/v1/cost-systems/alignment');
      const alignmentResult = await alignmentResponse.json();
      
      // Fetch dashboard data
      const dashboardResponse = await fetch('/api/v1/cost-systems/dashboard');
      const dashboardResult = await dashboardResponse.json();
      
      if (alignmentResult.success && dashboardResult.success) {
        setAlignment(alignmentResult.alignment);
        setDashboardData(dashboardResult.dashboard);
        setError(null);
      } else {
        setError(alignmentResult.error || dashboardResult.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp color="success" />;
      case 'decreasing': return <TrendingDown color="error" />;
      default: return <TrendingUp color="disabled" />;
    }
  };

  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'urgent':
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Cost Systems Engineering Dashboard</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading cost systems data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Cost Systems Engineering Dashboard</Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!dashboardData || !alignment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Cost Systems Engineering Dashboard</Typography>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cost Systems Engineering Dashboard</Typography>
        <Button 
          variant="outlined" 
          onClick={fetchData} 
          disabled={refreshing}
          startIcon={refreshing ? <LinearProgress size={20} /> : undefined}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Business Ready</Typography>
              </Box>
              <Typography variant="h6" color={getScoreColor(dashboardData.summary.businessReadinessScore)}>
                {formatPercentage(dashboardData.summary.businessReadinessScore)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.summary.businessReadinessScore * 100}
                color={getScoreColor(dashboardData.summary.businessReadinessScore)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Customer Ready</Typography>
              </Box>
              <Typography variant="h6" color={getScoreColor(dashboardData.summary.customerReadinessScore)}>
                {formatPercentage(dashboardData.summary.customerReadinessScore)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.summary.customerReadinessScore * 100}
                color={getScoreColor(dashboardData.summary.customerReadinessScore)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Engineering color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Engineering Aligned</Typography>
              </Box>
              <Typography variant="h6" color={getScoreColor(dashboardData.summary.engineeringAlignmentScore)}>
                {formatPercentage(dashboardData.summary.engineeringAlignmentScore)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData.summary.engineeringAlignmentScore * 100}
                color={getScoreColor(dashboardData.summary.engineeringAlignmentScore)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Potential Savings</Typography>
              </Box>
              <Typography variant="h6" color="success.main">
                {formatCurrency(dashboardData.summary.totalPotentialSavings)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Identified opportunities
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Active Recommendations</Typography>
              </Box>
              <Typography variant="h6" color="info.main">
                {dashboardData.summary.activeRecommendations}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ready for implementation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Business Cost Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Business Cost Metrics"
              avatar={<Business />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Cost</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.business.metrics.totalCost)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Efficiency</Typography>
                  <Typography variant="h6">{formatPercentage(dashboardData.business.metrics.efficiency)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Budget Utilization</Typography>
                  <Typography variant="h6">{formatPercentage(dashboardData.business.metrics.budgetUtilization)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Monthly Trend</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon(dashboardData.business.metrics.trends.monthly.direction)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {dashboardData.business.metrics.trends.monthly.magnitude.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Customer Cost Analysis"
              avatar={<People />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Cost per Customer</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.customer.analysis.costPerCustomer)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Lifetime Value</Typography>
                  <Typography variant="h6">{formatCurrency(dashboardData.customer.analysis.lifetimeValue)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Value Ratio</Typography>
                  <Typography variant="h6">{dashboardData.customer.analysis.valueRatio.toFixed(2)}:1</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Profitability</Typography>
                  <Typography variant="h6">{formatPercentage(dashboardData.customer.analysis.profitabilityScore)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Optimization Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Top Optimization Recommendations"
              avatar={<TrendingUp />}
            />
            <CardContent>
              <List dense>
                {dashboardData.business.topOptimizations.slice(0, 4).map((optimization, index) => (
                  <React.Fragment key={optimization.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Chip 
                          label={optimization.priority.toUpperCase()} 
                          size="small" 
                          color={getPriorityColor(optimization.priority)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={optimization.title}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {optimization.description}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              Potential savings: {formatCurrency(optimization.potentialSavings)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.business.topOptimizations.slice(0, 4).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Integration Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="System Integration Status"
              avatar={<Integration />}
            />
            <CardContent>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {dashboardData.engineering.integration.frontend ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Frontend Integration" 
                    secondary={dashboardData.engineering.integration.frontend ? "Connected" : "Disconnected"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dashboardData.engineering.integration.backend ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Backend Integration" 
                    secondary={dashboardData.engineering.integration.backend ? "Connected" : "Disconnected"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dashboardData.engineering.integration.businessLogic ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Business Logic Integration" 
                    secondary={dashboardData.engineering.integration.businessLogic ? "Connected" : "Disconnected"}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dashboardData.engineering.integration.databases ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </ListItemIcon>
                  <ListItemText 
                    primary="Database Integration" 
                    secondary={dashboardData.engineering.integration.databases ? "Connected" : "Disconnected"}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Insights */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Customer Cost Insights"
              avatar={<Assessment />}
            />
            <CardContent>
              <Grid container spacing={2}>
                {dashboardData.customer.topInsights.slice(0, 3).map((insight) => (
                  <Grid item xs={12} md={4} key={insight.id}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={insight.impact.toUpperCase()} 
                          size="small" 
                          color={getPriorityColor(insight.impact)}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption">
                          {formatPercentage(insight.confidence)} confidence
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CostSystemsDashboard;