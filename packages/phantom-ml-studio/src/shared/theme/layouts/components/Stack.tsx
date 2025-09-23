/**
 * STACK COMPONENT
 * 
 * Stack layout component for organizing elements with consistent spacing
 */

'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { StackProps } from '../types';

const StyledStack = styled(Box)<StackProps>(({ theme, direction = 'column', spacing = 2, align, justify, divider, wrap }) => {
  const getResponsiveValue = (value: any, property: string) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce((acc, [breakpoint, val]) => {
        if (val !== undefined && breakpoint in theme.breakpoints.values) {
          const responsiveValue = (() => {
            switch (property) {
              case 'alignItems':
                return val === 'start' ? 'flex-start' : val === 'end' ? 'flex-end' : val;
              case 'justifyContent':
                return val === 'start' ? 'flex-start' : 
                       val === 'end' ? 'flex-end' : 
                       val === 'between' ? 'space-between' :
                       val === 'around' ? 'space-around' :
                       val === 'evenly' ? 'space-evenly' : val;
              default:
                return val;
            }
          })();
          
          acc[theme.breakpoints.up(breakpoint as any)] = {
            [property]: responsiveValue,
          };
        }
        return acc;
      }, {} as any);
    }
    
    const singleValue = (() => {
      switch (property) {
        case 'alignItems':
          return value === 'start' ? 'flex-start' : value === 'end' ? 'flex-end' : value;
        case 'justifyContent':
          return value === 'start' ? 'flex-start' : 
                 value === 'end' ? 'flex-end' : 
                 value === 'between' ? 'space-between' :
                 value === 'around' ? 'space-around' :
                 value === 'evenly' ? 'space-evenly' : value;
        default:
          return value;
      }
    })();
    
    return { [property]: singleValue };
  };

  const getSpacing = (spacingValue: any) => {
    if (typeof spacingValue === 'number') {
      return theme.spacing(spacingValue);
    }
    if (typeof spacingValue === 'string') {
      return spacingValue;
    }
    if (typeof spacingValue === 'object' && spacingValue !== null) {
      return Object.entries(spacingValue).reduce((acc, [breakpoint, val]) => {
        if (val !== undefined && breakpoint in theme.breakpoints.values) {
          acc[theme.breakpoints.up(breakpoint as any)] = {
            gap: typeof val === 'number' ? theme.spacing(val) : val,
          };
        }
        return acc;
      }, {} as any);
    }
    return theme.spacing(2); // default
  };

  return {
    display: 'flex',
    ...(direction && getResponsiveValue(direction, 'flexDirection')),
    ...(wrap && getResponsiveValue(wrap, 'flexWrap')),
    ...(align && getResponsiveValue(align, 'alignItems')),
    ...(justify && getResponsiveValue(justify, 'justifyContent')),
    gap: getSpacing(spacing),
    ...(typeof spacing === 'object' && spacing !== null && getSpacing(spacing)),
  };
});

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing = 2,
  align,
  justify,
  divider,
  wrap,
  className,
  ...props
}) => {
  // Handle divider between children
  const processChildren = () => {
    if (!divider) return children;
    
    const childArray = React.Children.toArray(children);
    const childrenWithDividers: React.ReactNode[] = [];
    
    childArray.forEach((child, index) => {
      childrenWithDividers.push(child);
      if (index < childArray.length - 1) {
        childrenWithDividers.push(
          React.cloneElement(divider as React.ReactElement, { key: `divider-${index}` })
        );
      }
    });
    
    return childrenWithDividers;
  };

  return (
    <StyledStack
      direction={direction}
      spacing={spacing}
      {...(align && { align })}
      {...(justify && { justify })}
      {...(wrap && { wrap })}
      {...(className && { className })}
      {...props}
    >
      {processChildren()}
    </StyledStack>
  );
};

Stack.displayName = 'Stack';

// Stack utility components
export const VStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
  <Stack direction="column" {...props} />
);

export const HStack: React.FC<Omit<StackProps, 'direction'>> = (props) => (
  <Stack direction="row" {...props} />
);

export const StackDivider: React.FC<{ orientation?: 'horizontal' | 'vertical'; className?: string }> = ({ 
  orientation = 'horizontal',
  className 
}) => (
  <Box
    sx={{
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'divider',
      ...(orientation === 'horizontal' 
        ? { borderBottomWidth: 1, width: '100%' }
        : { borderRightWidth: 1, height: '100%' }
      ),
    }}
    className={className}
  />
);

// Pre-configured stack variants
export const VerticalStack: React.FC<StackProps> = (props) => (
  <Stack direction="column" {...props} />
);

export const HorizontalStack: React.FC<StackProps> = (props) => (
  <Stack direction="row" {...props} />
);

export const CenteredStack: React.FC<StackProps> = (props) => (
  <Stack align="center" justify="center" {...props} />
);

export const SpacedStack: React.FC<StackProps> = (props) => (
  <Stack spacing={4} {...props} />
);

export const TightStack: React.FC<StackProps> = (props) => (
  <Stack spacing={1} {...props} />
);

export const DividedStack: React.FC<Omit<StackProps, 'divider'>> = (props) => (
  <Stack divider={<StackDivider />} {...props} />
);

// Stack utilities hook
export const useStack = () => {
  const createDivider = (orientation: 'horizontal' | 'vertical' = 'horizontal') => (
    <StackDivider orientation={orientation} />
  );

  const spacingValues = {
    none: 0,
    xs: 0.5,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 6,
    '3xl': 8,
  };

  return {
    createDivider,
    spacingValues,
    // Common patterns
    patterns: {
      form: {
        direction: 'column' as const,
        spacing: 3,
        align: 'stretch' as const,
      },
      buttonGroup: {
        direction: 'row' as const,
        spacing: 1,
        align: 'center' as const,
      },
      navigation: {
        direction: 'row' as const,
        spacing: 2,
        align: 'center' as const,
        divider: createDivider('vertical'),
      },
      sidebar: {
        direction: 'column' as const,
        spacing: 1,
        align: 'stretch' as const,
      },
      card: {
        direction: 'column' as const,
        spacing: 2,
      },
    },
  };
};

export default Stack;
