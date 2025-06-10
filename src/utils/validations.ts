/**
 * Utility validation functions
 * 
 * This module contains reusable validation functions for common data types
 * and business logic validation rules.
 */

export class ValidationError extends Error {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Validates that a value is not null, undefined, or empty string
 * @param value - The value to validate
 * @param fieldName - The name of the field being validated
 * @throws ValidationError if the value is missing
 */
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName, value);
  }
};

/**
 * Validates email format using a simple regex
 * @param email - The email address to validate
 * @throws ValidationError if the email format is invalid
 */
export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', 'email', email);
  }
};

/**
 * Validates URL format using the URL constructor
 * @param url - The URL to validate
 * @param fieldName - The name of the field being validated (default: 'url')
 * @throws ValidationError if the URL format is invalid
 */
export const validateUrl = (url: string, fieldName: string = 'url'): void => {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`Invalid URL format for ${fieldName}`, fieldName, url);
  }
};

/**
 * Validates that a string is not empty after trimming whitespace
 * @param value - The string to validate
 * @param fieldName - The name of the field being validated
 * @throws ValidationError if the string is empty or only whitespace
 */
export const validateNonEmptyString = (value: string, fieldName: string): void => {
  if (!value || !value.trim()) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName, value);
  }
};

/**
 * Validates that an array is not empty
 * @param array - The array to validate
 * @param fieldName - The name of the field being validated
 * @throws ValidationError if the array is empty
 */
export const validateNonEmptyArray = (array: any[], fieldName: string): void => {
  if (!Array.isArray(array) || array.length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty array`, fieldName, array);
  }
};

/**
 * Validates that a number is within a specified range
 * @param value - The number to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param fieldName - The name of the field being validated
 * @throws ValidationError if the number is outside the range
 */
export const validateNumberRange = (value: number, min: number, max: number, fieldName: string): void => {
  if (typeof value !== 'number' || value < min || value > max) {
    throw new ValidationError(`${fieldName} must be a number between ${min} and ${max}`, fieldName, value);
  }
};

/**
 * Validates that a LinkedIn URL is from the linkedin.com domain
 * @param url - The LinkedIn URL to validate
 * @throws ValidationError if the URL is not from linkedin.com
 */
export const validateLinkedInUrl = (url: string): void => {
  validateUrl(url, 'linkedinUrl');
  if (!url.includes('linkedin.com')) {
    throw new ValidationError('LinkedIn URL must be from linkedin.com domain', 'linkedinUrl', url);
  }
}; 