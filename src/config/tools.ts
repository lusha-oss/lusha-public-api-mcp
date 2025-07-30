import { personBulkLookupHandler } from '../tools/personBulkLookup';
import { companyBulkLookupHandler } from '../tools/companyLookup';
import { contactSearchHandler } from '../tools/contactSearch';
import { contactEnrichHandler } from '../tools/contactEnrich';
import { personBulkLookupSchema, companyBulkLookupSchema, contactSearchSchema, contactEnrichSchema } from '../schemas';
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
        IMPORTANT: No credits are charged for searches. Credits are only charged during enrichment.
        The search supports filtering by:
        1. Contact properties (departments, seniority, existing data points, locations)
        2. Company properties (names, locations, technologies, industries, sizes, revenues, etc.)
        Pagination is supported through either 'pages' or 'offset' parameters.`,
    schema: contactSearchSchema,
    handler: contactSearchHandler
  },
  {
    name: "contactEnrich",
    description: `Enrich contacts from search results. This is step 3 of the prospecting process.
        IMPORTANT: 
        - revealEmails and revealPhones parameters are only available to customers on the Unified Credits pricing plan
        - Attempting to use these parameters on other plans will result in a 403 Unauthorized error
        - When neither parameter is used, the API returns both email addresses and phone numbers if available
        - Credits are charged for enrichment`,
    schema: contactEnrichSchema,
    handler: contactEnrichHandler
  }
];
