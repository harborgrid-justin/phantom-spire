/**
 * CONTAINER COMPONENT
 * 
 * Responsive container component with max-width constraints and centering
 */

'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { ContainerProps } from '../types';
import { containerSizes } from '../constants/breakpoints';
import { layouts } from '../constants/layouts';

const StyledContainer = styled(Box)<ContainerProps>(({ theme, size = 'lg', centerContent, fluid }) => {
  const getMaxWidth = () => {
    if (fluid) return '100%';
    if (typeof size === 'object') {
      // Handle responsive size
      return Object.entries(size).reduce((acc, [breakpoint, value]) => {
        if (value && breakpoint in theme.breakpoints.values) {
          acc[theme.breakpoints.up(breakpoint as any)] = {
            maxWidth: containerSizes[value as keyof typeof containerSizes],
          };
        }
        return acc;
      }, {} as any);
    }
    return containerSizes[size as keyof typeof containerSizes];
  };

  return {
    width: '100%',
    maxWidth: getMaxWidth(),
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    
    ...(centerContent && {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    
    // Responsive padding
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    
    [theme.breakpoints.up('lg')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  };
});

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  centerContent = false,
  fluid = false,
  className,
  ...props
}) => {
  return (
    <StyledContainer
      size={size}
      centerContent={centerContent}
      fluid={fluid}
      {...(className && { className })}
      {...props}
    >
      {children}
    </StyledContainer>
  );
};

Container.displayName = 'Container';

export default Container;

// Export additional container variants
export const FluidContainer: React.FC<Omit<ContainerProps, 'fluid'>> = (props) => (
  <Container fluid {...props} />
);

export const CenteredContainer: React.FC<Omit<ContainerProps, 'centerContent'>> = (props) => (
  <Container centerContent {...props} />
);

export const SmallContainer: React.FC<Omit<ContainerProps, 'size'>> = (props) => (
  <Container size="sm" {...props} />
);

export const MediumContainer: React.FC<Omit<ContainerProps, 'size'>> = (props) => (
  <Container size="md" {...props} />
);

export const LargeContainer: React.FC<Omit<ContainerProps, 'size'>> = (props) => (
  <Container size="lg" {...props} />
);

export const ExtraLargeContainer: React.FC<Omit<ContainerProps, 'size'>> = (props) => (
  <Container size="xl" {...props} />
);

// Hook for container utilities
export const useContainer = () => {
  return {
    sizes: containerSizes,
    getSizeValue: (size: keyof typeof containerSizes) => containerSizes[size],
    getResponsiveSize: (sizes: Partial<Record<string, keyof typeof containerSizes>>) => sizes,
  };
};
