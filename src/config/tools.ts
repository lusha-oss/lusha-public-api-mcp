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
        
        **Important**: No credits are charged for searches. Credits are only charged during enrichment.
        
        AVAILABLE FILTERS:
        
        LOCATIONS:
        - Usage: filters.companies.include.locations = [{ country: "United States" }]
        - Examples: "United States", "California", "New York", "London", "Germany"
        
        TECHNOLOGIES:
        - Usage: filters.companies.include.technologies = ["React", "Python"]
        - Examples: "React", "Python", "AWS", "Salesforce", "Microsoft", "Docker"
        
        INDUSTRIES:
        - Usage: Use companyFilters tool with filterType='industries' for complete list
        - Examples: "Technology", "Healthcare", "Finance", "Manufacturing", "Education"
        
        COMPANY SIZES (employee count):
        - Usage: filters.companies.include.sizes = [{ min: 11, max: 50 }]
        - Examples: {min: 1, max: 10}, {min: 11, max: 50}, {min: 51, max: 200}, {min: 201, max: 500}
        
        REVENUES (annual USD):
        - Usage: filters.companies.include.revenues = [{ min: 1000000, max: 10000000 }]
        - Examples: {min: 1M, max: 10M}, {min: 10M, max: 100M}
        
        DOMAINS:
        - Usage: filters.companies.include.domains = ["microsoft.com"]
        - Examples: "microsoft.com", "google.com", "amazon.com"
        
        NAICS CODES:
        - Usage: filters.companies.include.naics = ["511210", "541511"]
        - Use companyFilters tool with filterType='naics' for complete list
        
        SEARCH TIPS:
        - Use broader filters if you get 0 results (e.g., country instead of city)
        - Combine multiple filter types for precise targeting
        - Use exclude filters to remove unwanted results
        - Use the companyFilters tool to discover all available filter values
        
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
  },
  {
    name: "prospectingContact",
    description: `Search for contacts using various filters. This is step 2 of the prospecting process.
        
        **Important**: No credits are charged for searches. Credits are only charged during enrichment.
        
        AVAILABLE FILTERS:
        
        CONTACT PROPERTIES:
        - departments: ["Engineering & Technical", "Marketing"]
        - seniority: ["Director", "Manager"] (use contactFilters to get available levels)
        - existing_data_points: ["phone", "work_email", "mobile_phone"] (use contactFilters for options)
        - locations: [{ continent: "North America", country: "United States", city: "New York", state: "New York", country_grouping: "na" }]
        
        COMPANY PROPERTIES:
        - names: ["Apple", "Microsoft"] (company names)
        - locations: [{ country: "United States" }] (company headquarters)
        - technologies: ["Salesforce", "Amazon Web Services"] (tech stack used)
        - mainIndustriesIds: [4, 5] (main industry sectors)
        - subIndustriesIds: [101] (sub-industry categories)
        - intentTopics: ["Digital Sales"] (company intent signals)
        - sizes: [{ min: 100, max: 1000 }] (employee count ranges)
        - revenues: [{ min: 10000000, max: 100000000 }] (revenue ranges)
        - sicsCodes: ["1011", "1021"] (Standard Industrial Classification codes)
        - naicsCodes: ["11", "21"] (North American Industry Classification codes)
        
        PAGINATION:
        - Use 'pages' parameter: { page: 0, size: 20 }
        - Default page size is 20 if not specified
        - Page index starts from 0
        
        SEARCH TIPS:
        - Use contactFilters tool to discover all available filter values
        - Combine contact and company filters for precise targeting
        - Use broader filters if you get 0 results
        - Both include and exclude filters are supported
        
        Based on: https://docs.lusha.com/apis/openapi/contact-search-and-enrich/searchprospectingcontacts`,
    schema: contactSearchSchema,
    handler: contactSearchHandler
  },
  {
    name: "contactEnrich",
    description: `Enrich contacts from search results. This is step 3 of the prospecting process.
        
        REQUIREMENTS:
        - requestId: The requestId generated in the Prospecting Search response (UUID)
        - contactIds: Array containing the contact IDs for enrichment (Min 1, max 100)
        
        **Important Notice - Unified Credits Plan Required**
        
        | Parameter                     | Requirement                                                                                              |
        | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
        | revealEmails and revealPhones | Only available to customers on the **Unified Credits** pricing plan                                      |
        | Plan Restriction              | Attempting to use these parameters on other plans will result in a **403 Unauthorized** error            |
        | Default Behavior              | When neither parameter is used, the API returns **both email addresses and phone numbers**, if available |
        
        USAGE:
        - Set revealEmails=true to retrieve only the email address of the contact
        - Set revealPhones=true to retrieve only the phone number of the contact
        - Credits are charged for enrichment
        
        Based on: https://docs.lusha.com/apis/openapi/contact-search-and-enrich/enrichprospectingcontacts`,
    schema: contactEnrichSchema,
    handler: contactEnrichHandler
  },
  {
    name: "contactFilters",
    description: `Available filters for contact searches.
        
        AVAILABLE FILTER TYPES:
        - departments: List of available departments
        - seniority: List of available seniority levels  
        - existing_data_points: List of available data points
        - all_countries: List of available countries
        - locations: Search for geographic locations (requires locationSearchText parameter)
        
        USAGE:
        - No credits are charged for filter requests
        - Use this tool to explore available options before building search queries
        - For 'locations' filter type, you must provide locationSearchText parameter
        
        Based on: https://docs.lusha.com/apis/openapi/contact-search-and-enrich/searchprospectingcontacts`,
    schema: contactFiltersSchema,
    handler: contactFiltersHandler
  }
];
