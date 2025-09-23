/**
 * FLEX COMPONENT
 * 
 * Flexbox-based layout component with responsive capabilities
 */

'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { FlexProps } from '../types';

const StyledFlex = styled(Box)<FlexProps>(({ theme, direction = 'row', wrap = 'nowrap', align = 'stretch', justify = 'start', gap }) => {
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

  return {
    display: 'flex',
    ...(direction && getResponsiveValue(direction, 'flexDirection')),
    ...(wrap && getResponsiveValue(wrap, 'flexWrap')),
    ...(align && getResponsiveValue(align, 'alignItems')),
    ...(justify && getResponsiveValue(justify, 'justifyContent')),
    ...(gap && { gap: typeof gap === 'number' ? theme.spacing(gap) : gap }),
  };
});

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  wrap = 'nowrap',
  align = 'stretch',
  justify = 'start',
  gap,
  className,
  ...props
}) => {
  return (
    <StyledFlex
      direction={direction}
      wrap={wrap}
      align={align}
      justify={justify}
      {...(gap && { gap })}
      {...(className && { className })}
      {...props}
    >
      {children}
    </StyledFlex>
  );
};

Flex.displayName = 'Flex';

// Flex utility components
export const HStack: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
  <Flex direction="row" {...props} />
);

export const VStack: React.FC<Omit<FlexProps, 'direction'>> = (props) => (
  <Flex direction="column" {...props} />
);

export const Center: React.FC<FlexProps> = (props) => (
  <Flex align="center" justify="center" {...props} />
);

export const Spacer: React.FC<{ className?: string }> = ({ className }) => (
  <Box sx={{ flex: 1 }} className={className} />
);

// Pre-configured flex variants
export const FlexRow: React.FC<FlexProps> = (props) => (
  <Flex direction="row" align="center" {...props} />
);

export const FlexColumn: React.FC<FlexProps> = (props) => (
  <Flex direction="column" {...props} />
);

export const FlexBetween: React.FC<FlexProps> = (props) => (
  <Flex justify="between" align="center" {...props} />
);

export const FlexAround: React.FC<FlexProps> = (props) => (
  <Flex justify="around" align="center" {...props} />
);

export const FlexEvenly: React.FC<FlexProps> = (props) => (
  <Flex justify="evenly" align="center" {...props} />
);

export const FlexWrap: React.FC<FlexProps> = (props) => (
  <Flex wrap="wrap" {...props} />
);

export const FlexNoWrap: React.FC<FlexProps> = (props) => (
  <Flex wrap="nowrap" {...props} />
);

// Flex utilities hook
export const useFlex = () => {
  const createFlexValue = (grow = 0, shrink = 1, basis = 'auto') => `${grow} ${shrink} ${basis}`;
  
  const flexValues = {
    none: '0 0 auto',
    auto: '1 1 auto',
    initial: '0 1 auto',
    1: '1 1 0%',
    2: '2 1 0%',
    3: '3 1 0%',
    4: '4 1 0%',
    5: '5 1 0%',
  };

  const alignmentValues = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  const justificationValues = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  return {
    createFlexValue,
    flexValues,
    alignmentValues,
    justificationValues,
    // Common patterns
    patterns: {
      navbar: {
        direction: 'row' as const,
        justify: 'between' as const,
        align: 'center' as const,
      },
      sidebar: {
        direction: 'column' as const,
        align: 'stretch' as const,
      },
      card: {
        direction: 'column' as const,
        gap: 2,
      },
      buttonGroup: {
        direction: 'row' as const,
        gap: 1,
        align: 'center' as const,
      },
    },
  };
};

export default Flex;
