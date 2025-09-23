/**
 * GRID COMPONENTS
 * 
 * CSS Grid-based layout components with responsive capabilities
 */

'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { GridProps, GridItemProps } from '../types';

const StyledGrid = styled(Box)<GridProps>(({ theme, templateColumns, templateRows, gap, rowGap, columnGap, autoColumns, autoRows, autoFlow }) => {
  const getResponsiveValue = (value: any, property: string) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce((acc, [breakpoint, val]) => {
        if (val !== undefined && breakpoint in theme.breakpoints.values) {
          acc[theme.breakpoints.up(breakpoint as any)] = {
            [property]: val,
          };
        }
        return acc;
      }, {} as any);
    }
    return { [property]: value };
  };

  return {
    display: 'grid',
    ...(templateColumns && getResponsiveValue(templateColumns, 'gridTemplateColumns')),
    ...(templateRows && getResponsiveValue(templateRows, 'gridTemplateRows')),
    ...(gap && { gap: typeof gap === 'number' ? theme.spacing(gap) : gap }),
    ...(rowGap && { rowGap: typeof rowGap === 'number' ? theme.spacing(rowGap) : rowGap }),
    ...(columnGap && { columnGap: typeof columnGap === 'number' ? theme.spacing(columnGap) : columnGap }),
    ...(autoColumns && getResponsiveValue(autoColumns, 'gridAutoColumns')),
    ...(autoRows && getResponsiveValue(autoRows, 'gridAutoRows')),
    ...(autoFlow && getResponsiveValue(autoFlow, 'gridAutoFlow')),
  };
});

const StyledGridItem = styled(Box)<GridItemProps>(({ theme, colSpan, rowSpan, colStart, colEnd, rowStart, rowEnd, area }) => {
  const getResponsiveValue = (value: any, property: string) => {
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).reduce((acc, [breakpoint, val]) => {
        if (val !== undefined && breakpoint in theme.breakpoints.values) {
          acc[theme.breakpoints.up(breakpoint as any)] = {
            [property]: val === 'auto' ? 'auto' : `span ${val}`,
          };
        }
        return acc;
      }, {} as any);
    }
    return { [property]: value === 'auto' ? 'auto' : `span ${value}` };
  };

  return {
    ...(colSpan && getResponsiveValue(colSpan, 'gridColumn')),
    ...(rowSpan && getResponsiveValue(rowSpan, 'gridRow')),
    ...(colStart && getResponsiveValue(colStart, 'gridColumnStart')),
    ...(colEnd && getResponsiveValue(colEnd, 'gridColumnEnd')),
    ...(rowStart && getResponsiveValue(rowStart, 'gridRowStart')),
    ...(rowEnd && getResponsiveValue(rowEnd, 'gridRowEnd')),
    ...(area && getResponsiveValue(area, 'gridArea')),
  };
});

export const Grid: React.FC<GridProps> = ({
  children,
  templateColumns = 'repeat(12, 1fr)',
  templateRows,
  gap = 2,
  rowGap,
  columnGap,
  autoColumns,
  autoRows,
  autoFlow,
  className,
  ...props
}) => {
  return (
    <StyledGrid
      templateColumns={templateColumns}
      {...(templateRows && { templateRows })}
      gap={gap}
      {...(rowGap && { rowGap })}
      {...(columnGap && { columnGap })}
      {...(autoColumns && { autoColumns })}
      {...(autoRows && { autoRows })}
      {...(autoFlow && { autoFlow })}
      {...(className && { className })}
      {...props}
    >
      {children}
    </StyledGrid>
  );
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  area,
  className,
  ...props
}) => {
  return (
    <StyledGridItem
      {...(colSpan && { colSpan })}
      {...(rowSpan && { rowSpan })}
      {...(colStart && { colStart })}
      {...(colEnd && { colEnd })}
      {...(rowStart && { rowStart })}
      {...(rowEnd && { rowEnd })}
      {...(area && { area })}
      {...(className && { className })}
      {...props}
    >
      {children}
    </StyledGridItem>
  );
};

Grid.displayName = 'Grid';
GridItem.displayName = 'GridItem';

// Pre-configured grid variants
export const SimpleGrid: React.FC<GridProps & { columns?: number | Record<string, number> }> = ({ 
  columns = 1, 
  ...props 
}) => {
  const getColumns = () => {
    if (typeof columns === 'object') {
      return Object.entries(columns).reduce((acc, [breakpoint, cols]) => {
        acc[breakpoint as keyof typeof acc] = `repeat(${cols}, 1fr)`;
        return acc;
      }, {} as any);
    }
    return `repeat(${columns}, 1fr)`;
  };

  return <Grid templateColumns={getColumns()} {...props} />;
};

export const ResponsiveGrid: React.FC<GridProps> = (props) => (
  <Grid
    templateColumns={{
      xs: 'repeat(1, 1fr)',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    }}
    {...props}
  />
);

export const AutoGrid: React.FC<GridProps & { minItemWidth?: string }> = ({ 
  minItemWidth = '250px', 
  ...props 
}) => (
  <Grid
    templateColumns={`repeat(auto-fit, minmax(${minItemWidth}, 1fr))`}
    {...props}
  />
);

// Grid utilities hook
export const useGrid = () => {
  const createTemplate = (columns: number) => `repeat(${columns}, 1fr)`;
  
  const createResponsiveTemplate = (breakpoints: Record<string, number>) => {
    return Object.entries(breakpoints).reduce((acc, [bp, cols]) => {
      acc[bp as keyof typeof acc] = createTemplate(cols);
      return acc;
    }, {} as any);
  };

  const createAreaTemplate = (areas: string[][]) => {
    return areas.map(row => `"${row.join(' ')}"`).join(' ');
  };

  return {
    createTemplate,
    createResponsiveTemplate,
    createAreaTemplate,
    // Common patterns
    patterns: {
      sidebar: {
        templateColumns: '240px 1fr',
        templateAreas: '"sidebar main"',
      },
      header: {
        templateColumns: '1fr',
        templateRows: 'auto 1fr',
        templateAreas: '"header" "main"',
      },
      holy_grail: {
        templateColumns: '200px 1fr 200px',
        templateRows: 'auto 1fr auto',
        templateAreas: `
          "header header header"
          "nav main aside"
          "footer footer footer"
        `,
      },
    },
  };
};

export default Grid;
