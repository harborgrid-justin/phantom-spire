/**
 * Threat Actor Attribution Engine Component
 * Advanced attribution analysis and confidence scoring
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Rating
} from '@mui/material';

import {
  Psychology,
  Fingerprint,
  Analytics,
  Assessment,
  Security,
  Search,
  FilterList,
  TrendingUp,
  Warning,  Error as ErrorIcon,
  Info,
  CheckCircle,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Visibility,
  Compare,
  Code,
  Language,
  LocationOn,
  Schedule,
  Group,
  Link,
  DataUsage,
  BarChart,
  PieChart,
  Timeline,
  Hub,
  NetworkCheck
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

// Interfaces
interface AttributionEvidence {
  id: string;
  type: 'infrastructure' | 'malware' | 'ttp' | 'linguistic' | 'temporal' | 'geospatial' | 'operational';
  category: string;
  description: string;
  confidence: number;
  weight: number;
  sources: string[];
  artifacts: string[];
  analysis: {
    methodology: string;
    tools: string[];
    analyst: string;
    timestamp: Date;
  };
  connections: Array<{
    actorId: string;
    similarity: number;
    sharedElements: string[];
  }>;
}

interface AttributionScore {
  actorId: string;
  actorName: string;
  overallConfidence: number;
  evidenceBreakdown: {
    infrastructure: number;
    malware: number;
    ttp: number;
    linguistic: number;
    temporal: number;
    geospatial: number;
    operational: number;
  };
  strengthIndicators: string[];
  weaknessIndicators: string[];
  similarActors: Array<{
    actorId: string;
    actorName: string;
    similarity: number;
    conflictingEvidence: string[];
  }>;
  timeline: Array<{
    date: Date;
    confidence: number;
    evidence: string[];
    reason: string;
  }>;
}

interface AttributionAnalysis {
  id: string;
  targetArtifact: {
    type: 'malware' | 'campaign' | 'infrastructure' | 'incident';
    id: string;
    name: string;
    description: string;
  };
  status: 'analyzing' | 'completed' | 'requires_review' | 'disputed';
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  evidence: AttributionEvidence[];
  scores: AttributionScore[];
  methodology: {
    frameworks: string[];
    techniques: string[];
    confidence: string;
  };
  peerReviews: Array<{
    reviewer: string;
    date: Date;
    confidence: number;
    comments: string;
    approved: boolean;
  }>;
  alternatives: Array<{
    hypothesis: string;
    confidence: number;
    evidence: string[];
    reasoning: string;
  }>;
}

interface AttributionFilter {
  status: string;
  confidence: number;
  evidenceType: string;
  timeRange: string;
  analyst: string;
}

const ThreatActorAttributionEngine: React.FC = () => {
  const theme = useTheme();
  
  // Business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('threat-intelligence-attribution');

  // State management
  const [analyses, setAnalyses] = useState<AttributionAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AttributionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AttributionFilter>({
    status: 'all',
    confidence: 50,
    evidenceType: 'all',
    timeRange: '30d',
    analyst: 'all'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<AttributionEvidence | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Mock data generation
  const generateMockAnalyses = useCallback((): AttributionAnalysis[] => {
    const analyses: AttributionAnalysis[] = [];
    const statuses: AttributionAnalysis['status'][] = ['analyzing', 'completed', 'requires_review', 'disputed'];
    const evidenceTypes: AttributionEvidence['type'][] = ['infrastructure', 'malware', 'ttp', 'linguistic', 'temporal', 'geospatial', 'operational'];
    const artifactTypes: AttributionAnalysis['targetArtifact']['type'][] = ['malware', 'campaign', 'infrastructure', 'incident'];

    for (let i = 1; i <= 20; i++) {
      const evidence: AttributionEvidence[] = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, idx) => ({
        id: `evidence-${i}-${idx}`,
        type: evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)],
        category: `Category ${idx}`,
        description: `Evidence description for analysis ${i}, item ${idx}`,
        confidence: Math.floor(Math.random() * 40) + 60,
        weight: Math.random() * 0.8 + 0.2,
        sources: ['OSINT', 'Internal Analysis', 'Partner Intelligence'].slice(0, Math.floor(Math.random() * 3) + 1),
        artifacts: [`artifact-${i}-${idx}`, `hash-${i}-${idx}`],
        analysis: {
          methodology: 'Comparative Analysis',
          tools: ['YARA', 'Maltego', 'Custom Scripts'],
          analyst: `analyst${Math.floor(Math.random() * 5) + 1}@company.com`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        },
        connections: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, connIdx) => ({
          actorId: `actor-${Math.floor(Math.random() * 10) + 1}`,
          similarity: Math.floor(Math.random() * 40) + 60,
          sharedElements: [`element-${connIdx}-a`, `element-${connIdx}-b`]
        }))
      }));

      const scores: AttributionScore[] = Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, scoreIdx) => ({
        actorId: `actor-${scoreIdx + 1}`,
        actorName: `ThreatActor-${scoreIdx + 1}`,
        overallConfidence: Math.floor(Math.random() * 40) + 60,
        evidenceBreakdown: {
          infrastructure: Math.floor(Math.random() * 100),
          malware: Math.floor(Math.random() * 100),
          ttp: Math.floor(Math.random() * 100),
          linguistic: Math.floor(Math.random() * 100),
          temporal: Math.floor(Math.random() * 100),
          geospatial: Math.floor(Math.random() * 100),
          operational: Math.floor(Math.random() * 100)
        },
        strengthIndicators: [
          'Strong infrastructure overlap',
          'Unique malware signatures',
          'Consistent TTP patterns'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        weaknessIndicators: [
          'Limited temporal correlation',
          'Generic attack vectors',
          'Insufficient linguistic evidence'
        ].slice(0, Math.floor(Math.random() * 2) + 1),
        similarActors: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, simIdx) => ({
          actorId: `similar-actor-${simIdx}`,
          actorName: `SimilarActor-${simIdx}`,
          similarity: Math.floor(Math.random() * 30) + 70,
          conflictingEvidence: [`conflict-${simIdx}-a`, `conflict-${simIdx}-b`]
        })),
        timeline: Array.from({ length: 5 }, (_, timeIdx) => ({
          date: new Date(Date.now() - (timeIdx * 7 * 24 * 60 * 60 * 1000)),
          confidence: Math.floor(Math.random() * 40) + 60,
          evidence: [`evidence-${timeIdx}-a`, `evidence-${timeIdx}-b`],
          reason: `Timeline reason ${timeIdx + 1}`
        }))
      }));

      analyses.push({
        id: `attribution-${i}`,
        targetArtifact: {
          type: artifactTypes[Math.floor(Math.random() * artifactTypes.length)],
          id: `artifact-${i}`,
          name: `Target Artifact ${i}`,
          description: `Description of target artifact ${i} for attribution analysis`
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdBy: `analyst${Math.floor(Math.random() * 5) + 1}@company.com`,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        evidence,
        scores: scores.sort((a, b) => b.overallConfidence - a.overallConfidence),
        methodology: {
          frameworks: ['MITRE ATT&CK', 'Diamond Model', 'Kill Chain'],
          techniques: ['Code Similarity', 'Infrastructure Overlap', 'TTP Analysis'],
          confidence: 'Medium-High'
        },
        peerReviews: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, revIdx) => ({
          reviewer: `reviewer${revIdx + 1}@company.com`,
          date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
          confidence: Math.floor(Math.random() * 40) + 60,
          comments: `Peer review comments for analysis ${i}, review ${revIdx + 1}`,
          approved: Math.random() > 0.3
        })),
        alternatives: Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, altIdx) => ({
          hypothesis: `Alternative hypothesis ${altIdx + 1}`,
          confidence: Math.floor(Math.random() * 30) + 50,
          evidence: [`alt-evidence-${altIdx}-a`, `alt-evidence-${altIdx}-b`],
          reasoning: `Alternative reasoning for hypothesis ${altIdx + 1}`
        }))
      });
    }

    return analyses.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockAnalyses = generateMockAnalyses();
        setAnalyses(mockAnalyses);
        setSelectedAnalysis(mockAnalyses[0]);
        addUIUXEvaluation('attribution-engine-loaded', 'success', {
          analysisCount: mockAnalyses.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading attribution data:', error);
        addNotification('error', 'Failed to load attribution analysis data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockAnalyses, addNotification]);

  // Filtered analyses
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      if (searchTerm && !analysis.targetArtifact.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !analysis.targetArtifact.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filters.status !== 'all' && analysis.status !== filters.status) {
        return false;
      }
      
      const maxConfidence = Math.max(...analysis.scores.map(s => s.overallConfidence));
      if (maxConfidence < filters.confidence) {
        return false;
      }
      
      if (filters.evidenceType !== 'all') {
        const hasEvidenceType = analysis.evidence.some(e => e.type === filters.evidenceType);
        if (!hasEvidenceType) return false;
      }
      
      return true;
    });
  }, [analyses, searchTerm, filters]);

  // Event handlers
  const handleAnalysisSelect = (analysis: AttributionAnalysis) => {
    setSelectedAnalysis(analysis);
    addUIUXEvaluation('attribution-analysis-selected', 'interaction', {
      analysisId: analysis.id,
      evidenceCount: analysis.evidence.length
    });
  };

  const handleEvidenceSelect = (evidence: AttributionEvidence) => {
    setSelectedEvidence(evidence);
    setDetailsOpen(true);
    addUIUXEvaluation('attribution-evidence-selected', 'interaction', {
      evidenceId: evidence.id,
      evidenceType: evidence.type
    });
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newAnalyses = generateMockAnalyses();
      setAnalyses(newAnalyses);
      setSelectedAnalysis(newAnalyses[0]);
      addNotification('success', 'Attribution data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'analyzing': return 'info';
      case 'requires_review': return 'warning';
      case 'disputed': return 'error';
      default: return 'default';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Fingerprint color="primary" />
          Threat Actor Attribution Engine
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Advanced attribution analysis with evidence correlation and confidence scoring
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Analyses"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="analyzing">Analyzing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="requires_review">Requires Review</MenuItem>
                <MenuItem value="disputed">Disputed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Evidence Type</InputLabel>
              <Select
                value={filters.evidenceType}
                onChange={(e) => setFilters(prev => ({ ...prev, evidenceType: e.target.value }))}
                label="Evidence Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
                <MenuItem value="malware">Malware</MenuItem>
                <MenuItem value="ttp">TTP</MenuItem>
                <MenuItem value="linguistic">Linguistic</MenuItem>
                <MenuItem value="temporal">Temporal</MenuItem>
                <MenuItem value="geospatial">Geospatial</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" gutterBottom display="block">
              Min Confidence: {filters.confidence}%
            </Typography>
            <Box sx={{ px: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={filters.confidence} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Analysis List */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attribution Analyses ({filteredAnalyses.length})
              </Typography>
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {filteredAnalyses.map(analysis => (
                    <ListItem
                      key={analysis.id}
                      button
                      selected={selectedAnalysis?.id === analysis.id}
                      onClick={() => handleAnalysisSelect(analysis)}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Assessment color={getStatusColor(analysis.status)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap>
                              {analysis.targetArtifact.name}
                            </Typography>
                            <Chip 
                              label={analysis.status} 
                              size="small" 
                              color={getStatusColor(analysis.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {analysis.targetArtifact.type} • {analysis.evidence.length} evidence items
                            </Typography>
                            <Typography variant="caption" display="block">
                              Max confidence: {Math.max(...analysis.scores.map(s => s.overallConfidence))}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Updated: {analysis.lastUpdated.toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedAnalysis?.targetArtifact.name || 'Select Analysis'}
                </Typography>
                {selectedAnalysis && (
                  <Chip 
                    label={selectedAnalysis.status} 
                    color={getStatusColor(selectedAnalysis.status)}
                  />
                )}
              </Box>

              {selectedAnalysis ? (
                <Box sx={{ height: '510px' }}>
                  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                    <Tab label="Scores" />
                    <Tab label="Evidence" />
                    <Tab label="Review" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attribution Scores ({selectedAnalysis.scores.length})
                      </Typography>
                      <List dense>
                        {selectedAnalysis.scores.map(score => (
                          <ListItem key={score.actorId} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {score.actorName}
                                  </Typography>
                                  <Chip 
                                    label={`${score.overallConfidence}%`} 
                                    color={getConfidenceColor(score.overallConfidence)}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">Infrastructure: {score.evidenceBreakdown.infrastructure}%</Typography>
                                      <LinearProgress variant="determinate" value={score.evidenceBreakdown.infrastructure} sx={{ height: 4 }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">Malware: {score.evidenceBreakdown.malware}%</Typography>
                                      <LinearProgress variant="determinate" value={score.evidenceBreakdown.malware} sx={{ height: 4 }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">TTP: {score.evidenceBreakdown.ttp}%</Typography>
                                      <LinearProgress variant="determinate" value={score.evidenceBreakdown.ttp} sx={{ height: 4 }} />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block">Temporal: {score.evidenceBreakdown.temporal}%</Typography>
                                      <LinearProgress variant="determinate" value={score.evidenceBreakdown.temporal} sx={{ height: 4 }} />
                                    </Grid>
                                  </Grid>
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="success.main">
                                      Strengths: {score.strengthIndicators.join(', ')}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="warning.main">
                                      Weaknesses: {score.weaknessIndicators.join(', ')}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Evidence Items ({selectedAnalysis.evidence.length})
                      </Typography>
                      <List dense>
                        {selectedAnalysis.evidence.map(evidence => (
                          <ListItem
                            key={evidence.id}
                            button
                            onClick={() => handleEvidenceSelect(evidence)}
                            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                          >
                            <ListItemIcon>
                              {evidence.type === 'infrastructure' && <NetworkCheck />}
                              {evidence.type === 'malware' && <Code />}
                              {evidence.type === 'ttp' && <Security />}
                              {evidence.type === 'linguistic' && <Language />}
                              {evidence.type === 'temporal' && <Schedule />}
                              {evidence.type === 'geospatial' && <LocationOn />}
                              {evidence.type === 'operational' && <Group />}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">{evidence.category}</Typography>
                                  <Chip 
                                    label={evidence.type} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`${evidence.confidence}%`} 
                                    size="small" 
                                    color={getConfidenceColor(evidence.confidence)}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    {evidence.description}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    Weight: {Math.round(evidence.weight * 100)}% • Sources: {evidence.sources.join(', ')}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Peer Reviews ({selectedAnalysis.peerReviews.length})
                      </Typography>
                      
                      <Stepper orientation="vertical">
                        {selectedAnalysis.peerReviews.map((review, index) => (
                          <Step key={index} active={true}>
                            <StepLabel>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">{review.reviewer}</Typography>
                                <Chip 
                                  label={review.approved ? 'Approved' : 'Pending'} 
                                  size="small" 
                                  color={review.approved ? 'success' : 'warning'}
                                />
                              </Box>
                            </StepLabel>
                            <StepContent>
                              <Typography variant="body2" paragraph>
                                {review.comments}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="caption">
                                  Confidence: {review.confidence}%
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {review.date.toLocaleDateString()}
                                </Typography>
                              </Box>
                            </StepContent>
                          </Step>
                        ))}
                      </Stepper>

                      {selectedAnalysis.alternatives.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Alternative Hypotheses
                          </Typography>
                          {selectedAnalysis.alternatives.map((alt, index) => (
                            <Accordion key={index}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="body2">
                                  {alt.hypothesis} ({alt.confidence}% confidence)
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body2" paragraph>
                                  {alt.reasoning}
                                </Typography>
                                <Typography variant="caption">
                                  Evidence: {alt.evidence.join(', ')}
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Psychology sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select an Attribution Analysis
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Choose an analysis from the list to view detailed attribution scores and evidence
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Evidence Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Evidence Details
        </DialogTitle>
        <DialogContent>
          {selectedEvidence && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedEvidence.category} ({selectedEvidence.type})
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedEvidence.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Evidence Details</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Confidence" secondary={`${selectedEvidence.confidence}%`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Weight" secondary={`${Math.round(selectedEvidence.weight * 100)}%`} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Sources" secondary={selectedEvidence.sources.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Artifacts" secondary={selectedEvidence.artifacts.join(', ')} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Analysis Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Methodology" secondary={selectedEvidence.analysis.methodology} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Tools" secondary={selectedEvidence.analysis.tools.join(', ')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Analyst" secondary={selectedEvidence.analysis.analyst} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Timestamp" secondary={selectedEvidence.analysis.timestamp.toLocaleString()} />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Actor Connections</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Actor ID</TableCell>
                        <TableCell>Similarity</TableCell>
                        <TableCell>Shared Elements</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedEvidence.connections.map((conn, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{conn.actorId}</TableCell>
                          <TableCell>{conn.similarity}%</TableCell>
                          <TableCell>{conn.sharedElements.join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">View Actor Profile</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorAttributionEngine;