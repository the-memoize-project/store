# Glossary

This document defines key terms and concepts used throughout the Memoize Store project.

---

## Table of Contents

- [General Terms](#general-terms)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [FSRS Terms](#fsrs-terms)
- [Architecture](#architecture)
- [Cloudflare Platform](#cloudflare-platform)

---

## General Terms

### Store
The backend API application that handles all server-side operations for The Memoize Project.

### Edge Computing
Deploying code to run on servers distributed globally, closer to end users for lower latency.

### Worker
A Cloudflare Workers instance that handles HTTP requests and executes serverless code.

### Namespace
A logical container for key-value pairs in Cloudflare KV storage.

---

## Authentication

### OAuth2
An authorization framework that enables applications to obtain limited access to user accounts.

### Google Sign-In
Google's OAuth2 implementation for authenticating users with their Google accounts.

### Access Token
A credential used to access protected resources. In Memoize Store, this is a JWT-like token.

### Authorization Header
An HTTP header containing the access token, formatted as `Bearer <token>`.

### Me Middleware
Authentication middleware that validates the user's access token and retrieves user information.

---

## Data Models

### User
An authenticated user of the Memoize application, identified by Google OAuth.

**Fields:**
- `id` - Unique user identifier
- `email` - User's email address
- `name` - User's display name
- `picture` - URL to user's profile picture

### Deck
A collection of flashcards organized by topic or subject.

**Fields:**
- `id` - Unique deck identifier
- `name` - Deck name
- `description` - Deck description
- `created_at` - Timestamp of creation
- `user_id` - Owner's user ID

### Card
An individual flashcard with front/back content and FSRS scheduling metadata.

**Fields:**
- `id` - Unique card identifier
- `front` - Question or prompt
- `back` - Answer or response
- `state` - FSRS review state (new, learning, review, relearning)
- `stability` - FSRS memory stability
- `difficulty` - FSRS card difficulty
- `due` - Next review timestamp
- `last_review` - Last review timestamp
- `reps` - Number of repetitions
- `lapses` - Number of times forgotten
- `created_at` - Timestamp of creation
- `deck_id` - Parent deck ID
- `user_id` - Owner's user ID

---

## FSRS Terms

### FSRS (Free Spaced Repetition Scheduler)
A modern spaced repetition algorithm that optimizes review scheduling based on memory research.

### State
The current review state of a card:
- **New**: Never reviewed
- **Learning**: Initial learning phase
- **Review**: Regular review phase
- **Relearning**: Re-learning after forgetting

### Stability
A measure of how well the card is memorized. Higher stability means longer intervals between reviews.

### Difficulty
A measure of how hard a card is for the user. Ranges from 0 (easiest) to 10 (hardest).

### Due Date
The timestamp when a card should next be reviewed.

### Repetitions (Reps)
The total number of times a card has been reviewed.

### Lapses
The number of times a card was forgotten and moved to the relearning state.

---

## Architecture

### Router
The request routing system that maps HTTP requests to handler functions.

### Middleware
Functions that process requests before they reach route handlers (e.g., authentication).

### Handler
A function that processes an HTTP request and returns a response.

### Pipe Pattern
A functional composition pattern where data flows through a series of transformations.

```javascript
pipe(
  middleware1,
  middleware2,
  handler
)(request)
```

### CRUD Operations
Create, Read, Update, Delete - the four basic database operations.

### Module
A self-contained unit of functionality (e.g., `auth`, `card`, `deck`).

---

## Cloudflare Platform

### Cloudflare Workers
A serverless execution environment that runs JavaScript/TypeScript on Cloudflare's edge network.

### D1
Cloudflare's serverless SQL database built on SQLite.

### KV (Key-Value Storage)
Cloudflare's globally distributed key-value storage system.

### Wrangler
The official CLI tool for developing and deploying Cloudflare Workers.

### Binding
A connection between a Worker and a Cloudflare resource (e.g., D1 database, KV namespace).

### Environment Variables
Configuration values injected into the Worker at runtime (e.g., API keys, database URLs).

---

## Development Terms

### Entry Point
The main file that Cloudflare Workers executes (typically `src/index.js`).

### Migration
A versioned database schema change script.

### Type Alias
A TypeScript shorthand for a complex type definition in `tsconfig.json` (e.g., `@auth`, `@card`).

### Hot Reload
Automatic application restart when code changes are detected during development.

---

## HTTP Terminology

### Request
An HTTP message sent from a client to the server.

### Response
An HTTP message sent from the server back to the client.

### Status Code
A three-digit number indicating the result of an HTTP request:
- `200 OK` - Success
- `201 Created` - Resource created
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Headers
Metadata sent with HTTP requests and responses (e.g., `Content-Type`, `Authorization`).

### Body
The main content of an HTTP request or response, typically JSON in this API.

---

## Project-Specific Terms

### Me Endpoint
The `/auth/me` route that returns information about the authenticated user.

### Curried Function
A function that returns another function, enabling partial application:

```javascript
const middleware = (next) => (user) => next(user);
```

### Result Pattern
A return type convention where functions return `{ data }` on success or `{ error }` on failure.

---

## Contributing

If you encounter a term not defined here, please:
1. Open an issue requesting its addition
2. Submit a PR adding the term with a clear definition
3. Reference where the term is used in the codebase

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

**Part of The Memoize Project** 💾
