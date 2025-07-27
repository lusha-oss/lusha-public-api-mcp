#!/usr/bin/env node


import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tools, ToolDefinition } from "./config/tools";
import { adaptToolResponseToMCP, createMCPErrorResponse } from "./utils/mcp";
import { getLushaApiKey } from "./config";
import { logger } from "./utils/logger";
import { generateRequestId } from "./utils/error";

const serverConfig = {
  name: "lusha-mcp",
  version: "1.0.0"
};

try {
  // Validate API key is available
  getLushaApiKey();
  logger.info('Server starting up', {
    serverName: serverConfig.name,
    serverVersion: serverConfig.version,
    availableTools: tools.map(t => t.name)
  });
} catch (error) {
  logger.error('Failed to initialize server configuration', { error: (error as Error).message, stack: (error as Error).stack });
  process.exit(1);
}

const server = new McpServer({
  name: serverConfig.name,
  version: serverConfig.version
});

const createToolHandler = (toolDef: ToolDefinition) => {
  return async (args: any, _extra: any) => {
    const requestId = generateRequestId();
    
    try {
      logger.info(`${toolDef.name} tool invoked`, { requestId, toolName: toolDef.name, args });
      
      const result = await toolDef.handler(args);
      
      logger.info(`${toolDef.name} tool completed successfully`, { 
        requestId,
        toolName: toolDef.name,
        success: result.type === 'success'
      });
      
      return adaptToolResponseToMCP(result, toolDef.name);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      logger.error(`${toolDef.name} tool failed`, { 
        error: errorMessage, 
        stack: (error as Error).stack,
        requestId,
        toolName: toolDef.name
      });
      
      return createMCPErrorResponse(`${toolDef.name} failed: ${errorMessage}`, 500, toolDef.name, requestId);
    }
  };
};

// Register all tools from the tools array
tools.forEach(toolDef => {
  server.tool(
    toolDef.name,
    toolDef.description,
    (toolDef.schema as any).shape,
    createToolHandler(toolDef)
  );
  
  logger.info(`Registered tool: ${toolDef.name}`, {
    toolName: toolDef.name,
    description: toolDef.description
  });
});

const transport = new StdioServerTransport();

// Handle process termination gracefully
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  logger.error('Unhandled rejection', { 
    error: (reason as Error).message, 
    stack: (reason as Error).stack,
    promise: promise.toString()
  });
  process.exit(1);
});

server.connect(transport);

logger.info('MCP Server started successfully', {
  serverName: serverConfig.name,
  serverVersion: serverConfig.version,
  transport: 'stdio'
});