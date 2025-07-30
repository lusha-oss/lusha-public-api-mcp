import { contactEnrichHandler } from '../../tools/contactEnrich';
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

describe('contactEnrich', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful enrichment', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        contacts: [
          {
            id: "contact-1",
            name: "John Doe",
            emailAddresses: [
              {
                address: "john@example.com",
                type: "work"
              }
            ],
            phoneNumbers: [
              {
                number: "+1234567890",
                phoneType: "mobile"
              }
            ],
            company: {
              name: "Tech Corp",
              domain: "techcorp.com"
            }
          }
        ],
        creditsCharged: 6
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactEnrichHandler({
      requestId: "6bab9f80-7d8d-496f-8790-fd4330fdc69d",
      contactIds: ["contact-1"]
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.contacts).toHaveLength(1);
      expect(result.data.contacts[0].emailAddresses[0].address).toBe('john@example.com');
      expect(result.data.creditsCharged).toBe(6);
    }
    expect(mockClient.post).toHaveBeenCalledWith(
      '/prospecting/contact/enrich',
      expect.objectContaining({
        requestId: expect.any(String),
        contactIds: expect.arrayContaining(['contact-1'])
      })
    );
  });

  it('should handle API errors', async () => {
    const mockError = new LushaAPIError('API Error', 500);
    
    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockRejectedValueOnce(mockError);

    const result = await contactEnrichHandler({
      requestId: "6bab9f80-7d8d-496f-8790-fd4330fdc69d",
      contactIds: ["contact-1"]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.message).toBe('API Error');
      expect(result.error.status).toBe(500);
    }
  });

  it('should handle invalid UUID', async () => {
    const result = await contactEnrichHandler({
      requestId: "invalid-uuid", // Not a valid UUID
      contactIds: ["contact-1"]
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Request ID must be a valid UUID');
    }
  });

  it('should handle empty contact IDs array', async () => {
    const result = await contactEnrichHandler({
      requestId: "6bab9f80-7d8d-496f-8790-fd4330fdc69d",
      contactIds: [] // Empty array
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Contact IDs array cannot be empty');
    }
  });

  it('should handle too many contact IDs', async () => {
    // Create array with 101 contact IDs (exceeding max of 100)
    const tooManyIds = Array.from({ length: 101 }, (_, i) => `contact-${i}`);

    const result = await contactEnrichHandler({
      requestId: "6bab9f80-7d8d-496f-8790-fd4330fdc69d",
      contactIds: tooManyIds
    });

    expect(result.type).toBe('error');
    expect('error' in result).toBe(true);
    if (result.type === 'error') {
      expect(result.error.category).toBe('validation');
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Contact IDs array cannot exceed 100 items');
    }
  });

  it('should handle reveal options', async () => {
    const mockResponse = {
      data: {
        requestId: "mock-request-id",
        contacts: [
          {
            id: "contact-1",
            name: "John Doe",
            emailAddresses: [
              {
                address: "john@example.com",
                type: "work"
              }
            ]
          }
        ],
        creditsCharged: 3
      },
      status: 200
    };

    const { createLushaClient } = require('../../utils/api');
    const mockClient = createLushaClient();
    mockClient.post.mockResolvedValueOnce(mockResponse);

    const result = await contactEnrichHandler({
      requestId: "6bab9f80-7d8d-496f-8790-fd4330fdc69d",
      contactIds: ["contact-1"],
      revealEmails: true,
      revealPhones: false
    });

    expect(result.type).toBe('success');
    expect('data' in result).toBe(true);
    if (result.type === 'success') {
      expect(result.data.contacts).toHaveLength(1);
      expect(result.data.contacts[0].emailAddresses).toBeDefined();
      expect(result.data.creditsCharged).toBe(3);
    }
    expect(mockClient.post).toHaveBeenCalledWith(
      '/prospecting/contact/enrich',
      expect.objectContaining({
        revealEmails: true,
        revealPhones: false
      })
    );
  });
});