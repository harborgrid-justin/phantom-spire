/**
 * Intelligence Sharing and Collaboration Platform
 * Advanced CTI collaboration system for multi-organization threat intelligence sharing
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  AppBar,
  Toolbar,
  Drawer,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemButton,
  Collapse,
  Breadcrumbs,
  Link,
  RadioGroup,
  Radio,
  FormLabel,
  Checkbox,
  FormGroup,
  Autocomplete,
  AvatarGroup,
  CardHeader,
  CardActions,
  Fab,
  ListItemAvatar,
  ListSubheader,
  Step,
  StepLabel,
  Stepper,
  StepContent
} from '@mui/material';

import {
  Share,
  Group,
  GroupWork,
  People,
  PersonAdd,
  PersonRemove,
  Business,
  Public,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  Security,
  Shield,
  VerifiedUser,
  AdminPanelSettings,
  SupervisorAccount,
  ManageAccounts,
  AccountCircle,
  Badge as BadgeIcon,
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  Task,
  TaskAlt,
  Comment,
  Chat,
  ChatBubble,
  Forum,
  Message,
  Email,
  Send,
  Reply,
  Forward,
  Archive,
  Unarchive,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Flag,
  FlagOutlined,
  Report,
  ReportProblem,
  Feedback,
  ThumbUp,
  ThumbDown,
  ThumbsUpDown,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Schedule,
  History,
  Update,
  Sync,
  SyncProblem,
  Cloud,
  CloudSync,
  CloudUpload,
  CloudDownload,
  Upload,
  Download,
  Import,
  Export,
  AttachFile,
  Attachment,
  Link as LinkIcon,
  LinkOff,
  QrCode,
  Api,
  Code,
  Integration,
  Extension,
  Settings,
  Edit,
  Delete,
  Add,
  Remove,
  Search,
  FilterList,
  Sort,
  Refresh,
  Analytics,
  Assessment,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  CheckCircle,
  Info,
  Psychology,
  BugReport,
  AccountTree,
  Hub,
  DeviceHub,
  Transform,
  Functions,
  AutoGraph,
  Insights,
  Calculate,
  Schema,
  CompareArrows,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  MoreVert,
  Launch,
  OpenInNew,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';

import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/core/UIUXEvaluationService';

// Collaboration interfaces
interface Organization {
  id: string;
  name: string;
  type: 'government' | 'enterprise' | 'security_vendor' | 'research' | 'isac' | 'community';
  sector: string;
  country: string;
  region: string;
  trustLevel: 'unverified' | 'basic' | 'trusted' | 'premium' | 'strategic';
  partnership: {
    status: 'pending' | 'active' | 'suspended' | 'terminated';
    type: 'bilateral' | 'multilateral' | 'community' | 'commercial';
    established: Date;
    agreementType: 'nda' | 'mou' | 'contract' | 'informal';
    sharingLevel: 'basic' | 'enhanced' | 'full' | 'restricted';
  };
  capabilities: {
    dataTypes: string[];
    analysisCapabilities: string[];
    technicalExpertise: string[];
    geographicCoverage: string[];
    languages: string[];
  };
  statistics: {
    totalShared: number;
    totalReceived: number;
    qualityScore: number;
    responsiveness: number;
    reciprocity: number;
    lastActivity: Date;
  };
  contact: {
    primaryContact: string;
    email: string;
    phone?: string;
    timezone: string;
    preferredChannels: string[];
  };
  metadata: {
    created: Date;
    verified: boolean;
    verifiedBy?: string;
    verificationDate?: Date;
    tags: string[];
    notes: string;
  };
}

interface IntelligencePackage {
  id: string;
  title: string;
  description: string;
  classification: 'public' | 'tlp_white' | 'tlp_green' | 'tlp_amber' | 'tlp_red';
  type: 'ioc' | 'report' | 'analysis' | 'alert' | 'advisory' | 'campaign' | 'actor_profile' | 'technique';
  format: 'stix' | 'misp' | 'json' | 'xml' | 'pdf' | 'docx' | 'custom';
  content: {
    iocs?: string[];
    indicators?: any[];
    analysis?: string;
    recommendations?: string[];
    mitigations?: string[];
    attribution?: any;
    timeline?: any[];
    references?: string[];
    attachments?: string[];
  };
  sharing: {
    sharedBy: string;
    sharedWith: string[];
    shareDate: Date;
    expirationDate?: Date;
    permissions: {
      view: boolean;
      download: boolean;
      reshare: boolean;
      modify: boolean;
      comment: boolean;
    };
    restrictions: string[];
  };
  provenance: {
    source: string;
    originalAuthor: string;
    created: Date;
    confidence: number;
    reliability: 'unknown' | 'unreliable' | 'usually_reliable' | 'reliable' | 'completely_reliable';
    credibility: 'unknown' | 'improbable' | 'doubtful' | 'possibly_true' | 'probably_true' | 'confirmed';
  };
  feedback: {
    ratings: {
      userId: string;
      rating: number;
      comment?: string;
      timestamp: Date;
    }[];
    avgRating: number;
    totalRatings: number;
    usefulness: number;
    accuracy: number;
    timeliness: number;
  };
  collaboration: {
    comments: Comment[];
    annotations: Annotation[];
    reviews: Review[];
    subscriptions: string[];
    watchers: string[];
  };
  workflow: {
    status: 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'deprecated';
    reviewers: string[];
    approvers: string[];
    approvalDate?: Date;
    publishedDate?: Date;
    workflow_id?: string;
  };
  metrics: {
    views: number;
    downloads: number;
    shares: number;
    comments: number;
    utilization: number;
    impact: number;
  };
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  parentId?: string;
  replies?: Comment[];
  reactions: {
    type: 'like' | 'dislike' | 'helpful' | 'question' | 'concern';
    count: number;
    users: string[];
  }[];
  mentions: string[];
  attachments?: string[];
  edited?: {
    timestamp: Date;
    reason: string;
  };
}

interface Annotation {
  id: string;
  author: string;
  type: 'highlight' | 'note' | 'question' | 'correction' | 'addition';
  content: string;
  position: {
    section: string;
    line?: number;
    character?: number;
  };
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  visibility: 'public' | 'organization' | 'private';
}

interface Review {
  id: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  timestamp: Date;
  completedAt?: Date;
  criteria: {
    accuracy: number;
    completeness: number;
    relevance: number;
    timeliness: number;
    clarity: number;
  };
  comments: string;
  recommendations: string[];
  approvalLevel: 'technical' | 'management' | 'executive';
}

interface CollaborationWorkspace {
  id: string;
  name: string;
  description: string;
  type: 'investigation' | 'campaign_tracking' | 'actor_analysis' | 'incident_response' | 'research';
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'analyst' | 'observer';
    permissions: string[];
    joinedAt: Date;
    lastActivity: Date;
  }[];
  organizations: string[];
  packages: string[];
  activities: {
    id: string;
    type: 'package_shared' | 'comment_added' | 'analysis_updated' | 'member_added' | 'workspace_created';
    actor: string;
    timestamp: Date;
    description: string;
    metadata: Record<string, any>;
  }[];
  settings: {
    visibility: 'public' | 'organization' | 'private' | 'invited_only';
    defaultClassification: string;
    autoNotifications: boolean;
    requireApproval: boolean;
    allowExternalSharing: boolean;
    retentionPolicy: number;
  };
  metadata: {
    created: Date;
    createdBy: string;
    lastActivity: Date;
    isActive: boolean;
    tags: string[];
  };
}

const IntelligenceSharingCollaboration: React.FC = () => {
  const theme = useTheme();
  const wsRef = useRef<WebSocket | null>(null);
  
  // Core data states
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [intelligencePackages, setIntelligencePackages] = useState<IntelligencePackage[]>([]);
  const [workspaces, setWorkspaces] = useState<CollaborationWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<IntelligencePackage | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<CollaborationWorkspace | null>(null);
  const [orgDetailsOpen, setOrgDetailsOpen] = useState(false);
  const [packageDetailsOpen, setPackageDetailsOpen] = useState(false);
  const [workspaceDetailsOpen, setWorkspaceDetailsOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Collaboration states
  const [realTimeCollaboration, setRealTimeCollaboration] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [orgTypeFilter, setOrgTypeFilter] = useState<string>('all');
  const [trustLevelFilter, setTrustLevelFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [packageTypeFilter, setPackageTypeFilter] = useState<string>('all');
  const [workspaceTypeFilter, setWorkspaceTypeFilter] = useState<string>('all');
  
  // Sharing states
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [shareClassification, setShareClassification] = useState<string>('tlp_amber');
  const [sharePermissions, setSharePermissions] = useState({
    view: true,
    download: false,
    reshare: false,
    modify: false,
    comment: true
  });
  const [shareExpiration, setShareExpiration] = useState<Date | null>(null);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('intelligence-sharing-collaboration', {
      continuous: true,
      position: 'top-left',
      minimized: true,
      interval: 180000
    });

    return () => evaluationController.remove();
  }, []);

  // Generate mock organizations
  const generateMockOrganizations = useCallback((): Organization[] => {
    const orgTypes = ['government', 'enterprise', 'security_vendor', 'research', 'isac', 'community'] as const;
    const sectors = ['Finance', 'Healthcare', 'Energy', 'Government', 'Technology', 'Manufacturing', 'Defense'];
    const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Canada'];
    const trustLevels = ['unverified', 'basic', 'trusted', 'premium', 'strategic'] as const;
    const partnershipTypes = ['bilateral', 'multilateral', 'community', 'commercial'] as const;
    
    const orgs: Organization[] = [];
    
    for (let i = 0; i < 30; i++) {
      const orgType = orgTypes[Math.floor(Math.random() * orgTypes.length)];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const trustLevel = trustLevels[Math.floor(Math.random() * trustLevels.length)];
      
      orgs.push({
        id: `org-${i}`,
        name: `${sector} ${orgType.replace('_', ' ')} ${i + 1}`,
        type: orgType,
        sector,
        country,
        region: i < 10 ? 'North America' : i < 20 ? 'Europe' : 'Asia Pacific',
        trustLevel,
        partnership: {
          status: ['active', 'pending', 'suspended'][Math.floor(Math.random() * 3)] as any,
          type: partnershipTypes[Math.floor(Math.random() * partnershipTypes.length)],
          established: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          agreementType: ['nda', 'mou', 'contract', 'informal'][Math.floor(Math.random() * 4)] as any,
          sharingLevel: ['basic', 'enhanced', 'full', 'restricted'][Math.floor(Math.random() * 4)] as any
        },
        capabilities: {
          dataTypes: ['IOCs', 'Reports', 'Analysis', 'Alerts'].slice(0, Math.floor(Math.random() * 4) + 1),
          analysisCapabilities: ['Malware Analysis', 'Network Analysis', 'Behavioral Analysis'],
          technicalExpertise: ['APT', 'Ransomware', 'Phishing', 'DDoS'],
          geographicCoverage: [country],
          languages: ['English', 'Spanish', 'French', 'German'].slice(0, Math.floor(Math.random() * 3) + 1)
        },
        statistics: {
          totalShared: Math.floor(Math.random() * 1000) + 50,
          totalReceived: Math.floor(Math.random() * 800) + 30,
          qualityScore: Math.floor(Math.random() * 30) + 70,
          responsiveness: Math.floor(Math.random() * 40) + 60,
          reciprocity: Math.random(),
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        },
        contact: {
          primaryContact: `contact${i}@${orgType.replace('_', '')}.com`,
          email: `intel-sharing@${orgType.replace('_', '')}.com`,
          timezone: 'UTC',
          preferredChannels: ['email', 'api', 'portal']
        },
        metadata: {
          created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          verified: Math.random() > 0.3,
          verifiedBy: Math.random() > 0.3 ? 'admin@company.com' : undefined,
          verificationDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) : undefined,
          tags: [orgType, sector.toLowerCase(), trustLevel],
          notes: `Partnership established for ${sector.toLowerCase()} threat intelligence sharing`
        }
      });
    }
    
    return orgs.sort((a, b) => b.statistics.qualityScore - a.statistics.qualityScore);
  }, []);

  // Generate mock intelligence packages
  const generateMockPackages = useCallback((): IntelligencePackage[] => {
    const classifications = ['public', 'tlp_white', 'tlp_green', 'tlp_amber', 'tlp_red'] as const;
    const packageTypes = ['ioc', 'report', 'analysis', 'alert', 'advisory', 'campaign', 'actor_profile'] as const;
    const formats = ['stix', 'misp', 'json', 'xml', 'pdf', 'docx'] as const;
    const statuses = ['draft', 'review', 'approved', 'published', 'archived'] as const;
    const reliabilities = ['unknown', 'unreliable', 'usually_reliable', 'reliable', 'completely_reliable'] as const;
    
    const packages: IntelligencePackage[] = [];
    
    for (let i = 0; i < 50; i++) {
      const classification = classifications[Math.floor(Math.random() * classifications.length)];
      const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
      const format = formats[Math.floor(Math.random() * formats.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const sharedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      packages.push({
        id: `package-${i}`,
        title: `${packageType.replace('_', ' ')} Package ${i + 1}`,
        description: `Comprehensive ${packageType.replace('_', ' ')} intelligence package containing analysis and indicators`,
        classification,
        type: packageType,
        format,
        content: {
          iocs: packageType === 'ioc' ? [`IOC-${i}-1`, `IOC-${i}-2`, `IOC-${i}-3`] : undefined,
          analysis: `Detailed analysis of ${packageType.replace('_', ' ')} with key findings and recommendations`,
          recommendations: ['Monitor network traffic', 'Update detection rules', 'Implement mitigations'],
          attribution: {
            actor: `APT-${Math.floor(Math.random() * 50)}`,
            confidence: Math.floor(Math.random() * 40) + 60,
            evidence: ['Technical indicators', 'Behavioral patterns', 'Infrastructure overlap']
          },
          references: [`https://source${i}.example.com`, `https://analysis${i}.example.com`]
        },
        sharing: {
          sharedBy: `org-${Math.floor(Math.random() * 30)}`,
          sharedWith: [`org-${Math.floor(Math.random() * 30)}`, `org-${Math.floor(Math.random() * 30)}`],
          shareDate: sharedDate,
          expirationDate: classification === 'tlp_red' ? new Date(sharedDate.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
          permissions: {
            view: true,
            download: classification !== 'tlp_red',
            reshare: classification === 'public' || classification === 'tlp_white',
            modify: false,
            comment: true
          },
          restrictions: classification === 'tlp_red' ? ['No automated processing', 'Limited distribution'] : []
        },
        provenance: {
          source: `org-${Math.floor(Math.random() * 30)}`,
          originalAuthor: `analyst${i}@example.com`,
          created: new Date(sharedDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          confidence: Math.floor(Math.random() * 40) + 60,
          reliability: reliabilities[Math.floor(Math.random() * reliabilities.length)],
          credibility: ['possibly_true', 'probably_true', 'confirmed'][Math.floor(Math.random() * 3)] as any
        },
        feedback: {
          ratings: [],
          avgRating: Math.random() * 2 + 3,
          totalRatings: Math.floor(Math.random() * 20),
          usefulness: Math.floor(Math.random() * 30) + 70,
          accuracy: Math.floor(Math.random() * 25) + 75,
          timeliness: Math.floor(Math.random() * 35) + 65
        },
        collaboration: {
          comments: [],
          annotations: [],
          reviews: [],
          subscriptions: [`user-${Math.floor(Math.random() * 10)}`],
          watchers: [`user-${Math.floor(Math.random() * 10)}`, `user-${Math.floor(Math.random() * 10)}`]
        },
        workflow: {
          status,
          reviewers: status === 'review' ? [`reviewer-${Math.floor(Math.random() * 5)}`] : [],
          approvers: ['approver-1'],
          approvalDate: status === 'published' ? new Date(sharedDate.getTime() - 24 * 60 * 60 * 1000) : undefined,
          publishedDate: status === 'published' ? sharedDate : undefined
        },
        metrics: {
          views: Math.floor(Math.random() * 500) + 10,
          downloads: Math.floor(Math.random() * 100) + 5,
          shares: Math.floor(Math.random() * 50) + 1,
          comments: Math.floor(Math.random() * 20),
          utilization: Math.floor(Math.random() * 100),
          impact: Math.floor(Math.random() * 100)
        }
      });
    }
    
    return packages.sort((a, b) => b.sharing.shareDate.getTime() - a.sharing.shareDate.getTime());
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        setOrganizations(generateMockOrganizations());
        setIntelligencePackages(generateMockPackages());
        
        // Generate mock workspaces
        setWorkspaces([
          {
            id: 'workspace-1',
            name: 'APT Campaign Analysis',
            description: 'Collaborative analysis of recent APT campaign activities',
            type: 'campaign_tracking',
            members: [
              { userId: 'user-1', role: 'owner', permissions: ['read', 'write', 'admin'], joinedAt: new Date(), lastActivity: new Date() },
              { userId: 'user-2', role: 'analyst', permissions: ['read', 'write'], joinedAt: new Date(), lastActivity: new Date() }
            ],
            organizations: ['org-1', 'org-2', 'org-3'],
            packages: ['package-1', 'package-2'],
            activities: [
              {
                id: 'activity-1',
                type: 'package_shared',
                actor: 'user-1',
                timestamp: new Date(),
                description: 'Shared APT analysis package',
                metadata: { packageId: 'package-1' }
              }
            ],
            settings: {
              visibility: 'organization',
              defaultClassification: 'tlp_amber',
              autoNotifications: true,
              requireApproval: false,
              allowExternalSharing: true,
              retentionPolicy: 90
            },
            metadata: {
              created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              createdBy: 'user-1',
              lastActivity: new Date(),
              isActive: true,
              tags: ['apt', 'campaign', 'collaboration']
            }
          }
        ]);
        
      } catch (err) {
        setError('Failed to load collaboration data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generateMockOrganizations, generateMockPackages]);

  // Filter data
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      if (searchTerm && !org.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !org.sector.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (orgTypeFilter !== 'all' && org.type !== orgTypeFilter) {
        return false;
      }
      if (trustLevelFilter !== 'all' && org.trustLevel !== trustLevelFilter) {
        return false;
      }
      return true;
    });
  }, [organizations, searchTerm, orgTypeFilter, trustLevelFilter]);

  const filteredPackages = useMemo(() => {
    return intelligencePackages.filter(pkg => {
      if (searchTerm && !pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !pkg.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (classificationFilter !== 'all' && pkg.classification !== classificationFilter) {
        return false;
      }
      if (packageTypeFilter !== 'all' && pkg.type !== packageTypeFilter) {
        return false;
      }
      return true;
    });
  }, [intelligencePackages, searchTerm, classificationFilter, packageTypeFilter]);

  // Calculate dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalOrganizations = filteredOrganizations.length;
    const activePartnerships = filteredOrganizations.filter(org => org.partnership.status === 'active').length;
    const trustedPartners = filteredOrganizations.filter(org => 
      org.trustLevel === 'trusted' || org.trustLevel === 'premium' || org.trustLevel === 'strategic'
    ).length;
    const totalPackages = filteredPackages.length;
    const recentPackages = filteredPackages.filter(pkg => 
      pkg.sharing.shareDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const avgQuality = filteredOrganizations.length > 0 ?
      Math.round(filteredOrganizations.reduce((sum, org) => sum + org.statistics.qualityScore, 0) / filteredOrganizations.length) : 0;
    
    return {
      totalOrganizations,
      activePartnerships,
      trustedPartners,
      totalPackages,
      recentPackages,
      avgQuality
    };
  }, [filteredOrganizations, filteredPackages]);

  // Get trust level color
  const getTrustLevelColor = (level: string): string => {
    switch (level) {
      case 'strategic': return theme.palette.error.main;
      case 'premium': return theme.palette.warning.main;
      case 'trusted': return theme.palette.success.main;
      case 'basic': return theme.palette.info.main;
      case 'unverified': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  // Get classification color
  const getClassificationColor = (classification: string): string => {
    switch (classification) {
      case 'tlp_red': return theme.palette.error.main;
      case 'tlp_amber': return theme.palette.warning.main;
      case 'tlp_green': return theme.palette.success.main;
      case 'tlp_white': return theme.palette.info.main;
      case 'public': return theme.palette.primary.main;
      default: return theme.palette.grey[500];
    }
  };

  // Render organizations
  const renderOrganizations = () => (
    <Grid container spacing={3}>
      {filteredOrganizations.map(org => (
        <Grid item xs={12} sm={6} lg={4} key={org.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[8],
              }
            }}
            onClick={() => {
              setSelectedOrganization(org);
              setOrgDetailsOpen(true);
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: getTrustLevelColor(org.trustLevel),
                      width: 32,
                      height: 32
                    }}
                  >
                    <Business fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" noWrap>
                      {org.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {org.sector} • {org.country}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: 0.5 }}>
                  <Chip
                    size="small"
                    label={org.trustLevel.replace('_', ' ')}
                    sx={{
                      bgcolor: alpha(getTrustLevelColor(org.trustLevel), 0.1),
                      color: getTrustLevelColor(org.trustLevel)
                    }}
                  />
                  <Badge
                    badgeContent={org.partnership.status}
                    color={org.partnership.status === 'active' ? 'success' : 'warning'}
                    variant="dot"
                  />
                </Box>
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {org.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} organization specializing in {org.sector.toLowerCase()} security
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Quality: ${org.statistics.qualityScore}%`}
                  sx={{
                    bgcolor: alpha(org.statistics.qualityScore >= 80 ? theme.palette.success.main : 
                                 org.statistics.qualityScore >= 60 ? theme.palette.warning.main :
                                 theme.palette.error.main, 0.1),
                    color: org.statistics.qualityScore >= 80 ? theme.palette.success.main : 
                           org.statistics.qualityScore >= 60 ? theme.palette.warning.main :
                           theme.palette.error.main
                  }}
                />
                <Chip
                  size="small"
                  label={`${org.statistics.totalShared} shared`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${org.statistics.totalReceived} received`}
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Responsiveness
                    </Typography>
                    <Typography variant="body2">
                      {org.statistics.responsiveness}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Reciprocity
                    </Typography>
                    <Typography variant="body2">
                      {(org.statistics.reciprocity * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Last activity: {org.statistics.lastActivity.toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color={org.metadata.verified ? 'success' : 'default'}
                  >
                    {org.metadata.verified ? <VerifiedUser fontSize="small" /> : <Security fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share with organization
                      setSelectedRecipients([org.id]);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render intelligence packages
  const renderIntelligencePackages = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Package</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Classification</TableCell>
            <TableCell>Shared By</TableCell>
            <TableCell>Quality</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPackages.slice(0, 20).map(pkg => (
            <TableRow
              key={pkg.id}
              hover
              onClick={() => {
                setSelectedPackage(pkg);
                setPackageDetailsOpen(true);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {pkg.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {pkg.format.toUpperCase()} • {pkg.workflow.status}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={pkg.type.replace('_', ' ')}
                  color="primary"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={pkg.classification.replace('_', ' ').toUpperCase()}
                  sx={{
                    bgcolor: alpha(getClassificationColor(pkg.classification), 0.1),
                    color: getClassificationColor(pkg.classification)
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {organizations.find(org => org.id === pkg.sharing.sharedBy)?.name || 'Unknown'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    {pkg.feedback.avgRating.toFixed(1)}
                  </Typography>
                  <Box sx={{ display: 'flex' }}>
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        sx={{
                          fontSize: 16,
                          color: index < pkg.feedback.avgRating ? 
                            theme.palette.warning.main : theme.palette.grey[300]
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {pkg.metrics.views} views
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {pkg.metrics.comments} comments
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download package
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share package
                      setSelectedPackage(pkg);
                      setShareDialogOpen(true);
                    }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add comment
                      setSelectedPackage(pkg);
                      setCollaborationOpen(true);
                    }}
                  >
                    <Comment fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Intelligence Sharing & Collaboration
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Multi-organization threat intelligence sharing and collaborative analysis platform
        </Typography>
      </Box>

      {/* Connection Status */}
      <Alert
        severity={connectionStatus === 'connected' ? 'success' : 'warning'}
        sx={{ mb: 3 }}
        icon={connectionStatus === 'connected' ? <Cloud /> : <CloudOff />}
        action={
          <Switch
            checked={realTimeCollaboration}
            onChange={(e) => setRealTimeCollaboration(e.target.checked)}
          />
        }
      >
        Real-time collaboration is {connectionStatus}
      </Alert>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.totalOrganizations}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Partners
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <VerifiedUser />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.trustedPartners}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Trusted
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.totalPackages}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Packages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <Schedule />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.recentPackages}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <Assessment />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {dashboardStats.avgQuality}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Quality
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <GroupWork />
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {workspaces.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Workspaces
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search organizations, packages..."
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Org Type</InputLabel>
              <Select
                value={orgTypeFilter}
                onChange={(e) => setOrgTypeFilter(e.target.value)}
                label="Org Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="government">Government</MenuItem>
                <MenuItem value="enterprise">Enterprise</MenuItem>
                <MenuItem value="security_vendor">Security Vendor</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="isac">ISAC</MenuItem>
                <MenuItem value="community">Community</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trust Level</InputLabel>
              <Select
                value={trustLevelFilter}
                onChange={(e) => setTrustLevelFilter(e.target.value)}
                label="Trust Level"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="strategic">Strategic</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
                <MenuItem value="trusted">Trusted</MenuItem>
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Classification</InputLabel>
              <Select
                value={classificationFilter}
                onChange={(e) => setClassificationFilter(e.target.value)}
                label="Classification"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="tlp_white">TLP:WHITE</MenuItem>
                <MenuItem value="tlp_green">TLP:GREEN</MenuItem>
                <MenuItem value="tlp_amber">TLP:AMBER</MenuItem>
                <MenuItem value="tlp_red">TLP:RED</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {/* Add organization */}}
              >
                Add Partner
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => setShareDialogOpen(true)}
              >
                Share Intel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Organizations" icon={<Business />} />
          <Tab label="Intelligence Packages" icon={<Assignment />} />
          <Tab label="Workspaces" icon={<GroupWork />} />
          <Tab label="Activity Feed" icon={<Timeline />} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {activeTab === 0 && renderOrganizations()}
            {activeTab === 1 && renderIntelligencePackages()}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                {workspaces.map(workspace => (
                  <Grid item xs={12} md={6} key={workspace.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {workspace.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {workspace.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip size="small" label={workspace.type.replace('_', ' ')} />
                          <Chip size="small" label={`${workspace.members.length} members`} />
                          <Chip size="small" label={`${workspace.packages.length} packages`} />
                        </Box>
                        <AvatarGroup max={4}>
                          {workspace.members.map(member => (
                            <Avatar key={member.userId} sx={{ width: 24, height: 24 }}>
                              <Person fontSize="small" />
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            {activeTab === 3 && (
              <Timeline>
                {Array.from({ length: 20 }, (_, i) => (
                  <TimelineItem key={i}>
                    <TimelineOppositeContent sx={{ minWidth: 120 }}>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(Date.now() - i * 60 * 60 * 1000).toLocaleString()}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="primary">
                        <Share fontSize="small" />
                      </TimelineDot>
                      {i < 19 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">
                        Intelligence package shared
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        APT Analysis Package shared with 3 organizations
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </>
        )}
      </Box>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Collaboration Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Share />}
          tooltipTitle="Share Intelligence"
          onClick={() => setShareDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<GroupWork />}
          tooltipTitle="Create Workspace"
          onClick={() => {/* Create workspace */}}
        />
        <SpeedDialAction
          icon={<PersonAdd />}
          tooltipTitle="Invite Partner"
          onClick={() => {/* Invite partner */}}
        />
        <SpeedDialAction
          icon={<Settings />}
          tooltipTitle="Settings"
          onClick={() => setSettingsOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
};

export default IntelligenceSharingCollaboration;