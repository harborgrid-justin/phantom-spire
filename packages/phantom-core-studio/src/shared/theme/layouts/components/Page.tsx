/**
 * CONTENT LAYOUT COMPONENTS
 * 
 * Core content layout components for structuring page content
 */

'use client';

import React, { forwardRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider,
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  Skeleton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { BaseLayoutProps, LayoutProps, SpacingValue } from '../types';

// Component interfaces
export interface PageProps extends LayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  maxWidth?: string | number;
  padding?: SpacingValue;
  loading?: boolean;
}

export interface SectionProps extends LayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  divider?: boolean;
  spacing?: SpacingValue;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface CardProps extends LayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  error?: string;
  elevation?: number;
  variant?: 'elevation' | 'outlined';
  interactive?: boolean;
  onClick?: () => void;
}

export interface PanelProps extends LayoutProps {
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  headerActions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
}

export interface SplitProps extends LayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string | number;
  rightWidth?: string | number;
  direction?: 'horizontal' | 'vertical';
  resizable?: boolean;
  gap?: SpacingValue;
  minLeftSize?: string | number;
  minRightSize?: string | number;
}

// Styled Components
const PageRoot = styled(Box)<{ maxWidth?: string | number; padding?: number }>(
  ({ theme, maxWidth, padding = 24 }) => ({
    maxWidth: maxWidth || 'none',
    margin: '0 auto',
    padding: theme.spacing(padding / 8),
    width: '100%',
  })
);

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const PageTitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SectionRoot = styled(Box)<{ spacing?: number }>(({ theme, spacing = 16 }) => ({
  '& + &': {
    marginTop: theme.spacing(spacing / 8),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  gap: theme.spacing(2),
}));

const CardRoot = styled(MuiCard)<{ interactive?: boolean }>(
  ({ theme, interactive }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ...(interactive && {
      cursor: 'pointer',
      transition: theme.transitions.create(['box-shadow', 'transform'], {
        duration: theme.transitions.duration.short,
      }),
      '&:hover': {
        boxShadow: theme.shadows[8],
        transform: 'translateY(-2px)',
      },
    }),
  })
);

const CardContentGrow = styled(CardContent)({
  flexGrow: 1,
});

const PanelRoot = styled(Paper)<{ variant?: 'default' | 'outlined' | 'filled' }>(
  ({ theme, variant = 'default' }) => ({
    ...(variant === 'outlined' && {
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
    }),
    ...(variant === 'filled' && {
      backgroundColor: theme.palette.grey[50],
    }),
  })
);

const PanelHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const SplitRoot = styled(Box)<{ 
  direction?: 'horizontal' | 'vertical';
  gap?: number;
}>(({ theme, direction = 'horizontal', gap = 16 }) => ({
  display: 'flex',
  flexDirection: direction === 'horizontal' ? 'row' : 'column',
  gap: theme.spacing(gap / 8),
  height: '100%',
  width: '100%',
}));

const SplitPane = styled(Box)<{ 
  width?: string | number;
  minSize?: string | number;
}>(({ width, minSize }) => ({
  flex: width ? `0 0 ${typeof width === 'number' ? `${width}px` : width}` : 1,
  minWidth: minSize || 0,
  minHeight: minSize || 0,
  overflow: 'hidden',
}));

// Page Component
export const Page = forwardRef<HTMLDivElement, PageProps>(({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
  maxWidth,
  padding = 24,
  loading = false,
  className,
  ...props
}, ref) => {
  if (loading) {
    return (
      <PageRoot ref={ref} maxWidth={maxWidth} padding={padding} className={className} {...props}>
        <PageHeader>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="text" width="60%" height={24} />
        </PageHeader>
        <Skeleton variant="rectangular" height={400} />
      </PageRoot>
    );
  }

  return (
    <PageRoot ref={ref} maxWidth={maxWidth} padding={padding} className={className} {...props}>
      {(title || subtitle || actions || breadcrumbs) && (
        <PageHeader>
          {breadcrumbs}
          <PageTitleRow>
            <Box>
              {title && (
                <Typography variant="h4" component="h1" gutterBottom>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="subtitle1" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box sx={{ flexShrink: 0 }}>
                {actions}
              </Box>
            )}
          </PageTitleRow>
        </PageHeader>
      )}
      {children}
    </PageRoot>
  );
});

// Section Component
export const Section = forwardRef<HTMLDivElement, SectionProps>(({
  children,
  title,
  subtitle,
  actions,
  divider = false,
  spacing = 16,
  className,
  ...props
}, ref) => {
  return (
    <>
      <SectionRoot ref={ref} spacing={spacing} className={className} {...props}>
        {(title || subtitle || actions) && (
          <SectionHeader>
            <Box>
              {title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box>
                {actions}
              </Box>
            )}
          </SectionHeader>
        )}
        {children}
      </SectionRoot>
      {divider && <Divider sx={{ my: 3 }} />}
    </>
  );
});

// Card Component
export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  title,
  subtitle,
  actions,
  header,
  footer,
  loading = false,
  error,
  elevation = 1,
  variant = 'elevation',
  interactive = false,
  onClick,
  className,
  ...props
}, ref) => {
  if (loading) {
    return (
      <CardRoot ref={ref} elevation={elevation} variant={variant} className={className}>
        <CardHeader
          title={<Skeleton width="60%" />}
          subheader={<Skeleton width="40%" />}
          action={<Skeleton variant="circular" width={24} height={24} />}
        />
        <CardContentGrow>
          <Skeleton variant="rectangular" height={200} />
        </CardContentGrow>
      </CardRoot>
    );
  }

  return (
    <CardRoot
      ref={ref}
      elevation={elevation}
      variant={variant}
      interactive={interactive}
      onClick={onClick}
      className={className}
      {...props}
    >
      {header || title || subtitle || actions ? (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={
            actions || (
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            )
          }
        />
      ) : null}
      
      <CardContentGrow>
        {error ? (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        ) : (
          children
        )}
      </CardContentGrow>

      {footer && (
        <CardActions>
          {footer}
        </CardActions>
      )}
    </CardRoot>
  );
});

// Panel Component
export const Panel = forwardRef<HTMLDivElement, PanelProps>(({
  children,
  title,
  collapsible = false,
  defaultExpanded = true,
  onToggle,
  headerActions,
  variant = 'default',
  className,
  ...props
}, ref) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <PanelRoot ref={ref} variant={variant} className={className} {...props}>
      {title && (
        <PanelHeader>
          <Typography variant="h6">
            {title}
          </Typography>
          <Box>
            {headerActions}
            {collapsible && (
              <IconButton onClick={handleToggle} size="small">
                {expanded ? <MoreVertIcon /> : <MoreVertIcon />}
              </IconButton>
            )}
          </Box>
        </PanelHeader>
      )}
      {expanded && (
        <PanelContent>
          {children}
        </PanelContent>
      )}
    </PanelRoot>
  );
});

// Split Component
export const Split = forwardRef<HTMLDivElement, SplitProps>(({
  left,
  right,
  leftWidth,
  rightWidth,
  direction = 'horizontal',
  gap = 16,
  minLeftSize = 200,
  minRightSize = 200,
  className,
  ...props
}, ref) => {
  return (
    <SplitRoot
      ref={ref}
      direction={direction}
      gap={gap}
      className={className}
      {...props}
    >
      <SplitPane width={leftWidth} minSize={minLeftSize}>
        {left}
      </SplitPane>
      <SplitPane width={rightWidth} minSize={minRightSize}>
        {right}
      </SplitPane>
    </SplitRoot>
  );
});

// Display names
Page.displayName = 'Page';
Section.displayName = 'Section';
Card.displayName = 'Card';
Panel.displayName = 'Panel';
Split.displayName = 'Split';

export default Page;