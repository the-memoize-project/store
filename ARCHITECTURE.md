# Memoize Store Architecture

This document describes the architecture, design decisions, and internal workings of Memoize Store.

## Table of Contents

- [Philosophy](#philosophy)
- [Core Concepts](#core-concepts)
- [Architecture Overview](#architecture-overview)
- [Data Model](#data-model)
- [Authentication Flow](#authentication-flow)
- [API Design](#api-design)
- [Performance Considerations](#performance-considerations)

---

## Philosophy

### Design Principles

1. **Edge-First** - Built for global distribution with low latency
2. **Zero Dependencies** - No external runtime dependencies except own libraries
3. **Security by Default** - Token-based auth on all protected routes
4. **Separation of Concerns** - Multiple KV namespaces for different data types
5. **RESTful Design** - Clean, predictable API endpoints
6. **Type Safety** - Full TypeScript support for better DX

---

## Core Concepts

### Cloudflare Workers

The backend runs on Cloudflare Workers, providing:
- Global edge deployment
- Low latency responses
- Automatic scaling
- Built-in DDoS protection

### KV Storage

Data is stored in Cloudflare KV, a globally distributed key-value store:
- Eventually consistent
- Low latency reads
- High availability
- Simple API

### Token-Based Authentication

Uses simple token-based authentication:
- Access tokens generated on login
- Tokens stored in SESSIONS_KV with TTL
- Validated on every protected request
- No JWT dependencies (simplified approach)

---

## Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────────┐
│          Client Application              │
│      (Browser, Mobile App, etc.)         │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│      Cloudflare Workers (Edge)          │
│  ┌──────────────────────────────────┐   │
│  │    Router (@memoize/router)      │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │  Authentication Middleware       │   │
│  └──────────┬───────────────────────┘   │
│             │                            │
│  ┌──────────▼───────────────────────┐   │
│  │      Route Handlers              │   │
│  │  - Auth (OAuth)                  │   │
│  │  - Decks CRUD                    │   │
│  │  - Cards CRUD                    │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼──────────────────────────┘
              │
┌─────────────▼──────────────────────────┐
│       Cloudflare KV Storage             │
│  ┌──────────┐  ┌──────────┐            │
│  │USERS_KV  │  │DECKS_KV  │            │
│  └──────────┘  └──────────┘            │
│  ┌──────────┐  ┌──────────┐            │
│  │CARDS_KV  │  │SESSIONS  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Package Structure

```
packages/
├── auth/          # OAuth authentication
│   └── oauth.js   # Google OAuth flow
├── decks/         # Deck management
│   └── crud.js    # CRUD operations
├── cards/         # Card management
│   └── crud.js    # CRUD operations
├── middleware/    # Request middleware
│   └── auth.js    # Auth validation
└── utils/         # Shared utilities
    ├── crypto.js  # Token generation
    └── response.js # Response helpers
```

---

## Data Model

### KV Namespaces

#### USERS_KV
Stores user profiles and account information.

Keys:
- `user:{userId}` → User object
- `user:email:{email}` → `{ id: userId }` (lookup)

User object:
```json
{
  "id": "user_timestamp_random",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### SESSIONS_KV
Stores active sessions with automatic expiration.

Keys:
- `session:{token}` → Session object (TTL: 7 days)

Session object:
```json
{
  "userId": "user_id",
  "token": "random_token",
  "created_at": 1234567890,
  "expires_at": 1234567890
}
```

#### DECKS_KV
Stores deck metadata and user relationships.

Keys:
- `deck:{deckId}` → Deck object
- `user_decks:{userId}` → `{ deckIds: [...] }`

Deck object:
```json
{
  "id": "deck_timestamp_random",
  "userId": "user_id",
  "name": "Deck Name",
  "description": "Description",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### CARDS_KV
Stores card data and deck relationships.

Keys:
- `card:{cardId}` → Card object
- `deck_cards:{deckId}` → `{ cardIds: [...] }`

Card object:
```json
{
  "id": "card_timestamp_random",
  "deckId": "deck_id",
  "front": "Question",
  "back": "Answer",
  "tags": ["tag1", "tag2"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Authentication Flow

### Google OAuth Flow

1. **Frontend**: User clicks "Sign in with Google"
2. **Frontend**: Redirects to Google OAuth page
3. **Google**: User authorizes application
4. **Google**: Redirects back with authorization code
5. **Frontend**: Sends code to `/auth/callback`
6. **Backend**: Exchanges code for Google access token
7. **Backend**: Fetches user info from Google
8. **Backend**: Creates/updates user in USERS_KV
9. **Backend**: Generates access token
10. **Backend**: Stores session in SESSIONS_KV
11. **Backend**: Returns user data + access_token
12. **Frontend**: Stores access_token
13. **Frontend**: Includes token in all API requests

### Token Validation

On every protected request:
1. Extract `Authorization: Bearer <token>` header
2. Lookup session in SESSIONS_KV
3. Verify token hasn't expired
4. Fetch user data from USERS_KV
5. Attach user to request context
6. Proceed to route handler

---

## API Design

### RESTful Principles

- **Resources**: Decks and Cards
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Error)
- **JSON Responses**: All responses in JSON format

### Endpoint Structure

```
/auth/*               # Authentication endpoints (public)
/api/decks            # Deck collection
/api/decks/:id        # Specific deck
/api/decks/:id/cards  # Cards in deck
/api/cards/:id        # Specific card
```

### Error Handling

Consistent error response format:
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

---

## Performance Considerations

### KV Access Patterns

1. **Read-Heavy**: KV is optimized for reads (cached at edge)
2. **Write Propagation**: Writes are eventually consistent (~60s)
3. **Key Design**: Prefix-based keys for easy filtering
4. **Denormalization**: Store card counts with deck to avoid lookups

### Optimization Strategies

1. **Parallel Requests**: Use `Promise.all()` for batch operations
2. **Minimal Data Transfer**: Only fetch what's needed
3. **Edge Caching**: Leverage Cloudflare's edge cache
4. **Token Expiry**: Use KV TTL for automatic cleanup

### Scaling Considerations

- **Stateless Workers**: No state stored in worker instances
- **Global Distribution**: Automatic edge deployment
- **KV Limits**: 10GB per namespace, 25MB per key
- **Request Limits**: 100,000 requests/day (free tier)

---

## Security

### Best Practices

1. **Token-Based Auth**: All protected routes require valid token
2. **Ownership Verification**: Users can only access their own data
3. **Input Validation**: Validate all request data
4. **CORS Configuration**: Properly configured CORS headers
5. **Error Messages**: Don't leak sensitive information

### Threat Mitigation

- **XSS**: JSON-only responses, no HTML rendering
- **CSRF**: Token-based auth (not cookie-based)
- **Rate Limiting**: Cloudflare's built-in protection
- **SQL Injection**: N/A (KV storage, not SQL)

---

## Future Enhancements

- [ ] Rate limiting per user
- [ ] Webhook support for real-time updates
- [ ] Bulk operations for cards
- [ ] Search and filtering capabilities
- [ ] Analytics and usage tracking
- [ ] Multi-language support
- [ ] Image upload for cards
- [ ] Sharing and collaboration features
