# Contributing to Memoize Store

Thank you for your interest in contributing to Memoize Store! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/store.git`
3. Install dependencies: `bun install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- Google OAuth2 credentials

### Configuration

1. Copy `.dev.vars.example` to `.dev.vars`
2. Fill in your Google OAuth credentials
3. Create KV namespaces:
   ```bash
   wrangler kv:namespace create "USERS_KV"
   wrangler kv:namespace create "DECKS_KV"
   wrangler kv:namespace create "CARDS_KV"
   wrangler kv:namespace create "SESSIONS_KV"
   ```
4. Update `wrangler.toml` with KV namespace IDs

### Running Locally

```bash
# Start development server
bun run dev

# Run tests
bun run test

# Lint and format
biome check .
biome check --write .
```

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting. Please ensure your code passes all checks before submitting.

```bash
biome check --write .
```

## Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit pull request with clear description

## Questions?

Feel free to open an issue for discussion!
