/**
 * UI/UX Evaluation Components
 * React components for displaying evaluation metrics and controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
  styled,
  alpha
} from '@mui/material';
import {
  Assessment,
  BugReport,
  CheckCircle,
  Warning,
  Error,
  Info,
  Visibility,
  VisibilityOff,
  Refresh,
  Download,
  ExpandLess,
  ExpandMore,
  Timeline,
  Speed,
  Accessible,
  Palette,
  Business
} from '@mui/icons-material';

import { UIUXEvaluationService } from '../core/UIUXEvaluationService.js';
import {
  IPageEvaluation,
  IEvaluationIssue,
  IEvaluationMetric,
  EvaluationCategory,
  EvaluationSeverity
} from '../interfaces/IUIUXEvaluation.js';

// Styled components
const EvaluationPanel = styled(Card)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 350,
  maxHeight: '70vh',
  zIndex: 9999,
  boxShadow: theme.shadows[8],
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.98)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
}));

const ScoreCircle = styled(Box)(({ theme, score }: { theme: any; score: number }) => {
  const getColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 75) return theme.palette.warning.main;
    if (score >= 50) return theme.palette.error.light;
    return theme.palette.error.main;
  };

  return {
    width: 60,
    height: 60,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `conic-gradient(${getColor(score)} ${score * 3.6}deg, ${alpha(getColor(score), 0.1)} ${score * 3.6}deg)`,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 45,
      height: 45,
      borderRadius: '50%',
      backgroundColor: theme.palette.background.paper
    }
  };
});

interface EvaluationWidgetProps {
  pageId: string;
  component?: string;
  element?: HTMLElement;
  minimized?: boolean;
  onToggleMinimize?: (minimized: boolean) => void;
}

export const EvaluationWidget: React.FC<EvaluationWidgetProps> = ({
  pageId,
  component,
  element,
  minimized = false,
  onToggleMinimize
}) => {
  const theme = useTheme();
  const [evaluation, setEvaluation] = useState<IPageEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<EvaluationCategory>>(new Set());
  const [evaluationService] = useState(() => new UIUXEvaluationService());

  const runEvaluation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await evaluationService.evaluatePage(pageId, element);
      setEvaluation(result);
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setLoading(false);
    }
  }, [evaluationService, pageId, element]);

  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  const getCategoryIcon = (category: EvaluationCategory) => {
    switch (category) {
      case EvaluationCategory.ACCESSIBILITY:
        return <Accessible />;
      case EvaluationCategory.PERFORMANCE:
        return <Speed />;
      case EvaluationCategory.USABILITY:
        return <Assessment />;
      case EvaluationCategory.VISUAL_DESIGN:
        return <Palette />;
      case EvaluationCategory.ENTERPRISE_STANDARDS:
        return <Business />;
      default:
        return <Info />;
    }
  };

  const getSeverityColor = (severity: EvaluationSeverity) => {
    switch (severity) {
      case EvaluationSeverity.CRITICAL:
        return theme.palette.error.main;
      case EvaluationSeverity.HIGH:
        return theme.palette.warning.main;
      case EvaluationSeverity.MEDIUM:
        return theme.palette.info.main;
      case EvaluationSeverity.LOW:
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getSeverityIcon = (severity: EvaluationSeverity) => {
    switch (severity) {
      case EvaluationSeverity.CRITICAL:
        return <Error />;
      case EvaluationSeverity.HIGH:
        return <Warning />;
      case EvaluationSeverity.MEDIUM:
        return <Info />;
      case EvaluationSeverity.LOW:
        return <CheckCircle />;
      default:
        return <Info />;
    }
  };

  const toggleCategory = (category: EvaluationCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (minimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999
        }}
      >
        <Tooltip title="Show UI/UX Evaluation">
          <IconButton
            onClick={() => onToggleMinimize?.(false)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            <Badge badgeContent={evaluation?.issues.length || 0} color="error">
              <Assessment />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <EvaluationPanel>
        <CardContent sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              🎯 UI/UX Evaluation
            </Typography>
            <Box>
              <Tooltip title="Refresh Evaluation">
                <IconButton size="small" onClick={runEvaluation} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Hide Panel">
                <IconButton size="small" onClick={() => onToggleMinimize?.(true)}>
                  <VisibilityOff />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Loading */}
          {loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                Evaluating UI/UX metrics...
              </Typography>
            </Box>
          )}

          {/* Overall Score */}
          {evaluation && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScoreCircle score={evaluation.overallScore}>
                  <Typography variant="h6" fontWeight="bold" sx={{ zIndex: 1 }}>
                    {evaluation.overallScore}
                  </Typography>
                </ScoreCircle>
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    Overall Score
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {evaluation.pageName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={evaluation.compliance.wcag}
                      size="small"
                      color={evaluation.compliance.wcag === 'AAA' ? 'success' : 'warning'}
                    />
                    <Chip
                      label={evaluation.compliance.enterprise ? 'Enterprise ✓' : 'Enterprise ✗'}
                      size="small"
                      color={evaluation.compliance.enterprise ? 'success' : 'error'}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Quick Stats */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, backgroundColor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="h6" color="error">
                      {evaluation.issues.filter(i => i.severity === EvaluationSeverity.CRITICAL || i.severity === EvaluationSeverity.HIGH).length}
                    </Typography>
                    <Typography variant="caption">Critical/High Issues</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="h6" color="success">
                      {evaluation.metrics.length}
                    </Typography>
                    <Typography variant="caption">Metrics Collected</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Category Scores */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Category Scores
                </Typography>
                {Object.entries(evaluation.categoryScores).map(([category, score]: [EvaluationCategory, number]) => (
                  <Box key={category} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getCategoryIcon(category)}
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {category.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" fontWeight="bold">
                        {Math.round(score)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.divider, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: score >= 75 ? theme.palette.success.main : score >= 50 ? theme.palette.warning.main : theme.palette.error.main
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowDetails(true)}
                  startIcon={<Visibility />}
                >
                  Details
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {/* Export functionality */}}
                  startIcon={<Download />}
                >
                  Export
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </EvaluationPanel>

      {/* Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Assessment sx={{ mr: 1 }} />
            UI/UX Evaluation Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {evaluation && (
            <Box>
              {/* Issues by Category */}
              <Typography variant="h6" gutterBottom>
                Issues by Category
              </Typography>
              {Object.values(EvaluationCategory).map(category => {
                const categoryIssues = evaluation.issues.filter(issue => issue.category === category);
                if (categoryIssues.length === 0) return null;

                return (
                  <Box key={category} sx={{ mb: 2 }}>
                    <ListItemButton
                      onClick={() => toggleCategory(category)}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        {getCategoryIcon(category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">
                              {category.replace('_', ' ')}
                            </Typography>
                            <Chip
                              label={categoryIssues.length}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        }
                      />
                      {expandedCategories.has(category) ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    
                    <Collapse in={expandedCategories.has(category)}>
                      <List dense sx={{ pl: 4 }}>
                        {categoryIssues.map(issue => (
                          <ListItem key={issue.id} sx={{ px: 0 }}>
                            <ListItemIcon>
                              {getSeverityIcon(issue.severity)}
                            </ListItemIcon>
                            <ListItemText
                              primary={issue.title}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="textSecondary">
                                    {issue.description}
                                  </Typography>
                                  <Typography variant="caption" color="primary">
                                    {issue.recommendation}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Chip
                              label={issue.severity}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getSeverityColor(issue.severity), 0.1),
                                color: getSeverityColor(issue.severity)
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                );
              })}

              {/* Recommendations */}
              {evaluation.recommendations.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Recommendations
                  </Typography>
                  <List>
                    {evaluation.recommendations.map((recommendation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Hook for using the evaluation service
export const useUIUXEvaluation = (pageId: string, element?: HTMLElement) => {
  const [evaluation, setEvaluation] = useState<IPageEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluationService] = useState(() => new UIUXEvaluationService());

  const runEvaluation = useCallback(async () => {
    setLoading(true);
    try {
      const result = await evaluationService.evaluatePage(pageId, element);
      setEvaluation(result);
      return result;
    } catch (error) {
      console.error('Evaluation failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [evaluationService, pageId, element]);

  const startContinuousEvaluation = useCallback(async () => {
    return await evaluationService.startContinuousEvaluation(pageId, element);
  }, [evaluationService, pageId, element]);

  const stopContinuousEvaluation = useCallback(async (sessionId: string) => {
    await evaluationService.stopContinuousEvaluation(sessionId);
  }, [evaluationService]);

  const reportIssue = useCallback(async (issue: Omit<IEvaluationIssue, 'id' | 'timestamp' | 'resolved'>) => {
    await evaluationService.reportIssue(pageId, issue);
  }, [evaluationService, pageId]);

  const collectMetric = useCallback(async (metric: Omit<IEvaluationMetric, 'id' | 'timestamp'>) => {
    await evaluationService.collectMetric(pageId, metric);
  }, [evaluationService, pageId]);

  useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  return {
    evaluation,
    loading,
    runEvaluation,
    startContinuousEvaluation,
    stopContinuousEvaluation,
    reportIssue,
    collectMetric,
    evaluationService
  };
};
