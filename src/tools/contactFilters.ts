import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { handleApiError, generateRequestId, ErrorContext } from '../utils/error';
import { logger } from '../utils/logger';
import { contactFiltersSchema, ContactFiltersParams } from '../schemas';

export const contactFiltersHandler = async (params: ContactFiltersParams): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'contactFilters',
    operation: 'get_contact_filters',
    inputParams: params
  };

  try {
    logger.info('Starting contact filters request', { 
      requestId,
      toolName: 'contactFilters',
      inputParams: params 
    });
    
    const validatedParams = contactFiltersSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'contactFilters' });
    
    const client = createLushaClient();

    let endpoint = '';
    let method = 'GET';
    let data = undefined;

    switch (validatedParams.filterType) {
      case 'departments':
        endpoint = '/prospecting/filters/contacts/departments';
        break;
      case 'seniority':
        endpoint = '/prospecting/filters/contacts/seniority';
        break;
      case 'existing_data_points':
        endpoint = '/prospecting/filters/contacts/existing_data_points';
        break;
      case 'all_countries':
        endpoint = '/prospecting/filters/contacts/all_countries';
        break;
      default:
        if (validatedParams.locationSearchText) {
          endpoint = '/prospecting/filters/contacts/locations';
          method = 'POST';
          data = { text: validatedParams.locationSearchText };
        }
    }

    context.apiEndpoint = endpoint;
    
    logger.debug('Making contact filters API request', { 
      requestId,
      toolName: 'contactFilters',
      endpoint: context.apiEndpoint,
      method
    });
    
    const response = method === 'GET' 
      ? await client.get(endpoint)
      : await client.post(endpoint, data);
    
    logger.info('Contact filters request completed successfully', { 
      requestId,
      toolName: 'contactFilters',
      responseStatus: response.status
    });
    
    return {
      type: "success",
      data: {
        ...response.data,
        requestId,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('Contact filters request failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'contactFilters'
    });
    return handleApiError(error, context);
  }
}; 