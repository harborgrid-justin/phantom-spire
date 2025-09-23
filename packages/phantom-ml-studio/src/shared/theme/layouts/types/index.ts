/**
 * LAYOUT LIBRARY TYPES
 * 
 * Comprehensive type definitions for the enterprise layout system
 */

import { CSSProperties, ReactNode } from 'react';

// Base responsive value type
export type ResponsiveValue<T> = T | {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// Breakpoint keys
export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BreakpointValue = Record<BreakpointKey, number>;

// Spacing values
export type SpacingValue = 
  | number 
  | string 
  | 'auto' 
  | ResponsiveValue<number | string | 'auto'>;

// Alignment types
export type AlignmentValue = 
  | 'start' 
  | 'end' 
  | 'center' 
  | 'stretch' 
  | 'baseline'
  | ResponsiveValue<'start' | 'end' | 'center' | 'stretch' | 'baseline'>;

export type JustifyValue = 
  | 'start' 
  | 'end' 
  | 'center' 
  | 'between' 
  | 'around' 
  | 'evenly'
  | ResponsiveValue<'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'>;

// Flex types
export type FlexDirection = 
  | 'row' 
  | 'row-reverse' 
  | 'column' 
  | 'column-reverse'
  | ResponsiveValue<'row' | 'row-reverse' | 'column' | 'column-reverse'>;

export type FlexWrap = 
  | 'nowrap' 
  | 'wrap' 
  | 'wrap-reverse'
  | ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>;

// Base layout props interface
export interface BaseLayoutProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
}

// Core layout props
export interface LayoutProps extends BaseLayoutProps {
  // Spacing
  p?: SpacingValue; // padding
  px?: SpacingValue; // padding-x
  py?: SpacingValue; // padding-y
  pt?: SpacingValue; // padding-top
  pr?: SpacingValue; // padding-right
  pb?: SpacingValue; // padding-bottom
  pl?: SpacingValue; // padding-left
  
  m?: SpacingValue; // margin
  mx?: SpacingValue; // margin-x
  my?: SpacingValue; // margin-y
  mt?: SpacingValue; // margin-top
  mr?: SpacingValue; // margin-right
  mb?: SpacingValue; // margin-bottom
  ml?: SpacingValue; // margin-left
  
  // Size
  w?: ResponsiveValue<string | number>; // width
  h?: ResponsiveValue<string | number>; // height
  minW?: ResponsiveValue<string | number>; // min-width
  maxW?: ResponsiveValue<string | number>; // max-width
  minH?: ResponsiveValue<string | number>; // min-height
  maxH?: ResponsiveValue<string | number>; // max-height
  
  // Display
  display?: ResponsiveValue<'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none'>;
  overflow?: ResponsiveValue<'visible' | 'hidden' | 'scroll' | 'auto'>;
  
  // Position
  position?: ResponsiveValue<'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'>;
  top?: ResponsiveValue<string | number>;
  right?: ResponsiveValue<string | number>;
  bottom?: ResponsiveValue<string | number>;
  left?: ResponsiveValue<string | number>;
  zIndex?: ResponsiveValue<number>;
  
  // Background and border
  bg?: string; // background
  bgImage?: string;
  bgSize?: string;
  bgPosition?: string;
  bgRepeat?: string;
  
  border?: string;
  borderRadius?: ResponsiveValue<string | number>;
  borderColor?: string;
  borderWidth?: ResponsiveValue<string | number>;
  
  // Shadow
  shadow?: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>;
  
  // Text
  color?: string;
  fontSize?: ResponsiveValue<string | number>;
  fontWeight?: ResponsiveValue<string | number>;
  textAlign?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  
  // Visibility
  opacity?: ResponsiveValue<number>;
  visibility?: ResponsiveValue<'visible' | 'hidden'>;
}

// Container props
export interface ContainerProps extends LayoutProps {
  size?: ResponsiveValue<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'>;
  centerContent?: boolean;
  fluid?: boolean;
}

// Grid props
export interface GridProps extends LayoutProps {
  templateColumns?: ResponsiveValue<string>;
  templateRows?: ResponsiveValue<string>;
  gap?: SpacingValue;
  rowGap?: SpacingValue;
  columnGap?: SpacingValue;
  autoColumns?: ResponsiveValue<string>;
  autoRows?: ResponsiveValue<string>;
  autoFlow?: ResponsiveValue<'row' | 'column' | 'row dense' | 'column dense'>;
}

export interface GridItemProps extends LayoutProps {
  colSpan?: ResponsiveValue<number | 'auto'>;
  rowSpan?: ResponsiveValue<number | 'auto'>;
  colStart?: ResponsiveValue<number | 'auto'>;
  colEnd?: ResponsiveValue<number | 'auto'>;
  rowStart?: ResponsiveValue<number | 'auto'>;
  rowEnd?: ResponsiveValue<number | 'auto'>;
  area?: ResponsiveValue<string>;
}

// Flex props
export interface FlexProps extends LayoutProps {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  align?: AlignmentValue;
  justify?: JustifyValue;
  gap?: SpacingValue;
}

// Stack props
export interface StackProps extends LayoutProps {
  direction?: FlexDirection;
  spacing?: SpacingValue;
  align?: AlignmentValue;
  justify?: JustifyValue;
  divider?: ReactNode;
  wrap?: FlexWrap;
}

// Modal and Dialog props
export interface ModalProps extends BaseLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  isCentered?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preserveScrollBarGap?: boolean;
  blockScrollOnMount?: boolean;
}

export interface DialogProps extends ModalProps {
  title?: string;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

// Navigation props
export interface SidebarProps extends LayoutProps {
  isOpen: boolean;
  onClose?: () => void;
  variant?: 'drawer' | 'permanent' | 'persistent';
  placement?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface AppShellProps extends BaseLayoutProps {
  navbar?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  aside?: ReactNode;
  navbarOffsetBreakpoint?: BreakpointKey;
  asideOffsetBreakpoint?: BreakpointKey;
  fixed?: boolean;
  padding?: SpacingValue;
}

// Form layout props
export interface FormProps extends LayoutProps {
  spacing?: SpacingValue;
  variant?: 'stacked' | 'inline' | 'floating';
}

export interface FormGroupProps extends LayoutProps {
  label?: string;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  helperText?: string;
}

// Dashboard props
export interface DashboardProps extends LayoutProps {
  columns?: ResponsiveValue<number>;
  gap?: SpacingValue;
  autoHeight?: boolean;
}

export interface WidgetProps extends LayoutProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  error?: string;
}

// Animation and transition props
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface TransitionProps extends AnimationProps {
  in?: boolean;
  unmountOnExit?: boolean;
  mountOnEnter?: boolean;
}

// Theme variants
export type ColorScheme = 'light' | 'dark' | 'auto';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'solid' | 'outline' | 'ghost' | 'link' | 'subtle';

// Layout system configuration
export interface LayoutConfig {
  breakpoints: BreakpointValue;
  spacing: Record<string, string>;
  sizes: Record<string, string>;
  colors: Record<string, string>;
  shadows: Record<string, string>;
  radii: Record<string, string>;
  animations: Record<string, AnimationProps>;
}
