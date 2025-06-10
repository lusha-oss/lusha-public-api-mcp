import { ToolResponse } from '../types';
import { logger } from './logger';
import stringify from 'json-stringify-safe';

export const adaptToolResponseToMCP = (result: ToolResponse, toolName?: string) => {
  if (result.type === "success") {
    return {
      content: [{ 
        type: "text" as const, 
        text: stringify({
          success: true,
          data: result.data,
          metadata: {
            toolName,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        }, null, 2)
      }]
    };
  } 
  
  return {
    isError: true,
    content: [{ 
      type: "text" as const, 
      text: stringify({
        success: false,
        error: {
          message: result.error.message,
          status: result.error.status,
          code: result.error.code,
          category: result.error.category,
          severity: result.error.severity,
          requestId: result.error.requestId,
          timestamp: result.error.timestamp,
          ...(result.error.retryAfter && { retryAfter: result.error.retryAfter })
        },
        metadata: {
          toolName,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }, null, 2)
    }]
  };
};

export const createMCPErrorResponse = (
  message: string, 
  status: number = 500, 
  toolName?: string,
  requestId?: string
) => {
  logger.error('Creating MCP error response', undefined, { toolName, requestId }, {
    message,
    status
  });
  
  return {
    isError: true,
    content: [{ 
      type: "text" as const, 
      text: stringify({
        success: false,
        error: {
          message,
          status,
          category: 'mcp_error',
          severity: 'high',
          requestId: requestId || `mcp_${Date.now()}`,
          timestamp: new Date().toISOString()
        },
        metadata: {
          toolName,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }, null, 2)
    }]
  };
};


