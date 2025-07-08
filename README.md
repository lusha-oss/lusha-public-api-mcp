# Lusha MCP Server

A Model Context Protocol (MCP) server for integrating with the Lusha API. This server provides comprehensive person and company lookup capabilities with enterprise-grade error handling, logging, and configuration management.

<p align="center">
  <a href="https://www.lusha.com" target="_blank">
    <img src="https://cdn.prod.website-files.com/655b8092803c160e897db87b/66def0a54a183485662cbe89_Lusha.svg" alt="Lusha Logo" width="150"/>
  </a>
</p>

<p align="center">
  <strong>Unlock Lusha's contact enrichment power directly within your AI agents.</strong>
</p>
<p align="center">
  This Model Context Protocol (MCP) server provides a seamless bridge to the Lusha API, enabling tools like Claude Desktop, Cursor, or other MCP-compatible clients to perform business contact and company lookups effortlessly.
</p>

---

## Installation

### For Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "lusha": {
      "command": "npx",
      "args": ["@lusha-org/mcp@latest"],
      "env": {
        "LUSHA_API_KEY": "your_lusha_api_key_here"
      }
    }
  }
}
```
## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LUSHA_API_KEY` | Your Lusha API key | - | ✅ |
| `DISABLE_SSL` | Disable SSL certificate verification (useful for development with self-signed certificates) | `false` | ❌ |

### Example Configuration

```bash
# Required
LUSHA_API_KEY=your_actual_api_key_here

# Optional - Customize as needed
LOG_LEVEL=INFO
LUSHA_TIMEOUT=45000

# Development only - Skip SSL verification if needed
# DISABLE_SSL=true
```

## Usage

### Starting the Server

```bash
# Production
npm start

# Development with auto-reload
npm run dev

# Development with debug logging
npm run dev:debug
```

### Available MCP Tools

#### 1. Person Bulk Lookup (`personBulkLookup`)

Find multiple people using various search criteria in a single request.

**Parameters:**
- `contacts`: Array of contact objects (max 100)
- `metadata` (optional): Additional processing options

**Contact Object Requirements:**
Each contact must have one of:
- `linkedinUrl`: LinkedIn profile URL
- `email`: Email address
- `fullName` + company information (`companies` array with `name` or `domain`)

**Example:**
```json
{
  "contacts": [
    {
      "contactId": "contact_1",
      "fullName": "John Doe",
      "companies": [{"name": "Lusha", "isCurrent": true}]
    },
    {
      "contactId": "contact_2",
      "linkedinUrl": "https://linkedin.com/in/janedoe"
    },
    {
      "contactId": "contact_3",
      "email": "jane.smith@company.com"
    }
  ],
  "metadata": {
    "revealEmails": true,
    "revealPhones": false
  }
}
```

#### 2. Company Bulk Lookup (`companyBulkLookup`)

Retrieve detailed information about multiple companies in a single request.

**Parameters:**
- `companies`: Array of company objects (max 100)
- `metadata` (optional): Additional processing options

**Company Object Requirements:**
Each company must have:
- `id`: Unique identifier for the company in the request
- At least one of: `name`, `domain`, `fqdn`, or `companyId`

**Example:**
```json
{
  "companies": [
    {
      "id": "company_1",
      "domain": "lusha.com"
    },
    {
      "id": "company_2",
      "name": "Meta Platforms"
    },
    {
      "id": "company_3",
      "fqdn": "www.google.com"
    }
  ]
}
```

## Response Format

All responses follow the MCP standard structure:

### Success Response
```json
{
  "success": true,
  "data": {
    "contacts": { /* contact data by contactId */ },
    "companies": { /* company data by companyId */ },
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "metadata": {
    "toolName": "personBulkLookup",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Invalid email format",
    "status": 400,
    "code": "VALIDATION_ERROR",
    "category": "validation",
    "severity": "medium",
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "metadata": {
    "toolName": "personBulkLookup",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## Error Handling

The server implements comprehensive error handling with:

### Error Categories
- **validation**: Input validation errors
- **configuration**: Configuration-related errors
- **api_client_error**: 4xx HTTP errors from Lusha API
- **api_server_error**: 5xx HTTP errors from Lusha API
- **rate_limit**: Rate limiting errors
- **unknown**: Unclassified errors

### Error Severity Levels
- **low**: Minor issues that don't affect functionality
- **medium**: Issues that may affect some functionality
- **high**: Significant issues that affect core functionality
- **critical**: Critical issues that prevent operation

## Logging

### Log Levels
- **DEBUG**: Detailed debugging information
- **INFO**: General information about operations
- **WARN**: Warning messages for potential issues
- **ERROR**: Error messages for failed operations
- **FATAL**: Critical errors that may cause the server to stop

### Log Format

The enhanced logging system provides rich contextual information:

**Development (Human-Readable):**
```
[2025-05-26T11:37:40.962Z] INFO: Loading configuration from environment variables
[2025-05-26T11:37:40.962Z] INFO [environment=development, baseUrl=https://api.lusha.com, timeout=30000]: Configuration loaded successfully
[2025-05-26T11:37:40.962Z] INFO [serverName=lusha-mcp-server, serverVersion=1.0.0, environment=development]: Server starting up
[2025-05-26T11:37:40.963Z] INFO: Initializing MCP server transport...
[2025-05-26T11:37:40.964Z] INFO [serverName=lusha-mcp-server, serverVersion=1.0.0, availableTools=personBulkLookup,companyBulkLookup]: MCP server started successfully
```

**Production (Structured JSON):**
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": 1,
  "message": "Starting person bulk lookup request",
  "context": {
    "requestId": "req_1234567890_abc123",
    "toolName": "personBulkLookup",
    "operation": "bulk_person_lookup"
  },
  "metadata": {
    "inputParams": {
      "contactCount": 3
    }
  }
}
```

## Development

### Project Structure

```
src/
├── config/           # Configuration management
│   ├── index.ts     # Environment-based configuration with validation
│   └── tools.ts     # Tool definitions and registration
├── tools/            # MCP tool implementations
│   ├── personBulkLookup.ts  # Person lookup implementation
│   └── companyLookup.ts     # Company lookup implementation
├── utils/            # Utility functions
│   ├── api.ts       # API client with interceptors
│   ├── error.ts     # Comprehensive error handling system
│   ├── logger.ts    # Advanced structured logging
│   └── mcp.ts       # MCP protocol adapters
├── types.ts         # Type definitions
├── schemas.ts       # Zod schemas for validation
└── index.ts         # Main MCP server

├── env.example      # Environment configuration template
└── README.md        # Comprehensive documentation
```

## Contributing

1. Fork the repository: https://github.com/lusha-oss/lusha-public-api-mcp/tree/master
2. Create a feature branch
3. Make your changes
4. Add tests (when available)
5. Run validation: `npm run validate`
6. Submit a pull request

## Changelog

### Version 1.0.0 - Initial Release

- Basic MCP server implementation
- Simple person lookup functionality
- Basic error handling
- TypeScript implementation
- Zod schema validation

## Support

For issues and questions:
- Check the troubleshooting section
- Review the logs for error details
- Check the [Changelog](#changelog) for recent changes
- Open an issue on GitHub
- Contact the development team 
