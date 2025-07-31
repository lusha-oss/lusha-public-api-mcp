import { CompanyEnrichParams, companyEnrichSchema } from '../schemas';
import { createLushaClient } from '../utils/api';
import { logger } from '../utils/logger';
import { generateRequestId } from '../utils/error';
import { ToolResponse } from '../types';

export async function companyEnrichHandler(params: any): Promise<ToolResponse> {
  const requestId = generateRequestId();
  
  try {
    logger.info('Company enrich request started', { requestId, params });
    
    // Validate input parameters
    const validationResult = companyEnrichSchema.safeParse(params);
    if (!validationResult.success) {
      const errorMessage = `Validation failed: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      logger.warn('Company enrich validation failed', { requestId, error: errorMessage, params });
      
      return {
        type: 'error',
        error: {
          message: errorMessage,
          status: 400
        }
      };
    }

    const validatedParams: CompanyEnrichParams = validationResult.data;
    
    logger.debug('Calling Lusha company enrich API', { 
      requestId, 
      lushaRequestId: validatedParams.requestId,
      companyCount: validatedParams.companiesIds.length 
    });

    // Create Lusha API client and make the request
    const client = createLushaClient();
    const response = await client.post('/prospecting/company/enrich', {
      requestId: validatedParams.requestId,
      companiesIds: validatedParams.companiesIds
    });

    if (response.status !== 200 && response.status !== 201) {
      logger.error('Lusha API returned non-200 status', { 
        requestId, 
        status: response.status, 
        statusText: response.statusText,
        data: response.data 
      });
      
      return {
        type: 'error',
        error: {
          message: `Lusha API error: ${response.statusText}`,
          status: response.status
        }
      };
    }

    const enrichData = response.data;
    logger.info('Company enrich completed successfully', { 
      requestId,
      lushaRequestId: validatedParams.requestId,
      companiesEnriched: enrichData.companies?.length || 0
    });

    return {
      type: 'success',
      data: {
        requestId: enrichData.requestId,
        companies: enrichData.companies || [],
        enriched_count: enrichData.companies?.length || 0,
        credits_used: enrichData.companies?.length || 0 // Credits are charged per enriched company
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Company enrich failed', { 
      error: errorMessage, 
      stack: (error as Error).stack,
      requestId,
      params
    });

    return {
      type: 'error',
      error: {
        message: `Company enrich failed: ${errorMessage}`,
        status: 500
      }
    };
  }
} 