/**
 * LAYOUT PATTERN TYPES
 * 
 * Type definitions for complex layout patterns and compositions
 */

import { ReactNode, CSSProperties } from 'react';
import { BaseLayoutProps, SpacingValue, ResponsiveValue } from '../types';

// Base pattern props
export interface LayoutPatternProps extends BaseLayoutProps {
  variant?: 'default' | 'compact' | 'comfortable' | 'spacious';
  theme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
}

// App Shell Patterns
export interface AppShellPatternProps extends LayoutPatternProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
  sidebarWidth?: ResponsiveValue<string | number>;
  headerHeight?: ResponsiveValue<string | number>;
  footerHeight?: ResponsiveValue<string | number>;
  asideWidth?: ResponsiveValue<string | number>;
  sidebarCollapsible?: boolean;
  sidebarDefaultOpen?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  contentPadding?: SpacingValue;
}

export interface SplitLayoutProps extends LayoutPatternProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  leftWidth?: ResponsiveValue<string | number>;
  rightWidth?: ResponsiveValue<string | number>;
  direction?: ResponsiveValue<'horizontal' | 'vertical'>;
  resizable?: boolean;
  minLeftWidth?: string | number;
  minRightWidth?: string | number;
  defaultSplit?: number; // percentage
  onSplitChange?: (split: number) => void;
}

export interface HolyGrailLayoutProps extends LayoutPatternProps {
  header: ReactNode;
  navigation: ReactNode;
  content: ReactNode;
  aside: ReactNode;
  footer: ReactNode;
  navWidth?: ResponsiveValue<string | number>;
  asideWidth?: ResponsiveValue<string | number>;
  headerHeight?: ResponsiveValue<string | number>;
  footerHeight?: ResponsiveValue<string | number>;
  contentMinHeight?: string | number;
}

export interface DashboardPatternProps extends LayoutPatternProps {
  widgets: ReactNode[];
  columns?: ResponsiveValue<number>;
  gap?: SpacingValue;
  autoHeight?: boolean;
  sortable?: boolean;
  resizable?: boolean;
  onLayoutChange?: (layout: any[]) => void;
}

export interface AdminLayoutProps extends LayoutPatternProps {
  navigation: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  sidebar?: ReactNode;
  navCollapsed?: boolean;
  showBreadcrumbs?: boolean;
  contentMaxWidth?: string | number;
}

// Content Patterns
export interface MasterDetailPatternProps extends LayoutPatternProps {
  master: ReactNode;
  detail?: ReactNode;
  masterWidth?: ResponsiveValue<string | number>;
  detailWidth?: ResponsiveValue<string | number>;
  orientation?: ResponsiveValue<'horizontal' | 'vertical'>;
  showDetail?: boolean;
  onDetailToggle?: (show: boolean) => void;
  resizable?: boolean;
}

export interface TimelineLayoutProps extends LayoutPatternProps {
  items: Array<{
    id: string;
    timestamp: Date | string;
    title: ReactNode;
    content?: ReactNode;
    icon?: ReactNode;
    status?: 'completed' | 'active' | 'pending' | 'cancelled';
  }>;
  orientation?: 'vertical' | 'horizontal';
  showConnectors?: boolean;
  interactive?: boolean;
  onItemClick?: (item: any) => void;
}

export interface KanbanLayoutProps extends LayoutPatternProps {
  columns: Array<{
    id: string;
    title: string;
    items: ReactNode[];
    color?: string;
    maxItems?: number;
  }>;
  onDragEnd?: (result: any) => void;
  columnWidth?: string | number;
  columnMinWidth?: string | number;
  scrollable?: boolean;
}

export interface GalleryLayoutProps extends LayoutPatternProps {
  items: ReactNode[];
  columns?: ResponsiveValue<number>;
  aspectRatio?: number;
  gap?: SpacingValue;
  masonry?: boolean;
  lightbox?: boolean;
  lazy?: boolean;
  onItemClick?: (item: any, index: number) => void;
}

export interface ComparisonLayoutProps extends LayoutPatternProps {
  items: Array<{
    id: string;
    header?: ReactNode;
    content: ReactNode;
    highlight?: boolean;
  }>;
  maxColumns?: number;
  equalHeight?: boolean;
  stickyHeaders?: boolean;
}

// Business Patterns
export interface ReportLayoutProps extends LayoutPatternProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  summary?: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  actions?: ReactNode;
  exportOptions?: ReactNode;
  printable?: boolean;
}

export interface AnalyticsLayoutProps extends LayoutPatternProps {
  metrics: ReactNode[];
  charts: ReactNode[];
  filters?: ReactNode;
  timeRange?: ReactNode;
  exportOptions?: ReactNode;
  refreshInterval?: number;
  loading?: boolean;
}

export interface SettingsLayoutProps extends LayoutPatternProps {
  navigation: ReactNode;
  content: ReactNode;
  navPosition?: 'left' | 'top';
  navWidth?: string | number;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export interface OnboardingLayoutProps extends LayoutPatternProps {
  steps: Array<{
    id: string;
    title: string;
    content: ReactNode;
    optional?: boolean;
  }>;
  currentStep: number;
  onStepChange: (step: number) => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  linear?: boolean;
}

export interface WorkflowLayoutProps extends LayoutPatternProps {
  steps: Array<{
    id: string;
    title: string;
    status: 'completed' | 'active' | 'pending' | 'error';
    content?: ReactNode;
  }>;
  orientation?: 'horizontal' | 'vertical';
  interactive?: boolean;
  onStepClick?: (step: any, index: number) => void;
}

// Form Patterns
export interface FormPatternProps extends LayoutPatternProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  success?: string;
}

export interface WizardLayoutProps extends FormPatternProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    content: ReactNode;
    validation?: () => boolean | Promise<boolean>;
  }>;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  allowBack?: boolean;
  showStepNumbers?: boolean;
  linear?: boolean;
}

export interface TabbedFormLayoutProps extends FormPatternProps {
  tabs: Array<{
    id: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
    error?: boolean;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  sticky?: boolean;
}

export interface ConditionalFormLayoutProps extends FormPatternProps {
  sections: Array<{
    id: string;
    content: ReactNode;
    condition?: () => boolean;
    dependencies?: string[];
  }>;
  values?: Record<string, any>;
  onValuesChange?: (values: Record<string, any>) => void;
}

export interface ReviewFormLayoutProps extends FormPatternProps {
  sections: Array<{
    id: string;
    title: string;
    content: ReactNode;
    editable?: boolean;
  }>;
  onEdit?: (sectionId: string) => void;
  showEditButtons?: boolean;
  summary?: ReactNode;
}

// Data Patterns
export interface DataPatternProps extends LayoutPatternProps {
  loading?: boolean;
  error?: string;
  empty?: ReactNode;
  refresh?: () => void;
}

export interface DataExplorerLayoutProps extends DataPatternProps {
  filters: ReactNode;
  search: ReactNode;
  content: ReactNode;
  details?: ReactNode;
  actions?: ReactNode;
  sidebar?: ReactNode;
  showSidebar?: boolean;
}

export interface TableManagementLayoutProps extends DataPatternProps {
  table: ReactNode;
  toolbar?: ReactNode;
  filters?: ReactNode;
  pagination?: ReactNode;
  bulkActions?: ReactNode;
  details?: ReactNode;
  showFilters?: boolean;
  showDetails?: boolean;
}

export interface FilteredListLayoutProps extends DataPatternProps {
  filters: ReactNode;
  list: ReactNode;
  search?: ReactNode;
  sorting?: ReactNode;
  pagination?: ReactNode;
  layout?: 'list' | 'grid' | 'table';
}

export interface DetailViewLayoutProps extends DataPatternProps {
  header: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  actions?: ReactNode;
  related?: ReactNode;
  tabs?: Array<{
    id: string;
    label: string;
    content: ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

// Animation and transition props for patterns
export interface PatternAnimationProps {
  enableAnimations?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  reduceMotion?: boolean;
}

// Common layout configuration
export interface LayoutConfiguration {
  spacing?: SpacingValue;
  maxWidth?: string | number;
  minHeight?: string | number;
  background?: string;
  border?: boolean;
  shadow?: boolean;
  rounded?: boolean;
}