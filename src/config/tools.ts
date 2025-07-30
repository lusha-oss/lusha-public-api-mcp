import { personBulkLookupHandler } from '../tools/personBulkLookup';
import { companyBulkLookupHandler } from '../tools/companyLookup';
import { contactSearchHandler } from '../tools/contactSearch';
import { contactEnrichHandler } from '../tools/contactEnrich';
import { contactFiltersHandler } from '../tools/contactFilters';
import { personBulkLookupSchema, companyBulkLookupSchema, contactSearchSchema, contactEnrichSchema, contactFiltersSchema } from '../schemas';
import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
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
        - The requestId parameter MUST be the exact UUID received from the contactSearch response
        - MCP sets page size to 25 by default (API's default is 20 if not specified)
        - Page/offset index starts from 0
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
        - use contactFilters tool to get the requirement filters for the contact search"
        - revealEmails and revealPhones parameters are only available to customers on the Unified Credits pricing plan
        - Attempting to use these parameters on other plans will result in a 403 Unauthorized error
        - When neither parameter is used, the API returns both email addresses and phone numbers if available
        - Credits are charged for enrichment`,
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
  }
];
