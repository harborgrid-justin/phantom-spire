/**
 * WIDGET COMPONENT
 * 
 * Core widget component for enterprise dashboards with advanced features
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Collapse,
  CircularProgress,
  Alert,
  Typography,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import type { WidgetProps } from '../types';

const StyledWidget = styled(Card, {
  shouldForwardProp: (prop) => !['resizable', 'draggable', 'isFullscreen'].includes(prop as string),
})<{
  resizable?: boolean;
  draggable?: boolean;
  isFullscreen?: boolean;
}>(({ theme, resizable, draggable, isFullscreen }) => ({
  position: 'relative',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  
  ...(draggable && {
    cursor: 'move',
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  }),
  
  ...(resizable && {
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 16,
      height: 16,
      background: `linear-gradient(-45deg, transparent 30%, ${theme.palette.divider} 30%, ${theme.palette.divider} 70%, transparent 70%)`,
      cursor: 'nw-resize',
      opacity: 0,
      transition: theme.transitions.create('opacity'),
    },
    '&:hover::after': {
      opacity: 1,
    },
  }),
  
  ...(isFullscreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modal,
    borderRadius: 0,
    maxWidth: 'none',
    maxHeight: 'none',
  }),
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  '& .MuiCardHeader-title': {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  '& .MuiCardHeader-action': {
    margin: 0,
    alignSelf: 'flex-start',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flex: 1,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
  overflow: 'auto',
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  borderRadius: theme.shape.borderRadius,
}));

export const Widget: React.FC<WidgetProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions = [],
  loading = false,
  error = null,
  minHeight = 200,
  maxHeight,
  resizable = false,
  draggable = false,
  collapsible = false,
  removable = false,
  fullscreenable = false,
  refreshable = false,
  exportable = false,
  colSpan,
  rowSpan,
  onResize,
  onRemove,
  onRefresh,
  onExport,
  onFullscreen,
  className,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
    handleMenuClose();
  }, []);

  const handleFullscreen = useCallback(() => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    onFullscreen?.(newFullscreen);
    handleMenuClose();
  }, [isFullscreen, onFullscreen]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
    handleMenuClose();
  }, [onRefresh]);

  const handleExport = useCallback((format: string) => {
    onExport?.(format);
    handleMenuClose();
  }, [onExport]);

  const handleRemove = useCallback(() => {
    onRemove?.();
    handleMenuClose();
  }, [onRemove]);

  // Create action menu items
  const menuItems = [
    ...(refreshable ? [{
      key: 'refresh',
      label: 'Refresh',
      icon: <RefreshIcon fontSize="small" />,
      onClick: handleRefresh,
    }] : []),
    ...(collapsible ? [{
      key: 'collapse',
      label: collapsed ? 'Expand' : 'Collapse',
      icon: collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />,
      onClick: handleCollapse,
    }] : []),
    ...(fullscreenable ? [{
      key: 'fullscreen',
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      icon: isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />,
      onClick: handleFullscreen,
    }] : []),
    ...(exportable ? [{
      key: 'export',
      label: 'Export',
      icon: <ExportIcon fontSize="small" />,
      submenu: [
        { key: 'png', label: 'PNG Image', onClick: () => handleExport('png') },
        { key: 'jpg', label: 'JPEG Image', onClick: () => handleExport('jpg') },
        { key: 'pdf', label: 'PDF Document', onClick: () => handleExport('pdf') },
        { key: 'csv', label: 'CSV Data', onClick: () => handleExport('csv') },
      ],
    }] : []),
    ...(removable ? [{
      key: 'remove',
      label: 'Remove',
      icon: <CloseIcon fontSize="small" />,
      onClick: handleRemove,
      danger: true,
    }] : []),
  ];

  const hasMenu = menuItems.length > 0 || actions.length > 0;

  return (
    <StyledWidget
      ref={widgetRef}
      resizable={resizable}
      draggable={draggable}
      isFullscreen={isFullscreen}
      className={className}
      sx={{
        minHeight,
        ...(maxHeight && { maxHeight }),
        ...(colSpan && {
          gridColumn: typeof colSpan === 'object' 
            ? Object.entries(colSpan).reduce((acc, [bp, span]) => ({
              ...acc,
              [theme.breakpoints.up(bp as any)]: { gridColumn: `span ${span}` }
            }), {})
            : `span ${colSpan}`
        }),
        ...(rowSpan && {
          gridRow: typeof rowSpan === 'object'
            ? Object.entries(rowSpan).reduce((acc, [bp, span]) => ({
              ...acc,
              [theme.breakpoints.up(bp as any)]: { gridRow: `span ${span}` }
            }), {})
            : `span ${rowSpan}`
        }),
        ...sx,
      }}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || hasMenu) && (
        <StyledCardHeader
          avatar={icon}
          title={title}
          subheader={subtitle}
          action={
            hasMenu && (
              <>
                {actions.map((action, index) => (
                  <React.Fragment key={index}>{action}</React.Fragment>
                ))}
                {menuItems.length > 0 && (
                  <Tooltip title="Widget options">
                    <IconButton
                      size="small"
                      onClick={handleMenuOpen}
                      aria-label="widget options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )
          }
        />
      )}

      {/* Content */}
      <Collapse in={!collapsed} timeout="auto">
        <StyledCardContent>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            children
          )}
        </StyledCardContent>
      </Collapse>

      {/* Loading overlay */}
      {loading && (
        <LoadingOverlay>
          <CircularProgress size={40} />
        </LoadingOverlay>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            onClick={item.onClick}
            {...(item.danger && { sx: { color: 'error.main' } })}
          >
            {item.icon && <Box sx={{ mr: 1, display: 'flex' }}>{item.icon}</Box>}
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </StyledWidget>
  );
};

// Additional widget variants
export const StatWidget: React.FC<WidgetProps & {
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'percentage' | 'absolute';
}> = ({ value, unit, change, changeType = 'percentage', children, ...props }) => {
  const theme = useTheme();
  
  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    const suffix = changeType === 'percentage' ? '%' : '';
    return `${prefix}${change}${suffix}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  return (
    <Widget {...props}>
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
          {unit && (
            <Typography component="span" variant="h5" sx={{ ml: 1, color: 'text.secondary' }}>
              {unit}
            </Typography>
          )}
        </Typography>
        
        {change !== undefined && (
          <Typography
            variant="body2"
            sx={{
              color: getChangeColor(change),
              fontWeight: 500,
            }}
          >
            {formatChange(change)} from last period
          </Typography>
        )}
        
        {children}
      </Box>
    </Widget>
  );
};

export const ChartWidget: React.FC<WidgetProps> = ({ children, ...props }) => {
  return (
    <Widget
      {...props}
      sx={{
        '& .MuiCardContent-root': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          '& > *': {
            flex: 1,
            minHeight: 0,
          },
        },
        ...props.sx,
      }}
    >
      {children}
    </Widget>
  );
};

export const TableWidget: React.FC<WidgetProps> = ({ children, ...props }) => {
  return (
    <Widget
      {...props}
      sx={{
        '& .MuiCardContent-root': {
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
        ...props.sx,
      }}
    >
      {children}
    </Widget>
  );
};

Widget.displayName = 'Widget';
StatWidget.displayName = 'StatWidget';
ChartWidget.displayName = 'ChartWidget';
TableWidget.displayName = 'TableWidget';

export default Widget;
