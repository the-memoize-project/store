# @the-memoize-project/store/auth/me

> User authentication middleware

## Overview

The **me** middleware provides user authentication by validating Google OAuth access tokens and injecting authenticated user context into route handlers.

## Purpose

This middleware serves as the primary authentication layer for all protected routes in the Memoize Store API. It:
- Validates access tokens against Google OAuth
- Retrieves user information
- Prevents unauthorized access
- Provides user context to handlers

## Usage

```javascript
import { me } from '@auth';

router.get('/api/protected', me((user) => {
  // user is authenticated
  return Response.json({ userId: user.id });
}));
```

---

## API

### `me(next: (user: User) => Response): () => Promise<Response>`

**Parameters:**
- `next` - Handler function that receives the authenticated user

**Returns:** Async function that returns an HTTP Response

**User Type:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}
```

---

## How It Works

### 1. Token Extraction
The middleware reads the `Authorization` header from the request:

```javascript
import { headers } from '@the-memoize-project/router/worker';

// headers.authorization contains: "Bearer <access_token>"
const token = headers.authorization;
```

### 2. Token Validation
The token is validated using Google OAuth:

```javascript
import { Google } from "@the-memoize-project/auth";

const user = await Google.me(token);
```

### 3. User Check
If the user object contains an `id`, authentication succeeded:

```javascript
if (user?.id) {
  return next(user);  // Proceed to handler
} else {
  return new Response(null, { status: 401 });  // Unauthorized
}
```

### 4. Error Handling
Any errors during validation result in a 500 response:

```javascript
try {
  // validation logic
} catch (_error) {
  return new Response(null, { status: 500 });
}
```

---

## Implementation

```javascript
// src/auth/me/me.js
import { Google } from "@the-memoize-project/auth";
import { headers } from '@the-memoize-project/router/worker';

const me = async (next) => () =>  {
  try {
    const user = await Google.me(headers.authorization);
    return user?.id
      ? next(user)
      : new Response(null, { status: 401 });
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
};

export default me;
```

---

## Examples

### Basic Authentication

```javascript
import { me } from '@auth';
import router from '@the-memoize-project/router/worker';

router.get('/api/user/profile', me((user) => {
  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture
  });
}));
```

**Request:**
```http
GET /api/user/profile HTTP/1.1
Authorization: Bearer ya29.a0AfH6SM...
```

**Response:**
```json
{
  "id": "108234567890123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

---

### Protecting Resource Access

```javascript
import { me } from '@auth';
import Deck from '@deck';

router.get('/api/decks/:id', me(async (user) => {
  const { data, error } = await Deck.get(
    { id: request.params.id },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 404 });
  }

  return Response.json(data);
}));
```

This ensures users can only access their own decks.

---

### Middleware Composition

The curried pattern enables easy composition:

```javascript
import { me } from '@auth';

const requireAdmin = (next) => (user) => {
  if (!user.email.endsWith('@example.com')) {
    return Response.json({ error: 'Admin required' }, { status: 403 });
  }
  return next(user);
};

const logRequest = (next) => (user) => {
  console.log(`User ${user.id} accessed admin panel`);
  return next(user);
};

router.get('/admin', me(requireAdmin(logRequest((user) => {
  return Response.json({ message: 'Admin panel' });
}))));
```

---

## Response Status Codes

| Code | Meaning | Reason |
|------|---------|--------|
| `200` | OK | Authentication succeeded, handler executed |
| `401` | Unauthorized | Invalid or missing access token |
| `500` | Internal Server Error | OAuth validation failed |

---

## Testing

### Mock Valid Authentication

```javascript
import { describe, it, expect, vi } from 'vitest';
import { me } from '@auth';

describe('me middleware', () => {
  it('should authenticate valid user', async () => {
    // Mock Google OAuth
    vi.mock('@the-memoize-project/auth', () => ({
      Google: {
        me: async () => ({
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/pic.jpg'
        })
      }
    }));

    // Mock headers
    vi.mock('@the-memoize-project/router/worker', () => ({
      headers: {
        authorization: 'Bearer valid_token'
      }
    }));

    const handler = me((user) => Response.json({ userId: user.id }));
    const response = await handler();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.userId).toBe('123');
  });
});
```

### Mock Invalid Token

```javascript
it('should return 401 for invalid token', async () => {
  vi.mock('@the-memoize-project/auth', () => ({
    Google: {
      me: async () => null  // Invalid user
    }
  }));

  const handler = me((user) => Response.json({ user }));
  const response = await handler();

  expect(response.status).toBe(401);
});
```

### Mock OAuth Error

```javascript
it('should return 500 on OAuth error', async () => {
  vi.mock('@the-memoize-project/auth', () => ({
    Google: {
      me: async () => {
        throw new Error('OAuth service unavailable');
      }
    }
  }));

  const handler = me((user) => Response.json({ user }));
  const response = await handler();

  expect(response.status).toBe(500);
});
```

---

## Curried Function Pattern

The middleware uses a curried function pattern for composability:

### What is Currying?

Currying transforms a function with multiple arguments into a sequence of functions with single arguments:

```javascript
// Normal function
function add(a, b, c) {
  return a + b + c;
}

// Curried version
const addCurried = (a) => (b) => (c) => a + b + c;

// Usage
add(1, 2, 3);           // 6
addCurried(1)(2)(3);    // 6
```

### Why Use Currying Here?

1. **Enables middleware composition**
   ```javascript
   me(middleware1(middleware2(handler)))
   ```

2. **Partial application**
   ```javascript
   const authenticatedRoute = me(handler);
   router.get('/route', authenticatedRoute);
   ```

3. **Reusable middleware**
   ```javascript
   const withAuth = me;
   router.get('/route1', withAuth(handler1));
   router.get('/route2', withAuth(handler2));
   ```

---

## Security Considerations

### Token Security
- Tokens are validated on every request (no caching)
- Tokens are never stored server-side
- Failed validations return minimal error information

### HTTPS Required
- Always use HTTPS in production
- Tokens transmitted over HTTP can be intercepted

### Rate Limiting
- Consider adding rate limiting for authentication endpoints
- Prevents brute-force token attacks

### Token Expiration
- Google OAuth tokens expire automatically
- Expired tokens result in 401 responses
- Clients must refresh tokens when needed

---

## Troubleshooting

### Common Issues

**Issue:** `headers.authorization` is undefined

**Solution:** Ensure the router's `headers()` function is called before middleware:

```javascript
import router, { headers } from '@the-memoize-project/router/worker';

export default {
  fetch(request, env) {
    headers(request);  // Must be called before routing
    return router.handle(request);
  }
}
```

---

**Issue:** 401 responses for valid tokens

**Solutions:**
1. Check token format: `Bearer <token>`
2. Verify token hasn't expired
3. Ensure correct Google OAuth client credentials
4. Check that `@the-memoize-project/auth` package is up to date

---

**Issue:** 500 errors on all requests

**Solutions:**
1. Check Workers logs: `wrangler tail`
2. Verify Google OAuth API is accessible
3. Check environment variables
4. Test Google OAuth directly

---

## Dependencies

- `@the-memoize-project/auth` - Google OAuth integration
- `@the-memoize-project/router` - Request headers accessor

---

## Related

- [Parent Module: auth](../README.md)
- [Deck Module](../../deck/README.md) - Uses this middleware
- [Card Module](../../card/README.md) - Uses this middleware

---

**Part of The Memoize Project Store** 💾
