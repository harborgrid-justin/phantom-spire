/**
 * LAYOUT UTILITY COMPONENTS
 * 
 * Utility components for common layout patterns and helpers
 */

'use client';

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Divider as MuiDivider,
  Skeleton,
  CircularProgress,
  Fade,
  Slide,
  Grow,
  useMediaQuery,
} from '@mui/material';
import { BaseLayoutProps, LayoutProps, ResponsiveValue, SpacingValue } from '../types';

// Component interfaces
export interface CenterProps extends LayoutProps {
  axis?: 'both' | 'horizontal' | 'vertical';
  minHeight?: string | number;
}

export interface SpacerProps extends BaseLayoutProps {
  size?: SpacingValue;
  direction?: 'horizontal' | 'vertical';
}

export interface DividerProps extends BaseLayoutProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'fullWidth' | 'inset' | 'middle';
  spacing?: SpacingValue;
  label?: React.ReactNode;
}

export interface MasonryProps extends LayoutProps {
  columns?: ResponsiveValue<number>;
  spacing?: SpacingValue;
  items: React.ReactNode[];
}

export interface StickyProps extends LayoutProps {
  top?: number | string;
  bottom?: number | string;
  zIndex?: number;
  disabled?: boolean;
}

export interface ScrollAreaProps extends LayoutProps {
  maxHeight?: string | number;
  showScrollbars?: boolean;
  hideScrollbars?: boolean;
  thumbColor?: string;
  trackColor?: string;
}

export interface ShowHideProps extends BaseLayoutProps {
  when: boolean;
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  above?: boolean;
  fallback?: React.ReactNode;
}

export interface MotionWrapperProps extends BaseLayoutProps {
  type?: 'fade' | 'slide' | 'grow' | 'scale';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  in?: boolean;
  unmountOnExit?: boolean;
}

export interface LoadingStateProps extends BaseLayoutProps {
  loading: boolean;
  skeleton?: 'text' | 'rectangular' | 'circular' | 'custom';
  skeletonProps?: any;
  spinner?: boolean;
  children: React.ReactNode;
}

// Styled Components
const CenterRoot = styled(Box)<{ 
  axis?: 'both' | 'horizontal' | 'vertical';
  minHeight?: string | number;
}>(({ axis = 'both', minHeight }) => {
  const styles: any = {};

  if (axis === 'both' || axis === 'horizontal') {
    styles.display = 'flex';
    styles.justifyContent = 'center';
  }
  
  if (axis === 'both' || axis === 'vertical') {
    styles.display = 'flex';
    styles.alignItems = 'center';
  }

  if (axis === 'both') {
    styles.display = 'flex';
    styles.justifyContent = 'center';
    styles.alignItems = 'center';
  }

  if (minHeight) {
    styles.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
  }

  return styles;
});

const SpacerRoot = styled(Box)<{ 
  size?: number; 
  direction?: 'horizontal' | 'vertical';
}>(({ theme, size = 16, direction = 'vertical' }) => ({
  ...(direction === 'horizontal' ? {
    width: theme.spacing(size / 8),
    height: 1,
    display: 'inline-block',
  } : {
    height: theme.spacing(size / 8),
    width: '100%',
  }),
}));

const DividerRoot = styled(Box)<{ spacing?: number }>(({ theme, spacing = 16 }) => ({
  '& .MuiDivider-root': {
    margin: theme.spacing(spacing / 8, 0),
  },
}));

const MasonryRoot = styled(Box)<{ columns?: number; spacing?: number }>(
  ({ theme, columns = 3, spacing = 16 }) => ({
    columns: columns,
    columnGap: theme.spacing(spacing / 8),
    '& > *': {
      breakInside: 'avoid',
      marginBottom: theme.spacing(spacing / 8),
    },
  })
);

const StickyRoot = styled(Box)<{ 
  top?: number | string; 
  bottom?: number | string;
  zIndex?: number;
  disabled?: boolean;
}>(({ top, bottom, zIndex = 1, disabled }) => ({
  ...(disabled ? {} : {
    position: 'sticky',
    ...(top !== undefined && { top: typeof top === 'number' ? `${top}px` : top }),
    ...(bottom !== undefined && { bottom: typeof bottom === 'number' ? `${bottom}px` : bottom }),
    zIndex,
  }),
}));

const ScrollAreaRoot = styled(Box)<{
  maxHeight?: string | number;
  showScrollbars?: boolean;
  hideScrollbars?: boolean;
  thumbColor?: string;
  trackColor?: string;
}>(({ theme, maxHeight, showScrollbars = true, hideScrollbars = false, thumbColor, trackColor }) => ({
  overflow: 'auto',
  ...(maxHeight && {
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
  }),
  ...(hideScrollbars && {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  ...(!hideScrollbars && showScrollbars && {
    '&::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: trackColor || theme.palette.grey[200],
      borderRadius: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: thumbColor || theme.palette.grey[400],
      borderRadius: 4,
      '&:hover': {
        backgroundColor: thumbColor || theme.palette.grey[600],
      },
    },
  }),
}));

// Center Component
export const Center = forwardRef<HTMLDivElement, CenterProps>(({
  children,
  axis = 'both',
  minHeight,
  className,
  ...props
}, ref) => {
  return (
    <CenterRoot
      ref={ref}
      axis={axis}
      minHeight={minHeight}
      className={className}
      {...props}
    >
      {children}
    </CenterRoot>
  );
});

// Spacer Component
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(({
  size = 16,
  direction = 'vertical',
  className,
  ...props
}, ref) => {
  const theme = useTheme();
  const spacingValue = typeof size === 'number' ? size : theme.spacing(2);

  return (
    <SpacerRoot
      ref={ref}
      size={spacingValue}
      direction={direction}
      className={className}
      {...props}
    />
  );
});

// Divider Component
export const Divider = forwardRef<HTMLDivElement, DividerProps>(({
  orientation = 'horizontal',
  variant = 'fullWidth',
  spacing = 16,
  label,
  className,
  ...props
}, ref) => {
  return (
    <DividerRoot ref={ref} spacing={spacing} className={className} {...props}>
      <MuiDivider orientation={orientation} variant={variant}>
        {label}
      </MuiDivider>
    </DividerRoot>
  );
});

// Masonry Component
export const Masonry = forwardRef<HTMLDivElement, MasonryProps>(({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 16,
  items,
  className,
  ...props
}, ref) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  
  const getColumns = () => {
    if (typeof columns === 'number') return columns;
    
    if (isXs && columns.xs) return columns.xs;
    if (isSm && columns.sm) return columns.sm;
    if (isMd && columns.md) return columns.md;
    return columns.lg || 4;
  };

  return (
    <MasonryRoot
      ref={ref}
      columns={getColumns()}
      spacing={spacing}
      className={className}
      {...props}
    >
      {items || children}
    </MasonryRoot>
  );
});

// Sticky Component
export const Sticky = forwardRef<HTMLDivElement, StickyProps>(({
  children,
  top = 0,
  bottom,
  zIndex = 1,
  disabled = false,
  className,
  ...props
}, ref) => {
  return (
    <StickyRoot
      ref={ref}
      top={top}
      bottom={bottom}
      zIndex={zIndex}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </StickyRoot>
  );
});

// ScrollArea Component
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(({
  children,
  maxHeight,
  showScrollbars = true,
  hideScrollbars = false,
  thumbColor,
  trackColor,
  className,
  ...props
}, ref) => {
  return (
    <ScrollAreaRoot
      ref={ref}
      maxHeight={maxHeight}
      showScrollbars={showScrollbars}
      hideScrollbars={hideScrollbars}
      thumbColor={thumbColor}
      trackColor={trackColor}
      className={className}
      {...props}
    >
      {children}
    </ScrollAreaRoot>
  );
});

// Show/Hide Components
export const Show: React.FC<ShowHideProps> = ({
  children,
  when,
  breakpoint,
  above = false,
  fallback,
}) => {
  const theme = useTheme();
  const isVisible = breakpoint 
    ? useMediaQuery(above ? theme.breakpoints.up(breakpoint) : theme.breakpoints.down(breakpoint))
    : when;

  return isVisible ? <>{children}</> : <>{fallback}</>;
};

export const Hide: React.FC<ShowHideProps> = ({
  children,
  when,
  breakpoint,
  above = false,
  fallback,
}) => {
  const theme = useTheme();
  const isHidden = breakpoint 
    ? useMediaQuery(above ? theme.breakpoints.up(breakpoint) : theme.breakpoints.down(breakpoint))
    : when;

  return !isHidden ? <>{children}</> : <>{fallback}</>;
};

// Motion Wrapper Component
export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  in: inProp = true,
  unmountOnExit = false,
  className,
  ...props
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(inProp), delay);
    return () => clearTimeout(timer);
  }, [inProp, delay]);

  const getTransitionProps = () => ({
    in: show,
    timeout: duration,
    unmountOnExit,
    className,
    ...props,
  });

  switch (type) {
    case 'slide':
      return (
        <Slide direction={direction as any} {...getTransitionProps()}>
          <Box>{children}</Box>
        </Slide>
      );
    case 'grow':
      return (
        <Grow {...getTransitionProps()}>
          <Box>{children}</Box>
        </Grow>
      );
    case 'fade':
    default:
      return (
        <Fade {...getTransitionProps()}>
          <Box>{children}</Box>
        </Fade>
      );
  }
};

// Loading State Component
export const LoadingState: React.FC<LoadingStateProps> = ({
  children,
  loading,
  skeleton = 'rectangular',
  skeletonProps = {},
  spinner = false,
  className,
  ...props
}) => {
  if (!loading) return <>{children}</>;

  if (spinner) {
    return (
      <Center minHeight={200} className={className} {...props}>
        <CircularProgress />
      </Center>
    );
  }

  const getSkeletonComponent = () => {
    const defaultProps = {
      height: skeleton === 'text' ? 24 : 200,
      width: '100%',
      ...skeletonProps,
    };

    switch (skeleton) {
      case 'text':
        return <Skeleton variant="text" {...defaultProps} />;
      case 'circular':
        return <Skeleton variant="circular" {...defaultProps} />;
      case 'custom':
        return skeletonProps.component || <Skeleton {...defaultProps} />;
      case 'rectangular':
      default:
        return <Skeleton variant="rectangular" {...defaultProps} />;
    }
  };

  return (
    <Box className={className} {...props}>
      {getSkeletonComponent()}
    </Box>
  );
};

// Additional utility components
export const FullHeight = styled(Box)({
  height: '100vh',
});

export const FullWidth = styled(Box)({
  width: '100%',
});

export const AspectRatio = styled(Box)<{ ratio?: number }>(({ ratio = 16/9 }) => ({
  position: 'relative',
  width: '100%',
  paddingBottom: `${(1 / ratio) * 100}%`,
  '& > *': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
}));

export const Overlay = styled(Box)<{ opacity?: number; zIndex?: number }>(
  ({ theme, opacity = 0.5, zIndex = 1000 }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${opacity})`,
    zIndex,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })
);

// Display names
Center.displayName = 'Center';
Spacer.displayName = 'Spacer';
Divider.displayName = 'Divider';
Masonry.displayName = 'Masonry';
Sticky.displayName = 'Sticky';
ScrollArea.displayName = 'ScrollArea';
Show.displayName = 'Show';
Hide.displayName = 'Hide';
MotionWrapper.displayName = 'MotionWrapper';
LoadingState.displayName = 'LoadingState';

export default Center;