import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { 
  handleApiError, 
  generateRequestId,
  ErrorContext
} from '../utils/error';
import { logger } from '../utils/logger';
import { 
  companyProspectingSchema, 
  CompanyProspectingParams 
} from '../schemas';

/**
 * Handler for companyProspecting tool
 * Search for companies using Lusha's Prospecting API - Company Search only.
 * This tool implements company search without enrichment to avoid credit usage.
 * 
 * FEATURES:
 * - Filter by company attributes (domains, industries, locations, technologies, etc.)
 * - Pagination support for large result sets
 * - No credit usage - search only, no enrichment
 * 
 * Aligned with Lusha API documentation: https://docs.lusha.com/apis/openapi/company-search-and-enrich/searchprospectingcompanies
 */
export const companyProspectingHandler = async (params: CompanyProspectingParams): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'companyProspecting',
    operation: 'company_search_only',
    inputParams: { 
      pages: params.pages,
      filtersProvided: params.filters?.companies ? Object.keys(params.filters.companies).length : 0
    }
  };

  try {
    logger.info('Starting company search request', { 
      requestId,
      toolName: 'companyProspecting',
      pages: params.pages,
      filtersCount: params.filters?.companies ? Object.keys(params.filters.companies).length : 0,
      inputParams: params 
    });
    
    const validatedParams = companyProspectingSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'companyProspecting' });
    
    const client = createLushaClient();
    
    // Build search payload matching the exact API structure from documentation
    const searchPayload = {
      filters: {
        companies: validatedParams.filters.companies
      },
      pages: validatedParams.pages || { page: 0, size: 10 }
    };
    
    context.apiEndpoint = '/prospecting/company/search';
    logger.debug('Making company search API request', { 
      requestId,
      toolName: 'companyProspecting',
      endpoint: context.apiEndpoint,
      pages: searchPayload.pages
    });
    
    const searchResponse = await client.post('/prospecting/company/search', searchPayload);
    
    logger.info('Company search completed successfully', { 
      requestId,
      toolName: 'companyProspecting',
      responseStatus: searchResponse.status,
      totalResults: searchResponse.data?.totalResults || 0,
      currentPage: searchResponse.data?.currentPage || 0,
      companiesFound: searchResponse.data?.companies?.length || 0
    });

    return {
      type: "success",
      data: {
        ...searchResponse.data,
        timestamp: new Date().toISOString(),
        credits_used: searchResponse.data.billing.creditsCharged
      }
    };
    
  } catch (error) {
    logger.error('Company search failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'companyProspecting'
    });
    return handleApiError(error, context);
  }
}; 