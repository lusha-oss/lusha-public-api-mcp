import { z } from "zod";

const isValidLinkedInUrl = (url: string): boolean => {
  try {
    const { host } = new URL(url);
    const allowedHosts = ['linkedin.com', 'www.linkedin.com'];
    return allowedHosts.includes(host);
  } catch {
    return false;
  }
};

const personLookupSchema = z.object({
  linkedinUrl: z.string().url().optional().describe("LinkedIn profile URL"),
  email: z.string().email().optional().describe("Email address of the person"),
  firstName: z.string().optional().describe("First name of the person"),
  lastName: z.string().optional().describe("Last name of the person"),
  companyName: z.string().optional().describe("Company name where the person works"),
  companyDomain: z.string().optional().describe("Company domain where the person works"),
});

const companyLookupBaseSchema = z.object({
  name: z.string().optional().describe("Company name"),
  domain: z.string().optional().describe("Company domain"),
  fqdn: z.string().optional().describe("Fully qualified domain name of the company"),
});

export const companyLookupSchema = companyLookupBaseSchema.refine((company) => {
  const hasName = company.name && company.name.trim();
  const hasDomain = company.domain && company.domain.trim();
  const hasFqdn = company.fqdn && company.fqdn.trim();

  return hasName || hasDomain || hasFqdn;
}, {
  message: "Company must have at least one of: name, domain, or fqdn"
});

const companySchema = z.object({
  name: z.string().optional().describe("Company name"),
  domain: z.string().optional().describe("Company domain"),
  isCurrent: z.boolean().describe("Is this the person's current company?"),
  jobTitle: z.string().optional().describe("Job title at the company"),
  fqdn: z.string().optional().describe("Fully qualified domain name of the company"),
  companySocialId: z.string().optional().describe("Company social ID")
});

const bulkContactSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required").describe("Unique ID for the contact in the request"),
  fullName: z.string().optional().describe("Full name of the person"),
  email: z.string().optional().refine(
    (email) => !email || email.trim() === '' || z.string().email().safeParse(email).success,
    "Invalid email format"
  ).describe("Email address of the person"),
  linkedinUrl: z.string().url("Invalid URL format").refine(
    isValidLinkedInUrl,
    "LinkedIn URL must be from linkedin.com domain"
  ).optional().describe("LinkedIn profile URL"),
  companies: z.array(companySchema).optional().describe("Companies where the person works or worked"),
  location: z.string().optional().describe("Raw location of the person")
}).refine((contact) => {
  // Custom validation: must have one of email, linkedinUrl, or (fullName + company)
  const hasEmail = contact.email && contact.email.trim();
  const hasLinkedInUrl = contact.linkedinUrl && contact.linkedinUrl.trim();
  const hasFullName = contact.fullName && contact.fullName.trim();
  const hasCompany = contact.companies && contact.companies.length > 0 && 
    contact.companies.some(company => 
      (company.name && company.name.trim()) || 
      (company.domain && company.domain.trim())
    );

  const hasValidEmail = hasEmail;
  const hasValidLinkedIn = hasLinkedInUrl;
  const hasNameAndCompany = hasFullName && hasCompany;

  return hasValidEmail || hasValidLinkedIn || hasNameAndCompany;
}, {
  message: "Contact must have one of: (1) email, (2) linkedinUrl, or (3) fullName + company (name or domain)"
});

export const personBulkLookupSchema = z.object({
  contacts: z.array(z.object({
    contactId: z.string().min(1, "Contact ID is required"),
    fullName: z.string().optional(),
    email: z.string().optional().refine(
      (email) => !email || email.trim() === '' || z.string().email().safeParse(email).success,
      "Invalid email format"
    ),
    linkedinUrl: z.string().url("Invalid URL format").refine(
      isValidLinkedInUrl,
      "LinkedIn URL must be from linkedin.com domain"
    ).optional(),
    companies: z.array(z.object({
      name: z.string().optional(),
      domain: z.string().optional(),
      isCurrent: z.boolean(),
      jobTitle: z.string().optional(),
      fqdn: z.string().optional(),
      companySocialId: z.string().optional()
    })).optional(),
    location: z.string().optional()
  }))
  .min(1, "Contacts array cannot be empty")
  .max(100, "Contacts array cannot exceed 100 items"),
  metadata: z.object({
    filterBy: z.string().optional(),
    revealEmails: z.boolean().optional(),
    revealPhones: z.boolean().optional()
  }).optional()
});

export const companyBulkLookupSchema = z.object({
  companies: z.array(z.object({
    id: z.string().min(1, "Company ID is required").describe("Unique ID for the company in the request"),
    name: z.string().optional().describe("Company name"),
    domain: z.string().optional().describe("Company domain"),
    fqdn: z.string().optional().describe("Fully qualified domain name of the company"),
    companyId: z.string().optional().describe("A unique identifier for a Lusha company")
  }).refine((company) => {
    const hasName = company.name && company.name.trim();
    const hasDomain = company.domain && company.domain.trim();
    const hasFqdn = company.fqdn && company.fqdn.trim();
    const hasCompanyId = company.companyId && company.companyId.trim();

    return hasName || hasDomain || hasFqdn || hasCompanyId;
  }, {
    message: "Each company must have at least one of: name, domain, fqdn, or companyId"
  }))
  .min(1, "Companies array cannot be empty")
  .max(100, "Companies array cannot exceed 100 items"),
  metadata: z.object({
    filterBy: z.string().optional()
  }).optional()
});

export {
  personLookupSchema,
  bulkContactSchema,
  companySchema,
  companyLookupBaseSchema
};

export type PersonLookupParams = z.infer<typeof personLookupSchema>;
export type BulkContact = z.infer<typeof bulkContactSchema>;
export type Company = z.infer<typeof companySchema>;
export type PersonBulkLookupParams = z.infer<typeof personBulkLookupSchema>;
export type CompanyBulkLookupParams = z.infer<typeof companyBulkLookupSchema>;