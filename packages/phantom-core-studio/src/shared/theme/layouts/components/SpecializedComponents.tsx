/**
 * SPECIALIZED UTILITY COMPONENTS
 * 
 * Additional utility components for specific use cases
 */

'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  Badge,
  LinearProgress,
  CircularProgress,
  Rating,
  ButtonGroup,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Settings,
  ContentCopy,
  Check,
  Error,
  Warning,
  Info,
  Close,
  ExpandMore,
  ChevronRight,
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeOff,
} from '@mui/icons-material';
import { BaseLayoutProps } from '../types';

// Specialized component interfaces
export interface ImageViewerProps extends BaseLayoutProps {
  src: string;
  alt?: string;
  maxWidth?: string | number;
  maxHeight?: string | number;
  zoomable?: boolean;
  fullscreenEnabled?: boolean;
  showControls?: boolean;
  loading?: boolean;
  error?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export interface CodeBlockProps extends BaseLayoutProps {
  code: string;
  language?: string;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
  copyable?: boolean;
  maxHeight?: string | number;
  fontSize?: 'small' | 'medium' | 'large';
  wrapLines?: boolean;
}

export interface MediaPlayerProps extends BaseLayoutProps {
  src: string;
  type: 'audio' | 'video';
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string; // for video
  width?: string | number;
  height?: string | number;
}

export interface ToastProps {
  id: string;
  message: React.ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: React.ReactNode;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface ToastManagerProps extends BaseLayoutProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
  maxToasts?: number;
}

export interface RatingDisplayProps extends BaseLayoutProps {
  value: number;
  max?: number;
  precision?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  icon?: React.ReactNode;
  emptyIcon?: React.ReactNode;
}

export interface ProgressRingProps extends BaseLayoutProps {
  value: number;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  animated?: boolean;
}

export interface TreeViewProps extends BaseLayoutProps {
  nodes: Array<{
    id: string;
    label: string;
    children?: any[];
    icon?: React.ReactNode;
    expandedIcon?: React.ReactNode;
    disabled?: boolean;
    metadata?: any;
  }>;
  expanded?: string[];
  selected?: string[];
  multiSelect?: boolean;
  onNodeToggle?: (nodeIds: string[]) => void;
  onNodeSelect?: (nodeIds: string[]) => void;
  onNodeClick?: (node: any) => void;
}

export interface VirtualScrollProps extends BaseLayoutProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
  loading?: boolean;
  onLoadMore?: () => void;
}

export interface SplitterProps extends BaseLayoutProps {
  direction: 'horizontal' | 'vertical';
  sizes: number[];
  minSizes?: number[];
  maxSizes?: number[];
  onSizeChange?: (sizes: number[]) => void;
  disabled?: boolean;
  split?: boolean;
}

// Styled Components
const ImageViewerRoot = styled(Box)<{ zoomable?: boolean }>(({ zoomable }) => ({
  position: 'relative',
  display: 'inline-block',
  ...(zoomable && {
    cursor: 'zoom-in',
  }),
}));

const ImageControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.5),
}));

const CodeBlockRoot = styled(Box)<{ theme?: 'light' | 'dark' }>(({ theme: muiTheme, theme: codeTheme = 'light' }) => ({
  position: 'relative',
  backgroundColor: codeTheme === 'dark' ? muiTheme.palette.grey[900] : muiTheme.palette.grey[100],
  border: `1px solid ${muiTheme.palette.divider}`,
  borderRadius: muiTheme.shape.borderRadius,
  overflow: 'hidden',
}));

const CodeContent = styled('pre')<{ fontSize?: string }>(({ theme, fontSize = 'medium' }) => {
  const fontSizes = {
    small: '0.75rem',
    medium: '0.875rem',
    large: '1rem',
  };

  return {
    margin: 0,
    padding: theme.spacing(2),
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
    fontSize: fontSizes[fontSize as keyof typeof fontSizes],
    lineHeight: 1.5,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  };
});

const ProgressRingRoot = styled(Box)<{ size?: number }>(({ size = 40 }) => ({
  position: 'relative',
  display: 'inline-flex',
  width: size,
  height: size,
}));

const ProgressRingLabel = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

const TreeNodeRoot = styled(Box)<{ level: number }>(({ theme, level }) => ({
  paddingLeft: theme.spacing(level * 2),
}));

const VirtualScrollRoot = styled(Box)<{ containerHeight: number }>(({ containerHeight }) => ({
  height: containerHeight,
  overflow: 'auto',
}));

// ImageViewer Component
export const ImageViewer = forwardRef<HTMLDivElement, ImageViewerProps>(({
  src,
  alt,
  maxWidth = '100%',
  maxHeight = '100%',
  zoomable = true,
  fullscreenEnabled = true,
  showControls = true,
  loading = false,
  error,
  onLoad,
  onError,
  className,
  ...props
}, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load image: {error}
      </Alert>
    );
  }

  return (
    <ImageViewerRoot ref={ref} zoomable={zoomable} className={className} {...props}>
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: isFullscreen ? '100vw' : maxWidth,
          maxHeight: isFullscreen ? '100vh' : maxHeight,
          transform: `scale(${zoom})`,
          transition: 'transform 0.2s ease-in-out',
        }}
        onLoad={onLoad}
        onError={onError}
      />
      
      {showControls && (
        <ImageControls>
          <IconButton size="small" onClick={handleZoomIn} sx={{ color: 'white' }}>
            <ZoomIn />
          </IconButton>
          <IconButton size="small" onClick={handleZoomOut} sx={{ color: 'white' }}>
            <ZoomOut />
          </IconButton>
          {fullscreenEnabled && (
            <IconButton size="small" onClick={handleFullscreen} sx={{ color: 'white' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          )}
        </ImageControls>
      )}
    </ImageViewerRoot>
  );
});

// CodeBlock Component
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(({
  code,
  language = 'javascript',
  theme = 'light',
  showLineNumbers = true,
  copyable = true,
  maxHeight = 400,
  fontSize = 'medium',
  wrapLines = false,
  className,
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code');
    }
  };

  return (
    <CodeBlockRoot ref={ref} theme={theme} className={className} {...props}>
      {copyable && (
        <Box position="absolute" top={8} right={8} zIndex={1}>
          <IconButton size="small" onClick={handleCopy}>
            {copied ? <Check /> : <ContentCopy />}
          </IconButton>
        </Box>
      )}
      
      <CodeContent
        fontSize={fontSize}
        style={{
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
        }}
      >
        {code}
      </CodeContent>
    </CodeBlockRoot>
  );
});

// ProgressRing Component
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(({
  value,
  size = 40,
  thickness = 4,
  color = 'primary',
  showLabel = true,
  animated = false,
  className,
  ...props
}, ref) => {
  return (
    <ProgressRingRoot ref={ref} size={size} className={className} {...props}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        color={color}
        sx={animated ? {
          animation: 'spin 2s linear infinite',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        } : undefined}
      />
      {showLabel && (
        <ProgressRingLabel>
          <Typography variant="caption" component="div" color="textSecondary">
            {`${Math.round(value)}%`}
          </Typography>
        </ProgressRingLabel>
      )}
    </ProgressRingRoot>
  );
});

// ToastManager Component
export const ToastManager = forwardRef<HTMLDivElement, ToastManagerProps>(({
  toasts,
  onRemove,
  maxToasts = 5,
  className,
  ...props
}, ref) => {
  const visibleToasts = toasts.slice(-maxToasts);

  const getAnchorOrigin = (position: string) => {
    const [vertical, horizontal] = position.split('-');
    return {
      vertical: vertical as 'top' | 'bottom',
      horizontal: horizontal as 'left' | 'center' | 'right',
    };
  };

  return (
    <Box ref={ref} className={className} {...props}>
      {visibleToasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || 6000}
          onClose={() => onRemove(toast.id)}
          anchorOrigin={getAnchorOrigin(toast.position || 'top-right')}
          sx={{
            position: 'relative',
            marginBottom: index * 60,
          }}
        >
          <Alert
            severity={toast.type}
            onClose={() => onRemove(toast.id)}
            action={toast.action}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
});

// VirtualScroll Component
export const VirtualScroll = forwardRef<HTMLDivElement, VirtualScrollProps>(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  loading = false,
  onLoadMore,
  className,
  ...props
}, ref) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);

    // Load more when near bottom
    if (
      onLoadMore &&
      scrollTop + containerHeight >= (items.length * itemHeight) - (itemHeight * 5)
    ) {
      onLoadMore();
    }
  };

  return (
    <VirtualScrollRoot
      ref={ref}
      containerHeight={containerHeight}
      onScroll={handleScroll}
      className={className}
      {...props}
    >
      <div
        style={{
          height: items.length * itemHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
      
      {loading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      )}
    </VirtualScrollRoot>
  );
});

// TreeView Component  
export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(({
  nodes,
  expanded = [],
  selected = [],
  multiSelect = false,
  onNodeToggle,
  onNodeSelect,
  onNodeClick,
  className,
  ...props
}, ref) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(expanded);
  const [selectedNodes, setSelectedNodes] = useState<string[]>(selected);

  const handleNodeToggle = (nodeId: string) => {
    const newExpanded = expandedNodes.includes(nodeId)
      ? expandedNodes.filter(id => id !== nodeId)
      : [...expandedNodes, nodeId];
    
    setExpandedNodes(newExpanded);
    onNodeToggle?.(newExpanded);
  };

  const handleNodeSelect = (nodeId: string) => {
    let newSelected: string[];
    
    if (multiSelect) {
      newSelected = selectedNodes.includes(nodeId)
        ? selectedNodes.filter(id => id !== nodeId)
        : [...selectedNodes, nodeId];
    } else {
      newSelected = [nodeId];
    }
    
    setSelectedNodes(newSelected);
    onNodeSelect?.(newSelected);
  };

  const renderNode = (node: any, level: number = 0) => {
    const isExpanded = expandedNodes.includes(node.id);
    const isSelected = selectedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Box key={node.id}>
        <TreeNodeRoot
          level={level}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 0.5,
            cursor: 'pointer',
            backgroundColor: isSelected ? 'action.selected' : 'transparent',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => {
            handleNodeSelect(node.id);
            onNodeClick?.(node);
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                handleNodeToggle(node.id);
              }
            }}
            sx={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            {hasChildren && (isExpanded ? <ExpandMore /> : <ChevronRight />)}
          </IconButton>
          
          {node.icon && (
            <Box mr={1}>
              {isExpanded && node.expandedIcon ? node.expandedIcon : node.icon}
            </Box>
          )}
          
          <Typography variant="body2">
            {node.label}
          </Typography>
        </TreeNodeRoot>
        
        {hasChildren && isExpanded && (
          <Box>
            {node.children.map((childNode: any) => renderNode(childNode, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box ref={ref} className={className} {...props}>
      {nodes.map(node => renderNode(node))}
    </Box>
  );
});

// Display names
ImageViewer.displayName = 'ImageViewer';
CodeBlock.displayName = 'CodeBlock';
ProgressRing.displayName = 'ProgressRing';
ToastManager.displayName = 'ToastManager';
VirtualScroll.displayName = 'VirtualScroll';
TreeView.displayName = 'TreeView';

export default ImageViewer;