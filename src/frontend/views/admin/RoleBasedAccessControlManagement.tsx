/**
 * Role-Based Access Control and Permissions Management Interface
 * Enterprise-grade RBAC system for threat intelligence platform
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Stack,
  Container,
  Fab,
  ListItemSecondaryAction,
  ListSubheader,
  CardActions,
  CardHeader,
  AvatarGroup,
  Snackbar
} from '@mui/material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';

import {
  SimpleTreeView as TreeView,
  TreeItem
} from '@mui/x-tree-view';

import {
  Security,
  AdminPanelSettings,
  ManageAccounts,
  SupervisorAccount,
  AccountBox,
  Group,
  Person,
  Shield,
  Lock,
  LockOpen,
  Key,
  VpnKey,
  Assignment,
  AssignmentInd,
  Business,
  Domain,
  Apartment,
  LocationCity,
  Public,
  Language,
  Visibility,
  VisibilityOff,
  Edit,
  Delete,
  Add,
  Remove,
  Settings,
  MoreVert,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  CheckCircle,  Error as ErrorIcon,
  Warning,
  Info,
  Schedule,
  AccessTime,
  Event,
  CalendarToday,
  History,
  Timeline as TimelineIcon,
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  Dashboard,
  Insights,
  Calculate,
  Schema,
  GroupWork,
  CompareArrows,
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  ViewComfy,
  GridView,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Upload,
  Share,
  Launch,
  OpenInNew,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Label,
  LocalOffer,
  Category,
  Class,
  ShowChart,
  BarChart,
  PieChart,
  DonutLarge,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  Email,
  Sms,
  Phone,
  Message,
  Chat,
  Forum,
  Comment,
  BugReport,
  Build,
  Engineering,
  AccountTree
} from '@mui/icons-material';

import { LineChart, Line, AreaChart, Area, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ComposedChart, Pie } from 'recharts';
import { addUIUXEvaluation } from '../../../services/ui-ux-evaluation/hooks/useUIUXEvaluation';
import { useServicePage } from '../../../services/business-logic/hooks/useBusinessLogic';

// Enhanced Interfaces for RBAC and Permissions Management
interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom' | 'inherited';
  category: 'admin' | 'analyst' | 'operator' | 'viewer' | 'custom';
  level: number; // hierarchy level
  parentRoles: string[];
  childRoles: string[];
  permissions: Permission[];
  users: string[];
  groups: string[];
  organizations: string[];
  constraints: RoleConstraint[];
  metadata: RoleMetadata;
  audit: AuditInfo;
  status: 'active' | 'inactive' | 'deprecated' | 'pending';
  enabled: boolean;
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  conditions: PermissionCondition[];
  effect: 'allow' | 'deny';
  priority: number;
  inherited: boolean;
  source?: string; // source role if inherited
  constraints: PermissionConstraint[];
  metadata: Record<string, any>;
  enabled: boolean;
  temporary: boolean;
  expiresAt?: Date;
  grantedAt: Date;
  grantedBy: string;
}

interface PermissionScope {
  type: 'global' | 'organization' | 'department' | 'team' | 'project' | 'resource' | 'custom';
  targets: string[];
  exclusions: string[];
  inheritance: 'none' | 'down' | 'up' | 'both';
}

interface PermissionCondition {
  type: 'time' | 'location' | 'device' | 'ip' | 'mfa' | 'risk' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater' | 'less';
  value: any;
  required: boolean;
}

interface PermissionConstraint {
  type: 'rate_limit' | 'time_window' | 'approval_required' | 'audit_required' | 'delegation' | 'custom';
  config: Record<string, any>;
  message?: string;
}

interface RoleConstraint {
  type: 'mutual_exclusion' | 'prerequisite' | 'cardinality' | 'separation_of_duty' | 'custom';
  config: Record<string, any>;
  message: string;
}

interface RoleMetadata {
  classification: 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
  compliance: ComplianceInfo[];
  cost: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reviewRequired: boolean;
  reviewInterval: number; // days
  lastReview?: Date;
  nextReview?: Date;
  reviewer?: string;
}

interface ComplianceInfo {
  framework: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending';
  notes?: string;
}

interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  version: number;
  changes: AuditChange[];
  approvals: Approval[];
}

interface AuditChange {
  timestamp: Date;
  user: string;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
}

interface Approval {
  id: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  reason?: string;
  conditions?: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  roles: string[];
  permissions: Permission[];
  groups: string[];
  organizations: string[];
  departments: string[];
  teams: string[];
  profile: UserProfile;
  preferences: UserPreferences;
  session: SessionInfo;
  audit: UserAuditInfo;
  compliance: UserComplianceInfo;
  security: UserSecurityInfo;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  title: string;
  department: string;
  location: string;
  timezone: string;
  language: string;
  phone?: string;
  manager?: string;
  reports: string[];
  skills: string[];
  certifications: string[];
  clearanceLevel: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  privacy: PrivacyPreferences;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'digest' | 'weekly';
  types: string[];
}

interface DashboardPreferences {
  layout: string;
  widgets: string[];
  defaultView: string;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface PrivacyPreferences {
  profileVisibility: 'public' | 'internal' | 'private';
  activityTracking: boolean;
  dataSharing: boolean;
  analytics: boolean;
}

interface SessionInfo {
  id: string;
  ip: string;
  userAgent: string;
  location: string;
  device: string;
  startTime: Date;
  lastActivity: Date;
  duration: number;
  active: boolean;
}

interface UserAuditInfo {
  loginHistory: LoginRecord[];
  activityHistory: ActivityRecord[];
  permissionHistory: PermissionHistoryRecord[];
  accessViolations: AccessViolation[];
}

interface LoginRecord {
  timestamp: Date;
  ip: string;
  userAgent: string;
  location: string;
  success: boolean;
  reason?: string;
}

interface ActivityRecord {
  timestamp: Date;
  action: string;
  resource: string;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'error';
}

interface PermissionHistoryRecord {
  timestamp: Date;
  action: 'granted' | 'revoked' | 'modified';
  permission: string;
  grantedBy: string;
  reason?: string;
}

interface AccessViolation {
  timestamp: Date;
  type: 'permission_denied' | 'rate_limit' | 'time_constraint' | 'location_constraint' | 'other';
  resource: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolution?: string;
}

interface UserComplianceInfo {
  status: 'compliant' | 'non_compliant' | 'pending';
  certifications: CertificationInfo[];
  training: TrainingInfo[];
  policies: PolicyAcknowledgment[];
  reviews: ComplianceReview[];
}

interface CertificationInfo {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expired' | 'revoked';
}

interface TrainingInfo {
  name: string;
  completedDate: Date;
  score?: number;
  status: 'completed' | 'in_progress' | 'not_started';
}

interface PolicyAcknowledgment {
  policyId: string;
  version: string;
  acknowledgedDate: Date;
  acknowledgedBy: string;
}

interface ComplianceReview {
  id: string;
  reviewer: string;
  date: Date;
  status: 'pass' | 'fail' | 'pending';
  findings: string[];
  actions: string[];
}

interface UserSecurityInfo {
  mfaEnabled: boolean;
  mfaMethods: string[];
  passwordLastChanged: Date;
  accountLocked: boolean;
  lockReason?: string;
  riskScore: number;
  securityEvents: SecurityEvent[];
}

interface SecurityEvent {
  timestamp: Date;
  type: 'login_failure' | 'suspicious_activity' | 'privilege_escalation' | 'data_access' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  resolved: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'functional' | 'organizational' | 'project' | 'custom';
  parent?: string;
  children: string[];
  members: string[];
  roles: string[];
  permissions: Permission[];
  metadata: GroupMetadata;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface GroupMetadata {
  purpose: string;
  owner: string;
  contact: string;
  cost: number;
  budget: number;
  approval: ApprovalWorkflow;
}

interface ApprovalWorkflow {
  required: boolean;
  approvers: string[];
  steps: ApprovalStep[];
}

interface ApprovalStep {
  id: string;
  name: string;
  approvers: string[];
  required: boolean;
  timeout: number;
}

const RoleBasedAccessControlManagement: React.FC = () => {
  const theme = useTheme();
  
  // Enhanced business logic integration
  const {
    businessLogic,
    realTimeData,
    notifications,
    addNotification,
    removeNotification,
    isFullyLoaded,
    hasErrors,
    refresh
  } = useServicePage('admin');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // RBAC Management States
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // Selected Items
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Dialog States
  const [roleDetailOpen, setRoleDetailOpen] = useState(false);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [permissionMatrixOpen, setPermissionMatrixOpen] = useState(false);
  
  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState<string>('all');
  const [roleStatusFilter, setRoleStatusFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [groupTypeFilter, setGroupTypeFilter] = useState<string>('all');
  
  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'hierarchy'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'priority' | 'level'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Analytics States
  const [rbacMetrics, setRbacMetrics] = useState<any>({});
  const [accessPatterns, setAccessPatterns] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [roleUsageData, setRoleUsageData] = useState<any[]>([]);

  // Initialize UI/UX Evaluation
  useEffect(() => {
    const evaluationController = addUIUXEvaluation('rbac-permissions-management', {
      continuous: true,
      position: 'top-right',
      minimized: true,
      interval: 210000
    });

    return () => evaluationController.remove();
  }, []);

  // Load data
  useEffect(() => {
    loadRoles();
    loadUsers();
    loadGroups();
    loadPermissions();
    loadAnalytics();
  }, []);

  // Business logic operations
  const handleCreateRole = async (roleData: any) => {
    try {
      await businessLogic.execute('create-role', roleData, 'medium');
      addNotification('success', 'Role created successfully');
      await loadRoles();
    } catch (error) {
      addNotification('error', 'Failed to create role');
    }
  };

  const handleAssignPermissions = async (roleId: string, permissions: string[]) => {
    try {
      await businessLogic.execute('assign-permissions', { roleId, permissions }, 'medium');
      addNotification('success', 'Permissions assigned successfully');
      await loadRoles();
    } catch (error) {
      addNotification('error', 'Failed to assign permissions');
    }
  };

  const handleRevokeAccess = async (userId: string, resource: string) => {
    try {
      await businessLogic.execute('revoke-access', { userId, resource }, 'high');
      addNotification('warning', 'Access revoked successfully');
    } catch (error) {
      addNotification('error', 'Failed to revoke access');
    }
  };

  const handleRefreshRBAC = async () => {
    try {
      await refresh();
      await Promise.all([loadRoles(), loadUsers(), loadGroups(), loadPermissions()]);
      addNotification('success', 'RBAC data refreshed');
    } catch (error) {
      addNotification('error', 'Failed to refresh RBAC data');
    }
  };

  const loadRoles = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRoles: Role[] = generateMockRoles();
      setRoles(mockRoles);
      
    } catch (err) {
      setError('Failed to load roles');
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const mockUsers: User[] = generateMockUsers();
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const mockGroups: Group[] = generateMockGroups();
      setGroups(mockGroups);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadPermissions = async () => {
    try {
      const mockPermissions: Permission[] = generateMockPermissions();
      setPermissions(mockPermissions);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const metrics = generateRbacMetrics();
      setRbacMetrics(metrics);
      
      const patterns = generateAccessPatterns();
      setAccessPatterns(patterns);
      
      const compliance = generateComplianceData();
      setComplianceData(compliance);
      
      const events = generateSecurityEvents();
      setSecurityEvents(events);
      
      const usage = generateRoleUsageData();
      setRoleUsageData(usage);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  // Generate mock data
  const generateMockRoles = useCallback((): Role[] => {
    const categories: Role['category'][] = ['admin', 'analyst', 'operator', 'viewer', 'custom'];
    const types: Role['type'][] = ['system', 'custom', 'inherited'];
    const statuses: Role['status'][] = ['active', 'inactive', 'deprecated', 'pending'];
    
    return Array.from({ length: 25 }, (_, index) => ({
      id: `role-${index + 1}`,
      name: `Role ${index + 1}`,
      description: `Role description ${index + 1}`,
      type: types[index % types.length],
      category: categories[index % categories.length],
      level: Math.floor(index / 5) + 1,
      parentRoles: index > 0 && Math.random() > 0.7 ? [`role-${index}`] : [],
      childRoles: [],
      permissions: generateMockPermissions().slice(0, Math.floor(Math.random() * 10) + 5),
      users: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => `user-${i + 1}`),
      groups: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => `group-${i + 1}`),
      organizations: [`org-${index % 3 + 1}`],
      constraints: [],
      metadata: {
        classification: ['public', 'internal', 'confidential', 'secret'][index % 4] as any,
        compliance: [],
        cost: Math.floor(Math.random() * 1000) + 100,
        riskLevel: ['low', 'medium', 'high', 'critical'][index % 4] as any,
        reviewRequired: Math.random() > 0.5,
        reviewInterval: Math.floor(Math.random() * 365) + 30,
        lastReview: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
        nextReview: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
      },
      audit: {
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        createdBy: `user-${Math.floor(Math.random() * 5) + 1}`,
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedBy: `user-${Math.floor(Math.random() * 5) + 1}`,
        version: Math.floor(Math.random() * 10) + 1,
        changes: [],
        approvals: []
      },
      status: statuses[index % statuses.length],
      enabled: Math.random() > 0.1,
      priority: Math.floor(Math.random() * 10) + 1,
      tags: [`tag-${index % 5 + 1}`],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdBy: `user-${Math.floor(Math.random() * 5) + 1}`,
      updatedBy: `user-${Math.floor(Math.random() * 5) + 1}`
    }));
  }, []);

  const generateMockUsers = useCallback((): User[] => {
    const statuses: User['status'][] = ['active', 'inactive', 'suspended', 'pending'];
    
    return Array.from({ length: 50 }, (_, index) => ({
      id: `user-${index + 1}`,
      username: `user${index + 1}`,
      email: `user${index + 1}@company.com`,
      firstName: `First${index + 1}`,
      lastName: `Last${index + 1}`,
      displayName: `User ${index + 1}`,
      avatar: undefined,
      status: statuses[index % statuses.length],
      roles: [`role-${(index % 5) + 1}`, `role-${(index % 3) + 6}`],
      permissions: [],
      groups: [`group-${(index % 3) + 1}`],
      organizations: [`org-${(index % 3) + 1}`],
      departments: [`dept-${(index % 4) + 1}`],
      teams: [`team-${(index % 2) + 1}`],
      profile: {
        title: `Title ${index + 1}`,
        department: `Department ${(index % 4) + 1}`,
        location: `Office ${(index % 3) + 1}`,
        timezone: 'UTC',
        language: 'en',
        phone: undefined,
        manager: index > 0 ? `user-${Math.floor(index / 5) + 1}` : undefined,
        reports: [],
        skills: [`skill-${index % 5 + 1}`],
        certifications: [],
        clearanceLevel: ['public', 'confidential', 'secret'][index % 3]
      },
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          push: true,
          inApp: true,
          frequency: 'immediate',
          types: ['security', 'system']
        },
        dashboard: {
          layout: 'default',
          widgets: [],
          defaultView: 'overview',
          autoRefresh: true,
          refreshInterval: 300
        },
        privacy: {
          profileVisibility: 'internal',
          activityTracking: true,
          dataSharing: false,
          analytics: true
        }
      },
      session: {
        id: `session-${index + 1}`,
        ip: `192.168.1.${(index % 254) + 1}`,
        userAgent: 'Mozilla/5.0',
        location: `Location ${index + 1}`,
        device: 'Desktop',
        startTime: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 8 * 60 * 60 * 1000),
        active: Math.random() > 0.2
      },
      audit: {
        loginHistory: [],
        activityHistory: [],
        permissionHistory: [],
        accessViolations: []
      },
      compliance: {
        status: ['compliant', 'non_compliant', 'pending'][index % 3] as any,
        certifications: [],
        training: [],
        policies: [],
        reviews: []
      },
      security: {
        mfaEnabled: Math.random() > 0.3,
        mfaMethods: ['totp', 'sms'],
        passwordLastChanged: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        accountLocked: Math.random() < 0.05,
        lockReason: undefined,
        riskScore: Math.floor(Math.random() * 100),
        securityEvents: []
      },
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }));
  }, []);

  const generateMockGroups = useCallback((): Group[] => {
    const types: Group['type'][] = ['security', 'functional', 'organizational', 'project', 'custom'];
    const statuses: Group['status'][] = ['active', 'inactive', 'archived'];
    
    return Array.from({ length: 20 }, (_, index) => ({
      id: `group-${index + 1}`,
      name: `Group ${index + 1}`,
      description: `Group description ${index + 1}`,
      type: types[index % types.length],
      parent: index > 5 && Math.random() > 0.7 ? `group-${Math.floor(index / 2)}` : undefined,
      children: [],
      members: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => `user-${i + 1}`),
      roles: [`role-${(index % 3) + 1}`],
      permissions: [],
      metadata: {
        purpose: `Purpose ${index + 1}`,
        owner: `user-${(index % 10) + 1}`,
        contact: `contact${index + 1}@company.com`,
        cost: Math.floor(Math.random() * 5000) + 500,
        budget: Math.floor(Math.random() * 10000) + 1000,
        approval: {
          required: Math.random() > 0.5,
          approvers: [`user-${(index % 5) + 1}`],
          steps: []
        }
      },
      status: statuses[index % statuses.length],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      createdBy: `user-${(index % 5) + 1}`,
      updatedBy: `user-${(index % 5) + 1}`
    }));
  }, []);

  const generateMockPermissions = useCallback((): Permission[] => {
    const resources = ['users', 'roles', 'permissions', 'incidents', 'threats', 'reports', 'settings', 'audit'];
    const actions = ['create', 'read', 'update', 'delete', 'execute', 'approve', 'export', 'import'];
    const effects: Permission['effect'][] = ['allow', 'deny'];
    
    return Array.from({ length: 40 }, (_, index) => ({
      id: `permission-${index + 1}`,
      name: `${actions[index % actions.length]}_${resources[index % resources.length]}`,
      description: `Permission to ${actions[index % actions.length]} ${resources[index % resources.length]}`,
      resource: resources[index % resources.length],
      action: actions[index % actions.length],
      scope: {
        type: ['global', 'organization', 'department', 'team'][index % 4] as any,
        targets: [`target-${index % 5 + 1}`],
        exclusions: [],
        inheritance: 'down'
      },
      conditions: [],
      effect: effects[index % effects.length],
      priority: Math.floor(Math.random() * 100),
      inherited: Math.random() > 0.6,
      source: Math.random() > 0.6 ? `role-${(index % 5) + 1}` : undefined,
      constraints: [],
      metadata: {},
      enabled: Math.random() > 0.1,
      temporary: Math.random() < 0.1,
      expiresAt: Math.random() < 0.1 ? new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
      grantedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      grantedBy: `user-${(index % 10) + 1}`
    }));
  }, []);

  const generateRbacMetrics = () => ({
    totalRoles: 25,
    activeRoles: 22,
    totalUsers: 50,
    activeUsers: 47,
    totalGroups: 20,
    activeGroups: 18,
    totalPermissions: 40,
    activePermissions: 38,
    complianceRate: 0.92,
    securityScore: 85,
    accessViolations: 12,
    pendingApprovals: 5
  });

  const generateAccessPatterns = () => {
    return Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      logins: Math.floor(Math.random() * 100) + 50,
      permissionChanges: Math.floor(Math.random() * 20) + 5,
      violations: Math.floor(Math.random() * 10),
      approvals: Math.floor(Math.random() * 15) + 2
    }));
  };

  const generateComplianceData = () => {
    return [
      { framework: 'SOX', compliant: 95, nonCompliant: 5 },
      { framework: 'PCI-DSS', compliant: 88, nonCompliant: 12 },
      { framework: 'GDPR', compliant: 92, nonCompliant: 8 },
      { framework: 'HIPAA', compliant: 90, nonCompliant: 10 },
      { framework: 'ISO 27001', compliant: 87, nonCompliant: 13 }
    ];
  };

  const generateSecurityEvents = () => {
    return Array.from({ length: 7 }, (_, index) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      loginFailures: Math.floor(Math.random() * 50) + 10,
      suspiciousActivity: Math.floor(Math.random() * 20) + 5,
      privilegeEscalation: Math.floor(Math.random() * 10) + 1,
      dataAccess: Math.floor(Math.random() * 100) + 50
    }));
  };

  const generateRoleUsageData = () => {
    return [
      { role: 'Admin', users: 5, permissions: 40, usage: 95 },
      { role: 'Senior Analyst', users: 8, permissions: 25, usage: 85 },
      { role: 'Analyst', users: 15, permissions: 18, usage: 78 },
      { role: 'Junior Analyst', users: 12, permissions: 12, usage: 65 },
      { role: 'Viewer', users: 10, permissions: 5, usage: 45 }
    ];
  };

  // Filter and sort roles
  const filteredRoles = useMemo(() => {
    let filtered = roles.filter(role => {
      const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = roleTypeFilter === 'all' || role.type === roleTypeFilter;
      const matchesStatus = roleStatusFilter === 'all' || role.status === roleStatusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort roles
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [roles, searchTerm, roleTypeFilter, roleStatusFilter, sortBy, sortOrder]);

  // Render role status chip
  const renderRoleStatusChip = (status: Role['status']) => {
    const colors = {
      active: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      inactive: { color: theme.palette.grey[600], bg: alpha(theme.palette.grey[500], 0.1) },
      deprecated: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
      pending: { color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1) }
    };

    return (
      <Chip
        size="small"
        label={status.toUpperCase()}
        sx={{
          color: colors[status].color,
          backgroundColor: colors[status].bg
        }}
      />
    );
  };

  // Render role category chip
  const renderRoleCategoryChip = (category: Role['category']) => {
    const colors = {
      admin: { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1) },
      analyst: { color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1) },
      operator: { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1) },
      viewer: { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1) },
      custom: { color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1) }
    };

    return (
      <Chip
        size="small"
        label={category.toUpperCase()}
        sx={{
          color: colors[category].color,
          backgroundColor: colors[category].bg
        }}
      />
    );
  };

  // Render roles grid
  const renderRolesGrid = () => (
    <Grid container spacing={2}>
      {filteredRoles.map((role) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={role.id}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4]
              }
            }}
            onClick={() => {
              setSelectedRole(role);
              setRoleDetailOpen(true);
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Security />
                </Avatar>
              }
              title={
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {role.name}
                </Typography>
              }
              subheader={`Level ${role.level} • ${role.type}`}
              action={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {renderRoleStatusChip(role.status)}
                </Box>
              }
            />
            
            <CardContent sx={{ pt: 0 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }} noWrap>
                {role.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                {renderRoleCategoryChip(role.category)}
                <Chip 
                  size="small" 
                  label={`${role.permissions.length} permissions`} 
                  variant="outlined" 
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {role.users.length} users
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Risk: {role.metadata.riskLevel}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Created: {role.createdAt.toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  ${role.metadata.cost}/year
                </Typography>
              </Box>
            </CardContent>
            
            <CardActions>
              <Button size="small" startIcon={<Edit />}>
                Edit
              </Button>
              <Button size="small" startIcon={<Assignment />}>
                Permissions
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Total Roles</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {rbacMetrics.totalRoles}
            </Typography>
            <Typography variant="body2" color="success.main">
              {rbacMetrics.activeRoles} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6">Total Users</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {rbacMetrics.totalUsers}
            </Typography>
            <Typography variant="body2" color="success.main">
              {rbacMetrics.activeUsers} active
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assessment sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="h6">Compliance Rate</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {Math.round(rbacMetrics.complianceRate * 100)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Shield sx={{ mr: 1, color: theme.palette.success.main }} />
              <Typography variant="h6">Security Score</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {rbacMetrics.securityScore}/100
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Access Patterns Chart */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Access Patterns (24 Hours)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={accessPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="logins" fill={theme.palette.primary.main} name="Logins" />
              <Line yAxisId="right" type="monotone" dataKey="violations" stroke={theme.palette.error.main} name="Violations" />
            </ComposedChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Role Usage */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Role Usage
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={roleUsageData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="role" type="category" width={100} />
              <RechartsTooltip />
              <Bar dataKey="usage" fill={theme.palette.primary.main} name="Usage %" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Compliance Overview */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Compliance Framework Status
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Framework</TableCell>
                  <TableCell align="right">Compliant</TableCell>
                  <TableCell align="right">Non-Compliant</TableCell>
                  <TableCell align="right">Compliance Rate</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complianceData.map((item) => {
                  const total = item.compliant + item.nonCompliant;
                  const rate = (item.compliant / total) * 100;
                  
                  return (
                    <TableRow key={item.framework}>
                      <TableCell component="th" scope="row">
                        {item.framework}
                      </TableCell>
                      <TableCell align="right">{item.compliant}</TableCell>
                      <TableCell align="right">{item.nonCompliant}</TableCell>
                      <TableCell align="right">{rate.toFixed(1)}%</TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={rate >= 90 ? 'Compliant' : 'Review Required'}
                          color={rate >= 90 ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  // Main render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Role-Based Access Control & Permissions Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Enterprise-grade RBAC system for threat intelligence platform
        </Typography>
      </Box>

      {/* Header Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search roles, users, groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role Type</InputLabel>
              <Select
                value={roleTypeFilter}
                onChange={(e) => setRoleTypeFilter(e.target.value)}
                label="Role Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="system">System</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="inherited">Inherited</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={roleStatusFilter}
                onChange={(e) => setRoleStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="deprecated">Deprecated</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridView />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="hierarchy">
                <AccountTree />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => setPermissionMatrixOpen(true)}
            >
              Permission Matrix
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateRoleOpen(true)}
            >
              Create Role
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Roles" />
          <Tab label="Users" />
          <Tab label="Groups" />
          <Tab label="Permissions" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          {activeTab === 0 && (
            <>
              {viewMode === 'grid' && renderRolesGrid()}
              {viewMode === 'list' && (
                <Typography variant="h6">List View - Coming Soon</Typography>
              )}
              {viewMode === 'hierarchy' && (
                <Typography variant="h6">Hierarchy View - Coming Soon</Typography>
              )}
            </>
          )}
          {activeTab === 1 && (
            <Typography variant="h6">User Management - Coming Soon</Typography>
          )}
          {activeTab === 2 && (
            <Typography variant="h6">Group Management - Coming Soon</Typography>
          )}
          {activeTab === 3 && (
            <Typography variant="h6">Permission Management - Coming Soon</Typography>
          )}
          {activeTab === 4 && renderAnalyticsDashboard()}
        </Box>
      )}

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Security />}
          tooltipTitle="Create Role"
          onClick={() => setCreateRoleOpen(true)}
        />
        <SpeedDialAction
          icon={<Person />}
          tooltipTitle="Add User"
          onClick={() => setCreateUserOpen(true)}
        />
        <SpeedDialAction
          icon={<Group />}
          tooltipTitle="Create Group"
          onClick={() => setCreateGroupOpen(true)}
        />
        <SpeedDialAction
          icon={<Assignment />}
          tooltipTitle="Permission Matrix"
          onClick={() => setPermissionMatrixOpen(true)}
        />
      </SpeedDial>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Container>
  );
};

export default RoleBasedAccessControlManagement;
