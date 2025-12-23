# Navigation Guide

This document helps you navigate the Memoize Store codebase and documentation.

---

## 📚 Documentation

### Getting Started
- [README.md](README.md) - Project overview, quick start, and API endpoints
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute to the project
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines

### Architecture & Design
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design decisions
- [GLOSSARY.md](GLOSSARY.md) - Key terms and concepts
- [EXAMPLES.md](EXAMPLES.md) - Usage examples and code snippets

### Development
- [TESTING.md](TESTING.md) - Testing guide and conventions
- [SECURITY.md](SECURITY.md) - Security policies and vulnerability reporting
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes

---

## 📁 Project Structure

```
store/
├── src/                    # Source code
│   ├── index.js           # Worker entry point
│   ├── auth/              # Authentication module
│   ├── card/              # Card CRUD module
│   ├── deck/              # Deck CRUD module
│   ├── env/               # Environment variables
│   └── id/                # ID generation
├── migrations/            # Database migrations
├── wrangler.toml          # Cloudflare configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

---

## 🗂️ Module Documentation

### Core Modules
- [auth/](src/auth/README.md) - Authentication and authorization
  - [me/](src/auth/me/README.md) - Authentication middleware
- [card/](src/card/README.md) - Flashcard operations
- [deck/](src/deck/README.md) - Deck operations

### Utility Modules
- [env/](src/env/README.md) - Environment variable management
- [id/](src/id/README.md) - Unique ID generation

---

## 🔍 Finding What You Need

### I want to...

#### Understand the API
→ Start with [README.md](README.md#-api-endpoints)

#### Add a new endpoint
→ Read [ARCHITECTURE.md](ARCHITECTURE.md) then check the relevant module (card/deck)

#### Fix a bug
→ Check [TESTING.md](TESTING.md) for how to run tests, then navigate to the relevant module

#### Deploy changes
→ See [README.md](README.md#-quick-start) for deployment commands

#### Report a security issue
→ Follow [SECURITY.md](SECURITY.md)

#### Understand FSRS scheduling
→ Check [GLOSSARY.md](GLOSSARY.md#fsrs-terms) and [card/README.md](src/card/README.md)

#### Set up authentication
→ See [auth/README.md](src/auth/README.md)

#### Work with the database
→ Check [ARCHITECTURE.md](ARCHITECTURE.md#database) and `migrations/`

---

## 📖 Module Deep Dive

### Authentication Flow
```
src/auth/
├── index.js              # Exports
├── me/
│   ├── index.js         # Middleware export
│   ├── me.js            # Me middleware implementation
│   └── README.md        # Me middleware documentation
└── README.md            # Auth module overview
```

**Read:** [auth/README.md](src/auth/README.md) → [auth/me/README.md](src/auth/me/README.md)

---

### Card Operations
```
src/card/
├── index.js              # Router setup
├── card.js               # Card model (CRUD methods)
├── init.js               # Route initialization
├── create.js             # POST /api/decks/:deckId/cards
├── read.js               # GET /api/cards/:id
├── update.js             # PUT /api/cards/:id
├── delete.js             # DELETE /api/cards/:id
└── README.md            # Card module documentation
```

**Read:** [card/README.md](src/card/README.md)

---

### Deck Operations
```
src/deck/
├── index.js              # Router setup
├── deck.js               # Deck model (CRUD methods)
├── init.js               # Route initialization
├── create.js             # POST /api/decks
├── read.js               # GET /api/decks/:id, GET /api/decks
├── update.js             # PUT /api/decks/:id
├── delete.js             # DELETE /api/decks/:id
└── README.md            # Deck module documentation
```

**Read:** [deck/README.md](src/deck/README.md)

---

## 🧪 Testing

### Test Location
```
Each module should have corresponding test files:
src/card/card.spec.js
src/deck/deck.spec.js
src/auth/me/me.spec.js
```

**Read:** [TESTING.md](TESTING.md)

---

## 🗺️ Code Patterns

### Middleware Pattern
See: [auth/me/me.js](src/auth/me/me.js)

```javascript
const middleware = (next) => (context) => {
  // Process request
  return next(transformedContext);
};
```

### Result Pattern
See: [card/card.js](src/card/card.js)

```javascript
// Success
return { data: result };

// Failure
return { error: "Error message" };
```

### Router Pattern
See: [card/index.js](src/card/index.js)

```javascript
import router from '@the-memoize-project/router/worker';

router.post('/path', handler);
```

---

## 🔗 External Resources

### Dependencies
- [@the-memoize-project/router](https://github.com/the-memoize-project/router) - Request routing
- [@the-memoize-project/auth](https://github.com/the-memoize-project/auth) - Google OAuth

### Cloudflare Docs
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [KV Storage](https://developers.cloudflare.com/kv/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### FSRS Algorithm
- [FSRS GitHub](https://github.com/open-spaced-repetition/fsrs4anki)
- [FSRS Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki)

---

## 🛠️ Configuration Files

| File | Purpose |
|------|---------|
| `wrangler.toml` | Cloudflare Workers configuration |
| `tsconfig.json` | TypeScript compiler options and path aliases |
| `package.json` | Dependencies, scripts, and project metadata |
| `biome.json` | Code formatting and linting rules |
| `commitlint.config.cjs` | Git commit message linting |

---

## 📝 Contributing Workflow

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) for design patterns
3. Review module README for specific guidelines
4. Write tests following [TESTING.md](TESTING.md)
5. Submit PR with clear description

---

## 🆘 Getting Help

### Documentation Issues
→ [Open an issue](https://github.com/the-memoize-project/store/issues)

### Questions
→ [Start a discussion](https://github.com/the-memoize-project/store/discussions)

### Security Concerns
→ See [SECURITY.md](SECURITY.md)

---

**Navigation updated:** 2024-12-23

**Part of The Memoize Project** 💾
