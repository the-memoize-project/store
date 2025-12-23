# @the-memoize-project/store/card

> Flashcard CRUD operations with FSRS scheduling support

## Overview

The **card** module provides complete CRUD (Create, Read, Update, Delete) operations for flashcards with integrated support for the FSRS (Free Spaced Repetition Scheduler) algorithm. Cards contain front/back content and comprehensive metadata for optimal spaced repetition scheduling.

## Purpose

This module manages individual flashcards within decks, including:
- Creating new flashcards with FSRS initial state
- Reading card data with scheduling metadata
- Updating card content and FSRS parameters
- Deleting cards from decks
- Listing all cards in a deck

## Installation

This module is part of the Memoize Store monorepo. Import it using the TypeScript alias:

```javascript
import Card from '@card';
```

---

## Card Data Model

### Fields

```typescript
interface Card {
  id: string;              // Unique card identifier
  front: string;           // Question or prompt
  back: string;            // Answer or response

  // FSRS Scheduling Fields
  state: number;           // 0=New, 1=Learning, 2=Review, 3=Relearning
  stability: number;       // Memory stability (higher = longer intervals)
  difficulty: number;      // Card difficulty (0-10)
  due: number;             // Next review timestamp (Unix ms)
  last_review: number;     // Last review timestamp (Unix ms)
  reps: number;            // Total number of reviews
  lapses: number;          // Number of times forgotten

  // Metadata
  created_at: number;      // Creation timestamp (Unix ms)
  deck_id: string;         // Parent deck ID
  user_id: string;         // Owner's user ID
}
```

---

## Quick Start

### Create a Card

```javascript
import { me } from '@auth';
import Card from '@card';
import router from '@the-memoize-project/router/worker';

router.post('/api/decks/:deckId/cards', me(async (user) => {
  const { front, back } = await request.json();
  const deck = { id: request.params.deckId };

  const { data, error } = await Card.create(deck, {
    front,
    back,
    state: 0,              // New card
    stability: 0,
    difficulty: 5,          // Medium difficulty
    due: Date.now(),
    last_review: null,
    reps: 0,
    lapses: 0
  }, user);

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}));
```

### Get a Card

```javascript
router.get('/api/cards/:id', me(async (user) => {
  const { data, error } = await Card.get(
    { id: request.params.id },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 404 });
  }

  return Response.json(data);
}));
```

### List Cards in Deck

```javascript
router.get('/api/decks/:deckId/cards', me(async (user) => {
  const { data, error } = await Card.list(
    { id: request.params.deckId },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ cards: data });
}));
```

---

## API Reference

### `Card.create(deck, card, user)`

Creates a new flashcard in the specified deck.

**Parameters:**
```typescript
deck: { id: string }
card: {
  front: string
  back: string
  state: number
  stability: number
  difficulty: number
  due: number
  last_review: number | null
  reps: number
  lapses: number
}
user: { id: string }
```

**Returns:**
```typescript
{ data: Card } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Card.create(
  { id: 'deck_abc' },
  {
    front: 'What is FSRS?',
    back: 'Free Spaced Repetition Scheduler',
    state: 0,
    stability: 0,
    difficulty: 5,
    due: Date.now(),
    last_review: null,
    reps: 0,
    lapses: 0
  },
  { id: 'user_123' }
);
```

---

### `Card.get(card, user)`

Retrieves a single card by ID.

**Parameters:**
```typescript
card: { id: string }
user: { id: string }
```

**Returns:**
```typescript
{ data: Card } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Card.get(
  { id: 'card_xyz' },
  { id: 'user_123' }
);
```

---

### `Card.list(deck, user)`

Lists all cards in a deck, ordered by creation date (newest first).

**Parameters:**
```typescript
deck: { id: string }
user: { id: string }
```

**Returns:**
```typescript
{ data: Card[] } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Card.list(
  { id: 'deck_abc' },
  { id: 'user_123' }
);

// data = [{ id: '...', front: '...', ... }, ...]
```

---

### `Card.update(card, user)`

Updates a card's content and FSRS metadata.

**Parameters:**
```typescript
card: {
  id: string
  front: string
  back: string
  state: number
  stability: number
  difficulty: number
  due: number
  last_review: number
  reps: number
  lapses: number
}
user: { id: string }
```

**Returns:**
```typescript
{ data: true } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Card.update(
  {
    id: 'card_xyz',
    front: 'Updated question',
    back: 'Updated answer',
    state: 2,           // Now in review
    stability: 10.5,
    difficulty: 4.2,
    due: Date.now() + 86400000,  // Tomorrow
    last_review: Date.now(),
    reps: 3,
    lapses: 0
  },
  { id: 'user_123' }
);
```

---

### `Card.delete(card, user)`

Deletes a card.

**Parameters:**
```typescript
card: { id: string }
user: { id: string }
```

**Returns:**
```typescript
{ data: true } | { error: string }
```

**Example:**
```javascript
const { data, error } = await Card.delete(
  { id: 'card_xyz' },
  { id: 'user_123' }
);
```

---

## FSRS Integration

### Card States

| State | Value | Meaning |
|-------|-------|---------|
| New | 0 | Never reviewed |
| Learning | 1 | Initial learning phase |
| Review | 2 | Regular review phase |
| Relearning | 3 | Re-learning after forgetting |

### Initial FSRS Values

When creating a new card:

```javascript
{
  state: 0,              // New
  stability: 0,          // No stability yet
  difficulty: 5,         // Medium (0-10 scale)
  due: Date.now(),       // Due immediately
  last_review: null,     // Never reviewed
  reps: 0,               // No reviews
  lapses: 0              // No lapses
}
```

### After First Review

```javascript
{
  state: 1,              // Learning
  stability: 2.5,        // Initial stability
  difficulty: 4.8,       // Adjusted based on performance
  due: Date.now() + (1000 * 60 * 10),  // 10 minutes
  last_review: Date.now(),
  reps: 1,
  lapses: 0
}
```

### Mature Card

```javascript
{
  state: 2,              // Review
  stability: 45.2,       // High stability
  difficulty: 3.1,       // Lower difficulty (easier)
  due: Date.now() + (1000 * 60 * 60 * 24 * 30),  // 30 days
  last_review: Date.now(),
  reps: 15,
  lapses: 1
}
```

---

## Complete Example

### Full CRUD Workflow

```javascript
import { me } from '@auth';
import Card from '@card';
import router from '@the-memoize-project/router/worker';

// CREATE - Add a new card
router.post('/api/decks/:deckId/cards', me(async (user) => {
  const body = await request.json();
  const deck = { id: request.params.deckId };

  const { data, error } = await Card.create(deck, {
    front: body.front,
    back: body.back,
    state: 0,
    stability: 0,
    difficulty: 5,
    due: Date.now(),
    last_review: null,
    reps: 0,
    lapses: 0
  }, user);

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}));

// READ - Get single card
router.get('/api/cards/:id', me(async (user) => {
  const { data, error } = await Card.get(
    { id: request.params.id },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 404 });
  }

  return Response.json(data);
}));

// READ - List all cards in deck
router.get('/api/decks/:deckId/cards', me(async (user) => {
  const { data, error } = await Card.list(
    { id: request.params.deckId },
    user
  );

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ cards: data });
}));

// UPDATE - Update card after review
router.put('/api/cards/:id', me(async (user) => {
  const body = await request.json();

  const { data, error } = await Card.update({
    id: request.params.id,
    front: body.front,
    back: body.back,
    state: body.state,
    stability: body.stability,
    difficulty: body.difficulty,
    due: body.due,
    last_review: Date.now(),
    reps: body.reps + 1,
    lapses: body.lapses
  }, user);

  if (error) {
    return Response.json({ error }, { status: 404 });
  }

  return Response.json({ success: true });
}));

// DELETE - Delete card
router.delete('/api/cards/:id', me(async (user) => {
  const { data, error } = await Card.delete(
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
CREATE TABLE card (
  id TEXT PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  state INTEGER NOT NULL DEFAULT 0,
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 5,
  due INTEGER NOT NULL,
  last_review INTEGER,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  deck_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (deck_id) REFERENCES deck(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_card_deck ON card(deck_id);
CREATE INDEX idx_card_user ON card(user_id);
CREATE INDEX idx_card_due ON card(due);
```

---

## Best Practices

### 1. Always Validate User Ownership

The Card methods check `user_id` to ensure users can only access their own cards:

```javascript
const { data, error } = await Card.get({ id }, user);
// Fails if card doesn't belong to user
```

### 2. Update FSRS Fields After Review

When a user reviews a card, update all FSRS fields:

```javascript
await Card.update({
  id: card.id,
  front: card.front,
  back: card.back,
  state: newState,
  stability: newStability,
  difficulty: newDifficulty,
  due: newDueDate,
  last_review: Date.now(),
  reps: card.reps + 1,
  lapses: card.lapses + (forgot ? 1 : 0)
}, user);
```

### 3. Handle Errors Gracefully

```javascript
const { data, error } = await Card.create(deck, cardData, user);

if (error) {
  console.error('Failed to create card:', error);
  return Response.json({ error }, { status: 500 });
}

return Response.json(data, { status: 201 });
```

### 4. Use Transactions for Batch Operations

When creating multiple cards:

```javascript
const results = await Promise.all(
  cards.map(cardData => Card.create(deck, cardData, user))
);

const failures = results.filter(r => r.error);
if (failures.length > 0) {
  // Handle partial failure
}
```

---

## Testing

### Example Tests

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import Card from '@card';

describe('Card.create', () => {
  const mockUser = { id: 'user_123' };
  const mockDeck = { id: 'deck_abc' };

  it('should create a new card', async () => {
    const { data, error } = await Card.create(mockDeck, {
      front: 'Question',
      back: 'Answer',
      state: 0,
      stability: 0,
      difficulty: 5,
      due: Date.now(),
      last_review: null,
      reps: 0,
      lapses: 0
    }, mockUser);

    expect(error).toBeUndefined();
    expect(data).toHaveProperty('id');
    expect(data.front).toBe('Question');
    expect(data.state).toBe(0);
  });

  it('should assign deck_id and user_id', async () => {
    const { data } = await Card.create(mockDeck, cardData, mockUser);

    expect(data.deck_id).toBe('deck_abc');
    expect(data.user_id).toBe('user_123');
  });
});

describe('Card.get', () => {
  it('should return error for non-existent card', async () => {
    const { data, error } = await Card.get(
      { id: 'nonexistent' },
      { id: 'user_123' }
    );

    expect(data).toBeUndefined();
    expect(error).toBe('Failed to get card');
  });

  it('should not return cards from other users', async () => {
    // Create card for user_123
    const { data: createdCard } = await Card.create(
      mockDeck,
      cardData,
      { id: 'user_123' }
    );

    // Try to get it as user_456
    const { data, error } = await Card.get(
      { id: createdCard.id },
      { id: 'user_456' }
    );

    expect(error).toBeDefined();
  });
});
```

---

## Related Modules

- **[@auth](../auth)** - User authentication (required)
- **[@deck](../deck)** - Parent deck operations
- **[@id](../id)** - ID generation for new cards
- **[@env](../env)** - Database connection

---

## FSRS Resources

- [FSRS GitHub](https://github.com/open-spaced-repetition/fsrs4anki)
- [FSRS Algorithm](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)
- [FSRS Parameters](https://github.com/open-spaced-repetition/fsrs4anki/wiki/Free-Spaced-Repetition-Scheduler)

---

## Troubleshooting

### Cards not appearing in list

**Solutions:**
1. Verify the deck_id is correct
2. Check user_id matches authenticated user
3. Ensure cards were created successfully
4. Check database connection

### FSRS calculations seem incorrect

**Solutions:**
1. Verify all FSRS fields are present
2. Check that stability > 0 after first review
3. Ensure difficulty is between 0-10
4. Validate due dates are in the future

---

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for contribution guidelines.

---

**Part of The Memoize Project Store** 💾
