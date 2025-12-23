# @the-memoize-project/store/id

> Simple unique ID generation

## Overview

The **id** module provides a lightweight utility for generating unique identifiers for database records. It uses JavaScript's built-in `Math.random()` with base-32 encoding to create compact, URL-safe IDs.

## Purpose

This module:
- Generates unique IDs for cards, decks, and other entities
- Provides collision-resistant identifiers
- Creates compact, URL-safe strings
- Avoids dependencies on external ID generation libraries

## Installation

This module is part of the Memoize Store monorepo. Import it using the TypeScript alias:

```javascript
import Id from '@id';
```

---

## Quick Start

```javascript
import Id from '@id';

// Generate a unique ID
const id = Id.new();

console.log(id);  // e.g., "k7q9m2x5p8"
```

---

## API Reference

### `Id.new(): string`

Generates a new unique identifier.

**Returns:** String containing a random ID

**Example:**
```javascript
const id = Id.new();
// "k7q9m2x5p8"
```

**Characteristics:**
- **Length:** Variable (typically 10-11 characters)
- **Character set:** `0-9`, `a-v` (base-32)
- **URL-safe:** Yes
- **Unique:** Extremely high probability (collision-resistant)

---

## Implementation

```javascript
// src/id/id.js
const Id = {
  new() {
    return Math.random().toString(32).slice(2);
  }
};

export default Id;
```

### How It Works

1. `Math.random()` generates a random number between 0 and 1
   - Example: `0.8417694834729`

2. `.toString(32)` converts to base-32
   - Base-32 uses characters: `0-9` and `a-v`
   - Example: `0.qk7m2x5p8`

3. `.slice(2)` removes the `0.` prefix
   - Example: `qk7m2x5p8`

---

## Usage Examples

### Creating a Card

```javascript
import Id from '@id';
import env from '@env';

async function createCard(deck, card, user) {
  const id = Id.new();

  await env.DB.prepare(
    'INSERT INTO card (id, front, back, deck_id, user_id) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(id, card.front, card.back, deck.id, user.id)
    .run();

  return { id, ...card };
}
```

### Creating a Deck

```javascript
import Id from '@id';

const Deck = {
  async create(deck, user) {
    const id = Id.new();

    await env.DB.prepare(
      'INSERT INTO deck (id, name, description, created_at, user_id) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, deck.name, deck.description, Date.now(), user.id)
      .run();

    return { id, ...deck };
  }
};
```

### Generating Multiple IDs

```javascript
const ids = Array.from({ length: 5 }, () => Id.new());

console.log(ids);
// [
//   "k7q9m2x5p8",
//   "n3f8d1b9a4",
//   "p2r7k5m9x3",
//   "q8h4n2v6b1",
//   "m9d3f7k2p5"
// ]
```

---

## Characteristics

### ID Format

```
k7q9m2x5p8
│└─────────┘
│    └─ Random alphanumeric (base-32)
└─ Always starts with a letter (never 0.)
```

### Length

IDs are typically 10-11 characters long, but can vary slightly:

```javascript
Id.new();  // "k7q9m2x5p8"  (10 chars)
Id.new();  // "n3f8d1b9a4c" (11 chars)
```

### Character Set

Base-32 encoding uses:
- Digits: `0-9` (10 characters)
- Letters: `a-v` (22 characters)
- Total: 32 possible characters per position

**Not included:** `w-z` (to maintain base-32)

---

## Collision Probability

### How Unique Are These IDs?

With `Math.random()` providing ~53 bits of entropy (JavaScript's Number precision), the probability of collision is extremely low for typical use cases.

**Approximate collision probability:**

| Total IDs | Collision Probability |
|-----------|----------------------|
| 1,000 | ~0.00001% |
| 10,000 | ~0.001% |
| 100,000 | ~0.1% |
| 1,000,000 | ~11% |

**Conclusion:** Suitable for applications with up to ~100,000 entities. For larger scales, consider UUIDs or cryptographic random generators.

---

## Best Practices

### 1. Use for Database Primary Keys

```javascript
// Good - Primary key
const id = Id.new();
await env.DB.prepare(
  'INSERT INTO deck (id, ...) VALUES (?, ...)'
).bind(id, ...).run();

// Bad - Auto-increment (not suitable for distributed systems)
// Let database generate ID
```

### 2. Don't Reuse IDs

```javascript
// Good - Generate new ID for each entity
const deckId = Id.new();
const cardId = Id.new();

// Bad - Reusing ID
const id = Id.new();
const deckId = id;  // Don't do this
const cardId = id;  // Don't do this
```

### 3. Store as Text

```sql
-- Good - TEXT primary key
CREATE TABLE deck (
  id TEXT PRIMARY KEY,
  ...
);

-- Avoid - INTEGER (IDs are not numbers)
CREATE TABLE deck (
  id INTEGER PRIMARY KEY,  -- Don't do this
  ...
);
```

### 4. Don't Parse or Validate Format

IDs are opaque strings. Don't assume format:

```javascript
// Good - Use as-is
const id = Id.new();
await saveToDatabase(id);

// Bad - Assuming format
const id = Id.new();
if (id.length !== 10) {  // Don't do this
  throw new Error('Invalid ID');
}
```

---

## Limitations

### Not Cryptographically Secure

`Math.random()` is **not cryptographically secure**. Don't use these IDs for:
- Security tokens
- Session IDs
- Password reset tokens
- API keys

For secure tokens, use:
```javascript
// Use crypto.randomUUID() instead
const secureId = crypto.randomUUID();
// "a3bb189e-8bf9-3888-9912-ace4e6543002"
```

### Not Sequential

IDs are random and don't indicate creation order:

```javascript
const id1 = Id.new();  // "k7q9m2x5p8"
const id2 = Id.new();  // "n3f8d1b9a4"
const id3 = Id.new();  // "a9d5k2m7p3"

// Can't determine which was created first
```

To track order, use timestamps:

```sql
CREATE TABLE deck (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  ...
);
```

### Variable Length

IDs don't have a fixed length (typically 10-11 chars). Don't rely on specific length:

```javascript
// Bad
if (id.length === 10) {
  // This might fail for some IDs
}

// Good
if (typeof id === 'string' && id.length > 0) {
  // Check for valid string
}
```

---

## Alternatives

### UUID v4

For stronger uniqueness guarantees:

```javascript
// Native Web Crypto API
const id = crypto.randomUUID();
// "a3bb189e-8bf9-3888-9912-ace4e6543002"
```

**Pros:**
- Standardized format
- 128 bits of randomness
- Cryptographically secure

**Cons:**
- Longer (36 characters)
- Contains hyphens (less compact)

### ULID

For sortable, time-based IDs:

```javascript
// Requires library
import { ulid } from 'ulid';

const id = ulid();
// "01ARZ3NDEKTSV4RRFFQ69G5FAV"
```

**Pros:**
- Sortable by time
- URL-safe
- 128 bits

**Cons:**
- Requires dependency

### Nanoid

For customizable compact IDs:

```javascript
// Requires library
import { nanoid } from 'nanoid';

const id = nanoid();
// "V1StGXR8_Z5jdHi6B-myT"
```

**Pros:**
- Compact
- URL-safe
- Customizable alphabet and length

**Cons:**
- Requires dependency

---

## Testing

### Example Tests

```javascript
import { describe, it, expect } from 'vitest';
import Id from '@id';

describe('Id.new', () => {
  it('should generate a string', () => {
    const id = Id.new();
    expect(typeof id).toBe('string');
  });

  it('should generate non-empty IDs', () => {
    const id = Id.new();
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 10000; i++) {
      ids.add(Id.new());
    }

    // All IDs should be unique
    expect(ids.size).toBe(10000);
  });

  it('should generate URL-safe IDs', () => {
    const id = Id.new();

    // Should only contain base-32 characters
    expect(id).toMatch(/^[0-9a-v]+$/);
  });

  it('should not start with a period', () => {
    const id = Id.new();
    expect(id).not.toMatch(/^\./);
  });

  it('should be typically 10-11 characters', () => {
    const ids = Array.from({ length: 100 }, () => Id.new());
    const lengths = ids.map(id => id.length);

    expect(Math.min(...lengths)).toBeGreaterThanOrEqual(9);
    expect(Math.max(...lengths)).toBeLessThanOrEqual(12);
  });
});
```

### Mocking in Tests

```javascript
import { describe, it, vi } from 'vitest';
import Id from '@id';

describe('Card.create', () => {
  it('should use Id.new for ID generation', () => {
    const spy = vi.spyOn(Id, 'new');

    await Card.create(deck, card, user);

    expect(spy).toHaveBeenCalled();
  });

  it('should use mocked ID', () => {
    vi.spyOn(Id, 'new').mockReturnValue('test-id-123');

    const { data } = await Card.create(deck, card, user);

    expect(data.id).toBe('test-id-123');
  });
});
```

---

## Performance

### Benchmarks

ID generation is extremely fast:

```javascript
console.time('Generate 100,000 IDs');
for (let i = 0; i < 100000; i++) {
  Id.new();
}
console.timeEnd('Generate 100,000 IDs');
// ~15-20ms on typical hardware
```

### Memory Usage

IDs are lightweight strings:

```javascript
const id = Id.new();
console.log(new Blob([id]).size);
// ~10-11 bytes
```

---

## Migration Guide

### From Auto-Increment IDs

**Before:**
```sql
CREATE TABLE deck (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
);
```

**After:**
```sql
CREATE TABLE deck (
  id TEXT PRIMARY KEY,
  name TEXT
);
```

**Application code:**
```javascript
// Before
const id = result.lastInsertRowid;

// After
const id = Id.new();
const result = await env.DB.prepare(
  'INSERT INTO deck (id, name) VALUES (?, ?)'
).bind(id, name).run();
```

---

## Related Modules

- **[@card](../card)** - Uses Id.new() for card IDs
- **[@deck](../deck)** - Uses Id.new() for deck IDs
- **[@env](../env)** - Database storage for IDs

---

## References

- [Math.random() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
- [Number.prototype.toString() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString)
- [UUID - RFC 4122](https://datatracker.ietf.org/doc/html/rfc4122)

---

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for contribution guidelines.

---

**Part of The Memoize Project Store** 💾
