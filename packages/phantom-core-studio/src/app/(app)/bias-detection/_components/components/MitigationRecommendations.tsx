/**
 * Mitigation Recommendations Component
 * Displays actionable recommendations for bias mitigation
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  Error,
  Warning,
  CheckCircle,
  Security,
  AutoFixHigh,
  Assessment
} from '@mui/icons-material';
import { MitigationRecommendationsProps } from '../../_lib/types';

export function MitigationRecommendations({ report }: MitigationRecommendationsProps) {
  const getRecommendationIcon = (recommendation: string, status: string) => {
    if (recommendation.toLowerCase().includes('urgent') || status === 'high_bias') {
      return <Error color="error" />;
    }
    if (recommendation.toLowerCase().includes('retrain') || recommendation.toLowerCase().includes('data')) {
      return <Assessment color="primary" />;
    }
    if (recommendation.toLowerCase().includes('security') || recommendation.toLowerCase().includes('audit')) {
      return <Security color="info" />;
    }
    if (recommendation.toLowerCase().includes('post-processing') || recommendation.toLowerCase().includes('apply')) {
      return <AutoFixHigh color="secondary" />;
    }
    if (status === 'moderate') {
      return <Warning color="warning" />;
    }
    return <CheckCircle color="success" />;
  };

  const getRecommendationPriority = (recommendation: string, status: string) => {
    if (recommendation.toLowerCase().includes('urgent') || status === 'high_bias') {
      return { level: 'Critical', color: 'error' as const };
    }
    if (recommendation.toLowerCase().includes('immediate') || 
        recommendation.toLowerCase().includes('retrain') ||
        status === 'moderate') {
      return { level: 'High', color: 'warning' as const };
    }
    if (recommendation.toLowerCase().includes('regular') || 
        recommendation.toLowerCase().includes('monitor')) {
      return { level: 'Medium', color: 'info' as const };
    }
    return { level: 'Low', color: 'success' as const };
  };

  const categorizeRecommendations = (recommendations: string[], status: string) => {
    const categories = {
      immediate: recommendations.filter(r => 
        r.toLowerCase().includes('urgent') || 
        r.toLowerCase().includes('immediate') ||
        (status === 'moderate' && r.toLowerCase().includes('review')) ||
        status === 'high_bias'
      ),
      dataModel: recommendations.filter(r => 
        r.toLowerCase().includes('retrain') || 
        r.toLowerCase().includes('data') || 
        r.toLowerCase().includes('dataset') ||
        r.toLowerCase().includes('feature') ||
        r.toLowerCase().includes('collect')
      ),
      algorithmic: recommendations.filter(r => 
        r.toLowerCase().includes('post-processing') || 
        r.toLowerCase().includes('constraint') ||
        r.toLowerCase().includes('apply') ||
        r.toLowerCase().includes('algorithmic')
      ),
      monitoring: recommendations.filter(r => 
        r.toLowerCase().includes('monitor') || 
        r.toLowerCase().includes('audit') || 
        r.toLowerCase().includes('regular') ||
        r.toLowerCase().includes('continue')
      ),
      other: recommendations.filter(r => 
        !r.toLowerCase().includes('urgent') && 
        !r.toLowerCase().includes('immediate') &&
        !(status === 'moderate' && r.toLowerCase().includes('review')) &&
        !r.toLowerCase().includes('retrain') && 
        !r.toLowerCase().includes('data') && 
        !r.toLowerCase().includes('dataset') &&
        !r.toLowerCase().includes('feature') &&
        !r.toLowerCase().includes('collect') &&
        !r.toLowerCase().includes('post-processing') && 
        !r.toLowerCase().includes('constraint') &&
        !r.toLowerCase().includes('apply') &&
        !r.toLowerCase().includes('algorithmic') &&
        !r.toLowerCase().includes('monitor') && 
        !r.toLowerCase().includes('audit') && 
        !r.toLowerCase().includes('regular') &&
        !r.toLowerCase().includes('continue') &&
        status !== 'high_bias'
      )
    };
    
    // Fallback: if no categories match, put all in other for visibility
    if (categories.immediate.length === 0 && 
        categories.dataModel.length === 0 && 
        categories.algorithmic.length === 0 && 
        categories.monitoring.length === 0 && 
        categories.other.length === 0) {
      categories.other = recommendations;
    }
    
    return categories;
  };

  if (!report) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bias Mitigation Recommendations
          </Typography>
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              Select a report to view recommendations
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const categories = categorizeRecommendations(report.recommendations, report.status);

  return (
    <Card data-cy="recommendations">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Bias Mitigation Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Actionable steps to improve model fairness for {report.modelName}
        </Typography>

        {/* Status Alert */}
        {report.status === 'high_bias' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>CRITICAL:</strong> This model shows significant bias and requires immediate attention.
          </Alert>
        )}
        {report.status === 'moderate' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>WARNING:</strong> This model shows moderate bias concerns that should be addressed.
          </Alert>
        )}
        {report.status === 'good' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <strong>GOOD:</strong> This model meets fairness standards. Continue monitoring.
          </Alert>
        )}

        {/* Immediate Actions */}
        {categories.immediate.length > 0 && (
          <Box mb={3} data-cy="bias-mitigation-suggestions">
            <Typography variant="h6" color="error.main" gutterBottom>
              🚨 Immediate Actions Required
            </Typography>
            <List dense>
              {categories.immediate.map((recommendation, index) => {
                const priority = getRecommendationPriority(recommendation, report.status);
                return (
                  <ListItem key={`immediate-${index}`}>
                    <ListItemIcon>
                      {getRecommendationIcon(recommendation, report.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={recommendation}
                      secondary={
                        <Chip 
                          size="small" 
                          label={priority.level} 
                          color={priority.color}
                        />
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Data & Model Improvements */}
        {categories.dataModel.length > 0 && (
          <Box mb={3} data-cy="fairness-improvements">
            <Typography variant="h6" gutterBottom>
              📊 Data & Model Improvements
            </Typography>
            <List dense>
              {categories.dataModel.map((recommendation, index) => {
                const priority = getRecommendationPriority(recommendation, report.status);
                return (
                  <ListItem key={`data-${index}`}>
                    <ListItemIcon>
                      {getRecommendationIcon(recommendation, report.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={recommendation}
                      secondary={
                        <Chip 
                          size="small" 
                          label={priority.level} 
                          color={priority.color}
                        />
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Algorithmic Solutions */}
        {categories.algorithmic.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              🔧 Algorithmic Solutions
            </Typography>
            <List dense>
              {categories.algorithmic.map((recommendation, index) => {
                const priority = getRecommendationPriority(recommendation, report.status);
                return (
                  <ListItem key={`algo-${index}`}>
                    <ListItemIcon>
                      {getRecommendationIcon(recommendation, report.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={recommendation}
                      secondary={
                        <Chip 
                          size="small" 
                          label={priority.level} 
                          color={priority.color}
                        />
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Monitoring & Auditing */}
        {categories.monitoring.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              📈 Monitoring & Auditing
            </Typography>
            <List dense>
              {categories.monitoring.map((recommendation, index) => {
                const priority = getRecommendationPriority(recommendation, report.status);
                return (
                  <ListItem key={`monitor-${index}`}>
                    <ListItemIcon>
                      {getRecommendationIcon(recommendation, report.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={recommendation}
                      secondary={
                        <Chip 
                          size="small" 
                          label={priority.level} 
                          color={priority.color}
                        />
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Other Recommendations */}
        {categories.other.length > 0 && (
          <Box data-cy="action-items">
            <Typography variant="h6" gutterBottom>
              📋 Additional Recommendations
            </Typography>
            <List dense>
              {categories.other.map((recommendation, index) => {
                const priority = getRecommendationPriority(recommendation, report.status);
                return (
                  <ListItem key={`other-${index}`}>
                    <ListItemIcon>
                      {getRecommendationIcon(recommendation, report.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={recommendation}
                      secondary={
                        <Chip 
                          size="small" 
                          label={priority.level} 
                          color={priority.color}
                        />
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {report.recommendations.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No recommendations available for this report
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}