/**
 * BUSINESS COMPONENTS
 * 
 * Enterprise-specific business logic components for applications
 */

'use client';

import React, { forwardRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tooltip,
  Alert,
  AlertTitle,
} from '@mui/material';
import { 
  TrendingUp,
  TrendingDown,
  MoreVert as MoreVertIcon,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Error,
  Warning,
  Info,
  Schedule,
} from '@mui/icons-material';
import { BaseLayoutProps } from '../types';

// Business component interfaces
export interface MetricCardProps extends BaseLayoutProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string | number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

export interface KPIWidgetProps extends BaseLayoutProps {
  metrics: Array<{
    id: string;
    label: string;
    value: string | number;
    target?: string | number;
    progress?: number;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
  }>;
  title?: string;
  layout?: 'grid' | 'list';
}

export interface DataCardProps extends BaseLayoutProps {
  title: string;
  data: Record<string, any>;
  fields?: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'status' | 'chip' | 'avatar';
    formatter?: (value: any) => string;
  }>;
  actions?: React.ReactNode;
  status?: 'active' | 'inactive' | 'pending' | 'error';
  avatar?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export interface UserTableProps extends BaseLayoutProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    lastActive?: Date | string;
  }>;
  onUserClick?: (user: any) => void;
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
  showActions?: boolean;
  dense?: boolean;
}

export interface ProcessStepProps extends BaseLayoutProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'active' | 'pending' | 'error' | 'skipped';
    timestamp?: Date | string;
    assignee?: {
      name: string;
      avatar?: string;
    };
  }>;
  orientation?: 'horizontal' | 'vertical';
  interactive?: boolean;
  onStepClick?: (step: any) => void;
}

export interface TaskCardProps extends BaseLayoutProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee?: {
      name: string;
      avatar?: string;
    };
    dueDate?: Date | string;
    tags?: string[];
    progress?: number;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export interface StatisticDisplayProps extends BaseLayoutProps {
  statistics: Array<{
    id: string;
    label: string;
    value: string | number;
    change?: string | number;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
    color?: string;
  }>;
  columns?: 1 | 2 | 3 | 4;
  showChanges?: boolean;
}

// Styled components
const MetricCardRoot = styled(Card)<{ color?: string }>(({ theme, color = 'primary' }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${theme.palette[color as keyof typeof theme.palette].light}, ${theme.palette[color as keyof typeof theme.palette].main})`,
  color: theme.palette[color as keyof typeof theme.palette].contrastText,
}));

const TrendIndicator = styled(Box)<{ trend?: 'up' | 'down' | 'stable' }>(
  ({ theme, trend }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: trend === 'up' 
      ? theme.palette.success.main 
      : trend === 'down' 
        ? theme.palette.error.main 
        : theme.palette.text.secondary,
  })
);

const StatusChip = styled(Chip)<{ status?: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return theme.palette.success;
      case 'inactive': return theme.palette.error;
      case 'pending': return theme.palette.warning;
      case 'completed': return theme.palette.success;
      case 'in-progress': return theme.palette.info;
      case 'error': return theme.palette.error;
      default: return theme.palette.grey;
    }
  };

  const statusColor = getStatusColor();
  
  return {
    backgroundColor: statusColor.light,
    color: statusColor.dark,
    fontWeight: 600,
  };
});

const PriorityChip = styled(Chip)<{ priority?: string }>(({ theme, priority }) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent': return theme.palette.error;
      case 'high': return theme.palette.warning;
      case 'medium': return theme.palette.info;
      case 'low': return theme.palette.success;
      default: return theme.palette.grey;
    }
  };

  const priorityColor = getPriorityColor();
  
  return {
    backgroundColor: priorityColor.light,
    color: priorityColor.dark,
    fontWeight: 600,
    fontSize: '0.75rem',
  };
});

// MetricCard Component
export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'primary',
  icon,
  actions,
  loading = false,
  className,
  ...props
}, ref) => {
  return (
    <MetricCardRoot ref={ref} color={color} className={className} {...props}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          </Box>
          {actions}
        </Box>
        
        <Typography variant="h3" component="div" gutterBottom>
          {loading ? '...' : value}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {subtitle && (
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
          
          {trend && trendValue && (
            <TrendIndicator trend={trend}>
              {trend === 'up' ? <TrendingUp fontSize="small" /> : 
               trend === 'down' ? <TrendingDown fontSize="small" /> : null}
              <Typography variant="body2">
                {trendValue}
              </Typography>
            </TrendIndicator>
          )}
        </Box>
      </CardContent>
    </MetricCardRoot>
  );
});

// KPIWidget Component
export const KPIWidget = forwardRef<HTMLDivElement, KPIWidgetProps>(({
  metrics,
  title,
  layout = 'grid',
  className,
  ...props
}, ref) => {
  return (
    <Card ref={ref} className={className} {...props}>
      {title && (
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </CardContent>
      )}
      <CardContent>
        <Box 
          display={layout === 'grid' ? 'grid' : 'flex'}
          flexDirection={layout === 'list' ? 'column' : undefined}
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
          gap={2}
        >
          {metrics.map((metric) => (
            <Box key={metric.id} p={2} border="1px solid" borderColor="divider" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {metric.label}
              </Typography>
              <Typography variant="h5" component="div" gutterBottom>
                {metric.value}
              </Typography>
              {metric.target && (
                <Typography variant="caption" color="text.secondary">
                  Target: {metric.target}
                </Typography>
              )}
              {metric.progress !== undefined && (
                <LinearProgress 
                  variant="determinate" 
                  value={metric.progress} 
                  sx={{ mt: 1 }}
                  color={metric.color as any || 'primary'}
                />
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

// DataCard Component
export const DataCard = forwardRef<HTMLDivElement, DataCardProps>(({
  title,
  data,
  fields,
  actions,
  status,
  avatar,
  onEdit,
  onDelete,
  onView,
  className,
  ...props
}, ref) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderFieldValue = (field: any, value: any) => {
    switch (field.type) {
      case 'status':
        return <StatusChip label={value} status={value} size="small" />;
      case 'chip':
        return <Chip label={value} size="small" />;
      case 'avatar':
        return <Avatar src={value} sx={{ width: 24, height: 24 }} />;
      case 'date':
        return new Date(value).toLocaleDateString();
      default:
        return field.formatter ? field.formatter(value) : value;
    }
  };

  return (
    <Card ref={ref} className={className} {...props}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            {avatar && <Avatar src={avatar} />}
            <Box>
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
              {status && <StatusChip label={status} status={status} size="small" />}
            </Box>
          </Box>
          
          <Box>
            {actions}
            {(onEdit || onDelete || onView) && (
              <>
                <IconButton onClick={handleMenuClick} size="small">
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {onView && (
                    <MenuItem onClick={() => { onView(); handleMenuClose(); }}>
                      <Visibility fontSize="small" sx={{ mr: 1 }} />
                      View
                    </MenuItem>
                  )}
                  {onEdit && (
                    <MenuItem onClick={() => { onEdit(); handleMenuClose(); }}>
                      <Edit fontSize="small" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem onClick={() => { onDelete(); handleMenuClose(); }}>
                      <Delete fontSize="small" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>
        </Box>

        {fields && (
          <Box>
            {fields.map((field, index) => (
              <Box key={field.key} display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {field.label}:
                </Typography>
                <Typography variant="body2">
                  {renderFieldValue(field, data[field.key])}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

// UserTable Component
export const UserTable = forwardRef<HTMLDivElement, UserTableProps>(({
  users,
  onUserClick,
  onEdit,
  onDelete,
  showActions = true,
  dense = false,
  className,
  ...props
}, ref) => {
  return (
    <TableContainer component={Paper} ref={ref} className={className} {...props}>
      <Table size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Active</TableCell>
            {showActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id} 
              hover 
              onClick={() => onUserClick?.(user)}
              sx={{ cursor: onUserClick ? 'pointer' : 'default' }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                    {user.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={user.role} size="small" />
              </TableCell>
              <TableCell>
                <StatusChip label={user.status} status={user.status} size="small" />
              </TableCell>
              <TableCell>
                {user.lastActive && (
                  <Typography variant="caption">
                    {new Date(user.lastActive).toLocaleDateString()}
                  </Typography>
                )}
              </TableCell>
              {showActions && (
                <TableCell align="right">
                  <IconButton onClick={(e) => { e.stopPropagation(); onEdit?.(user); }} size="small">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); onDelete?.(user); }} size="small">
                    <Delete />
                  </IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

// TaskCard Component
export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({
  task,
  onClick,
  onEdit,
  onDelete,
  compact = false,
  className,
  ...props
}, ref) => {
  return (
    <Card 
      ref={ref} 
      className={className}
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 2 } : undefined,
      }}
      onClick={onClick}
      {...props}
    >
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant={compact ? "body1" : "h6"} component="h3" gutterBottom>
              {task.title}
            </Typography>
            {!compact && task.description && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {task.description}
              </Typography>
            )}
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            <StatusChip label={task.status} status={task.status} size="small" />
            <PriorityChip label={task.priority} priority={task.priority} size="small" />
          </Box>
        </Box>

        {task.assignee && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar 
              src={task.assignee.avatar} 
              sx={{ width: compact ? 20 : 24, height: compact ? 20 : 24 }}
            >
              {task.assignee.name[0]}
            </Avatar>
            <Typography variant="caption">
              {task.assignee.name}
            </Typography>
          </Box>
        )}

        {task.progress !== undefined && (
          <LinearProgress 
            variant="determinate" 
            value={task.progress} 
            sx={{ mb: 1 }}
          />
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1}>
            {task.tags?.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
          
          {task.dueDate && (
            <Typography variant="caption" color="text.secondary">
              <Schedule fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

// StatisticDisplay Component
export const StatisticDisplay = forwardRef<HTMLDivElement, StatisticDisplayProps>(({
  statistics,
  columns = 4,
  showChanges = true,
  className,
  ...props
}, ref) => {
  return (
    <Box 
      ref={ref}
      display="grid"
      gridTemplateColumns={`repeat(${columns}, 1fr)`}
      gap={2}
      className={className}
      {...props}
    >
      {statistics.map((stat) => (
        <Card key={stat.id}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              {stat.icon && (
                <Box sx={{ color: stat.color || 'primary.main' }}>
                  {stat.icon}
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
            
            <Typography variant="h4" component="div" gutterBottom>
              {stat.value}
            </Typography>
            
            {showChanges && stat.change && (
              <TrendIndicator trend={stat.changeType}>
                {stat.changeType === 'positive' ? <TrendingUp fontSize="small" /> : 
                 stat.changeType === 'negative' ? <TrendingDown fontSize="small" /> : null}
                <Typography variant="caption">
                  {stat.change}
                </Typography>
              </TrendIndicator>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

// Display names
MetricCard.displayName = 'MetricCard';
KPIWidget.displayName = 'KPIWidget';
DataCard.displayName = 'DataCard';
UserTable.displayName = 'UserTable';
TaskCard.displayName = 'TaskCard';
StatisticDisplay.displayName = 'StatisticDisplay';

export default MetricCard;