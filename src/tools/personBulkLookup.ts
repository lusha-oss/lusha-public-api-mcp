import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { 
  handleApiError, 
  generateRequestId,
  ErrorContext
} from '../utils/error';
import { logger } from '../utils/logger';
import { 
  personBulkLookupSchema, 
  PersonBulkLookupParams 
} from '../schemas';

export const personBulkLookupHandler = async (params: PersonBulkLookupParams): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'personBulkLookup',
    operation: 'bulk_person_lookup',
    inputParams: { contactCount: params.contacts?.length, metadata: params.metadata }
  };

  try {
    logger.info('Starting bulk person lookup request', { 
      requestId,
      toolName: 'personBulkLookup',
      contactCount: params.contacts?.length,
      inputParams: params 
    });
    
    const validatedParams = personBulkLookupSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'personBulkLookup' });
    
    const client = createLushaClient();
    context.apiEndpoint = '/v2/person';
    
    logger.debug('Making bulk API request', { 
      requestId,
      toolName: 'personBulkLookup',
      contactCount: validatedParams.contacts.length,
      endpoint: context.apiEndpoint
    });
    
    const response = await client.post('/v2/person', validatedParams);
    
    logger.info('Bulk person lookup completed successfully', { 
      requestId,
      toolName: 'personBulkLookup',
      responseStatus: response.status,
      processedContacts: response.data?.results?.length || 0
    });
    
    return {
      type: "success",
      data: {
        ...response.data,
        requestId,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error: unknown) {
    logger.error('Bulk person lookup failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'personBulkLookup'
    });
    return handleApiError(error, context);
  }
}; 