import { personBulkLookupHandler } from '../../tools/personBulkLookup';
import { LushaAPIError } from '../../utils/error';

// Mock the API client and calls
jest.mock('../../utils/api', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockClient = {
    get: mockGet,
    post: mockPost
  };
  return {
    createLushaClient: jest.fn(() => mockClient)
  };
});

describe('personBulkLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful person lookup', async () => {
    const mockResponse = {
      data: {
        results: [
          {
            contactId: "contact-1",
            fullName: "John Doe",
            email: "john@example.com",
            companies: [
              {
                name: "Tech Corp",
                domain: "techcorp.com",
                isCurrent: true,
                jobTitle: "Software Engineer"
              }
            ]
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await personBulkLookupHandler({
      contacts: [
        {
          contactId: "contact-1",
          email: "john@example.com"
        }
      ]
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].fullName).toBe('John Doe');
      expect(result.data.results[0].companies[0].name).toBe('Tech Corp');
    }
    expect(mockClient.post).toHaveBeenCalledWith(
      '/v2/person',
      expect.objectContaining({
        contacts: expect.arrayContaining([
          expect.objectContaining({
            contactId: "contact-1",
            email: "john@example.com"
          })
        ])
      })
    );
  });

  it('should handle API errors', async () => {
    const mockError = new LushaAPIError('API Error', 500);
    
    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockRejectedValueOnce(mockError);

    const result = await personBulkLookupHandler({
      contacts: [
        {
          contactId: "contact-1",
          email: "john@example.com"
        }
      ]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.message).toBe('API Error');
      expect(result.error.status).toBe(500);
    }
  });

  it('should handle empty contacts array', async () => {
    const result = await personBulkLookupHandler({
      contacts: []
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Contacts array cannot be empty');
    }
  });

  it('should handle too many contacts', async () => {
    // Create array with 101 contacts (exceeding max of 100)
    const tooManyContacts = Array.from({ length: 101 }, (_, i) => ({
      contactId: `contact-${i}`,
      email: `contact${i}@example.com`
    }));

    const result = await personBulkLookupHandler({
      contacts: tooManyContacts
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Contacts array cannot exceed 100 items');
    }
  });

  it('should handle missing required fields', async () => {
    const result = await personBulkLookupHandler({
      contacts: [
        {
          contactId: "contact-1"
          // Missing all lookup fields (email, linkedinUrl, fullName+company)
        }
      ]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Contact must have one of: (1) email, (2) linkedinUrl, or (3) fullName + company (name or domain)');
    }
  });

  it('should handle lookup by different identifiers', async () => {
    const mockResponse = {
      data: {
        results: [
          {
            contactId: "by-email",
            email: "john@example.com"
          },
          {
            contactId: "by-linkedin",
            linkedinUrl: "https://www.linkedin.com/in/johndoe"
          },
          {
            contactId: "by-name-company",
            fullName: "John Doe",
            companies: [
              {
                name: "Tech Corp",
                domain: "techcorp.com",
                isCurrent: true
              }
            ]
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await personBulkLookupHandler({
      contacts: [
        {
          contactId: "by-email",
          email: "john@example.com"
        },
        {
          contactId: "by-linkedin",
          linkedinUrl: "https://www.linkedin.com/in/johndoe"
        },
        {
          contactId: "by-name-company",
          fullName: "John Doe",
          companies: [
            {
              name: "Tech Corp",
              domain: "techcorp.com",
              isCurrent: true
            }
          ]
        }
      ]
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.results).toHaveLength(3);
      expect(result.data.results.find(r => r.contactId === "by-email")).toBeDefined();
      expect(result.data.results.find(r => r.contactId === "by-linkedin")).toBeDefined();
      expect(result.data.results.find(r => r.contactId === "by-name-company")).toBeDefined();
    }
  });

  it('should validate email format', async () => {
    const result = await personBulkLookupHandler({
      contacts: [
        {
          contactId: "contact-1",
          email: "invalid-email" // Invalid email format
        }
      ]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Invalid email format');
    }
  });

  it('should validate LinkedIn URL format', async () => {
    const result = await personBulkLookupHandler({
      contacts: [
        {
          contactId: "contact-1",
          linkedinUrl: "https://other-site.com/profile" // Invalid LinkedIn URL
        }
      ]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('LinkedIn URL must be from linkedin.com domain');
    }
  });
});