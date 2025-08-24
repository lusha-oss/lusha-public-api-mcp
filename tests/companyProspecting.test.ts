import { companyProspectingHandler } from '../src/tools/companyProspecting';
import { CompanyProspectingParams } from '../src/schemas';
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

describe('companyProspecting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('company search functionality', () => {
    test('should successfully search companies with domain filters', async () => {
      // Arrange
      const params: CompanyProspectingParams = {
        filters: {
          companies: {
            include: {
              domains: ['microsoft.com', 'google.com'],
              naicsCodes: ['511210', '541511']
            }
          }
        },
        pages: {
          page: 0,
          size: 10
        }
      };

      const mockSearchResponse = {
        status: 200,
        data: {
          requestId: 'mock-request-id',
          currentPage: 0,
          pageLength: 2,
          totalResults: 2,
          data: [
            { id: '1035', name: 'Microsoft', hasCompanyRevenue: true, hasCompanyMainIndustry: true },
            { id: '1441', name: 'Google', hasCompanyRevenue: false, hasCompanyMainIndustry: true }
          ],
          billing: {
            resultsReturned: 2,
            creditsCharged: 2
          }
        }
      };

      mockClient.post.mockResolvedValueOnce(mockSearchResponse);

      // Act
      const result = await companyProspectingHandler(params);

      // Assert
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.requestId).toBeDefined();
        expect(typeof result.data.requestId).toBe('string');
        expect(result.data.data).toHaveLength(2);
        expect(result.data.credits_used).toBe(0);
        expect(result.data.search_only).toBe(true);
      }
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/prospecting/company/search', {
        filters: {
          companies: params.filters.companies
        },
        pages: { page: 0, size: 10 }
      });
    });

    test('should handle search API failure', async () => {
      // Arrange
      const params: CompanyProspectingParams = {
        filters: {
          companies: {
            include: {
              names: ['NonExistentCompany']
            }
          }
        }
      };

      const apiError = new Error('API Error: Invalid request');
      mockClient.post.mockRejectedValueOnce(apiError);

      // Act
      const result = await companyProspectingHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error).toBeDefined();
      }
      expect(mockClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('advanced filtering', () => {
    test('should successfully handle complex include/exclude filters', async () => {
      // Arrange
      const params: CompanyProspectingParams = {
        filters: {
          companies: {
            include: {
              technologies: ['React', 'Node.js'],
              sizes: [{ min: 100, max: 500 }],
              locations: [{ country: 'United States' }]
            },
            exclude: {
              domains: ['excluded.com'],
              sics: ['1234']
            }
          }
        },
        pages: {
          page: 1,
          size: 20
        }
      };

      const mockSearchResponse = {
        status: 200,
        data: {
          requestId: 'complex-request-id',
          currentPage: 1,
          pageLength: 2,
          totalResults: 50,
          data: [
            { id: '101', name: 'Tech Corp', hasCompanyRevenue: true, hasCompanyMainIndustry: true },
            { id: '102', name: 'Dev Studio', hasCompanyRevenue: false, hasCompanyMainIndustry: true }
          ],
          billing: {
            resultsReturned: 2,
            creditsCharged: 2
          }
        }
      };

      mockClient.post.mockResolvedValueOnce(mockSearchResponse);

      // Act
      const result = await companyProspectingHandler(params);

      // Assert
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data.data).toHaveLength(2);
        expect(result.data.currentPage).toBe(1);
        expect(result.data.totalResults).toBe(50);
      }
      expect(mockClient.post).toHaveBeenCalledWith('/prospecting/company/search', {
        filters: {
          companies: {
            include: {
              technologies: ['React', 'Node.js'],
              sizes: [{ min: 100, max: 500 }],
              locations: [{ country: 'United States' }]
            },
            exclude: {
              domains: ['excluded.com'],
              sics: ['1234']
            }
          }
        },
        pages: { page: 1, size: 20 }
      });
    });

    test('should use default pagination when not provided', async () => {
      // Arrange
      const params: CompanyProspectingParams = {
        filters: {
          companies: {
            include: {
              naics: ['511210']
            }
          }
        }
      };

      const mockResponse = {
        status: 200,
        data: { 
          requestId: 'default-page-test', 
          currentPage: 0,
          pageLength: 0,
          totalResults: 0,
          data: [],
          billing: {
            resultsReturned: 0,
            creditsCharged: 0
          }
        }
      };

      mockClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await companyProspectingHandler(params);

      // Assert
      expect(result.type).toBe('success');
      expect(mockClient.post).toHaveBeenCalledWith('/prospecting/company/search', {
        filters: {
          companies: params.filters.companies
        },
        pages: { page: 0, size: 10 } // Default pagination
      });
    });
  });

  describe('input validation', () => {
    test('should reject invalid input with no filters', async () => {
      // Arrange
      const params = {
        filters: {}
      } as any;

      // Act
      const result = await companyProspectingHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Required');
        expect(result.error.status).toBe(400);
      }
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    test('should reject empty include and exclude filters', async () => {
      // Arrange
      const params = {
        filters: {
          companies: null
        }
      } as any;

      // Act
      const result = await companyProspectingHandler(params);

      // Assert
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.error.message).toContain('Expected object');
        expect(result.error.status).toBe(400);
      }
      expect(mockClient.post).not.toHaveBeenCalled();
    });
  });
}); 