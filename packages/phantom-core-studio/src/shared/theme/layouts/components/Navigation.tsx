/**
 * NAVIGATION COMPONENTS
 * 
 * Professional navigation components for enterprise applications
 */

'use client';

import React, { useState, useCallback } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  NavigateNext as NavigateNextIcon,
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import { BaseLayoutProps, SpacingValue } from '../types';

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface NavigationProps extends BaseLayoutProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  dense?: boolean;
  showIcons?: boolean;
  collapsible?: boolean;
  defaultExpanded?: string[];
}

export interface SidebarProps extends BaseLayoutProps {
  navigation: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  collapsed?: boolean;
  onToggle?: () => void;
  collapsible?: boolean;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

export interface TopBarProps extends BaseLayoutProps {
  title?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  notifications?: number;
  onMenuClick?: () => void;
  onNotificationsClick?: () => void;
  onUserClick?: () => void;
  height?: number;
  sticky?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbsProps extends BaseLayoutProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeIcon?: React.ReactNode;
  onHomeClick?: () => void;
}

// Styled Components
const NavigationRoot = styled(List)<{ dense?: boolean }>(({ theme, dense }) => ({
  width: '100%',
  padding: dense ? theme.spacing(0.5) : theme.spacing(1),
  '& .MuiListItemButton-root': {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0, 0.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '& .MuiListItemIcon-root': {
        color: 'inherit',
      },
    },
  },
}));

const SidebarRoot = styled(Box)<{ width?: number; collapsed?: boolean }>(
  ({ theme, width = 240, collapsed }) => ({
    width: collapsed ? 64 : width,
    height: '100%',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  })
);

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const TopBarRoot = styled(Box)<{ height?: number; sticky?: boolean }>(
  ({ theme, height = 64, sticky }) => ({
    height,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 3),
    ...(sticky && {
      position: 'sticky',
      top: 0,
      zIndex: theme.zIndex.appBar,
    }),
  })
);

const TopBarSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

// Navigation Component
export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  dense = false,
  showIcons = true,
  collapsible = true,
  defaultExpanded = [],
  className,
  ...props
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

  const handleToggle = useCallback((itemId: string) => {
    setExpanded(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  }, []);

  const renderItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.has(item.id);
    const isActive = activeItem === item.id;

    return (
      <React.Fragment key={item.id}>
        {item.divider && <Divider sx={{ my: 1 }} />}
        <ListItem disablePadding>
          <ListItemButton
            className={isActive ? 'active' : ''}
            disabled={item.disabled}
            onClick={() => {
              if (hasChildren && collapsible) {
                handleToggle(item.id);
              }
              if (item.onClick) {
                item.onClick();
              }
              if (onItemClick) {
                onItemClick(item);
              }
            }}
            sx={{
              pl: 2 + level * 2,
            }}
          >
            {showIcons && item.icon && (
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error" variant="dot">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                variant: dense ? 'body2' : 'body1',
                fontWeight: isActive ? 600 : 400,
              }}
            />
            {item.badge && !showIcons && (
              <Badge badgeContent={item.badge} color="primary" size="small" />
            )}
            {hasChildren && collapsible && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <NavigationRoot dense={dense} className={className} {...props}>
      {items.map(item => renderItem(item))}
    </NavigationRoot>
  );
};

// Sidebar Component
export const Sidebar: React.FC<SidebarProps> = ({
  navigation,
  header,
  footer,
  width = 240,
  collapsed = false,
  onToggle,
  collapsible = true,
  variant = 'permanent',
  className,
  ...props
}) => {
  return (
    <SidebarRoot width={width} collapsed={collapsed} className={className} {...props}>
      {header && (
        <SidebarHeader>
          {header}
          {collapsible && onToggle && (
            <IconButton onClick={onToggle} size="small">
              <MenuIcon />
            </IconButton>
          )}
        </SidebarHeader>
      )}
      
      <SidebarContent>
        {navigation}
      </SidebarContent>

      {footer && (
        <SidebarFooter>
          {footer}
        </SidebarFooter>
      )}
    </SidebarRoot>
  );
};

// TopBar Component
export const TopBar: React.FC<TopBarProps> = ({
  title,
  navigation,
  actions,
  user,
  notifications = 0,
  onMenuClick,
  onNotificationsClick,
  onUserClick,
  height = 64,
  sticky = true,
  className,
  ...props
}) => {
  return (
    <TopBarRoot height={height} sticky={sticky} className={className} {...props}>
      <TopBarSection sx={{ flex: 1 }}>
        {onMenuClick && (
          <IconButton onClick={onMenuClick} edge="start">
            <MenuIcon />
          </IconButton>
        )}
        {title && (
          <Typography variant="h6" component="div" noWrap>
            {title}
          </Typography>
        )}
        {navigation && (
          <Box sx={{ ml: 2 }}>
            {navigation}
          </Box>
        )}
      </TopBarSection>

      <TopBarSection>
        {actions}
        {onNotificationsClick && (
          <IconButton onClick={onNotificationsClick}>
            <Badge badgeContent={notifications} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        )}
        {user && (
          <Tooltip title={`${user.name} (${user.email})`}>
            <IconButton onClick={onUserClick}>
              {user.avatar ? (
                <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>
        )}
      </TopBarSection>
    </TopBarRoot>
  );
};

// Breadcrumbs Component
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <NavigateNextIcon fontSize="small" />,
  maxItems = 8,
  showHome = true,
  homeIcon,
  onHomeClick,
  className,
  ...props
}) => {
  const renderBreadcrumb = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    if (item.onClick || item.path) {
      return (
        <Link
          key={index}
          component="button"
          variant="body2"
          onClick={item.onClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: isLast ? 'text.primary' : 'text.secondary',
            fontWeight: isLast ? 600 : 400,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: !isLast ? 'underline' : 'none',
            },
          }}
        >
          {item.icon}
          {item.label}
        </Link>
      );
    }

    return (
      <Typography
        key={index}
        variant="body2"
        color={isLast ? 'text.primary' : 'text.secondary'}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: isLast ? 600 : 400,
        }}
      >
        {item.icon}
        {item.label}
      </Typography>
    );
  };

  const breadcrumbItems = showHome && onHomeClick
    ? [{ label: 'Home', icon: homeIcon, onClick: onHomeClick }, ...items]
    : items;

  return (
    <MuiBreadcrumbs
      separator={separator}
      maxItems={maxItems}
      className={className}
      {...props}
    >
      {breadcrumbItems.map((item, index) =>
        renderBreadcrumb(item, index, index === breadcrumbItems.length - 1)
      )}
    </MuiBreadcrumbs>
  );
};

// Display names
Navigation.displayName = 'Navigation';
Sidebar.displayName = 'Sidebar';
TopBar.displayName = 'TopBar';
Breadcrumbs.displayName = 'Breadcrumbs';

export default Navigation;