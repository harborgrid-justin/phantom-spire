/**
 * Threat Actor Capability Assessment Component
 * Capability scoring and assessment framework
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';

import {
  Assessment,
  TrendingUp,
  Security,
  Psychology,
  Code,
  Computer,
  Search,
  FilterList,
  Analytics,
  BarChart,
  Timeline,
  Warning,
  CheckCircle,  Error as ErrorIcon,
  Info,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Star,
  StarBorder,
  Build,
  Language,
  Group,
  Shield,
  Visibility,
  Compare
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';
import { Status, Priority } from '../../types/index';

// Interfaces
interface CapabilityDimension {
  id: string;
  name: string;
  description: string;
  weight: number;
  subDimensions: Array<{
    id: string;
    name: string;
    description: string;
    weight: number;
    indicators: string[];
  }>;
}

interface CapabilityScore {
  dimensionId: string;
  subDimensionId?: string;
  score: number;
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
  evidence: Array<{
    type: 'observed' | 'inferred' | 'reported';
    description: string;
    confidence: number;
    source: string;
    timestamp: Date;
  }>;
  lastUpdated: Date;
}

interface ThreatActorCapabilityProfile {
  id: string;
  name: string;
  aliases: string[];
  overallCapability: {
    score: number;
    level: 'minimal' | 'basic' | 'intermediate' | 'advanced' | 'expert';
    confidence: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  dimensionScores: CapabilityScore[];
  strengths: string[];
  weaknesses: string[];
  evolutionHistory: Array<{
    date: Date;
    overallScore: number;
    majorChanges: string[];
    reasoning: string;
  }>;
  comparisons: Array<{
    actorId: string;
    actorName: string;
    relativeDifference: number;
    strongerIn: string[];
    weakerIn: string[];
  }>;
  assessmentMeta: {
    lastAssessment: Date;
    assessorId: string;
    methodology: string;
    confidence: number;
    reviewStatus: 'draft' | 'peer_reviewed' | 'approved' | 'disputed';
  };
}

interface AssessmentFilter {
  actor: string;
  dimension: string;
  confidenceLevel: number;
  timeRange: string;
  trend: string;
  assessmentStatus: string;
}

const ThreatActorCapabilityAssessment: React.FC = () => {
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
  } = useServicePage('threat-intelligence-capability');

  // State management
  const [profiles, setProfiles] = useState<ThreatActorCapabilityProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ThreatActorCapabilityProfile | null>(null);
  const [dimensions, setDimensions] = useState<CapabilityDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AssessmentFilter>({
    actor: 'all',
    dimension: 'all',
    confidenceLevel: 60,
    timeRange: '6m',
    trend: 'all',
    assessmentStatus: 'all'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<CapabilityDimension | null>(null);

  // Mock capability dimensions
  const mockDimensions: CapabilityDimension[] = [
    {
      id: 'technical',
      name: 'Technical Capabilities',
      description: 'Technical skills and malware development capabilities',
      weight: 0.25,
      subDimensions: [
        {
          id: 'malware_dev',
          name: 'Malware Development',
          description: 'Ability to develop custom malware',
          weight: 0.4,
          indicators: ['Custom malware families', 'Code quality', 'Innovation level']
        },
        {
          id: 'exploitation',
          name: 'Exploitation Techniques',
          description: 'Capability to discover and exploit vulnerabilities',
          weight: 0.3,
          indicators: ['Zero-day usage', 'Exploit sophistication', 'Target diversity']
        },
        {
          id: 'infrastructure',
          name: 'Infrastructure Management',
          description: 'Command and control infrastructure capabilities',
          weight: 0.3,
          indicators: ['C2 sophistication', 'Resilience', 'Operational security']
        }
      ]
    },
    {
      id: 'operational',
      name: 'Operational Capabilities',
      description: 'Operational planning and execution skills',
      weight: 0.25,
      subDimensions: [
        {
          id: 'planning',
          name: 'Campaign Planning',
          description: 'Strategic planning and coordination abilities',
          weight: 0.4,
          indicators: ['Campaign complexity', 'Multi-stage operations', 'Timing coordination']
        },
        {
          id: 'opsec',
          name: 'Operational Security',
          description: 'Ability to maintain operational security',
          weight: 0.3,
          indicators: ['OPSEC adherence', 'Attribution avoidance', 'Counter-intelligence']
        },
        {
          id: 'persistence',
          name: 'Persistence Mechanisms',
          description: 'Capability to maintain long-term access',
          weight: 0.3,
          indicators: ['Persistence techniques', 'Stealth capabilities', 'Detection evasion']
        }
      ]
    },
    {
      id: 'intelligence',
      name: 'Intelligence Capabilities',
      description: 'Information gathering and analysis skills',
      weight: 0.2,
      subDimensions: [
        {
          id: 'reconnaissance',
          name: 'Reconnaissance',
          description: 'Target identification and profiling capabilities',
          weight: 0.4,
          indicators: ['OSINT skills', 'Target selection', 'Profiling accuracy']
        },
        {
          id: 'social_eng',
          name: 'Social Engineering',
          description: 'Human manipulation and deception skills',
          weight: 0.3,
          indicators: ['Phishing sophistication', 'Pretexting abilities', 'Psychological manipulation']
        },
        {
          id: 'analysis',
          name: 'Intelligence Analysis',
          description: 'Capability to analyze and process intelligence',
          weight: 0.3,
          indicators: ['Data analysis', 'Pattern recognition', 'Strategic insight']
        }
      ]
    },
    {
      id: 'resources',
      name: 'Resource Capabilities',
      description: 'Financial and human resource access',
      weight: 0.15,
      subDimensions: [
        {
          id: 'funding',
          name: 'Financial Resources',
          description: 'Access to funding and financial capabilities',
          weight: 0.5,
          indicators: ['Operation scale', 'Resource investment', 'Sustainability']
        },
        {
          id: 'personnel',
          name: 'Human Resources',
          description: 'Access to skilled personnel and expertise',
          weight: 0.5,
          indicators: ['Team size', 'Skill diversity', 'Specialization level']
        }
      ]
    },
    {
      id: 'adaptability',
      name: 'Adaptability',
      description: 'Ability to adapt and evolve capabilities',
      weight: 0.15,
      subDimensions: [
        {
          id: 'learning',
          name: 'Learning Capability',
          description: 'Ability to learn from failures and adapt',
          weight: 0.5,
          indicators: ['Response to countermeasures', 'Technique evolution', 'Innovation rate']
        },
        {
          id: 'flexibility',
          name: 'Operational Flexibility',
          description: 'Ability to change tactics and strategies',
          weight: 0.5,
          indicators: ['Tactical shifts', 'Target pivoting', 'Method diversification']
        }
      ]
    }
  ];

  // Mock data generation
  const generateMockProfiles = useCallback((): ThreatActorCapabilityProfile[] => {
    const profiles: ThreatActorCapabilityProfile[] = [];
    const capabilityLevels: Array<'minimal' | 'basic' | 'intermediate' | 'advanced' | 'expert'> = 
      ['minimal', 'basic', 'intermediate', 'advanced', 'expert'];
    const trends: Array<'improving' | 'declining' | 'stable'> = ['improving', 'declining', 'stable'];

    for (let i = 1; i <= 18; i++) {
      const dimensionScores: CapabilityScore[] = [];
      
      // Generate scores for each dimension and sub-dimension
      mockDimensions.forEach(dimension => {
        dimension.subDimensions.forEach(subDim => {
          dimensionScores.push({
            dimensionId: dimension.id,
            subDimensionId: subDim.id,
            score: Math.floor(Math.random() * 40) + 60,
            confidence: Math.floor(Math.random() * 30) + 70,
            trend: trends[Math.floor(Math.random() * trends.length)],
            evidence: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, evidenceIdx) => ({
              type: ['observed', 'inferred', 'reported'][Math.floor(Math.random() * 3)] as any,
              description: `Evidence ${evidenceIdx + 1} for ${subDim.name}`,
              confidence: Math.floor(Math.random() * 30) + 70,
              source: ['Internal Analysis', 'OSINT', 'Partner Intel'][Math.floor(Math.random() * 3)],
              timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
            })),
            lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          });
        });
      });

      // Calculate overall score
      const overallScore = Math.floor(
        dimensionScores.reduce((sum, score) => {
          const dimension = mockDimensions.find(d => d.id === score.dimensionId);
          const subDimension = dimension?.subDimensions.find(sd => sd.id === score.subDimensionId);
          const weight = (dimension?.weight || 0) * (subDimension?.weight || 0);
          return sum + (score.score * weight);
        }, 0)
      );

      const level = overallScore >= 90 ? 'expert' : 
                   overallScore >= 80 ? 'advanced' :
                   overallScore >= 70 ? 'intermediate' :
                   overallScore >= 60 ? 'basic' : 'minimal';

      profiles.push({
        id: `capability-actor-${i}`,
        name: `CapabilityActor-${i}`,
        aliases: [`CA-${i}`, `Group-${i}`],
        overallCapability: {
          score: overallScore,
          level,
          confidence: Math.floor(Math.random() * 20) + 80,
          trend: trends[Math.floor(Math.random() * trends.length)]
        },
        dimensionScores,
        strengths: [
          'Advanced malware development',
          'Sophisticated operational security',
          'Strong intelligence gathering'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        weaknesses: [
          'Limited resource access',
          'Predictable attack patterns',
          'Poor adaptability'
        ].slice(0, Math.floor(Math.random() * 2) + 1),
        evolutionHistory: Array.from({ length: 6 }, (_, monthIdx) => ({
          date: new Date(Date.now() - (monthIdx + 1) * 30 * 24 * 60 * 60 * 1000),
          overallScore: Math.max(50, overallScore + (Math.random() - 0.5) * 20),
          majorChanges: [`Change ${monthIdx + 1}A`, `Change ${monthIdx + 1}B`],
          reasoning: `Evolution reasoning for month ${monthIdx + 1}`
        })),
        comparisons: profiles.slice(-3).map(existingProfile => ({
          actorId: existingProfile.id,
          actorName: existingProfile.name,
          relativeDifference: Math.floor((Math.random() - 0.5) * 40),
          strongerIn: ['Technical', 'Operational'],
          weakerIn: ['Intelligence', 'Resources']
        })),
        assessmentMeta: {
          lastAssessment: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
          assessorId: `analyst${Math.floor(Math.random() * 5) + 1}@company.com`,
          methodology: 'Structured Assessment Framework v2.1',
          confidence: Math.floor(Math.random() * 20) + 80,
          reviewStatus: ['draft', 'peer_reviewed', 'approved', 'disputed'][Math.floor(Math.random() * 4)] as any
        }
      });
    }

    return profiles.sort((a, b) => b.overallCapability.score - a.overallCapability.score);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockProfiles = generateMockProfiles();
        setProfiles(mockProfiles);
        setDimensions(mockDimensions);
        setSelectedProfile(mockProfiles[0]);
        addUIUXEvaluation('capability-assessment-loaded', 'success', {
          profileCount: mockProfiles.length,
          loadTime: 1000
        });
      } catch (error) {
        console.error('Error loading capability data:', error);
        addNotification('error', 'Failed to load capability assessment data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockProfiles, addNotification]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      if (searchTerm && !profile.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !profile.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      if (filters.actor !== 'all' && profile.id !== filters.actor) {
        return false;
      }
      
      if (profile.overallCapability.confidence < filters.confidenceLevel) {
        return false;
      }
      
      if (filters.trend !== 'all' && profile.overallCapability.trend !== filters.trend) {
        return false;
      }
      
      if (filters.assessmentStatus !== 'all' && profile.assessmentMeta.reviewStatus !== filters.assessmentStatus) {
        return false;
      }
      
      return true;
    });
  }, [profiles, searchTerm, filters]);

  // Event handlers
  const handleProfileSelect = (profile: ThreatActorCapabilityProfile) => {
    setSelectedProfile(profile);
    addUIUXEvaluation('capability-profile-selected', 'interaction', {
      profileId: profile.id,
      overallScore: profile.overallCapability.score
    });
  };

  const handleDimensionSelect = (dimension: CapabilityDimension) => {
    setSelectedDimension(dimension);
    setDetailsOpen(true);
    addUIUXEvaluation('capability-dimension-selected', 'interaction', {
      dimensionId: dimension.id,
      dimensionName: dimension.name
    });
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      const newProfiles = generateMockProfiles();
      setProfiles(newProfiles);
      setSelectedProfile(newProfiles[0]);
      addNotification('success', 'Capability assessment data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh data');
    }
  };

  const getCapabilityColor = (score: number) => {
    if (score >= 90) return 'error';
    if (score >= 80) return 'warning';
    if (score >= 70) return 'info';
    if (score >= 60) return 'success';
    return 'default';
  };

  const getCapabilityLevel = (score: number) => {
    if (score >= 90) return 'Expert';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Intermediate';
    if (score >= 60) return 'Basic';
    return 'Minimal';
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
          <Assessment color="primary" />
          Threat Actor Capability Assessment
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Comprehensive capability scoring and assessment framework for threat actors
        </Typography>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search Actors"
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
              <InputLabel>Trend</InputLabel>
              <Select
                value={filters.trend}
                onChange={(e) => setFilters(prev => ({ ...prev, trend: e.target.value }))}
                label="Trend"
              >
                <MenuItem value="all">All Trends</MenuItem>
                <MenuItem value="improving">Improving</MenuItem>
                <MenuItem value="declining">Declining</MenuItem>
                <MenuItem value="stable">Stable</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.assessmentStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, assessmentStatus: e.target.value }))}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="peer_reviewed">Peer Reviewed</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="disputed">Disputed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" gutterBottom display="block">
              Min Confidence: {filters.confidenceLevel}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={filters.confidenceLevel} 
              sx={{ height: 8, borderRadius: 4 }}
            />
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
        {/* Profile List */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Capability Profiles ({filteredProfiles.length})
              </Typography>
              <Box sx={{ height: '520px', overflow: 'auto' }}>
                <List dense>
                  {filteredProfiles.map(profile => (
                    <ListItem
                      key={profile.id}
                      button
                      selected={selectedProfile?.id === profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Assessment color={getCapabilityColor(profile.overallCapability.score)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap>
                              {profile.name}
                            </Typography>
                            <Chip 
                              label={profile.overallCapability.level} 
                              size="small" 
                              color={getCapabilityColor(profile.overallCapability.score)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Score: {profile.overallCapability.score}/100
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={profile.overallCapability.score} 
                                sx={{ flexGrow: 1, height: 4 }}
                                color={getCapabilityColor(profile.overallCapability.score)}
                              />
                              {profile.overallCapability.trend === 'improving' && <TrendingUp fontSize="small" color="success" />}
                              {profile.overallCapability.trend === 'declining' && <TrendingUp fontSize="small" color="error" sx={{ transform: 'rotate(180deg)' }} />}
                            </Box>
                            <Typography variant="caption" color="textSecondary">
                              Confidence: {profile.overallCapability.confidence}% • {profile.assessmentMeta.reviewStatus}
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

        {/* Profile Details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '600px' }}>
            <CardContent sx={{ height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {selectedProfile?.name || 'Select Profile'}
                </Typography>
                {selectedProfile && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={`${selectedProfile.overallCapability.score}/100`} 
                      color={getCapabilityColor(selectedProfile.overallCapability.score)}
                    />
                    <Chip 
                      label={selectedProfile.overallCapability.level} 
                      variant="outlined"
                    />
                  </Box>
                )}
              </Box>

              {selectedProfile ? (
                <Box sx={{ height: '510px' }}>
                  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
                    <Tab label="Overview" />
                    <Tab label="Dimensions" />
                    <Tab label="Evolution" />
                    <Tab label="Comparison" />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Overall Assessment</Typography>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="h4" color={getCapabilityColor(selectedProfile.overallCapability.score)}>
                                {selectedProfile.overallCapability.score}
                              </Typography>
                              <Typography variant="h6">/ 100</Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {getCapabilityLevel(selectedProfile.overallCapability.score)} Level Threat Actor
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={selectedProfile.overallCapability.score} 
                              sx={{ mt: 1, height: 8, borderRadius: 4 }}
                              color={getCapabilityColor(selectedProfile.overallCapability.score)}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>Assessment Metadata</Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText 
                                primary="Confidence" 
                                secondary={`${selectedProfile.overallCapability.confidence}%`} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Trend" 
                                secondary={selectedProfile.overallCapability.trend} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Last Assessment" 
                                secondary={selectedProfile.assessmentMeta.lastAssessment.toLocaleDateString()} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Review Status" 
                                secondary={selectedProfile.assessmentMeta.reviewStatus.replace('_', ' ')} 
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom color="success.main">
                            Key Strengths
                          </Typography>
                          <List dense>
                            {selectedProfile.strengths.map((strength, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <CheckCircle color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={strength} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom color="warning.main">
                            Key Weaknesses
                          </Typography>
                          <List dense>
                            {selectedProfile.weaknesses.map((weakness, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <Warning color="warning" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={weakness} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Capability Dimensions
                      </Typography>
                      {dimensions.map(dimension => {
                        const dimensionScores = selectedProfile.dimensionScores.filter(s => s.dimensionId === dimension.id);
                        const avgScore = dimensionScores.reduce((sum, s) => sum + s.score, 0) / dimensionScores.length;
                        
                        return (
                          <Accordion key={dimension.id}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                <Typography variant="body1">{dimension.name}</Typography>
                                <Box sx={{ flexGrow: 1, mx: 2 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={avgScore} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                    color={getCapabilityColor(avgScore)}
                                  />
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                  {Math.round(avgScore)}/100
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" color="textSecondary" paragraph>
                                {dimension.description}
                              </Typography>
                              <Grid container spacing={2}>
                                {dimension.subDimensions.map(subDim => {
                                  const subScore = dimensionScores.find(s => s.subDimensionId === subDim.id);
                                  return (
                                    <Grid item xs={12} md={6} key={subDim.id}>
                                      <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          {subDim.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={subScore?.score || 0} 
                                            sx={{ flexGrow: 1, height: 6 }}
                                            color={getCapabilityColor(subScore?.score || 0)}
                                          />
                                          <Typography variant="caption">
                                            {subScore?.score || 0}/100
                                          </Typography>
                                        </Box>
                                        <Typography variant="caption" color="textSecondary">
                                          {subDim.description}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Capability Evolution History
                      </Typography>
                      <List dense>
                        {selectedProfile.evolutionHistory.map((evolution, idx) => (
                          <ListItem key={idx} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body2">
                                    {evolution.date.toLocaleDateString()}
                                  </Typography>
                                  <Chip 
                                    label={`${Math.round(evolution.overallScore)}/100`} 
                                    size="small" 
                                    color={getCapabilityColor(evolution.overallScore)}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block">
                                    Major Changes: {evolution.majorChanges.join(', ')}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {evolution.reasoning}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedTab === 3 && (
                    <Box sx={{ mt: 2, height: '450px', overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Comparative Analysis
                      </Typography>
                      <List dense>
                        {selectedProfile.comparisons.map((comparison, idx) => (
                          <ListItem key={idx} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body2">{comparison.actorName}</Typography>
                                  <Chip 
                                    label={comparison.relativeDifference > 0 ? `+${comparison.relativeDifference}` : `${comparison.relativeDifference}`}
                                    size="small" 
                                    color={comparison.relativeDifference > 0 ? 'success' : 'error'}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" display="block" color="success.main">
                                    Stronger in: {comparison.strongerIn.join(', ')}
                                  </Typography>
                                  <Typography variant="caption" display="block" color="error.main">
                                    Weaker in: {comparison.weakerIn.join(', ')}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
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
                    <Assessment sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.5), mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      Select a Capability Profile
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Choose a threat actor profile to view detailed capability assessment
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dimension Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Capability Dimension Details
        </DialogTitle>
        <DialogContent>
          {selectedDimension && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedDimension.name}
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedDimension.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Weight in overall assessment: {Math.round(selectedDimension.weight * 100)}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Sub-dimensions
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Weight</TableCell>
                        <TableCell>Key Indicators</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedDimension.subDimensions.map(subDim => (
                        <TableRow key={subDim.id}>
                          <TableCell>{subDim.name}</TableCell>
                          <TableCell>{subDim.description}</TableCell>
                          <TableCell>{Math.round(subDim.weight * 100)}%</TableCell>
                          <TableCell>{subDim.indicators.join(', ')}</TableCell>
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
          <Button variant="contained">View Assessment Guide</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatActorCapabilityAssessment;