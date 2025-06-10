// Type definitions for Lusha API parameters and responses

export interface PersonLookupParams {
  linkedinUrl?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyDomain?: string;
}

export interface CompanyLookupHandlerParams {
  name?: string;
  domain?: string;
  fqdn?: string;
}

export type HandlerParams = PersonLookupParams;

export interface ErrorResponse {
  message: string;
  status: number;
  code?: string;
  category?: string;
  severity?: string;
  requestId?: string;
  timestamp?: string;
  retryAfter?: number;
}

export type ToolResponse = 
  | { type: "success"; data: Record<string, any> }
  | { type: "error"; error: ErrorResponse }; 