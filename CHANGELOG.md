# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-12-15

### Added
- Initial release of Memoize Store
- Google OAuth2 authentication with callback endpoint
- User management with KV storage
- Session management with token-based authentication
- Deck CRUD operations (Create, Read, Update, Delete)
- Card CRUD operations within decks
- Authentication middleware for protected routes
- Multiple KV namespaces for data separation:
  - USERS_KV for user profiles
  - SESSIONS_KV for active sessions
  - DECKS_KV for deck metadata
  - CARDS_KV for card data
- CORS support for cross-origin requests
- Cloudflare Workers deployment configuration
- TypeScript definitions for all API types
- Comprehensive documentation (README, CONTRIBUTING, CODE_OF_CONDUCT)
- Development tools setup (Biome, Commitlint, Husky)

### Security
- Token-based authentication on all protected routes
- Access token validation and expiration
- User ownership verification for deck and card operations
- Secure OAuth2 flow with Google

[0.1.0]: https://github.com/the-memoize-project/store/releases/tag/v0.1.0
