import { companyBulkLookupHandler } from '../../tools/companyLookup';
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

describe('companyBulkLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful company lookup', async () => {
    const mockResponse = {
      data: {
        "company-1": {
          name: "Tech Corp",
          domain: "techcorp.com",
          industry: "Software",
          size: "1000-5000",
          revenue: "$100M-$500M",
          location: {
            country: "United States",
            state: "California"
          }
        }
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await companyBulkLookupHandler({
      companies: [
        {
          id: "company-1",
          name: "Tech Corp",
          domain: "techcorp.com"
        }
      ]
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data["company-1"]).toBeDefined();
      expect(result.data["company-1"].name).toBe('Tech Corp');
      expect(result.data["company-1"].domain).toBe('techcorp.com');
    }
    expect(mockClient.post).toHaveBeenCalledWith(
      '/v2/company',
      expect.objectContaining({
        companies: expect.arrayContaining([
          expect.objectContaining({
            id: "company-1",
            name: "Tech Corp",
            domain: "techcorp.com"
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

    const result = await companyBulkLookupHandler({
      companies: [
        {
          id: "company-1",
          name: "Tech Corp"
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

  it('should handle empty companies array', async () => {
    const result = await companyBulkLookupHandler({
      companies: []
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Companies array cannot be empty');
    }
  });

  it('should handle too many companies', async () => {
    // Create array with 101 companies (exceeding max of 100)
    const tooManyCompanies = Array.from({ length: 101 }, (_, i) => ({
      id: `company-${i}`,
      name: `Company ${i}`
    }));

    const result = await companyBulkLookupHandler({
      companies: tooManyCompanies
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Companies array cannot exceed 100 items');
    }
  });

  it('should handle missing required fields', async () => {
    const result = await companyBulkLookupHandler({
      companies: [
        {
          id: "company-1"
          // Missing all lookup fields (name, domain, fqdn)
        }
      ]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Each company must have at least one of: name, domain, fqdn, or companyId');
    }
  });

  it('should handle lookup by different identifiers', async () => {
    const mockResponse = {
      data: {
        "by-name": { name: "Tech Corp" },
        "by-domain": { domain: "techcorp.com" },
        "by-fqdn": { fqdn: "www.techcorp.com" }
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await companyBulkLookupHandler({
      companies: [
        { id: "by-name", name: "Tech Corp" },
        { id: "by-domain", domain: "techcorp.com" },
        { id: "by-fqdn", fqdn: "www.techcorp.com" }
      ]
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data["by-name"]).toBeDefined();
      expect(result.data["by-domain"]).toBeDefined();
      expect(result.data["by-fqdn"]).toBeDefined();
    }
  });

  it('should handle metadata filtering', async () => {
    const mockResponse = {
      data: {
        "company-1": {
          name: "Tech Corp",
          domain: "techcorp.com",
          filteredField: "value"
        }
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await companyBulkLookupHandler({
      companies: [
        { id: "company-1", name: "Tech Corp" }
      ],
      metadata: {
        filterBy: "someField"
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data["company-1"]).toBeDefined();
      expect(result.data["company-1"].filteredField).toBe('value');
    }
  });
});