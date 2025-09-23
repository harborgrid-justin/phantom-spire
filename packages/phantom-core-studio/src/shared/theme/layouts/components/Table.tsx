/**
 * DATA & TABLE LAYOUT COMPONENTS
 * 
 * Advanced data presentation and table layout components
 */

'use client';

import React, { forwardRef, useState, useMemo } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Paper,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  ListItemSecondaryAction,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Skeleton,
  Alert,
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit,
  Delete,
  Visibility,
  GetApp,
  Sort,
  ViewColumn,
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
} from '@mui/icons-material';
import { BaseLayoutProps, SpacingValue } from '../types';

// Data component interfaces
export interface TableColumn {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'chip' | 'avatar' | 'actions';
  formatter?: (value: any, row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps extends BaseLayoutProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  error?: string;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: any) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  dense?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
}

export interface DataGridProps extends TableProps {
  title?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterable?: boolean;
  filters?: React.ReactNode;
  toolbar?: React.ReactNode;
  actions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: any[]) => void;
    disabled?: (selectedRows: any[]) => boolean;
  }>;
  exportable?: boolean;
  onExport?: () => void;
}

export interface ListProps extends BaseLayoutProps {
  items: any[];
  loading?: boolean;
  error?: string;
  renderItem: (item: any, index: number) => React.ReactNode;
  itemKey?: string | ((item: any) => string);
  dividers?: boolean;
  dense?: boolean;
  maxHeight?: string | number;
  emptyMessage?: string;
  virtualizedThreshold?: number;
}

export interface TimelineProps extends BaseLayoutProps {
  items: Array<{
    id: string;
    timestamp: Date | string;
    title: string;
    description?: string;
    content?: React.ReactNode;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    variant?: 'filled' | 'outlined';
  }>;
  position?: 'left' | 'right' | 'alternate';
  loading?: boolean;
}

export interface DataExplorerProps extends BaseLayoutProps {
  data: any[];
  columns: TableColumn[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  views?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    component: React.ReactNode;
  }>;
  activeView?: string;
  onViewChange?: (viewId: string) => void;
  loading?: boolean;
}

// Styled Components
const TableRoot = styled(Paper)(({ theme }) => ({
  width: '100%',
  overflow: 'hidden',
}));

const DataGridRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const DataGridToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  minWidth: 250,
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
  },
}));

const ListRoot = styled(Box)<{ maxHeight?: string | number }>(({ theme, maxHeight }) => ({
  width: '100%',
  ...(maxHeight && {
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    overflow: 'auto',
  }),
}));

const TimelineRoot = styled(Timeline)(({ theme }) => ({
  '& .MuiTimelineItem-root': {
    '&:before': {
      content: 'none',
    },
  },
}));

// Table Component
export const Table = forwardRef<HTMLDivElement, TableProps>(({
  columns,
  data,
  loading = false,
  error,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onSort,
  sortBy,
  sortDirection = 'asc',
  pagination,
  dense = false,
  stickyHeader = false,
  maxHeight,
  className,
  ...props
}, ref) => {
  const isSelected = (id: string) => selectedRows.includes(id);
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map(row => row.id || row._id));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelection = isSelected(id)
      ? selectedRows.filter(selectedId => selectedId !== id)
      : [...selectedRows, id];
    onSelectionChange?.(newSelection);
  };

  const handleSort = (columnId: string) => {
    if (!onSort) return;
    
    const newDirection = sortBy === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnId, newDirection);
  };

  const renderCellContent = (column: TableColumn, value: any, row: any) => {
    if (column.formatter) {
      return column.formatter(value, row);
    }

    switch (column.type) {
      case 'chip':
        return <Chip label={value} size="small" />;
      case 'avatar':
        return <Avatar src={value} sx={{ width: 32, height: 32 }} />;
      case 'boolean':
        return value ? <CheckCircle color="success" /> : <RadioButtonUnchecked />;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <TableRoot ref={ref} className={className} {...props}>
        <TableContainer>
          <MuiTable>
            <TableHead>
              <TableRow>
                {selectable && <TableCell padding="checkbox" />}
                {columns.map(column => (
                  <TableCell key={column.id}>
                    <Skeleton width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && <TableCell padding="checkbox" />}
                  {columns.map(column => (
                    <TableCell key={column.id}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      </TableRoot>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <TableRoot ref={ref} className={className} {...props}>
      <TableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ 
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const rowId = row.id || row._id || index.toString();
              const selected = isSelected(rowId);

              return (
                <TableRow
                  key={rowId}
                  hover={!!onRowClick}
                  selected={selected}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        maxWidth: column.maxWidth,
                      }}
                    >
                      {renderCellContent(column, row[column.id], row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.pageSize}
          page={pagination.page}
          onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
          onRowsPerPageChange={(e) => pagination.onPageSizeChange(parseInt(e.target.value))}
        />
      )}
    </TableRoot>
  );
});

// DataGrid Component
export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(({
  title,
  searchable = true,
  searchValue = '',
  onSearch,
  filterable = true,
  filters,
  toolbar,
  actions = [],
  exportable = true,
  onExport,
  selectedRows = [],
  className,
  ...tableProps
}, ref) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleActionMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  const selectedRowsData = tableProps.data.filter(row => 
    selectedRows.includes(row.id || row._id)
  );

  return (
    <DataGridRoot ref={ref} className={className}>
      <DataGridToolbar>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          {title && (
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          )}
          
          {searchable && onSearch && (
            <SearchField
              size="small"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {toolbar}
          
          {filterable && filters}
          
          {selectedRows.length > 0 && actions.length > 0 && (
            <>
              <IconButton onClick={handleActionMenu}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleActionClose}
              >
                {actions.map(action => (
                  <MenuItem
                    key={action.id}
                    disabled={action.disabled?.(selectedRowsData)}
                    onClick={() => {
                      action.onClick(selectedRowsData);
                      handleActionClose();
                    }}
                  >
                    <ListItemIcon>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText>
                      {action.label}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {exportable && onExport && (
            <IconButton onClick={onExport}>
              <GetApp />
            </IconButton>
          )}
        </Box>
      </DataGridToolbar>

      <Table {...tableProps} selectedRows={selectedRows} />
    </DataGridRoot>
  );
});

// List Component
export const List = forwardRef<HTMLDivElement, ListProps>(({
  items,
  loading = false,
  error,
  renderItem,
  itemKey = 'id',
  dividers = false,
  dense = false,
  maxHeight,
  emptyMessage = 'No items found',
  className,
  ...props
}, ref) => {
  const getItemKey = (item: any, index: number) => {
    return typeof itemKey === 'function' ? itemKey(item) : item[itemKey] || index;
  };

  if (loading) {
    return (
      <ListRoot ref={ref} maxHeight={maxHeight} className={className} {...props}>
        <List>
          {Array.from({ length: 5 }).map((_, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <MuiListItemText
                primary={<Skeleton width="60%" />}
                secondary={<Skeleton width="40%" />}
              />
            </ListItem>
          ))}
        </List>
      </ListRoot>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <ListRoot ref={ref} maxHeight={maxHeight} className={className} {...props}>
      <List dense={dense}>
        {items.map((item, index) => (
          <React.Fragment key={getItemKey(item, index)}>
            {renderItem(item, index)}
            {dividers && index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </ListRoot>
  );
});

// Timeline Component  
export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(({
  items,
  position = 'right',
  loading = false,
  className,
  ...props
}, ref) => {
  if (loading) {
    return (
      <Box ref={ref} className={className} {...props}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index} display="flex" gap={2} mb={3}>
            <Skeleton variant="circular" width={24} height={24} />
            <Box flex={1}>
              <Skeleton width="30%" height={20} />
              <Skeleton width="80%" height={16} sx={{ mt: 1 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <TimelineRoot position={position} ref={ref} className={className} {...props}>
      {items.map((item, index) => (
        <TimelineItem key={item.id}>
          <TimelineOppositeContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {new Date(item.timestamp).toLocaleString()}
            </Typography>
          </TimelineOppositeContent>
          
          <TimelineSeparator>
            <TimelineDot 
              color={item.color || 'primary'} 
              variant={item.variant || 'filled'}
            >
              {item.icon || <Schedule />}
            </TimelineDot>
            {index < items.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          
          <TimelineContent sx={{ py: '12px', px: 2 }}>
            <Typography variant="h6" component="span">
              {item.title}
            </Typography>
            {item.description && (
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            )}
            {item.content && (
              <Box sx={{ mt: 1 }}>
                {item.content}
              </Box>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </TimelineRoot>
  );
});

// Display names
Table.displayName = 'Table';
DataGrid.displayName = 'DataGrid';
List.displayName = 'List';
Timeline.displayName = 'Timeline';

export default Table;