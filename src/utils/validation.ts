/**
 * Validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate SSN format (XXX-XX-XXXX)
 */
export function validateSSN(ssn: string): ValidationResult {
  if (!ssn || ssn.trim() === '') {
    return { isValid: false, error: 'SSN is required' };
  }

  const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
  if (!ssnPattern.test(ssn.trim())) {
    return { isValid: false, error: 'SSN must be in format XXX-XX-XXXX' };
  }

  return { isValid: true };
}

/**
 * Validate first name
 */
export function validateFirstName(firstName: string): ValidationResult {
  if (!firstName || firstName.trim() === '') {
    return { isValid: false, error: 'First name is required' };
  }

  if (firstName.trim().length < 2) {
    return { isValid: false, error: 'First name must be at least 2 characters' };
  }

  if (firstName.trim().length > 50) {
    return { isValid: false, error: 'First name must be less than 50 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (!namePattern.test(firstName.trim())) {
    return { isValid: false, error: 'First name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
}

/**
 * Validate last name
 */
export function validateLastName(lastName: string): ValidationResult {
  if (!lastName || lastName.trim() === '') {
    return { isValid: false, error: 'Last name is required' };
  }

  if (lastName.trim().length < 2) {
    return { isValid: false, error: 'Last name must be at least 2 characters' };
  }

  if (lastName.trim().length > 50) {
    return { isValid: false, error: 'Last name must be less than 50 characters' };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (!namePattern.test(lastName.trim())) {
    return { isValid: false, error: 'Last name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

/**
 * Validate employee number
 */
export function validateEmployeeNo(employeeNo: string): ValidationResult {
  if (!employeeNo || employeeNo.trim() === '') {
    return { isValid: false, error: 'Employee number is required' };
  }

  if (employeeNo.trim().length < 1) {
    return { isValid: false, error: 'Employee number cannot be empty' };
  }

  if (employeeNo.trim().length > 20) {
    return { isValid: false, error: 'Employee number must be less than 20 characters' };
  }

  // Allow alphanumeric characters, hyphens, and underscores
  const employeeNoPattern = /^[a-zA-Z0-9_-]+$/;
  if (!employeeNoPattern.test(employeeNo.trim())) {
    return { isValid: false, error: 'Employee number can only contain letters, numbers, hyphens, and underscores' };
  }

  return { isValid: true };
}

/**
 * Format SSN input (auto-format as user types)
 */
export function formatSSN(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format as XXX-XX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  }
}
