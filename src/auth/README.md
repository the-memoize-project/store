# @the-memoize-project/store/auth

> Authentication and authorization module for Memoize Store

## Overview

The **auth** module provides authentication middleware for validating user access tokens and protecting API routes. It integrates with Google OAuth through the `@the-memoize-project/auth` package to verify user identity.

## Purpose

This module ensures that only authenticated users can access protected resources in the Memoize Store API. It provides middleware functions that validate access tokens and inject user context into request handlers.

## Installation

This module is part of the Memoize Store monorepo. Import it using the TypeScript alias:

```javascript
import { me } from '@auth';
```

## Available Middleware

### `me` - User Authentication Middleware

The `me` middleware validates the user's access token from the Authorization header and retrieves user information from Google OAuth.

**Returns:**
- User object on success
- `401 Unauthorized` if token is invalid or missing
- `500 Internal Server Error` on validation failure

## Quick Start

```javascript
import { me } from '@auth';
import router from '@the-memoize-project/router/worker';

// Protect a route with authentication
router.get('/api/decks', me((user) => {
  // user is validated and available
  return Response.json({ userId: user.id });
}));
```

---

## Detailed Example

### Protecting an API Route

```javascript
import { me } from '@auth';
import router from '@the-memoize-project/router/worker';
import Deck from '@deck';

// List all decks for authenticated user
router.get('/api/decks', me(async (user) => {
  const { data, error } = await Deck.list(user);

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ decks: data });
}));
```

**Request:**
```http
GET /api/decks HTTP/1.1
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "decks": [
    {
      "id": "abc123",
      "name": "Spanish Vocabulary",
      "description": "Common Spanish words",
      "created_at": 1703001600000,
      "user_id": "google_user_id"
    }
  ]
}
```

**Unauthorized Response (401):**
```json
null
```

---

### Using with Multiple Middleware

The `me` middleware follows a curried function pattern, enabling composition with other middleware:

```javascript
import { me } from '@auth';
import router from '@the-memoize-project/router/worker';

const adminOnly = (next) => (user) => {
  if (!user.isAdmin) {
    return new Response('Forbidden', { status: 403 });
  }
  return next(user);
};

// Chain middleware
router.delete('/api/admin/users/:id', me(adminOnly((user) => {
  // Only admins reach here
  return Response.json({ success: true });
})));
```

---

## API Reference

### `me(next: (user: User) => Response): () => Promise<Response>`

Validates the user's access token and injects user context into the handler.

**Parameters:**
- `next` - Handler function that receives the authenticated user object

**Returns:** Async function that returns a Response

**User Object:**
```typescript
{
  id: string;        // Google user ID
  email: string;     // User email
  name: string;      // Display name
  picture: string;   // Profile picture URL
}
```

**Response Status Codes:**
- `200` - Success (handler response)
- `401` - Unauthorized (invalid/missing token)
- `500` - Internal server error

---

## How It Works

### Authentication Flow

```
1. Client sends request with Authorization header
   ↓
2. me() middleware extracts token from header
   ↓
3. Google.me() validates token with Google OAuth
   ↓
4. If valid, user object is retrieved
   ↓
5. Handler function (next) is called with user
   ↓
6. Handler response is returned to client
```

### Code Implementation

```javascript
// src/auth/me/me.js
import { Google } from "@the-memoize-project/auth";
import { headers } from '@the-memoize-project/router/worker';

const me = async (next) => () =>  {
  try {
    // Validate token and get user info
    const user = await Google.me(headers.authorization);

    // Check if user is valid
    return user?.id
      ? next(user)  // Proceed with authenticated user
      : new Response(null, { status: 401 });  // Unauthorized
  } catch (_error) {
    return new Response(null, { status: 500 });  // Server error
  }
};

export default me;
```

---

## Best Practices

### 1. Always Validate Protected Routes

```javascript
// Good - Protected route
router.post('/api/decks', me((user) => {
  // Create deck for authenticated user
}));

// Bad - Unprotected route (anyone can create decks)
router.post('/api/decks', (request) => {
  // No authentication check
});
```

### 2. Handle Authorization Errors

```javascript
router.get('/api/decks/:id', me(async (user) => {
  const deck = await Deck.get({ id: params.id }, user);

  if (deck.error) {
    // Deck not found OR user doesn't own it
    return Response.json(
      { error: deck.error },
      { status: 404 }
    );
  }

  return Response.json(deck.data);
}));
```

### 3. Use Curried Pattern for Middleware Composition

```javascript
const rateLimiter = (next) => (user) => {
  if (exceededRateLimit(user)) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  return next(user);
};

router.post('/api/cards', me(rateLimiter((user) => {
  // Handler
})));
```

### 4. Don't Catch User Validation Errors

The `me` middleware already handles errors. Don't wrap it in try-catch:

```javascript
// Good
router.get('/api/decks', me((user) => {
  return Response.json({ userId: user.id });
}));

// Bad - Unnecessary error handling
router.get('/api/decks', async (request) => {
  try {
    return await me((user) => {
      return Response.json({ userId: user.id });
    })();
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});
```

---

## Submodules

- **[me/](me/README.md)** - Authentication middleware implementation

---

## Testing

### Example Test

```javascript
import { describe, it, expect } from 'vitest';
import { me } from '@auth';

describe('me middleware', () => {
  it('should return 401 when token is invalid', async () => {
    const handler = me((user) => Response.json({ user }));

    // Mock invalid authorization header
    globalThis.headers = { authorization: 'Bearer invalid_token' };

    const response = await handler();

    expect(response.status).toBe(401);
  });

  it('should call next handler with valid user', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };

    // Mock valid Google OAuth response
    globalThis.Google = {
      me: async () => mockUser
    };

    const handler = me((user) => Response.json({ user }));
    const response = await handler();
    const data = await response.json();

    expect(data.user).toEqual(mockUser);
  });
});
```

---

## Related Modules

- **[@the-memoize-project/auth](https://github.com/the-memoize-project/auth)** - Google OAuth integration
- **[@the-memoize-project/router](https://github.com/the-memoize-project/router)** - Request routing
- **[@deck](../deck)** - Deck operations (uses auth)
- **[@card](../card)** - Card operations (uses auth)

---

## Security Considerations

### Token Validation
- Access tokens are validated against Google OAuth on every request
- Invalid tokens result in immediate 401 response
- No tokens are stored server-side (stateless authentication)

### Error Handling
- Authentication errors return minimal information to prevent information disclosure
- All errors are logged for debugging purposes
- User data is never exposed in error responses

### Best Security Practices
- Always use HTTPS in production
- Set appropriate CORS headers
- Rotate Google OAuth client secrets regularly
- Monitor for unusual authentication patterns

---

## Troubleshooting

### 401 Unauthorized Responses

**Problem:** All requests return 401 even with valid token

**Solutions:**
1. Verify the Authorization header format: `Bearer <token>`
2. Check that the access token hasn't expired
3. Ensure the token is from the correct Google OAuth client
4. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment

### 500 Internal Server Error

**Problem:** Authentication fails with 500 error

**Solutions:**
1. Check Cloudflare Workers logs: `wrangler tail`
2. Verify Google OAuth service is accessible
3. Check network connectivity from Workers
4. Review environment variable configuration

---

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for contribution guidelines.

---

**Part of The Memoize Project Store** 💾
