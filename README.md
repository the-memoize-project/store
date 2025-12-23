<div align="center">

# 💾 Memoize Store

**Backend API for The Memoize Project. Zero dependencies, edge-deployed.**

Part of [**The Memoize Project**](https://github.com/the-memoize-project) — A modern flashcard application with FSRS spaced repetition

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg?style=flat-square)](https://workers.cloudflare.com/)

[**Getting Started**](#-quick-start) · [**Documentation**](#-api-endpoints) · [**Contributing**](CONTRIBUTING.md)

</div>

---

## 📚 About The Memoize Project

**The Memoize Project** is a modern, personal flashcard application designed for effective learning through spaced repetition. Born from a comprehensive architectural refactoring, the project embraces a **micro-repository architecture** where each context is independently maintained and versioned.

### 🎯 Project Context

- **Mission**: Building a powerful flashcard application with cutting-edge spaced repetition algorithms
- **Evolution**: Migrating from Anki's SM-2 algorithm to the more sophisticated **FSRS (Free Spaced Repetition Scheduler)**
- **Architecture**: Modern micro-repo structure with independent, focused modules
- **Organization**: [github.com/the-memoize-project](https://github.com/the-memoize-project)

### 🧩 Repository Purpose

This repository (`store`) provides the **backend API** that powers the Memoize application. It's designed to be:

- **Lightweight**: Zero dependencies, minimal footprint
- **Edge-Native**: Deployed on Cloudflare Workers for global low-latency
- **Secure**: OAuth2 authentication with Google Sign-In
- **Scalable**: D1 database with efficient SQLite storage
- **Type-Safe**: Full TypeScript support

---

## 🌟 What is Memoize Store?

**Memoize Store** is a backend API built on Cloudflare Workers that provides:

- **Authentication**: OAuth2 with Google Sign-In
- **User Management**: User profiles and session handling
- **Deck Management**: CRUD operations for flashcard decks
- **Card Management**: CRUD operations for flashcards
- **Edge Computing**: Low-latency responses worldwide

### ✨ Key Features

- **🔐 Google OAuth** - Secure authentication with Google Sign-In
- **⚡ Zero Dependencies** - Built on native Web APIs and Cloudflare Workers
- **🪶 Ultra Lightweight** - Minimal bundle size, maximum performance
- **🌍 Global Edge** - Deployed worldwide on Cloudflare's network
- **💾 D1 Database** - Cloudflare's serverless SQL database built on SQLite
- **🔒 Type Safe** - Full TypeScript definitions included
- **🎯 RESTful API** - Clean, predictable API design
- **🔑 Token-Based Auth** - Access token validation on all protected routes
- **✅ 100% Test Coverage** - Comprehensive test suite with 163 tests

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) or Node.js 18+
- [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- Google OAuth2 credentials

### Installation

```bash
# Install dependencies
bun install

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create memoize

# Update wrangler.toml with the database ID

# Run migrations
bun run migration

# Set environment variables
# Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET via Cloudflare dashboard or .dev.vars

# Start development server
bun run dev

# Deploy to production
bun run deploy
```

---

## 📡 API Endpoints

### Authentication

#### `POST /auth/callback`
Exchange Google OAuth code for user data and access token.

**Request:**
```json
{
  "code": "google_oauth_code_from_frontend"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  },
  "access_token": "jwt_token"
}
```

### Decks

#### `GET /api/decks`
List all decks for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "decks": [
    {
      "id": "deck_id",
      "name": "Deck Name",
      "description": "Deck Description",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/decks`
Create a new deck.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "New Deck",
  "description": "Deck Description"
}
```

#### `GET /api/decks/:id`
Get a specific deck.

#### `PUT /api/decks/:id`
Update a deck.

#### `DELETE /api/decks/:id`
Delete a deck.

### Cards

#### `GET /api/decks/:deckId/cards`
List all cards in a deck.

#### `POST /api/decks/:deckId/cards`
Create a new card in a deck.

**Request:**
```json
{
  "front": "Question",
  "back": "Answer",
  "tags": ["tag1", "tag2"]
}
```

#### `GET /api/cards/:id`
Get a specific card.

#### `PUT /api/cards/:id`
Update a card.

#### `DELETE /api/cards/:id`
Delete a card.

---

## 🏗️ Architecture

### Database Schema

The Store uses Cloudflare D1 (SQLite) with the following tables:

1. **deck**: Flashcard deck metadata
   - `id` (TEXT PRIMARY KEY)
   - `name` (TEXT)
   - `description` (TEXT)
   - `created_at` (INTEGER)
   - `user_id` (TEXT)

2. **card**: Individual flashcards with FSRS scheduling
   - `id` (TEXT PRIMARY KEY)
   - `front` (TEXT) - Question/prompt
   - `back` (TEXT) - Answer/response
   - `state` (INTEGER) - FSRS state (0=New, 1=Learning, 2=Review, 3=Relearning)
   - `stability` (REAL) - Memory stability
   - `difficulty` (REAL) - Card difficulty (0-10)
   - `due` (INTEGER) - Next review timestamp
   - `last_review` (INTEGER) - Last review timestamp
   - `reps` (INTEGER) - Number of reviews
   - `lapses` (INTEGER) - Times forgotten
   - `created_at` (INTEGER)
   - `deck_id` (TEXT FOREIGN KEY)
   - `user_id` (TEXT)

### Authentication Flow

1. Frontend redirects user to Google OAuth
2. Google redirects back with authorization code
3. Frontend sends code to `/auth/callback`
4. Backend exchanges code for Google user info via `@the-memoize-project/auth`
5. Backend validates user and returns access_token
6. Frontend stores access_token and includes in all API requests
7. Backend validates access_token on protected routes using `me` middleware

### Module Architecture

```
src/
├── index.js           # Worker entry point
├── auth/              # Authentication module
│   └── me/           # Auth middleware
├── card/              # Card CRUD operations
├── deck/              # Deck CRUD operations
├── env/               # Environment bindings
└── id/                # ID generation
```

---

## 🛠️ Development

### Project Structure

```
@the-memoize-project/store/
├── src/
│   ├── index.js              # Worker entry point
│   ├── auth/                 # Authentication module
│   │   ├── index.js
│   │   └── me/              # Auth middleware
│   │       ├── me.js
│   │       ├── me.spec.js
│   │       └── README.md
│   ├── card/                 # Card CRUD module
│   │   ├── card.js          # Card model
│   │   ├── card.spec.js     # Tests
│   │   ├── create.js        # POST handler
│   │   ├── read.js          # GET handlers
│   │   ├── update.js        # PUT handler
│   │   ├── delete.js        # DELETE handler
│   │   ├── init.js          # Route initialization
│   │   ├── index.js
│   │   └── README.md
│   ├── deck/                 # Deck CRUD module
│   │   ├── deck.js          # Deck model
│   │   ├── deck.spec.js     # Tests
│   │   ├── create.js        # POST handler
│   │   ├── read.js          # GET handlers
│   │   ├── update.js        # PUT handler
│   │   ├── delete.js        # DELETE handler
│   │   ├── init.js          # Route initialization
│   │   ├── index.js
│   │   └── README.md
│   ├── env/                  # Environment management
│   │   ├── env.js
│   │   ├── env.spec.js
│   │   ├── index.js
│   │   └── README.md
│   └── id/                   # ID generation
│       ├── id.js
│       ├── id.spec.js
│       ├── index.js
│       └── README.md
├── migrations/               # D1 database migrations
├── wrangler.toml            # Cloudflare configuration
├── tsconfig.json            # TypeScript configuration
├── package.json
├── GLOSSARY.md              # Project terminology
├── NAVIGATION.md            # Codebase navigation guide
└── README.md
```

### Commands

```bash
# Start development server
bun run dev

# Run tests with coverage
bun run test

# Run database migrations
bun run migration

# Deploy to production
bun run deploy

# Tail logs
wrangler tail
```

### Test Coverage

The project maintains **100% test coverage** across all modules:

- **163 tests** covering all functionality
- **id module**: 23 tests
- **env module**: 35 tests
- **auth/me module**: 32 tests
- **deck module**: 35 tests
- **card module**: 38 tests

Run tests with:
```bash
bun run test
```

---

## 📖 Documentation

Comprehensive documentation is available for all modules:

- **[GLOSSARY.md](GLOSSARY.md)** - Project terminology and definitions
- **[NAVIGATION.md](NAVIGATION.md)** - Codebase navigation guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture details
- **[TESTING.md](TESTING.md)** - Testing guide and conventions
- **[EXAMPLES.md](EXAMPLES.md)** - Usage examples

### Module Documentation

Each module has detailed README documentation:

- **[src/auth/README.md](src/auth/README.md)** - Authentication module
  - **[src/auth/me/README.md](src/auth/me/README.md)** - Auth middleware
- **[src/card/README.md](src/card/README.md)** - Card operations with FSRS
- **[src/deck/README.md](src/deck/README.md)** - Deck operations
- **[src/env/README.md](src/env/README.md)** - Environment management
- **[src/id/README.md](src/id/README.md)** - ID generation

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

MIT © The Memoize Project Contributors

See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for The Memoize Project**

[⭐ Star us on GitHub](https://github.com/the-memoize-project/store) · [🧠 Learn more](https://github.com/the-memoize-project)

</div>
