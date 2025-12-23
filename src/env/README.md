# @the-memoize-project/store/env

> Environment variable management for Cloudflare Workers

## Overview

The **env** module provides a simple, global accessor for Cloudflare Workers environment variables and bindings. It acts as a bridge between the Worker runtime environment and application code.

## Purpose

This module:
- Stores Cloudflare Workers environment bindings
- Provides global access to D1 databases, KV namespaces, and secrets
- Simplifies environment variable access across modules
- Avoids prop drilling environment through function parameters

## Installation

This module is part of the Memoize Store monorepo. Import it using the TypeScript alias:

```javascript
import env from '@env';
```

---

## Quick Start

### Initialize Environment (Worker Entry Point)

```javascript
// src/index.js
import env from '@env';
import router from '@the-memoize-project/router/worker';

export default {
  fetch(request, environment) {
    // Initialize env with Worker bindings
    env(environment);

    return router.handle(request);
  }
};
```

### Access Environment Variables (Any Module)

```javascript
// src/card/card.js
import env from '@env';

const Card = {
  async create(deck, card, user) {
    // Access D1 database from env
    const result = await env.DB.prepare(
      'INSERT INTO card (...) VALUES (...)'
    ).run();

    return result;
  }
};
```

---

## API Reference

### `env(data?: object): env`

Initializes or accesses the environment object.

**As Initializer:**
```javascript
env(environment);  // Call once at Worker entry point
```

**As Accessor:**
```javascript
const db = env.DB;           // Access D1 database
const kv = env.USERS_KV;     // Access KV namespace
const secret = env.API_KEY;  // Access secret
```

**Parameters:**
- `data` (optional) - Object containing environment bindings

**Returns:** The `env` function itself (for chaining and access)

---

## How It Works

### Implementation

```javascript
// src/env/env.js
const env = (data) => {
  Object.assign(env, data);
  return env;
};

export default env;
```

### Initialization

When called with an object, `env` merges that object's properties into itself:

```javascript
const environment = {
  DB: d1Database,
  USERS_KV: kvNamespace,
  API_KEY: 'secret_value'
};

env(environment);

// Now env.DB, env.USERS_KV, env.API_KEY are available
```

### Access

After initialization, `env` is callable without arguments and acts as a property accessor:

```javascript
env.DB;          // D1 database instance
env.USERS_KV;    // KV namespace instance
env.API_KEY;     // Secret value
```

---

## Available Bindings

### D1 Database

```javascript
env.DB  // Cloudflare D1 database instance
```

**Usage:**
```javascript
const { results } = await env.DB.prepare(
  'SELECT * FROM deck WHERE user_id = ?'
).bind(userId).all();
```

### KV Namespaces

```javascript
env.USERS_KV     // User data
env.DECKS_KV     // Deck metadata
env.CARDS_KV     // Card data
env.SESSIONS_KV  // Session tokens
```

**Usage:**
```javascript
await env.USERS_KV.put(key, value);
const data = await env.USERS_KV.get(key);
await env.USERS_KV.delete(key);
```

### Secrets

```javascript
env.GOOGLE_CLIENT_ID       // Google OAuth Client ID
env.GOOGLE_CLIENT_SECRET   // Google OAuth Client Secret
env.JWT_SECRET             // JWT signing secret
```

**Usage:**
```javascript
const clientId = env.GOOGLE_CLIENT_ID;
```

---

## Complete Example

### Worker Entry Point

```javascript
// src/index.js
import env from '@env';
import router, { headers } from '@the-memoize-project/router/worker';
import '@card';
import '@deck';

export default {
  fetch(request, environment) {
    // Initialize headers from request
    headers(request);

    // Initialize env with Cloudflare bindings
    env(environment);

    // Route request
    return router.handle(request);
  }
};
```

### Using in Modules

```javascript
// src/card/card.js
import env from '@env';
import Id from '@id';

const Card = {
  async create(deck, card, user) {
    const id = Id.new();

    // Use env.DB to access database
    const { success } = await env.DB.prepare(
      `INSERT INTO card (id, front, back, deck_id, user_id)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(id, card.front, card.back, deck.id, user.id)
      .run();

    return success
      ? { data: { id, ...card } }
      : { error: 'Failed to create card' };
  },

  async get(card, user) {
    // Use env.DB to query database
    const data = await env.DB.prepare(
      'SELECT * FROM card WHERE id = ? AND user_id = ?'
    )
      .bind(card.id, user.id)
      .first();

    return data
      ? { data }
      : { error: 'Card not found' };
  }
};

export default Card;
```

---

## Best Practices

### 1. Initialize Once

Call `env(environment)` only once at the Worker entry point:

```javascript
// Good - Single initialization
export default {
  fetch(request, environment) {
    env(environment);
    return router.handle(request);
  }
};

// Bad - Multiple initializations
router.get('/route1', () => {
  env(environment);  // Don't do this
});
```

### 2. Access Directly

After initialization, access env properties directly:

```javascript
// Good
const db = env.DB;
await db.prepare('SELECT * FROM deck').all();

// Bad - Unnecessary destructuring
const { DB } = env;
await DB.prepare('SELECT * FROM deck').all();
```

### 3. Don't Modify env

Only use `env()` to initialize. Don't manually assign properties:

```javascript
// Good
env(environment);

// Bad
env.DB = myDatabase;  // Don't do this
env.newProp = 'value'; // Don't do this
```

### 4. Check for Undefined Bindings

In development, bindings might be undefined:

```javascript
if (!env.DB) {
  throw new Error('Database not configured');
}

const data = await env.DB.prepare('SELECT ...').all();
```

---

## Configuration

### wrangler.toml

Define bindings in `wrangler.toml`:

```toml
name = "memoize-store"
main = "src/index.js"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "memoize"
database_id = "your-database-id"

# KV Namespaces
[[kv_namespaces]]
binding = "USERS_KV"
id = "your-users-kv-id"

[[kv_namespaces]]
binding = "DECKS_KV"
id = "your-decks-kv-id"

# Secrets (set via `wrangler secret put`)
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
# JWT_SECRET
```

### Setting Secrets

```bash
# Set secrets via Wrangler CLI
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put JWT_SECRET
```

### Local Development

Create `.dev.vars` for local secrets:

```bash
# .dev.vars
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-jwt-secret
```

**Important:** Never commit `.dev.vars` to git. It's included in `.gitignore`.

---

## TypeScript Support

### Type Definitions

Define environment types in `types.d.ts`:

```typescript
// types.d.ts
interface Env {
  // D1 Database
  DB: D1Database;

  // KV Namespaces
  USERS_KV: KVNamespace;
  DECKS_KV: KVNamespace;
  CARDS_KV: KVNamespace;
  SESSIONS_KV: KVNamespace;

  // Secrets
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
}
```

### Usage

```typescript
import env from '@env';

// TypeScript now knows env.DB is a D1Database
const result: D1Result = await env.DB.prepare('SELECT * FROM deck').all();
```

---

## Testing

### Mocking Environment

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import env from '@env';

describe('env module', () => {
  beforeEach(() => {
    // Reset env before each test
    Object.keys(env).forEach(key => {
      if (key !== 'constructor') {
        delete env[key];
      }
    });
  });

  it('should store environment bindings', () => {
    const mockEnv = {
      DB: 'mock-database',
      USERS_KV: 'mock-kv'
    };

    env(mockEnv);

    expect(env.DB).toBe('mock-database');
    expect(env.USERS_KV).toBe('mock-kv');
  });

  it('should merge multiple calls', () => {
    env({ DB: 'database' });
    env({ API_KEY: 'secret' });

    expect(env.DB).toBe('database');
    expect(env.API_KEY).toBe('secret');
  });
});
```

### Mocking in Module Tests

```javascript
import { describe, it, beforeEach, vi } from 'vitest';
import Card from '@card';
import env from '@env';

describe('Card.create', () => {
  beforeEach(() => {
    // Mock D1 database
    env({
      DB: {
        prepare: vi.fn().mockReturnValue({
          bind: vi.fn().mockReturnValue({
            run: vi.fn().mockResolvedValue({ success: true })
          })
        })
      }
    });
  });

  it('should create a card', async () => {
    const { data, error } = await Card.create(
      { id: 'deck_123' },
      { front: 'Q', back: 'A' },
      { id: 'user_123' }
    );

    expect(env.DB.prepare).toHaveBeenCalled();
    expect(error).toBeUndefined();
  });
});
```

---

## Security Considerations

### Secret Management

- **Never log secrets:** Don't use `console.log(env.API_KEY)`
- **Use Wrangler Secrets:** Store sensitive data as Wrangler secrets
- **Rotate regularly:** Change secrets periodically
- **Least privilege:** Only expose necessary bindings

### Access Control

- **Validate before use:** Check that bindings exist
- **Type checking:** Use TypeScript to catch missing bindings at compile time
- **Error handling:** Handle missing bindings gracefully

```javascript
if (!env.DB) {
  return Response.json(
    { error: 'Database not configured' },
    { status: 500 }
  );
}
```

---

## Troubleshooting

### "env.DB is undefined"

**Causes:**
1. Environment not initialized: Call `env(environment)` in worker entry point
2. Binding not configured: Check `wrangler.toml`
3. Wrong binding name: Verify binding name matches `wrangler.toml`

**Solutions:**
```javascript
// 1. Initialize at entry point
export default {
  fetch(request, environment) {
    env(environment);  // Add this
    return router.handle(request);
  }
};

// 2. Check wrangler.toml
[[d1_databases]]
binding = "DB"  // Must match env.DB

// 3. Verify binding name
env.DB  // Must match binding in wrangler.toml
```

---

### "Cannot read property 'prepare' of undefined"

This means `env.DB` is undefined. Follow solutions above.

---

### Secrets not available locally

**Solutions:**
1. Create `.dev.vars` file
2. Add secrets to `.dev.vars`
3. Restart `wrangler dev`

```bash
# .dev.vars
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Alternative Approaches

### Passing Environment as Parameter

Instead of a global, you could pass env through function parameters:

```javascript
// Not recommended - verbose
const Card = {
  async create(env, deck, card, user) {
    await env.DB.prepare('...').run();
  }
};

// Every call needs env
await Card.create(env, deck, card, user);
```

The global approach simplifies the API:

```javascript
// Recommended - cleaner
const Card = {
  async create(deck, card, user) {
    await env.DB.prepare('...').run();
  }
};

await Card.create(deck, card, user);
```

---

## Related Modules

- **[@card](../card)** - Uses env.DB
- **[@deck](../deck)** - Uses env.DB
- **[@auth](../auth)** - Uses env secrets

---

## Cloudflare Resources

- [Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [KV Storage](https://developers.cloudflare.com/kv/)
- [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

---

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for contribution guidelines.

---

**Part of The Memoize Project Store** 💾
