/**
 * FORM LAYOUT COMPONENTS
 * 
 * Comprehensive form layout components for enterprise applications
 */

'use client';

import React, { forwardRef, useCallback } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { 
  Box, 
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Tabs,
  Tab,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle,
  RadioButtonUnchecked,
  Error as ErrorIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { BaseLayoutProps, SpacingValue } from '../types';

// Form component interfaces
export interface FormProps extends BaseLayoutProps {
  onSubmit?: (data: any) => void;
  loading?: boolean;
  error?: string;
  success?: string;
  spacing?: SpacingValue;
  maxWidth?: string | number;
  variant?: 'standard' | 'outlined' | 'filled';
}

export interface FormGroupProps extends BaseLayoutProps {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  success?: string;
  spacing?: SpacingValue;
  orientation?: 'vertical' | 'horizontal';
}

export interface FormRowProps extends BaseLayoutProps {
  columns?: number | 'auto';
  spacing?: SpacingValue;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export interface FormSectionProps extends BaseLayoutProps {
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  spacing?: SpacingValue;
}

export interface WizardFormProps extends BaseLayoutProps {
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    content: React.ReactNode;
    optional?: boolean;
    validate?: () => boolean | Promise<boolean>;
  }>;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  orientation?: 'horizontal' | 'vertical';
  allowSkip?: boolean;
  showProgress?: boolean;
}

export interface TabFormProps extends BaseLayoutProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    error?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

export interface FieldArrayProps extends BaseLayoutProps {
  items: any[];
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  addLabel?: string;
  removeLabel?: string;
  maxItems?: number;
  minItems?: number;
  sortable?: boolean;
}

export interface ConditionalFieldsProps extends BaseLayoutProps {
  fields: Array<{
    id: string;
    component: React.ReactNode;
    condition: (values: any) => boolean;
    dependencies?: string[];
  }>;
  values?: Record<string, any>;
  onValuesChange?: (values: Record<string, any>) => void;
}

// Styled Components
const FormRoot = styled('form')<{ 
  maxWidth?: string | number; 
  spacing?: number;
}>(({ theme, maxWidth, spacing = 24 }) => ({
  maxWidth: maxWidth || 'none',
  margin: '0 auto',
  '& > * + *': {
    marginTop: theme.spacing(spacing / 8),
  },
}));

const FormGroupRoot = styled(Box)<{ 
  spacing?: number;
  orientation?: 'vertical' | 'horizontal';
}>(({ theme, spacing = 16, orientation = 'vertical' }) => ({
  ...(orientation === 'horizontal' && {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    '& .form-group-label': {
      minWidth: 200,
      flexShrink: 0,
    },
    '& .form-group-content': {
      flex: 1,
    },
  }),
  '& + &': {
    marginTop: theme.spacing(spacing / 8),
  },
}));

const FormRowRoot = styled(Box)<{ 
  columns?: number | 'auto';
  spacing?: number;
}>(({ theme, columns = 'auto', spacing = 16 }) => ({
  display: 'grid',
  gridTemplateColumns: typeof columns === 'number' 
    ? `repeat(${columns}, 1fr)` 
    : 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(spacing / 8),
  alignItems: 'start',
}));

const WizardRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const TabFormRoot = styled(Paper)(({ theme }) => ({
  '& .MuiTabs-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const FieldArrayRoot = styled(Box)(({ theme }) => ({
  '& .field-array-item': {
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    '& + &': {
      marginTop: theme.spacing(1),
    },
  },
  '& .field-array-controls': {
    marginTop: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
  },
  '& .field-array-remove': {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
}));

// Form Component
export const Form = forwardRef<HTMLFormElement, FormProps>(({
  children,
  onSubmit,
  loading = false,
  error,
  success,
  spacing = 24,
  maxWidth,
  variant = 'standard',
  className,
  ...props
}, ref) => {
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmit && !loading) {
      const formData = new FormData(event.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      onSubmit(data);
    }
  }, [onSubmit, loading]);

  return (
    <FormRoot
      ref={ref}
      onSubmit={handleSubmit}
      maxWidth={maxWidth}
      spacing={spacing}
      className={className}
      {...props}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {children}
    </FormRoot>
  );
});

// FormGroup Component  
export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(({
  children,
  label,
  description,
  required = false,
  error,
  success,
  spacing = 16,
  orientation = 'vertical',
  className,
  ...props
}, ref) => {
  return (
    <FormGroupRoot
      ref={ref}
      spacing={spacing}
      orientation={orientation}
      className={className}
      {...props}
    >
      {label && (
        <Box className="form-group-label">
          <FormLabel required={required}>
            <Typography variant="subtitle1" component="span">
              {label}
            </Typography>
          </FormLabel>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
      )}
      
      <Box className="form-group-content">
        {children}
        
        {error && (
          <FormHelperText error>
            {error}
          </FormHelperText>
        )}
        
        {success && !error && (
          <FormHelperText sx={{ color: 'success.main' }}>
            {success}
          </FormHelperText>
        )}
      </Box>
    </FormGroupRoot>
  );
});

// FormRow Component
export const FormRow = forwardRef<HTMLDivElement, FormRowProps>(({
  children,
  columns = 'auto',
  spacing = 16,
  align = 'start',
  className,
  ...props
}, ref) => {
  return (
    <FormRowRoot
      ref={ref}
      columns={columns}
      spacing={spacing}
      sx={{ alignItems: align }}
      className={className}
      {...props}
    >
      {children}
    </FormRowRoot>
  );
});

// FormSection Component
export const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(({
  children,
  title,
  description,
  collapsible = false,
  defaultExpanded = true,
  icon,
  spacing = 24,
  className,
  ...props
}, ref) => {
  if (collapsible) {
    return (
      <Accordion 
        ref={ref}
        defaultExpanded={defaultExpanded} 
        className={className} 
        {...props}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Box>
              <Typography variant="h6">{title}</Typography>
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ '& > * + *': { mt: spacing / 8 } }}>
            {children}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  }

  return (
    <Box ref={ref} className={className} {...props}>
      {(title || description) && (
        <Box mb={2}>
          {title && (
            <Box display="flex" alignItems="center" gap={1} mb={description ? 0.5 : 0}>
              {icon}
              <Typography variant="h6" component="h3">
                {title}
              </Typography>
            </Box>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
      
      <Box sx={{ '& > * + *': { mt: spacing / 8 } }}>
        {children}
      </Box>
    </Box>
  );
});

// WizardForm Component
export const WizardForm = forwardRef<HTMLDivElement, WizardFormProps>(({
  steps,
  currentStep = 0,
  onStepChange,
  onComplete,
  orientation = 'horizontal',
  allowSkip = false,
  showProgress = true,
  className,
  ...props
}, ref) => {
  const handleNext = async () => {
    const current = steps[currentStep];
    if (current.validate) {
      const isValid = await current.validate();
      if (!isValid) return;
    }
    
    if (currentStep < steps.length - 1) {
      onStepChange?.(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onStepChange?.(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1 && allowSkip) {
      onStepChange?.(currentStep + 1);
    }
  };

  return (
    <WizardRoot ref={ref} className={className} {...props}>
      {showProgress && (
        <LinearProgress 
          variant="determinate" 
          value={(currentStep + 1) / steps.length * 100} 
          sx={{ mb: 3 }}
        />
      )}

      <Stepper 
        activeStep={currentStep} 
        orientation={orientation}
        alternativeLabel={orientation === 'horizontal'}
      >
        {steps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel optional={step.optional}>
              {step.label}
            </StepLabel>
            {orientation === 'vertical' && (
              <StepContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {step.description}
                </Typography>
                {index === currentStep && step.content}
              </StepContent>
            )}
          </Step>
        ))}
      </Stepper>

      {orientation === 'horizontal' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {steps[currentStep]?.label}
          </Typography>
          {steps[currentStep]?.description && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {steps[currentStep].description}
            </Typography>
          )}
          <Box sx={{ mt: 2, mb: 2 }}>
            {steps[currentStep]?.content}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
        <Button
          disabled={currentStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        
        {allowSkip && steps[currentStep]?.optional && (
          <Button onClick={handleSkip}>
            Skip
          </Button>
        )}

        <Box sx={{ flex: 1 }} />
        
        <Button
          variant="contained"
          onClick={handleNext}
        >
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </WizardRoot>
  );
});

// TabForm Component
export const TabForm = forwardRef<HTMLDivElement, TabFormProps>(({
  tabs,
  activeTab,
  onTabChange,
  orientation = 'horizontal',
  variant = 'standard',
  className,
  ...props
}, ref) => {
  const [currentTab, setCurrentTab] = React.useState(activeTab || tabs[0]?.id);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    onTabChange?.(newValue);
  };

  const currentTabData = tabs.find(tab => tab.id === currentTab);

  return (
    <TabFormRoot ref={ref} className={className} {...props}>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        orientation={orientation}
        variant={variant}
        scrollButtons="auto"
        sx={orientation === 'vertical' ? { borderRight: 1, borderColor: 'divider' } : undefined}
      >
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            label={tab.label}
            value={tab.id}
            disabled={tab.disabled}
            icon={tab.icon}
            iconPosition="start"
            sx={{
              ...(tab.error && {
                color: 'error.main',
                '& .MuiTab-iconWrapper': {
                  color: 'error.main',
                },
              }),
            }}
          />
        ))}
      </Tabs>

      <Box sx={{ p: 3 }}>
        {currentTabData?.content}
      </Box>
    </TabFormRoot>
  );
});

// FieldArray Component
export const FieldArray = forwardRef<HTMLDivElement, FieldArrayProps>(({
  items,
  onAdd,
  onRemove,
  onMove,
  renderItem,
  addLabel = 'Add Item',
  removeLabel = 'Remove',
  maxItems,
  minItems = 0,
  sortable = false,
  className,
  ...props
}, ref) => {
  const canAdd = !maxItems || items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <FieldArrayRoot ref={ref} className={className} {...props}>
      {items.map((item, index) => (
        <Box key={index} className="field-array-item">
          {renderItem(item, index)}
          {canRemove && onRemove && (
            <IconButton
              className="field-array-remove"
              size="small"
              onClick={() => onRemove(index)}
              color="error"
            >
              <RemoveIcon />
            </IconButton>
          )}
        </Box>
      ))}

      {canAdd && onAdd && (
        <Box className="field-array-controls">
          <Button
            startIcon={<AddIcon />}
            onClick={onAdd}
            variant="outlined"
          >
            {addLabel}
          </Button>
        </Box>
      )}
    </FieldArrayRoot>
  );
});

// ConditionalFields Component  
export const ConditionalFields = forwardRef<HTMLDivElement, ConditionalFieldsProps>(({
  fields,
  values = {},
  onValuesChange,
  className,
  ...props
}, ref) => {
  const visibleFields = fields.filter(field => field.condition(values));

  return (
    <Box ref={ref} className={className} {...props}>
      {visibleFields.map(field => (
        <Box key={field.id} sx={{ mb: 2 }}>
          {field.component}
        </Box>
      ))}
    </Box>
  );
});

// Display names
Form.displayName = 'Form';
FormGroup.displayName = 'FormGroup';
FormRow.displayName = 'FormRow';
FormSection.displayName = 'FormSection';
WizardForm.displayName = 'WizardForm';
TabForm.displayName = 'TabForm';
FieldArray.displayName = 'FieldArray';
ConditionalFields.displayName = 'ConditionalFields';

export default Form;