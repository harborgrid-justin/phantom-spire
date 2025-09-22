import { useCallback } from 'react'
import { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import * as yup from 'yup'

// Enhanced validation schemas
export const modelValidationSchema = yup.object({
  name: yup
    .string()
    .required('Model name is required')
    .min(3, 'Model name must be at least 3 characters')
    .max(50, 'Model name must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9/s-_]+$/, 'Model name can only contain letters, numbers, spaces, hyphens, and underscores'),

  type: yup
    .string()
    .required('Model type is required')
    .oneOf(
      ['classification', 'regression', 'clustering', 'anomaly_detection', 'nlp', 'computer_vision'],
      'Invalid model type'
    ),

  algorithm: yup
    .string()
    .required('Algorithm is required')
    .min(2, 'Algorithm name must be at least 2 characters'),

  description: yup
    .string()
    .optional()
    .max(500, 'Description must not exceed 500 characters'),

  tags: yup
    .array()
    .of(yup.string().required())
    .optional()
    .max(10, 'Maximum 10 tags allowed'),

  framework: yup
    .string()
    .required('Framework is required'),
})

export const datasetValidationSchema = yup.object({
  name: yup
    .string()
    .required('Dataset name is required')
    .min(3, 'Dataset name must be at least 3 characters')
    .max(100, 'Dataset name must not exceed 100 characters'),

  description: yup
    .string()
    .optional()
    .max(1000, 'Description must not exceed 1000 characters'),

  format: yup
    .string()
    .required('Data format is required')
    .oneOf(['csv', 'json', 'parquet', 'xlsx'], 'Invalid data format'),

  size: yup
    .number()
    .required('Dataset size is required')
    .positive('Dataset size must be positive')
    .max(10000000, 'Dataset size cannot exceed 10MB'),

  features: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one feature is required')
    .max(1000, 'Maximum 1000 features allowed'),
})

export const deploymentValidationSchema = yup.object({
  name: yup
    .string()
    .required('Deployment name is required')
    .min(3, 'Deployment name must be at least 3 characters')
    .max(50, 'Deployment name must not exceed 50 characters'),

  modelId: yup
    .string()
    .required('Model selection is required'),

  environment: yup
    .string()
    .required('Environment is required')
    .oneOf(['development', 'staging', 'production'], 'Invalid environment'),

  instances: yup
    .number()
    .required('Number of instances is required')
    .integer('Instances must be a whole number')
    .min(1, 'At least 1 instance is required')
    .max(10, 'Maximum 10 instances allowed'),

  memoryLimit: yup
    .number()
    .required('Memory limit is required')
    .positive('Memory limit must be positive')
    .max(8192, 'Memory limit cannot exceed 8GB'),

  cpuLimit: yup
    .number()
    .required('CPU limit is required')
    .positive('CPU limit must be positive')
    .max(4, 'CPU limit cannot exceed 4 cores'),
})

// Generic form validation hook
export function useFormValidation<TFieldValues extends FieldValues = FieldValues>() {
  const validateField = useCallback(
    async <TFieldName extends FieldPath<TFieldValues>>(
      schema: yup.ObjectSchema<any>,
      fieldName: TFieldName,
      value: any,
      setError: UseFormSetError<TFieldValues>
    ) => {
      try {
        // Validate specific field
        await schema.validateAt(fieldName as string, { [fieldName]: value })
        // Clear error if validation passes
        setError(fieldName, { message: undefined })
        return true
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          setError(fieldName, {
            type: 'validation',
            message: error.message
          })
        }
        return false
      }
    },
    []
  )

  const validateForm = useCallback(
    async (
      schema: yup.ObjectSchema<any>,
      data: TFieldValues,
      setError: UseFormSetError<TFieldValues>
    ) => {
      try {
        await schema.validate(data, { abortEarly: false })
        return true
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          // Set all validation errors
          error.inner.forEach((err) => {
            if (err.path) {
              setError(err.path as FieldPath<TFieldValues>, {
                type: 'validation',
                message: err.message,
              })
            }
          })
        }
        return false
      }
    },
    []
  )

  const clearErrors = useCallback(
    (
      fields: FieldPath<TFieldValues>[],
      setError: UseFormSetError<TFieldValues>
    ) => {
      fields.forEach(field => {
        setError(field, { message: undefined })
      })
    },
    []
  )

  return {
    validateField,
    validateForm,
    clearErrors,
  }
}

// Specific validation hooks for common forms
export function useModelFormValidation() {
  const { validateField, validateForm, clearErrors } = useFormValidation()

  return {
    schema: modelValidationSchema,
    validateField,
    validateForm,
    clearErrors,
  }
}

export function useDatasetFormValidation() {
  const { validateField, validateForm, clearErrors } = useFormValidation()

  return {
    schema: datasetValidationSchema,
    validateField,
    validateForm,
    clearErrors,
  }
}

export function useDeploymentFormValidation() {
  const { validateField, validateForm, clearErrors } = useFormValidation()

  return {
    schema: deploymentValidationSchema,
    validateField,
    validateForm,
    clearErrors,
  }
}

// Helper functions for form handling
export const getFormDefaultValues = {
  model: () => ({
    name: '',
    type: '',
    algorithm: '',
    description: '',
    tags: [],
    framework: 'phantom-ml-core',
  }),

  dataset: () => ({
    name: '',
    description: '',
    format: 'csv',
    size: 0,
    features: [],
  }),

  deployment: () => ({
    name: '',
    modelId: '',
    environment: 'development',
    instances: 1,
    memoryLimit: 512,
    cpuLimit: 1,
  }),
}

// Form submission helper
export function createFormSubmissionHandler<T extends FieldValues>(_onSubmit: (data: T) => Promise<void> | void,
  onError?: (_error: unknown) => void
) {
  return async (_data: T) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
      onError?.(error)
    }
  }
}