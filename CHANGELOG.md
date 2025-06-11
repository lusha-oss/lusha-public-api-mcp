# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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