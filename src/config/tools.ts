import { personBulkLookupHandler } from '../tools/personBulkLookup';
import { companyBulkLookupHandler } from '../tools/companyLookup';
import { companyProspectingHandler } from '../tools/companyProspecting';
import { companyEnrichHandler } from '../tools/companyEnrich';
import { personBulkLookupSchema, companyBulkLookupSchema, companyProspectingSchema, companyEnrichSchema } from '../schemas';
import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodType<any>;
  handler: (args: any) => Promise<any>;
}

export const tools: ToolDefinition[] = [
  {
    name: "personBulkLookup",
    description: `Look up multiple or single persons information from Lusha API. 
        REQUIREMENTS: Each person body must have a combination of: 
        1. LinkedIn URL, 
        2. full name + company domain/name, or 
        3. email address. 
        IMPORTANT: Only use revealEmails or revealPhones parameters when specifically requested by the user for email-only or phone-only results.`,
    schema: personBulkLookupSchema,
    handler: personBulkLookupHandler
  },
  {
    name: "companyBulkLookup",
    description: `Look up multiple or single companies information from Lusha API.
        REQUIREMENTS: Each company must provide at least one of:
        1. Company name,
        2. Company domain,
        3. Fully qualified domain name (fqdn), or
        4. Lusha companyId.
        Each company must have a unique 'id' field for identification in the response.`,
    schema: companyBulkLookupSchema,
    handler: companyBulkLookupHandler
  },
  {
    name: "prospectingCompany",
    description: `Search for companies using advanced filters via Lusha's Prospecting API.
        This tool implements company search only.
        
        FEATURES:
        - Filter by company attributes (domains, industries, locations, technologies, sizes, revenues, etc.)
        - Support for include/exclude filtering patterns
        - Pagination support for large result sets
        
        FILTERS AVAILABLE:
        - Company domains (e.g., ['microsoft.com', 'google.com'])
        - NAICS codes (e.g., ['511210', '541511'])
        - Company names, locations, technologies, industries
        - Size ranges, revenue ranges, SIC codes
        
        Based on: https://docs.lusha.com/apis/openapi/company-search-and-enrich/searchprospectingcompanies`,
    schema: companyProspectingSchema,
    handler: companyProspectingHandler
  },
  {
    name: "companyEnrich",
    description: `Enrich companies from prospecting search results using Lusha's Prospecting API.
        This is step 3 of the prospecting process where credits are charged.
        
        REQUIREMENTS:
        - requestId: Must be from a previous prospectingCompany search response
        - companiesIds: Array of company IDs from the search results (1-50 companies)
        
        IMPORTANT:
        - Credits are charged at this step - one credit per successfully enriched company
        - Use this after getting search results from the prospectingCompany tool
        - Maximum 50 companies can be enriched in a single request
        - The enriched companies will be returned in the response
        - Should return the credits used for the request
        
        Based on: https://docs.lusha.com/apis/openapi/company-search-and-enrich/enrichprospectingcompanies`,
    schema: companyEnrichSchema,
    handler: companyEnrichHandler
  }
];
