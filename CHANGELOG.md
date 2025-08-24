# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.2.0](https://github.com/lusha-oss/lusha-public-api-mcp/compare/v1.1.1...v1.2.0) (2025-08-24)


### Features

* add company enrichment tool and related schema, handler, and tests ([d8b0930](https://github.com/lusha-oss/lusha-public-api-mcp/commit/d8b0930d25c5a01d18bbffc4ea58c275834bae68))
* add company filters tool and related schema, handler, and configuration ([3caf25e](https://github.com/lusha-oss/lusha-public-api-mcp/commit/3caf25e1f3b13ee75d81b31277ca3bdc09cee2a3))
* add company prospecting tool and related tests ([f517418](https://github.com/lusha-oss/lusha-public-api-mcp/commit/f5174185eb334b3bc26cdbd0af91000d964e51a0))
* add-contact-enrich-tool ([0d090f5](https://github.com/lusha-oss/lusha-public-api-mcp/commit/0d090f5ca184d4159ad177f53453691d98fe1613))
* add-contact-enrich-tool ([5e64b23](https://github.com/lusha-oss/lusha-public-api-mcp/commit/5e64b232b458f8d4cf4679c052625965cec2acea))
* add-contact-enrich-tool ([064cbb3](https://github.com/lusha-oss/lusha-public-api-mcp/commit/064cbb363a18d41c354b2b53068025e5a2ad7972))
* add-contact-enrich-tool ([d280b94](https://github.com/lusha-oss/lusha-public-api-mcp/commit/d280b94e6dc65515e8c1c57210f314a3dccb0299))
* add-contact-enrich-tool ([0924489](https://github.com/lusha-oss/lusha-public-api-mcp/commit/092448942b24c4a5fea0d7eac80a2d85165b8878))
* add-contact-enrich-tool ([ab053dc](https://github.com/lusha-oss/lusha-public-api-mcp/commit/ab053dcf8acc8fa5846d2bd0682f6f43fffdcfe0))
* add-contact-enrich-tool ([324b72e](https://github.com/lusha-oss/lusha-public-api-mcp/commit/324b72eee5f897b5895d316392e893281b2ef222))
* add-contact-search-tool ([8c2104a](https://github.com/lusha-oss/lusha-public-api-mcp/commit/8c2104a21fa96973c056f943d07fcc055178c53e))


### Bug Fixes

* update company enrichment test to reflect new limit on company IDs ([97f73f7](https://github.com/lusha-oss/lusha-public-api-mcp/commit/97f73f70b499647c4a8a20ce0f900b7145216c7f))

## [1.1.1](https://github.com/lusha-oss/lusha-public-api-mcp/compare/v1.1.0...v1.1.1) (2025-07-08)


### Features

* add support for optional SSL certificate validation in Axios client ([17c31dd](https://github.com/lusha-oss/lusha-public-api-mcp/commit/17c31ddb9eb949904161994842133bd916d8d63c))

## [1.1.0](https://github.com/lusha-oss/lusha-public-api-mcp/compare/v1.0.1...v1.1.0) (2025-07-08)

## [1.0.1](https://github.com/lusha-oss/lusha-public-api-mcp/compare/v1.0.0...v1.0.1) (2025-06-11)

## 1.0.0 (2025-06-11)


### Features

* update readme ([4569887](https://github.com/lusha-oss/lusha-public-api-mcp/commit/45698879ef04ee066c24e6a8580ca32737f87c7c))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

##  (2025-06-03)


### Features

* **company:** add company lookup functionality with validation schema and handler ([5072aa8](https://github.com/lusha-com/lusha-mcp-poc/commit/5072aa84b6684ff6be366d8731ff959c9ebaa640))
* **company:** implement companyBulkLookup functionality with validation schema and handler ([7958db6](https://github.com/lusha-com/lusha-mcp-poc/commit/7958db615cb21c0c37975c6e9d634fcfe4c2fd41))
* **error:** enhance error handling by adding ZodError support and improving error message extraction ([d7813f6](https://github.com/lusha-com/lusha-mcp-poc/commit/d7813f69df67b1965d2b55aea6ddb6dba991b1ac))
* **package:** add executable entry point and update package configuration ([b0e28c5](https://github.com/lusha-com/lusha-mcp-poc/commit/b0e28c525cd469a707aafe0e311ef2ed53f46625))
* **schemas:** add LinkedIn URL validation function to ensure URLs are from the correct domain ([c4b67dc](https://github.com/lusha-com/lusha-mcp-poc/commit/c4b67dc511e7388ad7ff089471b79f7a63000334))
* **server:** introduce v2.0.0 with enhanced error handling, logging, and bulk lookup capabilities ([c37dac4](https://github.com/lusha-com/lusha-mcp-poc/commit/c37dac43499573e85ba73a42975a09288582fc91))
* **server:** update Lusha API configuration, add pyproject.toml, and enhance validation for bulk person lookup ([cec9852](https://github.com/lusha-com/lusha-mcp-poc/commit/cec985264059d8de5ecc1448c49e7dfeff141293))


### Bug Fixes

* **company:** update error status in companyLookupHandler to reflect actual response status ([6470b2e](https://github.com/lusha-com/lusha-mcp-poc/commit/6470b2ec7e78a7743f96370b2c6f01d2c98375bd))
* **server:** fixed logger issues ([010da9e](https://github.com/lusha-com/lusha-mcp-poc/commit/010da9ee979d391b93a850726d17741540a9066e))
* **tools:** update personBulkLookup description to clarify requirements for API usage ([97d897f](https://github.com/lusha-com/lusha-mcp-poc/commit/97d897f33716ea75b22cfbf2f75090b4c2256c8f))


### Code Refactoring

* **config:** simplify configuration management by removing unused settings and centralizing API key retrieval ([42e49a4](https://github.com/lusha-com/lusha-mcp-poc/commit/42e49a4c370e3444a761bdca9bbd2d071c73d7fe))
* **logger:** replace simple format with JSON format for improved log structure ([6171977](https://github.com/lusha-com/lusha-mcp-poc/commit/6171977979028f674912de7c2974f49d423f8d40))
* **server:** remove personLookup tool and implement personBulkLookup tool with enhanced validation ([54d65c1](https://github.com/lusha-com/lusha-mcp-poc/commit/54d65c17e7425c7ce7f8b604e265dbca20be748e))
* **server:** restructure tool registration and enhance validation for bulk person lookup ([ad4d935](https://github.com/lusha-com/lusha-mcp-poc/commit/ad4d935178afe2935f9c7f9a30fe9c3dbbbc7ba9))
* **tools:** remove retry logic from bulk lookup handlers for companies and persons ([308dc0d](https://github.com/lusha-com/lusha-mcp-poc/commit/308dc0d9f175923b6768bd94d73811cd4834395f))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines. 