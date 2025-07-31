import { companyEnrichHandler } from '../src/tools/companyEnrich';
import { CompanyEnrichParams } from '../src/schemas';
import { createLushaClient } from '../src/utils/api';
import { logger } from '../src/utils/logger';

// Mock dependencies
jest.mock('../src/utils/api');
jest.mock('../src/utils/logger');

const mockClient = {
  post: jest.fn()
};

(createLushaClient as jest.Mock).mockReturnValue(mockClient);
(logger.info as jest.Mock) = jest.fn();
(logger.debug as jest.Mock) = jest.fn();
(logger.error as jest.Mock) = jest.fn();
(logger.warn as jest.Mock) = jest.fn();

describe('companyEnrich', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('company enrichment functionality', () => {
    test('should successfully enrich companies with valid request ID and company IDs', async () => {
      // Arrange
      const params: CompanyEnrichParams = {
        requestId: 'test-request-id-123',
        companiesIds: ['1035', '1441']
      };

      const mockEnrichResponse = {
        status: 200,
        data: {
          requestId: 'test-request-id-123',
          companies: [
            {
              id: '1035',
              name: 'Microsoft Corporation',
              domain: 'microsoft.com',
              location: 'Redmond, WA, United States',
              employees: 221000,
              revenue: 198000000000,
              industry: 'Software',
              founded: 1975
            },
            {
              id: '1441',
              name: 'Google LLC',
              domain: 'google.com',
              location: 'Mountain View, CA, United States',
              employees: 156500,
              revenue: 307394000000,
              industry: 'Internet',
              founded: 1998
            }
          ]
        }
      };

      mockClient.post.mockResolvedValueOnce(mockEnrichResponse);

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.requestId).toBe('test-request-id-123');
        expect(result.data.companies).toHaveLength(2);
        expect(result.data.enriched_count).toBe(2);
        expect(result.data.credits_used).toBe(2);
        expect(result.data.companies[0]).toHaveProperty('name', 'Microsoft Corporation');
        expect(result.data.companies[1]).toHaveProperty('name', 'Google LLC');
      }
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/prospecting/company/enrich', {
        requestId: 'test-request-id-123',
        companiesIds: ['1035', '1441']
      });
    });

    test('should handle API failure during enrichment', async () => {
      // Arrange
      const params: CompanyEnrichParams = {
        requestId: 'invalid-request-id',
        companiesIds: ['9999']
      };

      const apiError = new Error('API Error: Request ID not found');
      mockClient.post.mockRejectedValueOnce(apiError);

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Company enrich failed');
        expect(result.error.status).toBe(500);
      }
      expect(mockClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('input validation', () => {
    test('should reject request with empty requestId', async () => {
      // Arrange
      const params = {
        requestId: '',
        companiesIds: ['1035']
      } as any;

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Request ID is required');
        expect(result.error.status).toBe(400);
      }
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    test('should reject request with empty company IDs array', async () => {
      // Arrange
      const params = {
        requestId: 'valid-request-id',
        companiesIds: []
      } as any;

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('At least one company ID is required');
        expect(result.error.status).toBe(400);
      }
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    test('should reject request with more than 100 company IDs', async () => {
      // Arrange
      const params = {
        requestId: 'valid-request-id',
        companiesIds: Array.from({ length: 101 }, (_, i) => `company-${i}`)
      } as any;

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Cannot enrich more than 100 companies at once');
        expect(result.error.status).toBe(400);
      }
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    test('should reject request with missing requestId', async () => {
      // Arrange
      const params = {
        companiesIds: ['1035']
      } as any;

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Required');
        expect(result.error.status).toBe(400);
      }
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle successful request with no enriched companies', async () => {
      // Arrange
      const params: CompanyEnrichParams = {
        requestId: 'empty-result-request',
        companiesIds: ['nonexistent']
      };

      const mockResponse = {
        status: 200,
        data: {
          requestId: 'empty-result-request',
          companies: []
        }
      };

      mockClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.companies).toHaveLength(0);
        expect(result.data.enriched_count).toBe(0);
        expect(result.data.credits_used).toBe(0);
      }
    });

    test('should handle non-200 status response from API', async () => {
      // Arrange
      const params: CompanyEnrichParams = {
        requestId: 'rate-limited-request',
        companiesIds: ['1035']
      };

      const mockResponse = {
        status: 429,
        statusText: 'Too Many Requests',
        data: { error: 'Rate limit exceeded' }
      };

      mockClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await companyEnrichHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Lusha API error');
        expect(result.error.status).toBe(429);
      }
    });
  });
}); 