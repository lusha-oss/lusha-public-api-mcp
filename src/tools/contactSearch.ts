import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { handleApiError, generateRequestId, ErrorContext } from '../utils/error';
import { logger } from '../utils/logger';
import { contactSearchSchema } from '../schemas';

export const contactSearchHandler = async (params: any): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'contactSearch',
    operation: 'contact_search',
    inputParams: params
  };

  try {
    logger.info('Starting contact search request', { 
      requestId,
      toolName: 'contactSearch',
      inputParams: params 
    });
    
    const validatedParams = contactSearchSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'contactSearch' });
    
    const client = createLushaClient();
    context.apiEndpoint = '/prospecting/contact/search';
    
    logger.debug('Making contact search API request', { 
      requestId,
      toolName: 'contactSearch',
      endpoint: context.apiEndpoint
    });
    
    const response = await client.post(context.apiEndpoint, validatedParams);
    
    logger.info('Contact search completed successfully', { 
      requestId,
      toolName: 'contactSearch',
      responseStatus: response.status
    });
    
    return {
      type: "success",
      data: {
        ...response.data,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('Contact search failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'contactSearch'
    });
    return handleApiError(error, context);
  }
}; 