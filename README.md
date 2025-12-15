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
- **Scalable**: KV-based storage distributed across multiple namespaces
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
- **💾 KV Storage** - Distributed key-value storage across namespaces
- **🔒 Type Safe** - Full TypeScript definitions included
- **🎯 RESTful API** - Clean, predictable API design
- **🔑 Token-Based Auth** - Access token validation on all protected routes

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

# Create KV namespaces
wrangler kv:namespace create "USERS_KV"
wrangler kv:namespace create "DECKS_KV"
wrangler kv:namespace create "CARDS_KV"
wrangler kv:namespace create "SESSIONS_KV"

# Update wrangler.toml with the KV namespace IDs

# Set environment variables
# Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, etc. in wrangler.toml or via Cloudflare dashboard

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

### KV Namespaces

The Store uses four separate KV namespaces:

1. **USERS_KV**: User profiles and account data
   - Key: `user:{userId}`
   - Value: User object

2. **SESSIONS_KV**: Active sessions and access tokens
   - Key: `session:{token}`
   - Value: Session data with expiry

3. **DECKS_KV**: Deck metadata and relationships
   - Key: `deck:{deckId}`
   - Key: `user_decks:{userId}` (list of deck IDs)

4. **CARDS_KV**: Card data
   - Key: `card:{cardId}`
   - Key: `deck_cards:{deckId}` (list of card IDs)

### Authentication Flow

1. Frontend redirects user to Google OAuth
2. Google redirects back with authorization code
3. Frontend sends code to `/auth/callback`
4. Backend exchanges code for Google user info
5. Backend creates/updates user in USERS_KV
6. Backend generates access_token and stores in SESSIONS_KV
7. Backend returns user data and access_token
8. Frontend stores access_token and includes in all API requests
9. Backend validates access_token on protected routes

---

## 🛠️ Development

### Project Structure

```
@the-memoize-project/store/
├── packages/
│   ├── auth/        # OAuth authentication
│   ├── decks/       # Deck CRUD operations
│   ├── cards/       # Card CRUD operations
│   ├── middleware/  # Auth middleware
│   └── utils/       # Shared utilities
├── src/
│   └── index.js     # Worker entry point
├── wrangler.toml    # Cloudflare configuration
└── package.json
```

### Commands

```bash
# Start development server
bun run dev

# Run tests
bun run test

# Deploy to production
bun run deploy

# Tail logs
wrangler tail
```

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
