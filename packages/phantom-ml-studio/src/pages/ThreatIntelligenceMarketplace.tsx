import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Chip,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  Psychology as AIIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CloudUpload as UploadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

interface ThreatModel {
  id: string;
  name: string;
  description: string;
  category: 'malware_detection' | 'network_intrusion' | 'anomaly_detection' | 'threat_hunting' | 'vulnerability_assessment';
  algorithm: string;
  accuracy: number;
  securityScore: number;
  threatTypes: string[];
  publisher: string;
  publisherType: 'phantom_official' | 'community' | 'enterprise_partner';
  rating: number;
  downloads: number;
  lastUpdated: string;
  version: string;
  size: string;
  price: number; // 0 for free
  verified: boolean;
  complianceFlags: string[];
  threatIntelSources: string[];
  performanceMetrics: {
    falsePositiveRate: number;
    falseNegativeRate: number;
    averageLatency: number;
    throughput: number;
  };
  deployment: {
    supportedPlatforms: string[];
    requirements: string[];
    scalability: 'low' | 'medium' | 'high';
  };
  preview?: {
    demo: boolean;
    sampleData: boolean;
    documentation: boolean;
  };
}

const ThreatIntelligenceMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [models, setModels] = useState<ThreatModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<ThreatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<ThreatModel | null>(null);
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    // Initialize with mock threat intelligence models
    const mockModels: ThreatModel[] = [
      {
        id: 'phantom-apt-detector-v3',
        name: 'Advanced Persistent Threat Detector v3.1',
        description: 'State-of-the-art APT detection model using behavioral analysis and threat intelligence fusion. Specialized for detecting sophisticated multi-stage attacks.',
        category: 'threat_hunting',
        algorithm: 'Neural Network + Graph Analysis',
        accuracy: 96.8,
        securityScore: 98.2,
        threatTypes: ['APT', 'Lateral Movement', 'Data Exfiltration', 'Command & Control'],
        publisher: 'Phantom Security Team',
        publisherType: 'phantom_official',
        rating: 4.9,
        downloads: 12456,
        lastUpdated: '2024-01-15',
        version: '3.1.2',
        size: '45MB',
        price: 0,
        verified: true,
        complianceFlags: ['NIST', 'ISO27001', 'SOC2'],
        threatIntelSources: ['MITRE ATT&CK', 'VirusTotal', 'Hybrid Analysis', 'YARA Rules'],
        performanceMetrics: {
          falsePositiveRate: 0.02,
          falseNegativeRate: 0.032,
          averageLatency: 1.2,
          throughput: 2400
        },
        deployment: {
          supportedPlatforms: ['Linux', 'Windows', 'Docker', 'Kubernetes'],
          requirements: ['8GB RAM', '2 CPU cores', 'GPU optional'],
          scalability: 'high'
        },
        preview: {
          demo: true,
          sampleData: true,
          documentation: true
        }
      },
      {
        id: 'community-malware-classifier',
        name: 'Community Malware Family Classifier',
        description: 'Open-source malware classification model trained on millions of samples. Supports 50+ malware families with high accuracy.',
        category: 'malware_detection',
        algorithm: 'XGBoost + Feature Engineering',
        accuracy: 94.2,
        securityScore: 93.7,
        threatTypes: ['Ransomware', 'Trojans', 'Botnets', 'Rootkits', 'Adware'],
        publisher: 'CyberSecurity Community',
        publisherType: 'community',
        rating: 4.6,
        downloads: 8923,
        lastUpdated: '2024-01-10',
        version: '2.4.1',
        size: '23MB',
        price: 0,
        verified: true,
        complianceFlags: ['Open Source', 'MIT License'],
        threatIntelSources: ['VirusTotal', 'Malware Bazaar', 'URLhaus'],
        performanceMetrics: {
          falsePositiveRate: 0.055,
          falseNegativeRate: 0.058,
          averageLatency: 0.8,
          throughput: 3200
        },
        deployment: {
          supportedPlatforms: ['Linux', 'Windows', 'macOS', 'Docker'],
          requirements: ['4GB RAM', '1 CPU core'],
          scalability: 'medium'
        },
        preview: {
          demo: true,
          sampleData: true,
          documentation: true
        }
      },
      {
        id: 'enterprise-network-anomaly',
        name: 'Enterprise Network Anomaly Detector',
        description: 'Commercial-grade network anomaly detection with real-time analysis and automated response capabilities.',
        category: 'network_intrusion',
        algorithm: 'LSTM + Attention Mechanism',
        accuracy: 92.5,
        securityScore: 95.1,
        threatTypes: ['Network Intrusions', 'DDoS', 'Port Scanning', 'Data Exfiltration'],
        publisher: 'SecureNet Solutions',
        publisherType: 'enterprise_partner',
        rating: 4.4,
        downloads: 3421,
        lastUpdated: '2024-01-12',
        version: '1.8.0',
        size: '67MB',
        price: 299,
        verified: true,
        complianceFlags: ['PCI-DSS', 'HIPAA', 'GDPR'],
        threatIntelSources: ['Cisco Talos', 'FireEye', 'CrowdStrike'],
        performanceMetrics: {
          falsePositiveRate: 0.087,
          falseNegativeRate: 0.075,
          averageLatency: 2.1,
          throughput: 1800
        },
        deployment: {
          supportedPlatforms: ['Linux Enterprise', 'Windows Server', 'VMware'],
          requirements: ['16GB RAM', '4 CPU cores', 'NVIDIA GPU'],
          scalability: 'high'
        },
        preview: {
          demo: true,
          sampleData: false,
          documentation: true
        }
      },
      {
        id: 'zero-day-vulnerability-scanner',
        name: 'Zero-Day Vulnerability Predictor',
        description: 'AI-powered vulnerability assessment model that identifies potential zero-day vulnerabilities using code analysis and threat patterns.',
        category: 'vulnerability_assessment',
        algorithm: 'Transformer + Graph Neural Network',
        accuracy: 89.7,
        securityScore: 96.5,
        threatTypes: ['Zero-day Exploits', 'Code Vulnerabilities', 'Binary Analysis'],
        publisher: 'VulnAI Research',
        publisherType: 'enterprise_partner',
        rating: 4.7,
        downloads: 1876,
        lastUpdated: '2024-01-08',
        version: '1.2.3',
        size: '89MB',
        price: 499,
        verified: true,
        complianceFlags: ['NIST CVE', 'OWASP Top 10'],
        threatIntelSources: ['CVE Database', 'Exploit-DB', 'NVD'],
        performanceMetrics: {
          falsePositiveRate: 0.103,
          falseNegativeRate: 0.058,
          averageLatency: 3.5,
          throughput: 800
        },
        deployment: {
          supportedPlatforms: ['Linux', 'Docker', 'Cloud (AWS, Azure)'],
          requirements: ['32GB RAM', '8 CPU cores', 'High-performance storage'],
          scalability: 'high'
        },
        preview: {
          demo: false,
          sampleData: true,
          documentation: true
        }
      }
    ];

    setModels(mockModels);
    setFilteredModels(mockModels);
  }, []);

  useEffect(() => {
    let filtered = models;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.threatTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(model => model.category === categoryFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'accuracy':
        filtered.sort((a, b) => b.accuracy - a.accuracy);
        break;
    }

    setFilteredModels(filtered);
  }, [searchTerm, categoryFilter, sortBy, models]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getPublisherColor = (type: string) => {
    switch (type) {
      case 'phantom_official': return 'primary';
      case 'enterprise_partner': return 'secondary';
      case 'community': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'malware_detection': return <SecurityIcon />;
      case 'network_intrusion': return <ShieldIcon />;
      case 'anomaly_detection': return <TimelineIcon />;
      case 'threat_hunting': return <AssessmentIcon />;
      case 'vulnerability_assessment': return <VisibilityIcon />;
      default: return <AIIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🏪 Threat Intelligence ML Models Marketplace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover, download, and deploy security-focused ML models with threat intelligence
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Upload Model
          </Button>
          <Button variant="contained" startIcon={<SecurityIcon />}>
            My Models
          </Button>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <AlertTitle>🏆 H2O.ai Competitive Advantage</AlertTitle>
        <Typography variant="body2">
          <strong>Curated security model marketplace:</strong> Pre-trained threat detection models, community contributions, 
          enterprise partnerships, and threat intelligence integration - a specialized marketplace H2O.ai doesn't offer!
        </Typography>
      </Alert>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search models, threats, algorithms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="malware_detection">Malware Detection</MenuItem>
                <MenuItem value="network_intrusion">Network Intrusion</MenuItem>
                <MenuItem value="anomaly_detection">Anomaly Detection</MenuItem>
                <MenuItem value="threat_hunting">Threat Hunting</MenuItem>
                <MenuItem value="vulnerability_assessment">Vulnerability Assessment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="downloads">Most Downloaded</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="accuracy">Highest Accuracy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredModels.length} models found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Browse Models" />
        <Tab label="Featured" />
        <Tab label="My Downloads" />
        <Tab label="Upload Model" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {filteredModels.map((model) => (
            <Grid item xs={12} md={6} lg={4} key={model.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {getCategoryIcon(model.category)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" noWrap>
                        {model.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={model.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          ({model.rating})
                        </Typography>
                        {model.verified && <VerifiedIcon color="primary" fontSize="small" />}
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                    {model.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Algorithm:</strong> {model.algorithm}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2">Accuracy:</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={model.accuracy}
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2">{model.accuracy}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">Security Score:</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={model.securityScore}
                        color="error"
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2">{model.securityScore}%</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Threat Types:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {model.threatTypes.slice(0, 3).map((type, index) => (
                        <Chip key={index} label={type} size="small" />
                      ))}
                      {model.threatTypes.length > 3 && (
                        <Chip label={`+${model.threatTypes.length - 3} more`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={model.publisherType.replace('_', ' ').toUpperCase()}
                      color={getPublisherColor(model.publisherType) as any}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {model.downloads.toLocaleString()} downloads
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {model.price === 0 ? 'Free' : `$${model.price}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      v{model.version} • {model.size}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelDialog(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button size="small" variant="contained" startIcon={<DownloadIcon />}>
                    {model.price === 0 ? 'Download' : 'Purchase'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>🌟 Featured Models</AlertTitle>
              Handpicked models showcasing the latest in threat intelligence and security ML
            </Alert>
          </Grid>
          {filteredModels
            .filter(model => model.publisherType === 'phantom_official' || model.rating >= 4.5)
            .slice(0, 6)
            .map((model) => (
              <Grid item xs={12} md={6} lg={4} key={`featured-${model.id}`}>
                <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StarIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary">FEATURED</Typography>
                    </Box>
                    <Typography variant="h5" gutterBottom>{model.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {model.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">{model.price === 0 ? 'FREE' : `$${model.price}`}</Typography>
                      <Rating value={model.rating} precision={0.1} size="small" readOnly />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" fullWidth startIcon={<DownloadIcon />}>
                      Get Featured Model
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Model Details Dialog */}
      <Dialog
        open={showModelDialog}
        onClose={() => setShowModelDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedModel && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedModel && getCategoryIcon(selectedModel.category)}
              </Avatar>
              <Box>
                <Typography variant="h5">{selectedModel.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  by {selectedModel.publisher}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedModel && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" paragraph>
                    {selectedModel.description}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Accuracy</TableCell>
                          <TableCell>{selectedModel.accuracy}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Security Score</TableCell>
                          <TableCell>{selectedModel.securityScore}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>False Positive Rate</TableCell>
                          <TableCell>{(selectedModel.performanceMetrics.falsePositiveRate * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Average Latency</TableCell>
                          <TableCell>{selectedModel.performanceMetrics.averageLatency}ms</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Throughput</TableCell>
                          <TableCell>{selectedModel.performanceMetrics.throughput} req/sec</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="h6" gutterBottom>Threat Intelligence Sources</Typography>
                  <Box sx={{ mb: 3 }}>
                    {selectedModel.threatIntelSources.map((source, index) => (
                      <Chip key={index} label={source} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Deployment Info</Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Platforms:</strong> {selectedModel.deployment.supportedPlatforms.join(', ')}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Requirements:</strong> {selectedModel.deployment.requirements.join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Scalability:</strong> {selectedModel.deployment.scalability.toUpperCase()}
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Compliance</Typography>
                    {selectedModel.complianceFlags.map((flag, index) => (
                      <Chip key={index} label={flag} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Paper>

                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Downloads</Typography>
                    <Typography variant="h4" color="primary">
                      {selectedModel.downloads.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      total downloads
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModelDialog(false)}>Close</Button>
          {selectedModel?.preview?.demo && (
            <Button variant="outlined">Try Demo</Button>
          )}
          <Button variant="contained" startIcon={<DownloadIcon />}>
            {selectedModel?.price === 0 ? 'Download Free' : `Purchase $${selectedModel?.price}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreatIntelligenceMarketplace;