# @the-memoize-project/store/deck

> Deck CRUD operations for organizing flashcards

## Overview

The **deck** module provides complete CRUD (Create, Read, Update, Delete) operations for flashcard decks. Decks are collections that organize cards by topic, subject, or any other categorization chosen by the user.

## Purpose

This module manages deck operations, including:
- Creating new decks
- Reading deck metadata
- Listing all user decks
- Updating deck information
- Deleting decks (and all contained cards)

## Installation

This module is part of the Memoize Store monorepo. Import it using the TypeScript alias:

```javascript
import Deck from '@deck';
```

---

## Deck Data Model

### Fields

```typescript
interface Deck {
  id: string;              // Unique deck identifier
  name: string;            // Deck name
  description: string;     // Deck description
  created_at: number;      // Creation timestamp (Unix ms)
  user_id: string;         // Owner's user ID
}
```

---

## Quick Start

### Create a Deck

```javascript
import { me } from '@auth';
import Deck from '@deck';
import router from '@the-memoize-project/router/worker';

router.post('/api/decks', me(async (user) => {
  const { name, description } = await request.json();

  const { data, error } = await Deck.create(
    { name, description },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}));
```

### Get a Deck

```javascript
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

### List All Decks

```javascript
router.get('/api/decks', me(async (user) => {
  const { data, error } = await Deck.list(user);

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ decks: data });
}));
```

---

## API Reference

### `Deck.create(deck, user)`

Creates a new deck.

**Parameters:**
```typescript
deck: {
  name: string
  description: string
}
user: { id: string }
```

**Returns:**
```typescript
{ data: Deck } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Deck.create(
  {
    name: 'Spanish Vocabulary',
    description: 'Common Spanish words and phrases'
  },
  { id: 'user_123' }
);

// data = {
//   id: 'deck_xyz',
//   name: 'Spanish Vocabulary',
//   description: 'Common Spanish words and phrases',
//   created_at: 1703001600000,
//   user_id: 'user_123'
// }
```

---

### `Deck.get(deck, user)`

Retrieves a single deck by ID.

**Parameters:**
```typescript
deck: { id: string }
user: { id: string }
```

**Returns:**
```typescript
{ data: Deck } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Deck.get(
  { id: 'deck_xyz' },
  { id: 'user_123' }
);
```

**Security:** Users can only retrieve their own decks. Attempting to access another user's deck returns an error.

---

### `Deck.list(user)`

Lists all decks owned by the user, ordered by creation date (newest first).

**Parameters:**
```typescript
user: { id: string }
```

**Returns:**
```typescript
{ data: Deck[] } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Deck.list({ id: 'user_123' });

// data = [
//   {
//     id: 'deck_xyz',
//     name: 'Spanish Vocabulary',
//     description: 'Common Spanish words',
//     created_at: 1703001600000,
//     user_id: 'user_123'
//   },
//   {
//     id: 'deck_abc',
//     name: 'Japanese Kanji',
//     description: 'N5 level kanji',
//     created_at: 1702996000000,
//     user_id: 'user_123'
//   }
// ]
```

---

### `Deck.update(deck, user)`

Updates a deck's name and description.

**Parameters:**
```typescript
deck: {
  id: string
  name: string
  description: string
}
user: { id: string }
```

**Returns:**
```typescript
{ data: true } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Deck.update(
  {
    id: 'deck_xyz',
    name: 'Spanish Vocabulary - Updated',
    description: 'Common Spanish words, phrases, and grammar'
  },
  { id: 'user_123' }
);
```

**Note:** The `id` field in the deck parameter is not used in the current implementation (line 58 of deck.js). This should be fixed to use `deck.id` instead of generating a new ID.

---

### `Deck.delete(deck, user)`

Deletes a deck and all its associated cards.

**Parameters:**
```typescript
deck: { id: string }
user: { id: string }
```

**Returns:**
```typescript
{ data: true } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Deck.delete(
  { id: 'deck_xyz' },
  { id: 'user_123' }
);
```

**Warning:** This operation is **irreversible**. All cards in the deck will be deleted due to the CASCADE foreign key constraint.

---

## Complete Example

### Full CRUD Workflow

```javascript
import { me } from '@auth';
import Deck from '@deck';
import router from '@the-memoize-project/router/worker';

// CREATE - Create a new deck
router.post('/api/decks', me(async (user) => {
  const { name, description } = await request.json();

  const { data, error } = await Deck.create(
    { name, description },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}));

// READ - Get single deck
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

// READ - List all decks
router.get('/api/decks', me(async (user) => {
  const { data, error } = await Deck.list(user);

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ decks: data });
}));

// UPDATE - Update deck
router.put('/api/decks/:id', me(async (user) => {
  const { name, description } = await request.json();

  const { data, error } = await Deck.update(
    {
      id: request.params.id,
      name,
      description
    },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 404 });
  }

  return Response.json({ success: true });
}));

// DELETE - Delete deck
router.delete('/api/decks/:id', me(async (user) => {
  const { data, error } = await Deck.delete(
    { id: request.params.id },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 404 });
  }

  return Response.json({ success: true });
}));
```

---

## Database Schema

```sql
CREATE TABLE deck (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_deck_user ON deck(user_id);
CREATE INDEX idx_deck_created ON deck(created_at);
```

### Foreign Key Constraints

When a deck is deleted, all associated cards are automatically deleted due to the CASCADE constraint on the `card` table:

```sql
-- In card table
FOREIGN KEY (deck_id) REFERENCES deck(id) ON DELETE CASCADE
```

---

## Best Practices

### 1. Always Validate User Ownership

The Deck methods enforce user ownership:

```javascript
const { data, error } = await Deck.get({ id }, user);
// Fails if deck doesn't belong to user
```

### 2. Handle Errors Gracefully

```javascript
const { data, error } = await Deck.create({ name, description }, user);

if (error) {
  console.error('Failed to create deck:', error);
  return Response.json({ error }, { status: 500 });
}

return Response.json(data, { status: 201 });
```

### 3. Confirm Before Deleting

Since deck deletion is irreversible and deletes all cards:

```javascript
// Frontend should show confirmation dialog
const confirmed = await showConfirmDialog(
  `Delete deck "${deck.name}" and all its cards?`
);

if (!confirmed) return;

const { error } = await fetch(`/api/decks/${deck.id}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});
```

### 4. Provide Meaningful Names and Descriptions

```javascript
// Good - descriptive
await Deck.create({
  name: 'Japanese N5 Grammar',
  description: 'Essential grammar patterns for JLPT N5 level'
}, user);

// Bad - vague
await Deck.create({
  name: 'Study',
  description: ''
}, user);
```

### 5. List Decks with Pagination (Future Enhancement)

For users with many decks, consider adding pagination:

```javascript
// Future API
router.get('/api/decks', me(async (user) => {
  const limit = parseInt(request.query.limit) || 20;
  const offset = parseInt(request.query.offset) || 0;

  const { data } = await Deck.list(user, { limit, offset });
  return Response.json({ decks: data });
}));
```

---

## Testing

### Example Tests

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import Deck from '@deck';

describe('Deck.create', () => {
  const mockUser = { id: 'user_123' };

  it('should create a new deck', async () => {
    const { data, error } = await Deck.create({
      name: 'Test Deck',
      description: 'Test Description'
    }, mockUser);

    expect(error).toBeUndefined();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe('Test Deck');
    expect(data.description).toBe('Test Description');
    expect(data.user_id).toBe('user_123');
  });

  it('should assign created_at timestamp', async () => {
    const before = Date.now();
    const { data } = await Deck.create({
      name: 'Test',
      description: 'Test'
    }, mockUser);
    const after = Date.now();

    expect(data.created_at).toBeGreaterThanOrEqual(before);
    expect(data.created_at).toBeLessThanOrEqual(after);
  });
});

describe('Deck.list', () => {
  it('should return decks in descending order', async () => {
    // Create multiple decks
    await Deck.create({ name: 'First', description: '' }, mockUser);
    await Deck.create({ name: 'Second', description: '' }, mockUser);
    await Deck.create({ name: 'Third', description: '' }, mockUser);

    const { data } = await Deck.list(mockUser);

    expect(data[0].name).toBe('Third');  // Most recent
    expect(data[2].name).toBe('First');  // Oldest
  });

  it('should not return other users decks', async () => {
    await Deck.create({ name: 'User 1', description: '' }, { id: 'user_1' });
    await Deck.create({ name: 'User 2', description: '' }, { id: 'user_2' });

    const { data } = await Deck.list({ id: 'user_1' });

    expect(data.length).toBe(1);
    expect(data[0].name).toBe('User 1');
  });
});

describe('Deck.update', () => {
  it('should update deck fields', async () => {
    const { data: created } = await Deck.create({
      name: 'Original',
      description: 'Original Description'
    }, mockUser);

    const { data, error } = await Deck.update({
      id: created.id,
      name: 'Updated',
      description: 'Updated Description'
    }, mockUser);

    expect(error).toBeUndefined();

    const { data: updated } = await Deck.get({ id: created.id }, mockUser);
    expect(updated.name).toBe('Updated');
    expect(updated.description).toBe('Updated Description');
  });
});

describe('Deck.delete', () => {
  it('should delete deck', async () => {
    const { data: created } = await Deck.create({
      name: 'To Delete',
      description: ''
    }, mockUser);

    const { error } = await Deck.delete({ id: created.id }, mockUser);
    expect(error).toBeUndefined();

    const { error: getError } = await Deck.get({ id: created.id }, mockUser);
    expect(getError).toBeDefined();
  });

  it('should cascade delete cards', async () => {
    const { data: deck } = await Deck.create({
      name: 'Deck with Cards',
      description: ''
    }, mockUser);

    // Create cards in deck
    await Card.create(deck, cardData1, mockUser);
    await Card.create(deck, cardData2, mockUser);

    // Delete deck
    await Deck.delete({ id: deck.id }, mockUser);

    // Cards should be deleted
    const { data: cards } = await Card.list(deck, mockUser);
    expect(cards.length).toBe(0);
  });
});
```

---

## Known Issues

### Deck.update Bug

**Issue:** Line 58 in `src/deck/deck.js` generates a new ID instead of using the provided `deck.id`:

```javascript
// Current (WRONG)
const id = Id.new();

// Should be
const id = deck.id;
```

**Impact:** Update operations may fail or update the wrong deck.

**Workaround:** This needs to be fixed in the codebase.

---

## Related Modules

- **[@auth](../auth)** - User authentication (required)
- **[@card](../card)** - Card operations within decks
- **[@id](../id)** - ID generation for new decks
- **[@env](../env)** - Database connection

---

## HTTP Examples

### Create Deck

**Request:**
```http
POST /api/decks HTTP/1.1
Authorization: Bearer ya29.a0...
Content-Type: application/json

{
  "name": "French Vocabulary",
  "description": "Common French words for beginners"
}
```

**Response (201):**
```json
{
  "id": "deck_xyz789",
  "name": "French Vocabulary",
  "description": "Common French words for beginners",
  "created_at": 1703001600000,
  "user_id": "google_user_123"
}
```

### List Decks

**Request:**
```http
GET /api/decks HTTP/1.1
Authorization: Bearer ya29.a0...
```

**Response (200):**
```json
{
  "decks": [
    {
      "id": "deck_xyz789",
      "name": "French Vocabulary",
      "description": "Common French words for beginners",
      "created_at": 1703001600000,
      "user_id": "google_user_123"
    },
    {
      "id": "deck_abc123",
      "name": "Spanish Grammar",
      "description": "Essential Spanish grammar rules",
      "created_at": 1702996000000,
      "user_id": "google_user_123"
    }
  ]
}
```

---

## Troubleshooting

### Deck not found errors

**Solutions:**
1. Verify the deck ID is correct
2. Ensure the user owns the deck
3. Check if the deck was deleted
4. Verify database connection

### Decks not appearing in list

**Solutions:**
1. Check user_id matches authenticated user
2. Ensure decks were created successfully
3. Verify database connection
4. Check for database errors in logs

### Update operations failing

**Solutions:**
1. Fix the bug in Deck.update (line 58)
2. Verify all required fields are provided
3. Check user authorization
4. Review database constraints

---

## Future Enhancements

- [ ] Pagination for deck lists
- [ ] Deck sharing/collaboration
- [ ] Deck categories/tags
- [ ] Deck statistics (card count, due count)
- [ ] Deck import/export
- [ ] Deck templates
- [ ] Soft delete (trash/archive)

---

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for contribution guidelines.

---

**Part of The Memoize Project Store** 💾
