import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { handleApiError, generateRequestId, ErrorContext } from '../utils/error';
import { logger } from '../utils/logger';
import { contactEnrichSchema, ContactEnrichParams } from '../schemas';

export const contactEnrichHandler = async (params: ContactEnrichParams): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'contactEnrich',
    operation: 'contact_enrich',
    inputParams: {
      requestId: params.requestId,
      contactCount: params.contactIds?.length,
      revealEmails: params.revealEmails,
      revealPhones: params.revealPhones
    }
  };

  try {
    logger.info('Starting contact enrich request', { 
      requestId,
      toolName: 'contactEnrich',
      inputParams: params 
    });
    
    const validatedParams = contactEnrichSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'contactEnrich' });
    
    const client = createLushaClient();
    context.apiEndpoint = '/prospecting/contact/enrich';
    
    logger.debug('Making contact enrich API request', { 
      requestId,
      toolName: 'contactEnrich',
      endpoint: context.apiEndpoint,
      contactCount: validatedParams.contactIds.length
    });
    
    const response = await client.post(context.apiEndpoint, validatedParams);
    
    logger.info('Contact enrich completed successfully', { 
      requestId,
      toolName: 'contactEnrich',
      responseStatus: response.status,
      enrichedContacts: response.data?.contacts?.length || 0
    });
    
    return {
      type: "success",
      data: {
        ...response.data,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('Contact enrich failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'contactEnrich'
    });
    return handleApiError(error, context);
  }
}; 