import { contactFiltersHandler } from '../../tools/contactFilters';
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

describe('contactFilters', () => {
  it('should handle departments filter type', async () => {
    const mockResponse = {
      data: {
        "0": "Business Development",
        "1": "Marketing"
      },
      status: 200
    };

    // Import the mocked client
    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.get.mockResolvedValueOnce(mockResponse);

    const result = await contactFiltersHandler({
      filterType: 'departments'
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data).toBeDefined();
    }
    expect(mockClient.get).toHaveBeenCalledWith(
      '/prospecting/filters/contacts/departments'
    );
  });

  it('should handle API errors', async () => {
    const mockError = new LushaAPIError('API Error', 500);
    
    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.get.mockRejectedValueOnce(mockError);

    const result = await contactFiltersHandler({
      filterType: 'departments'
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.message).toBe('API Error');
      expect(result.error.status).toBe(500);
    }
  });

  it('should handle validation errors for invalid filter type', async () => {
    const result = await contactFiltersHandler({
      filterType: 'locations' as any,
      locationSearchText: 'New York'
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Invalid enum value');
    }
  });
});