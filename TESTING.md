# Testing Guide

This document describes how to test the Memoize Store API.

## Table of Contents

- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Testing Checklist](#testing-checklist)

---

## Manual Testing

### Setup

1. Start the development server:
   ```bash
   bun run dev
   ```

2. The server will be available at `http://localhost:8787`

### Testing with cURL

#### Authentication

```bash
# OAuth callback (you'll need a real Google OAuth code)
curl -X POST http://localhost:8787/auth/callback \
  -H "Content-Type: application/json" \
  -d '{"code": "your_google_oauth_code"}'

# Save the access_token from the response
export ACCESS_TOKEN="your_access_token"

# Validate token
curl -X GET http://localhost:8787/auth/validate \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Logout
curl -X POST http://localhost:8787/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Decks

```bash
# List all decks
curl -X GET http://localhost:8787/api/decks \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Create a deck
curl -X POST http://localhost:8787/api/decks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"name": "Test Deck", "description": "A test deck"}'

# Save the deck ID from the response
export DECK_ID="deck_xxx"

# Get a specific deck
curl -X GET http://localhost:8787/api/decks/$DECK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Update a deck
curl -X PUT http://localhost:8787/api/decks/$DECK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"name": "Updated Deck"}'

# Delete a deck
curl -X DELETE http://localhost:8787/api/decks/$DECK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Cards

```bash
# List cards in a deck
curl -X GET http://localhost:8787/api/decks/$DECK_ID/cards \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Create a card
curl -X POST http://localhost:8787/api/decks/$DECK_ID/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "front": "What is 2+2?",
    "back": "4",
    "tags": ["math", "easy"]
  }'

# Save the card ID from the response
export CARD_ID="card_xxx"

# Get a specific card
curl -X GET http://localhost:8787/api/cards/$CARD_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Update a card
curl -X PUT http://localhost:8787/api/cards/$CARD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "front": "What is 2+3?",
    "back": "5"
  }'

# Delete a card
curl -X DELETE http://localhost:8787/api/cards/$CARD_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Testing with Postman/Insomnia

1. Import the following collection:

```json
{
  "name": "Memoize Store API",
  "requests": [
    {
      "name": "OAuth Callback",
      "method": "POST",
      "url": "http://localhost:8787/auth/callback",
      "body": {
        "code": "{{google_oauth_code}}"
      }
    },
    {
      "name": "List Decks",
      "method": "GET",
      "url": "http://localhost:8787/api/decks",
      "headers": {
        "Authorization": "Bearer {{access_token}}"
      }
    },
    {
      "name": "Create Deck",
      "method": "POST",
      "url": "http://localhost:8787/api/decks",
      "headers": {
        "Authorization": "Bearer {{access_token}}"
      },
      "body": {
        "name": "Test Deck",
        "description": "A test deck"
      }
    }
  ]
}
```

---

## Automated Testing

### Unit Tests

Create test files in `packages/*/tests/` directories.

Example test (`packages/utils/tests/crypto.test.js`):

```javascript
import { describe, it, expect } from 'vitest';
import { generateId, hash, verifyAccessToken } from '../crypto.js';

describe('Crypto Utils', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');

    expect(id1).toMatch(/^test_/);
    expect(id2).toMatch(/^test_/);
    expect(id1).not.toBe(id2);
  });

  it('should hash strings consistently', async () => {
    const hash1 = await hash('test');
    const hash2 = await hash('test');

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should verify valid tokens', () => {
    const validToken = {
      userId: 'user_123',
      token: 'abc123',
      created_at: Date.now(),
      expires_at: Date.now() + 1000000,
    };

    expect(verifyAccessToken(validToken)).toBe(true);
  });

  it('should reject expired tokens', () => {
    const expiredToken = {
      userId: 'user_123',
      token: 'abc123',
      created_at: Date.now() - 2000000,
      expires_at: Date.now() - 1000000,
    };

    expect(verifyAccessToken(expiredToken)).toBe(false);
  });
});
```

### Integration Tests

Create integration tests for the full API flow.

Example (`tests/integration/auth.test.js`):

```javascript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Authentication Flow', () => {
  let accessToken;

  it('should handle OAuth callback', async () => {
    // Mock Google OAuth
    const response = await fetch('http://localhost:8787/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'mock_code' }),
    });

    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.access_token).toBeDefined();

    accessToken = data.access_token;
  });

  it('should validate token', async () => {
    const response = await fetch('http://localhost:8787/auth/validate', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await response.json();
    expect(data.valid).toBe(true);
  });

  it('should reject invalid token', async () => {
    const response = await fetch('http://localhost:8787/auth/validate', {
      headers: { 'Authorization': 'Bearer invalid_token' },
    });

    expect(response.status).toBe(401);
  });
});
```

### Run Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run tests with coverage
bun run test --coverage

# Run specific test file
bun run test packages/utils/tests/crypto.test.js
```

---

## Testing Checklist

### Authentication
- [ ] OAuth callback with valid code returns user and token
- [ ] OAuth callback with invalid code returns error
- [ ] Token validation with valid token succeeds
- [ ] Token validation with expired token fails
- [ ] Token validation with invalid token fails
- [ ] Logout clears session

### Decks
- [ ] List decks returns empty array for new user
- [ ] Create deck succeeds with valid data
- [ ] Create deck fails without name
- [ ] Get deck returns correct data
- [ ] Get deck fails for non-existent deck
- [ ] Get deck fails for other user's deck
- [ ] Update deck succeeds with valid data
- [ ] Update deck fails for other user's deck
- [ ] Delete deck removes deck and all cards
- [ ] Delete deck fails for other user's deck

### Cards
- [ ] List cards returns empty array for new deck
- [ ] Create card succeeds with valid data
- [ ] Create card fails without front/back
- [ ] Get card returns correct data
- [ ] Get card fails for non-existent card
- [ ] Get card fails for other user's card
- [ ] Update card succeeds with valid data
- [ ] Update card fails for other user's card
- [ ] Delete card removes card from deck
- [ ] Delete card fails for other user's card

### Security
- [ ] All protected routes require authentication
- [ ] Users cannot access other users' data
- [ ] Tokens expire after 7 days
- [ ] CORS headers are set correctly
- [ ] Error messages don't leak sensitive data

### Performance
- [ ] API responds within 200ms for simple queries
- [ ] Batch operations use Promise.all()
- [ ] KV operations are optimized
- [ ] No unnecessary KV reads
