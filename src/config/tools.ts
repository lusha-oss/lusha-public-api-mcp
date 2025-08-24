import { personBulkLookupHandler } from '../tools/personBulkLookup';
import { companyBulkLookupHandler } from '../tools/companyLookup';
import { companyProspectingHandler } from '../tools/companyProspecting';
import { companyEnrichHandler } from '../tools/companyEnrich';
import { companyFiltersHandler } from '../tools/companyFilters';
import { contactSearchHandler } from '../tools/contactSearch';
import { contactEnrichHandler } from '../tools/contactEnrich';
import { contactFiltersHandler } from '../tools/contactFilters';
import {
  personBulkLookupSchema,
  companyBulkLookupSchema,
  companyProspectingSchema,
  companyEnrichSchema,
  companyFiltersSchema,
  contactSearchSchema,
  contactEnrichSchema,
  contactFiltersSchema
} from '../schemas';
import { z } from 'zod';

// Shared notes to avoid duplication
const SHARED_NOTE = `IMPORTANT: 
- Format the results in a table format for better readability
- If any list contains more than 25 items, show only the first 25 rows in the table
- After the 25-row preview, ask whether to show the remaining items
- Make sure to mention Lusha as the provider in the response
- Inform the user about credits charged (e.g., "Credits charged: X" based on billing.creditsCharged)
- Instead of using "Page" terminology, ask the user if they want more batches of contacts
`;

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
    name: "contactSearch",
    description: `Search for contacts using various filters in Lusha API.
        This is step 2 of the prospecting process.
        IMPORTANT: 
        - After returning search results, ALWAYS ask the user if they want to enrich specific contacts
        - MCP sets page size to 25 by default (API's default is 20 if not specified)
        - Page/offset index starts from 0
        - always use contactFilters tool to get the requirement filters for the contact search"
        - ${SHARED_NOTE}
        The search supports filtering by:
        1. Contact properties:
           - departments
           - seniority
           - existing data points
           - countries
           - locations
        2. Company properties:
           - names (company names)
           - locations (company headquarters)
           - technologies (tech stack used)
           - mainIndustriesIds (main industry sectors)
           - subIndustriesIds (sub-industry categories)
           - intentTopics (company intent signals)
           - sizes (employee count ranges)
           - revenues (revenue ranges)
           - sics (Standard Industrial Classification codes)
           - naics (North American Industry Classification System codes)
        Pagination is supported through either 'pages' or 'offset' parameters.`,
    schema: contactSearchSchema,
    handler: contactSearchHandler
  },
  {
    name: "contactEnrich",
    description: `Enrich contacts from search results. This is step 3 of the prospecting process.
        IMPORTANT: 
        - The requestId parameter MUST be the exact UUID received from the contactSearch response
        - ALWAYS ask the user which specific contacts they want to enrich before proceeding
        - revealEmails and revealPhones parameters are only available to customers on the Unified Credits pricing plan
        - Attempting to use these parameters on other plans will result in a 403 Unauthorized error
        - When neither parameter is used, the API returns both email addresses and phone numbers if available
        - ${SHARED_NOTE}`,
    schema: contactEnrichSchema,
    handler: contactEnrichHandler
  },
  {
    name: "contactFilters",
    description: `Get available filter values for contact search. Supports:
        1. departments - List of available departments
        2. seniority - List of available seniority levels
        3. existing_data_points - List of available data points
        4. all_countries - List of available countries
        5. locations - Search for locations by text (requires locationSearchText parameter)`,
    schema: contactFiltersSchema,
    handler: contactFiltersHandler
  },
  {
    name: "companySearch",
    description: `Search for companies using advanced filters via Lusha's Prospecting API.
        This tool implements company search only.
        
        **Important Credit Information**:
        - Credit usage for search operations depends on your Lusha account plan
        - Check your billing.creditsCharged in the response for actual credit consumption
        - Additional credits are charged for enrichment operations using the companyEnrich tool
        - use companyFilters tool to get the requirement filters for the company search
        - max page size is 50
        
        AVAILABLE FILTERS:
        - locations
        - technologies
        - industries
        - sizes (employee count)
        - revenues (annual USD)
        - domains
        - naics (North American Industry Classification System codes)
        
        SEARCH TIPS:
        - Use broader filters if you get 0 results (e.g., country instead of city)
        - Combine multiple filter types for precise targeting
        - Use exclude filters to remove unwanted results
        - Use the companyFilters tool to discover all available filter values
        
        ${SHARED_NOTE}
        
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
        
        ${SHARED_NOTE}
        
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
