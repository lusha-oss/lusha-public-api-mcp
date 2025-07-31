import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { 
  handleApiError, 
  generateRequestId,
  ErrorContext
} from '../utils/error';
import { logger } from '../utils/logger';
import { 
  companyFiltersSchema, 
  CompanyFiltersParams 
} from '../schemas';

/**
 * Handler for companyFilters tool
 * Get available filter options for company prospecting using Lusha's Filters API.
 * 
 * FEATURES:
 * - Retrieve all available filter types (sizes, revenues, industries, etc.)
 * - No credit usage - metadata retrieval only
 * 
 * AVAILABLE FILTERS:
 * - industries: Industry classifications with main and sub-industries
 * - sizes: Available company size ranges
 * - revenues: Available revenue ranges
 * - sics: Standard Industrial Classification codes
 * - naics: North American Industry Classification System codes
 * - intentTopics: Available intent topics
 * 
 * Aligned with Lusha API documentation: https://docs.lusha.com/apis/openapi/company-filters
 */
export const companyFiltersHandler = async (params: CompanyFiltersParams): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'companyFilters',
    operation: 'get_all_filter_options',
    inputParams: params
  };

  try {
    logger.info('Starting company filters request', { 
      requestId,
      toolName: 'companyFilters',
      inputParams: params 
    });
    
    const validatedParams = companyFiltersSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'companyFilters' });
    
    const client = createLushaClient();
    
    // Map filter types to their corresponding API endpoints
    const endpointMap: Record<string, string> = {
      sizes: '/prospecting/filters/companies/sizes',
      revenues: '/prospecting/filters/companies/revenues',
      industries: '/prospecting/filters/companies/industries_labels',
      sics: '/prospecting/filters/companies/sics',
      naics: '/prospecting/filters/companies/naics',
      intentTopics: '/prospecting/filters/companies/intent_topics'
    };

    const filterType = validatedParams.filterType || 'sizes';
    const endpoint = endpointMap[filterType];
    
    logger.debug('Making company filter API request', { 
      requestId,
      toolName: 'companyFilters',
      filterType,
      endpoint
    });
    
    const response = await client.get(endpoint);
    
    logger.info('Company filters request completed successfully', { 
      requestId,
      toolName: 'companyFilters',
      filterType,
      responseStatus: response.status,
      resultCount: Array.isArray(response.data) ? response.data.length : 'N/A'
    });

    return {
      type: "success",
      data: {
        filterType,
        results: response.data,
        timestamp: new Date().toISOString(),
        credits_used: 0
      }
    };
    
  } catch (error) {
    logger.error('Company filters request failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'companyFilters'
    });
    return handleApiError(error, context);
  }
};