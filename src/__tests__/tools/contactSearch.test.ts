import { contactSearchHandler } from '../../tools/contactSearch';
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

describe('contactSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle basic search successfully', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 0,
        pageLength: 25,
        totalResults: 100,
        data: [
          {
            name: "John Doe",
            contactId: "123",
            jobTitle: "Marketing Manager",
            companyName: "Test Company"
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      filters: {
        contacts: {
          include: {
            departments: ["Marketing"]
          }
        }
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].name).toBe('John Doe');
      expect(result.data.currentPage).toBe(0);
      expect(result.data.pageLength).toBe(25);
    }
    expect(mockClient.post).toHaveBeenCalledWith(
      '/prospecting/contact/search',
      expect.objectContaining({
        filters: expect.any(Object)
      })
    );
  });

  it('should handle API errors', async () => {
    const mockError = new LushaAPIError('API Error', 500);
    
    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockRejectedValueOnce(mockError);

    const result = await contactSearchHandler({
      filters: {
        contacts: {
          include: {
            departments: ["Marketing"]
          }
        }
      }
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.message).toBe('API Error');
      expect(result.error.status).toBe(500);
    }
  });

  it('should handle validation errors', async () => {
    const result = await contactSearchHandler({
      filters: {
        contacts: {
          include: {
            seniority: ['invalid'] // seniority should be numbers, not strings
          }
        }
      }
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
    }
  });

  it('should handle contact filters with multiple criteria', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 0,
        pageLength: 25,
        totalResults: 50,
        data: [
          {
            name: "Jane Smith",
            contactId: "456",
            jobTitle: "Marketing Director",
            companyName: "Tech Corp"
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      filters: {
        contacts: {
          include: {
            departments: ["Marketing"],
            seniority: [5], // manager level
            existing_data_points: ["email", "phone"],
            locations: [
              {
                country: "United States",
                state: "California"
              }
            ]
          }
        }
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].name).toBe('Jane Smith');
      expect(result.data.totalResults).toBe(50);
    }
  });

  it('should handle company filters', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 0,
        pageLength: 25,
        totalResults: 30,
        data: [
          {
            name: "Bob Johnson",
            contactId: "789",
            jobTitle: "Sales Manager",
            companyName: "Tech Solutions Inc"
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      filters: {
        companies: {
          include: {
            names: ["Tech Solutions"],
            technologies: ["React", "Node.js"],
            mainIndustriesIds: ["software"],
            sizes: [{ min: 50, max: 200 }],
            locations: [{ country: "United States" }]
          }
        }
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].name).toBe('Bob Johnson');
      expect(result.data.totalResults).toBe(30);
    }
  });

  it('should handle combined contact and company filters', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 0,
        pageLength: 25,
        totalResults: 10,
        data: [
          {
            name: "Alice Brown",
            contactId: "101",
            jobTitle: "Marketing Manager",
            companyName: "Tech Innovators"
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      filters: {
        contacts: {
          include: {
            departments: ["Marketing"],
            seniority: [5]
          }
        },
        companies: {
          include: {
            sizes: [{ min: 100, max: 500 }],
            mainIndustriesIds: ["technology"],
            technologies: ["AWS"]
          }
        }
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].name).toBe('Alice Brown');
      expect(result.data.totalResults).toBe(10);
    }
  });

  it('should handle pagination using pages', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 2,
        pageLength: 15,
        totalResults: 45,
        data: [
          {
            name: "David Wilson",
            contactId: "202",
            jobTitle: "Sales Director",
            companyName: "Tech Corp"
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      pages: {
        page: 2,
        size: 15
      },
      filters: {
        contacts: {
          include: {
            departments: ["Sales"]
          }
        }
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.currentPage).toBe(2);
      expect(result.data.pageLength).toBe(15);
      expect(result.data.totalResults).toBe(45);
      expect(result.data.data).toHaveLength(1);
    }
  });

  it('should handle pagination using offset', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 1,
        pageLength: 20,
        totalResults: 60,
        data: [
          {
            name: "Sarah Lee",
            contactId: "303",
            jobTitle: "Product Manager",
            companyName: "Tech Solutions"
          }
        ]
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      offset: {
        index: 20,
        size: 20
      },
      filters: {
        contacts: {
          include: {
            departments: ["Product"]
          }
        }
      }
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.pageLength).toBe(20);
      expect(result.data.totalResults).toBe(60);
      expect(result.data.data).toHaveLength(1);
    }
  });

  it('should handle invalid pagination parameters', async () => {
    const result = await contactSearchHandler({
      pages: {
        page: -1, // Invalid: page must be >= 0
        size: 5   // Invalid: size must be >= 10
      },
      filters: {}
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
    }
  });

  it('should handle empty filters', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        currentPage: 0,
        pageLength: 25,
        totalResults: 0,
        data: []
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactSearchHandler({
      filters: {}
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.data).toHaveLength(0);
      expect(result.data.totalResults).toBe(0);
    }
  });
});