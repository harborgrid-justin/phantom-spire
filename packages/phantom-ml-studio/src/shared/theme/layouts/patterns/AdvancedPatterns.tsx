/**
 * ADVANCED LAYOUT PATTERNS
 * 
 * Complex layout patterns for specialized enterprise use cases
 */

'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { BaseLayoutProps } from '../types';

// Advanced pattern interfaces
export interface CommandPaletteProps extends BaseLayoutProps {
  open: boolean;
  onClose: () => void;
  commands: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    shortcut?: string;
    category?: string;
    onExecute: () => void;
  }>;
  placeholder?: string;
  maxHeight?: number;
}

export interface NotificationCenterProps extends BaseLayoutProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: Date | string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    avatar?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: (id: string) => void;
  maxHeight?: number;
  showUnreadOnly?: boolean;
}

export interface HelpSystemProps extends BaseLayoutProps {
  sections: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    searchTags?: string[];
  }>;
  searchable?: boolean;
  collapsible?: boolean;
  showToc?: boolean;
}

export interface QuickActionsProps extends BaseLayoutProps {
  actions: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    disabled?: boolean;
    tooltip?: string;
  }>;
  variant?: 'fab' | 'speed-dial' | 'toolbar' | 'grid';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface ActivityFeedProps extends BaseLayoutProps {
  activities: Array<{
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
    action: string;
    target?: string;
    timestamp: Date | string;
    details?: string;
    type: 'create' | 'update' | 'delete' | 'comment' | 'share' | 'system';
  }>;
  maxHeight?: number;
  showAvatars?: boolean;
  groupByDate?: boolean;
  onUserClick?: (user: any) => void;
}

export interface GalleryViewProps extends BaseLayoutProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    description?: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }>;
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
  spacing?: number;
  aspectRatio?: number;
  onItemClick?: (item: any) => void;
  onItemSelect?: (items: any[]) => void;
  selectable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
}

// Styled Components
const CommandPaletteRoot = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: 600,
  maxHeight: 400,
  zIndex: theme.zIndex.modal,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[16],
  overflow: 'hidden',
}));

const CommandSearch = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    '& fieldset': {
      border: 'none',
    },
  },
}));

const CommandList = styled(List)(({ theme }) => ({
  maxHeight: 320,
  overflow: 'auto',
  padding: 0,
}));

const NotificationCenterRoot = styled(Paper)(({ theme }) => ({
  width: 400,
  maxHeight: 500,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const NotificationList = styled(List)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: 0,
}));

const HelpSystemRoot = styled(Paper)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
}));

const HelpSidebar = styled(Box)(({ theme }) => ({
  width: 250,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: 'auto',
}));

const HelpContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflow: 'auto',
}));

const ActivityFeedRoot = styled(Box)<{ maxHeight?: number }>(({ theme, maxHeight }) => ({
  ...(maxHeight && {
    maxHeight,
    overflow: 'auto',
  }),
}));

const GalleryGrid = styled(Box)<{ columns?: any; spacing?: number }>(
  ({ theme, columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }, spacing = 2 }) => ({
    display: 'grid',
    gap: theme.spacing(spacing),
    gridTemplateColumns: `repeat(${columns.xs}, 1fr)`,
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: `repeat(${columns.sm}, 1fr)`,
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: `repeat(${columns.md}, 1fr)`,
    },
    [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: `repeat(${columns.lg}, 1fr)`,
    },
    [theme.breakpoints.up('xl')]: {
      gridTemplateColumns: `repeat(${columns.xl}, 1fr)`,
    },
  })
);

// CommandPalette Component
export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(({
  open,
  onClose,
  commands,
  placeholder = "Type a command...",
  maxHeight = 400,
  className,
  ...props
}, ref) => {
  const [search, setSearch] = useState('');

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExecute = (command: any) => {
    command.onExecute();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1300,
        }}
        onClick={onClose}
      />
      <CommandPaletteRoot ref={ref} className={className} {...props}>
        <CommandSearch
          fullWidth
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
        <CommandList style={{ maxHeight: maxHeight - 64 }}>
          {filteredCommands.map((command) => (
            <ListItem
              key={command.id}
              button
              onClick={() => handleExecute(command)}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={2} width="100%">
                {command.icon}
                <Box flex={1}>
                  <Typography variant="body1">
                    {command.label}
                  </Typography>
                  {command.description && (
                    <Typography variant="caption" color="text.secondary">
                      {command.description}
                    </Typography>
                  )}
                </Box>
                {command.shortcut && (
                  <Chip label={command.shortcut} size="small" variant="outlined" />
                )}
              </Box>
            </ListItem>
          ))}
        </CommandList>
      </CommandPaletteRoot>
    </>
  );
});

// NotificationCenter Component
export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(({
  notifications,
  onMarkAsRead,
  onMarkAllRead,
  onClear,
  maxHeight = 500,
  showUnreadOnly = false,
  className,
  ...props
}, ref) => {
  const filteredNotifications = showUnreadOnly
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <NotificationCenterRoot ref={ref} className={className} {...props}>
      <NotificationHeader>
        <Typography variant="h6">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Typography>
        <Box>
          <Button size="small" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        </Box>
      </NotificationHeader>
      
      <NotificationList style={{ maxHeight: maxHeight - 80 }}>
        {filteredNotifications.map((notification) => (
          <ListItem
            key={notification.id}
            alignItems="flex-start"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: notification.read ? 'transparent' : 'action.hover',
            }}
          >
            <Box display="flex" width="100%" gap={2}>
              <Badge
                color={getTypeColor(notification.type) as any}
                variant="dot"
                invisible={notification.read}
              >
                <Avatar src={notification.avatar} sx={{ width: 32, height: 32 }}>
                  <NotificationsIcon />
                </Avatar>
              </Badge>
              
              <Box flex={1}>
                <Typography variant="subtitle2" gutterBottom>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
                
                {notification.action && (
                  <Box mt={1}>
                    <Button size="small" onClick={notification.action.onClick}>
                      {notification.action.label}
                    </Button>
                  </Box>
                )}
              </Box>
              
              <IconButton
                size="small"
                onClick={() => onClear(notification.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </NotificationList>
    </NotificationCenterRoot>
  );
});

// HelpSystem Component
export const HelpSystem = forwardRef<HTMLDivElement, HelpSystemProps>(({
  sections,
  searchable = true,
  collapsible = true,
  showToc = true,
  className,
  ...props
}, ref) => {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState(sections[0]?.id);

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(search.toLowerCase()) ||
    section.searchTags?.some(tag => 
      tag.toLowerCase().includes(search.toLowerCase())
    )
  );

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <HelpSystemRoot ref={ref} className={className} {...props}>
      {showToc && (
        <HelpSidebar>
          {searchable && (
            <Box p={2} borderBottom="1px solid" borderColor="divider">
              <TextField
                size="small"
                fullWidth
                placeholder="Search help..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
          
          <List dense>
            {filteredSections.map((section) => (
              <ListItem
                key={section.id}
                button
                selected={section.id === activeSection}
                onClick={() => setActiveSection(section.id)}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {section.icon}
                  <ListItemText primary={section.title} />
                </Box>
              </ListItem>
            ))}
          </List>
        </HelpSidebar>
      )}
      
      <HelpContent>
        {currentSection && (
          <>
            <Typography variant="h4" gutterBottom>
              {currentSection.title}
            </Typography>
            {currentSection.content}
          </>
        )}
      </HelpContent>
    </HelpSystemRoot>
  );
});

// QuickActions Component
export const QuickActions = forwardRef<HTMLDivElement, QuickActionsProps>(({
  actions,
  variant = 'speed-dial',
  position = 'bottom-right',
  className,
  ...props
}, ref) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return { bottom: 16, right: 16 };
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      default:
        return { bottom: 16, right: 16 };
    }
  };

  if (variant === 'speed-dial') {
    return (
      <SpeedDial
        ref={ref}
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', ...getPositionStyles() }}
        icon={<SpeedDialIcon />}
        className={className}
        {...props}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.id}
            icon={action.icon}
            tooltipTitle={action.tooltip || action.label}
            onClick={action.onClick}
            FabProps={{
              disabled: action.disabled,
              color: action.color,
            }}
          />
        ))}
      </SpeedDial>
    );
  }

  if (variant === 'grid') {
    return (
      <Box
        ref={ref}
        display="grid"
        gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))"
        gap={2}
        className={className}
        {...props}
      >
        {actions.map((action) => (
          <Card key={action.id}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <IconButton
                color={action.color}
                disabled={action.disabled}
                onClick={action.onClick}
                size="large"
              >
                {action.icon}
              </IconButton>
              <Typography variant="body2" mt={1}>
                {action.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Toolbar variant
  return (
    <Box
      ref={ref}
      display="flex"
      gap={1}
      className={className}
      {...props}
    >
      {actions.map((action) => (
        <Tooltip key={action.id} title={action.tooltip || action.label}>
          <IconButton
            color={action.color}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.icon}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
});

// ActivityFeed Component
export const ActivityFeed = forwardRef<HTMLDivElement, ActivityFeedProps>(({
  activities,
  maxHeight = 400,
  showAvatars = true,
  groupByDate = false,
  onUserClick,
  className,
  ...props
}, ref) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <AddIcon color="success" />;
      case 'update': return <EditIcon color="info" />;
      case 'delete': return <DeleteIcon color="error" />;
      case 'share': return <ShareIcon color="primary" />;
      default: return <PersonIcon />;
    }
  };

  return (
    <ActivityFeedRoot ref={ref} maxHeight={maxHeight} className={className} {...props}>
      <List>
        {activities.map((activity, index) => (
          <ListItem key={activity.id} alignItems="flex-start">
            <Box display="flex" width="100%" gap={2}>
              {showAvatars && (
                <Avatar 
                  src={activity.user.avatar}
                  sx={{ width: 32, height: 32, cursor: onUserClick ? 'pointer' : 'default' }}
                  onClick={() => onUserClick?.(activity.user)}
                >
                  {activity.user.name[0]}
                </Avatar>
              )}
              
              <Box flex={1}>
                <Typography variant="body2" gutterBottom>
                  <strong>{activity.user.name}</strong> {activity.action}
                  {activity.target && (
                    <> <em>{activity.target}</em></>
                  )}
                </Typography>
                
                {activity.details && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {activity.details}
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.timestamp).toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                {getActivityIcon(activity.type)}
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </ActivityFeedRoot>
  );
});

// GalleryView Component
export const GalleryView = forwardRef<HTMLDivElement, GalleryViewProps>(({
  items,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  spacing = 2,
  aspectRatio = 16 / 9,
  onItemClick,
  onItemSelect,
  selectable = false,
  searchable = false,
  filterable = false,
  className,
  ...props
}, ref) => {
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleItemClick = (item: any) => {
    if (selectable) {
      const newSelection = selectedItems.includes(item.id)
        ? selectedItems.filter(id => id !== item.id)
        : [...selectedItems, item.id];
      setSelectedItems(newSelection);
      onItemSelect?.(items.filter(i => newSelection.includes(i.id)));
    } else {
      onItemClick?.(item);
    }
  };

  return (
    <Box ref={ref} className={className} {...props}>
      {searchable && (
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      <GalleryGrid columns={columns} spacing={spacing}>
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              ...(selectedItems.includes(item.id) && {
                boxShadow: 8,
                borderColor: 'primary.main',
                borderWidth: 2,
              }),
            }}
            onClick={() => handleItemClick(item)}
          >
            {item.image && (
              <Box
                sx={{
                  paddingTop: `${(1 / aspectRatio) * 100}%`,
                  position: 'relative',
                  backgroundImage: `url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              
              {item.subtitle && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.subtitle}
                </Typography>
              )}
              
              {item.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description}
                </Typography>
              )}
              
              {item.tags && (
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {item.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </GalleryGrid>
    </Box>
  );
});

// Display names
CommandPalette.displayName = 'CommandPalette';
NotificationCenter.displayName = 'NotificationCenter';
HelpSystem.displayName = 'HelpSystem';
QuickActions.displayName = 'QuickActions';
ActivityFeed.displayName = 'ActivityFeed';
GalleryView.displayName = 'GalleryView';

export default CommandPalette;