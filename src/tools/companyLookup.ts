import { ToolResponse } from '../types';
import { createLushaClient } from '../utils/api';
import { 
  handleApiError, 
  generateRequestId,
  ErrorContext
} from '../utils/error';
import { logger } from '../utils/logger';
import { 
  companyBulkLookupSchema, 
  CompanyBulkLookupParams 
} from '../schemas';

/**
 * Handler for companyBulkLookup tool
 * Fetches multiple companies data from Lusha API
 * Required parameters: array of companies with name OR domain OR fqdn for each company
 */
export const companyBulkLookupHandler = async (params: CompanyBulkLookupParams): Promise<ToolResponse> => {
  const requestId = generateRequestId();
  
  const context: ErrorContext = {
    requestId,
    toolName: 'companyBulkLookup',
    operation: 'bulk_company_lookup',
    inputParams: { companyCount: params.companies?.length, metadata: params.metadata }
  };

  try {
    logger.info('Starting bulk company lookup request', { 
      requestId,
      toolName: 'companyBulkLookup',
      companyCount: params.companies?.length,
      inputParams: params 
    });
    
    const validatedParams = companyBulkLookupSchema.parse(params);
    logger.debug('Input validation passed', { requestId, toolName: 'companyBulkLookup' });
    
    const client = createLushaClient();
    context.apiEndpoint = '/v2/company';
    
    logger.debug('Making bulk company API request', { 
      requestId,
      toolName: 'companyBulkLookup',
      companyCount: validatedParams.companies.length,
      endpoint: context.apiEndpoint
    });

    const companiesForApi = validatedParams.companies.map(company => ({
      id: company.id,
      name: company.name,
      domain: company.domain,
      fqdn: company.fqdn,
      companyId: company.companyId
    }));
    
    const response = await client.post('/v2/company', {
      companies: companiesForApi
    });
    
    logger.info('Bulk company lookup completed successfully', { 
      requestId,
      toolName: 'companyBulkLookup',
      responseStatus: response.status,
      processedCompanies: Object.keys(response.data || {}).length
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
    logger.error('Bulk company lookup failed', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId,
      toolName: 'companyBulkLookup'
    });
    return handleApiError(error, context);
  }
}; 