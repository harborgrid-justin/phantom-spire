/**
 * LAYOUT PATTERNS - COMPLEX COMPOSITIONS
 * 
 * Advanced layout patterns that combine multiple components for enterprise use cases
 */

// App Shell Patterns
export { AppShell } from './AppShell';
export { SplitLayout } from './SplitLayout';
export { HolyGrailLayout } from './HolyGrailLayout';
export { DashboardLayout } from './DashboardLayout';
export { AdminLayout } from './AdminLayout';

// Content Patterns  
export { MasterDetailLayout } from './MasterDetailLayout';
export { TimelineLayout } from './TimelineLayout';
export { KanbanLayout } from './KanbanLayout';
export { GalleryLayout } from './GalleryLayout';
export { ComparisonLayout } from './ComparisonLayout';

// Business Patterns
export { ReportLayout } from './ReportLayout';
export { AnalyticsLayout } from './AnalyticsLayout';
export { SettingsLayout } from './SettingsLayout';
export { OnboardingLayout } from './OnboardingLayout';
export { WorkflowLayout } from './WorkflowLayout';

// Form Patterns
export { WizardLayout } from './WizardLayout';
export { TabbedFormLayout } from './TabbedFormLayout';
export { ConditionalFormLayout } from './ConditionalFormLayout';
export { ReviewFormLayout } from './ReviewFormLayout';

// Data Patterns
export { DataExplorerLayout } from './DataExplorerLayout';
export { TableManagementLayout } from './TableManagementLayout';
export { FilteredListLayout } from './FilteredListLayout';
export { DetailViewLayout } from './DetailViewLayout';

// Export pattern types
export type {
  LayoutPatternProps,
  AppShellPatternProps,
  MasterDetailPatternProps,
  DashboardPatternProps,
  FormPatternProps,
} from './types';