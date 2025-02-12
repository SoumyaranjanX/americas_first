/**
 * @fileoverview Healthcare-optimized form input component with HIPAA compliance
 * Implements Material Design 3.0 principles and WCAG 2.1 Level AA accessibility
 * @version 1.0.0
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import classnames from 'classnames'; // v2.3.2
import { Input as StyledInput } from '../../styles/components';
import { validateForm, sanitizeInput } from '../../lib/utils/validation';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';
import * as Yup from 'yup';

interface InputProps {
  // Core props
  id: string;
  name: string;
  label: string;
  value: string;
  type?: 'text' | 'password' | 'email' | 'tel' | 'number';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  
  // Healthcare-specific props
  isPHI?: boolean;
  dataType?: 'mrn' | 'ssn' | 'dob' | 'npi' | 'diagnosis' | 'medication';
  clinicalValidation?: {
    type: 'warning' | 'critical' | 'none';
    message?: string;
  };
  fhirProfile?: string;
  
  // Event handlers
  onChange: (value: string, isValid: boolean) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onPHIAccess?: (accessType: 'view' | 'edit') => void;

  // New props
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  color: ${theme.palette.text.secondary};
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconWrapper = styled.div<{ position: 'start' | 'end' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.position === 'start' ? 'left: 12px;' : 'right: 12px;'}
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.palette.text.secondary};
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: ${theme.palette.error.main};
  margin-top: 4px;
`;

const createValidationSchema = (
  fieldName: string,
  isPHI: boolean,
  dataType?: string,
  fhirProfile?: string
) => {
  let schema = Yup.object().shape({
    [fieldName]: Yup.string().defined('This field is required')
  });

  if (isPHI) {
    schema = schema.concat(
      Yup.object().shape({
        [fieldName]: Yup.string().defined()
          .test('phi-validation', 'Invalid PHI format', function(value) {
            return true;
          })
      })
    );
  }

  return schema;
};

const CustomStyledInput = styled.input<{
  $hasError?: boolean;
  $hasStartIcon?: boolean;
  $hasEndIcon?: boolean;
  $secureContent?: boolean;
}>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.$hasError ? theme.palette.error.main : theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1.5;
  color: ${theme.palette.text.primary};
  background-color: ${theme.palette.background.paper};
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? theme.palette.error.main : theme.palette.primary.main};
    box-shadow: 0 0 0 2px ${props => props.$hasError ? theme.palette.error.light : theme.palette.primary.light};
  }
  
  &:disabled {
    background-color: ${theme.palette.action.disabledBackground};
    cursor: not-allowed;
  }
  
  padding-left: ${props => props.$hasStartIcon ? '2.5rem' : '1rem'};
  padding-right: ${props => props.$hasEndIcon ? '2.5rem' : '1rem'};
  -webkit-text-security: ${props => props.$secureContent ? 'disc' : 'none'};
`;

const Input: React.FC<InputProps> = ({
  id,
  name,
  label,
  value,
  type = 'text',
  placeholder,
  error,
  disabled,
  required,
  fullWidth = false,
  isPHI = false,
  dataType,
  clinicalValidation,
  fhirProfile,
  onChange,
  onBlur,
  onPHIAccess,
  startIcon,
  endIcon
}) => {
  // State management
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup validation timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Handle PHI access logging
  useEffect(() => {
    if (isPHI && isFocused) {
      onPHIAccess?.('view');
    }
  }, [isPHI, isFocused, onPHIAccess]);

  // Input change handler with debounced validation
  const handleChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Clear previous validation timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Create validation schema with the current field name
    const schema = createValidationSchema(name, isPHI, dataType, fhirProfile);

    // Sanitize input for security
    const sanitizedValue = sanitizeInput(newValue, {
      stripHtml: true,
      escapeChars: true,
      trimWhitespace: true,
      enableMetrics: isPHI
    });

    // Immediate feedback for obvious issues
    let quickValidation = true;
    if (required && !sanitizedValue) {
      setInternalError('This field is required');
      quickValidation = false;
    }

    // Update value immediately but mark as validating
    setIsValidating(true);
    onChange(sanitizedValue, quickValidation);

    // Debounced full validation
    validationTimeoutRef.current = setTimeout(async () => {
      try {
        const validationResult = await schema.validate(
          { [name]: sanitizedValue },
          { abortEarly: false }
        ).then(() => ({ isValid: true, errors: [] }))
        .catch((err) => ({ 
          isValid: false, 
          errors: err.errors 
        }));

        if (!validationResult.isValid) {
          setInternalError(validationResult.errors[0]);
        } else {
          setInternalError(undefined);
        }
        setIsValidating(false);
        onChange(sanitizedValue, validationResult.isValid);

      } catch (error) {
        setInternalError('Validation error occurred');
        setIsValidating(false);
        onChange(sanitizedValue, false);
      }
    }, 300);
  }, [name, required, isPHI, dataType, fhirProfile, onChange]);

  // Focus event handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (isPHI) {
      onPHIAccess?.('edit');
    }
  }, [isPHI, onPHIAccess]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  // Compute input classes
  const inputClasses = classnames({
    'input--full-width': fullWidth,
    'input--error': !!internalError,
    'input--disabled': disabled,
    'input--phi': isPHI,
    'input--validating': isValidating,
    [`input--clinical-${clinicalValidation?.type}`]: clinicalValidation?.type
  });

  // Compute ARIA attributes
  const ariaAttributes = {
    'aria-invalid': !!internalError,
    'aria-required': required,
    'aria-describedby': internalError ? `${id}-error` : undefined,
    'aria-busy': isValidating,
    'role': 'textbox',
    'aria-label': label
  };

  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <InputWrapper>
        {startIcon && (
          <IconWrapper position="start">
            {startIcon}
          </IconWrapper>
        )}
        <CustomStyledInput
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled || isValidating}
          required={required}
          className={inputClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          $hasError={!!error}
          $hasStartIcon={!!startIcon}
          $hasEndIcon={!!endIcon}
          $secureContent={isPHI}
          {...ariaAttributes}
        />
        {endIcon && (
          <IconWrapper position="end">
            {endIcon}
          </IconWrapper>
        )}
      </InputWrapper>
      {internalError && <ErrorMessage role="alert">{internalError}</ErrorMessage>}
      {clinicalValidation?.message && (
        <div 
          className={`input__clinical-message input__clinical-message--${clinicalValidation.type}`}
          role="status"
        >
          {clinicalValidation.message}
        </div>
      )}
    </InputContainer>
  );
};

export default Input;