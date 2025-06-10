import { ToolResponse } from "../types";
import { logger } from "./logger";
import { ValidationError } from "./validations";
import { ZodError } from "zod";

// Custom error classes for better error categorization
export class LushaAPIError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'LushaAPIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class RateLimitError extends Error {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Enhanced error context interface
export interface ErrorContext {
  requestId?: string;
  toolName?: string;
  operation?: string;
  userId?: string;
  timestamp?: string;
  inputParams?: any;
  apiEndpoint?: string;
  [key: string]: any;
}

// Error classification function
export const classifyError = (error: any): string => {
  if (error instanceof ConfigurationError) return 'configuration';
  if (error instanceof ValidationError) return 'validation';
  if (error instanceof ZodError) return 'validation';
  if (error instanceof RateLimitError) return 'rate_limit';
  
  if (error instanceof LushaAPIError) {
    if (error.status >= 500) return 'api_server_error';
    if (error.status === 429) return 'rate_limit';
    if (error.status === 403) return 'access_forbidden';
    if (error.status >= 400) return 'api_client_error';
  }
  
  return 'unknown';
};

// Helper function to parse API error messages
const parseApiErrorMessage = (errorData: any): string => {
  if (!errorData) return "API request failed";
  
  // Handle string message
  if (typeof errorData.message === 'string') {
    return errorData.message;
  }
  
  // Handle array of messages
  if (Array.isArray(errorData.message)) {
    return errorData.message.join('; ');
  }
  
  // Handle nested message structure
  if (errorData.message && Array.isArray(errorData.message)) {
    return errorData.message.join('; ');
  }
  
  // Fallback to first available message-like property
  return errorData.error || errorData.detail || "API request failed";
};

// Helper function to format Zod error messages
const formatZodError = (zodError: ZodError): string => {
  const issues = zodError.issues.map(issue => {
    const path = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
    return `${issue.message}${path}`;
  });
  
  return issues.join('; ');
};

export const handleApiError = (error: any, context: ErrorContext = {}): ToolResponse => {
  const requestId = context.requestId || generateRequestId();
  
  try {
    let processedError: Error;
    let status = 500;
    let message = "Unknown error occurred";

    if (error.isAxiosError) {
      status = error.response?.status || error.response?.data?.statusCode || 500;
      message = parseApiErrorMessage(error.response?.data) || "API request failed";

      processedError = status === 429 
        ? new RateLimitError(message, error.response?.headers?.['retry-after'] ? parseInt(error.response.headers['retry-after']) : undefined)
        : new LushaAPIError(message, status);
        
    } else if (error instanceof ZodError) {
      status = 400;
      message = formatZodError(error);
      processedError = new ValidationError(message, 'validation', error.issues);
    } else {
      processedError = error;
      status = (error as any).status || 500;
      message = error.message || "Unknown error occurred";
    }

    const category = classifyError(processedError);
    
    logger.error(`Error in ${context.operation || 'operation'}`, {
      ...context,
      requestId,
      errorCategory: category,
      httpStatus: status,
      error: processedError.message,
      stack: processedError.stack
    });

    const errorResponse: any = {
      message,
      status,
      code: (processedError as any).code,
      category,
      requestId,
      timestamp: new Date().toISOString()
    };

    if (processedError instanceof RateLimitError) {
      errorResponse.retryAfter = processedError.retryAfter;
    }

    return {
      type: "error",
      error: errorResponse
    };

  } catch (handlingError) {
    const fallbackRequestId = requestId || generateRequestId();
    logger.error('Error handler itself failed', { 
      requestId: fallbackRequestId,
      originalError: error?.message || 'Unknown original error',
      error: (handlingError as Error).message,
      stack: (handlingError as Error).stack
    });
    
    return {
      type: "error",
      error: {
        message: "Internal error handling failure",
        status: 500,
        category: 'internal',
        requestId: fallbackRequestId,
        timestamp: new Date().toISOString()
      }
    };
  }
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

 