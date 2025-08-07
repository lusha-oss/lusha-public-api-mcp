import { personBulkLookupHandler } from '../tools/personBulkLookup';
import { companyBulkLookupHandler } from '../tools/companyLookup';
import { companyProspectingHandler } from '../tools/companyProspecting';
import { companyEnrichHandler } from '../tools/companyEnrich';
import { companyFiltersHandler } from '../tools/companyFilters';
import { personBulkLookupSchema, companyBulkLookupSchema, companyProspectingSchema, companyEnrichSchema, companyFiltersSchema } from '../schemas';
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
    description: `Search for companies using advanced filters. Returns basic company info only - does NOT auto-enrich.
        Ask user before enriching results (costs credits).
        
        FILTERS:
        - locations: [{ country: "United States" }] - countries, states, cities
        - technologies: ["React", "Python", "AWS"] - tech stack used
        - industries: ["Technology", "Healthcare"] - use companyFilters for full list
        - sizes: [{ min: 11, max: 50 }] - employee count ranges
        - revenues: [{ min: 1000000, max: 10000000 }] - annual USD
        - domains: ["microsoft.com"] - company websites
        - naics: ["511210", "541511"] - industry classification codes
        
        TIPS: Use broader filters if no results. Combine filters for precision. Use companyFilters to see available values.
        
        Based on: https://docs.lusha.com/apis/openapi/company-search-and-enrich/searchprospectingcompanies`,
    schema: companyProspectingSchema,
    handler: companyProspectingHandler
  },
  {
    name: "companyEnrich",
    description: `Get detailed company information from search results. WARNING: CHARGES CREDITS - always ask user first!
        
        REQUIREMENTS:
        - requestId: from prospectingCompany search response
        - companiesIds: array of company IDs (max 50)
        - User explicit consent required
        
        One credit charged per company enriched. Use only when user requests detailed information.
        
        Based on: https://docs.lusha.com/apis/openapi/company-search-and-enrich/enrichprospectingcompanies`,
    schema: companyEnrichSchema,
    handler: companyEnrichHandler
  },
  {
    name: "companyFilters",
    description: `Get available filter options for company prospecting. No credits charged.
        
        FILTER TYPES:
        - names, industries, sizes, revenues, sics, naics, intentTopics
        - locations, technologies (require searchText parameter)
        
        Use to explore available filter values before building prospecting queries.
        
        Based on: https://docs.lusha.com/apis/openapi/company-filters`,
    schema: companyFiltersSchema,
    handler: companyFiltersHandler
  }
];
