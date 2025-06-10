import axios, { AxiosInstance } from 'axios';
import { getLushaApiKey, getLushaBaseUrl } from '../config';
import { ConfigurationError } from './error';
import { logger } from './logger';

/**
 * Create a configured Axios client for Lusha API
 */
export const createLushaClient = (): AxiosInstance => {
  const key = getLushaApiKey();
  const baseURL = getLushaBaseUrl();
  
  if (!key) {
    throw new ConfigurationError('No API key provided. Set LUSHA_API_KEY environment variable.');
  }

  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      "API_KEY": key,
      'Content-Type': 'application/json',
      'User-Agent': 'lusha-mcp/1.0.0'
    }
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (config) => {
      logger.debug('Making API request', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        timeout: config.timeout
      });
      return config;
    },
    (error) => {
      logger.error('Request interceptor error', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging and error handling
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const context = {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText
      };

      if (error.response) {
        logger.warn('API request failed with response', context, {
          responseData: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        logger.error('API request failed without response', undefined, context, {
          request: error.request
        });
      } else {
        logger.error('API request setup failed', error, context);
      }

      return Promise.reject(error);
    }
  );

  return client;
};
