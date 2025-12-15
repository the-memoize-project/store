# Memoize Store Examples

This document provides practical examples of how to use the Memoize Store API.

## Table of Contents

- [Authentication](#authentication)
- [Deck Operations](#deck-operations)
- [Card Operations](#card-operations)
- [Error Handling](#error-handling)

---

## Authentication

### Login with Google OAuth

```javascript
// Frontend: Redirect to Google OAuth
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=openid%20email%20profile`;

window.location.href = googleAuthUrl;

// After Google redirects back with code
const code = new URLSearchParams(window.location.search).get('code');

// Exchange code for access token
const response = await fetch('https://your-worker.workers.dev/auth/callback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ code }),
});

const data = await response.json();
// {
//   "user": {
//     "id": "user_xxx",
//     "email": "user@example.com",
//     "name": "User Name",
//     "picture": "https://..."
//   },
//   "access_token": "token_xxx"
// }

// Store access token
localStorage.setItem('access_token', data.access_token);
```

### Validate Token

```javascript
const accessToken = localStorage.getItem('access_token');

const response = await fetch('https://your-worker.workers.dev/auth/validate', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "user": { ... },
//   "valid": true
// }
```

### Logout

```javascript
const accessToken = localStorage.getItem('access_token');

const response = await fetch('https://your-worker.workers.dev/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// Clear local storage
localStorage.removeItem('access_token');
```

---

## Deck Operations

### List All Decks

```javascript
const accessToken = localStorage.getItem('access_token');

const response = await fetch('https://your-worker.workers.dev/api/decks', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "decks": [
//     {
//       "id": "deck_xxx",
//       "name": "Spanish Vocabulary",
//       "description": "Basic Spanish words",
//       "created_at": "2024-01-01T00:00:00Z",
//       "updated_at": "2024-01-01T00:00:00Z"
//     }
//   ],
//   "total": 1
// }
```

### Get Single Deck

```javascript
const deckId = 'deck_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/decks/${deckId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "deck": {
//     "id": "deck_xxx",
//     "name": "Spanish Vocabulary",
//     "description": "Basic Spanish words",
//     "cardCount": 50,
//     "created_at": "2024-01-01T00:00:00Z",
//     "updated_at": "2024-01-01T00:00:00Z"
//   }
// }
```

### Create Deck

```javascript
const accessToken = localStorage.getItem('access_token');

const response = await fetch('https://your-worker.workers.dev/api/decks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: 'French Vocabulary',
    description: 'Common French phrases',
  }),
});

const data = await response.json();
// {
//   "deck": {
//     "id": "deck_yyy",
//     "userId": "user_xxx",
//     "name": "French Vocabulary",
//     "description": "Common French phrases",
//     "created_at": "2024-01-02T00:00:00Z",
//     "updated_at": "2024-01-02T00:00:00Z"
//   }
// }
```

### Update Deck

```javascript
const deckId = 'deck_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/decks/${deckId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: 'Advanced Spanish',
    description: 'Advanced Spanish vocabulary and grammar',
  }),
});

const data = await response.json();
// {
//   "deck": {
//     "id": "deck_xxx",
//     "name": "Advanced Spanish",
//     "description": "Advanced Spanish vocabulary and grammar",
//     ...
//   }
// }
```

### Delete Deck

```javascript
const deckId = 'deck_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/decks/${deckId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "message": "Deck deleted successfully",
//   "deckId": "deck_xxx"
// }
```

---

## Card Operations

### List Cards in Deck

```javascript
const deckId = 'deck_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/decks/${deckId}/cards`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "cards": [
//     {
//       "id": "card_xxx",
//       "deckId": "deck_xxx",
//       "front": "Hello",
//       "back": "Hola",
//       "tags": ["greeting", "basic"],
//       "created_at": "2024-01-01T00:00:00Z",
//       "updated_at": "2024-01-01T00:00:00Z"
//     }
//   ],
//   "total": 1
// }
```

### Get Single Card

```javascript
const cardId = 'card_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/cards/${cardId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "card": {
//     "id": "card_xxx",
//     "deckId": "deck_xxx",
//     "front": "Hello",
//     "back": "Hola",
//     "tags": ["greeting", "basic"],
//     ...
//   }
// }
```

### Create Card

```javascript
const deckId = 'deck_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/decks/${deckId}/cards`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    front: 'Goodbye',
    back: 'Adiós',
    tags: ['farewell', 'basic'],
  }),
});

const data = await response.json();
// {
//   "card": {
//     "id": "card_yyy",
//     "deckId": "deck_xxx",
//     "front": "Goodbye",
//     "back": "Adiós",
//     "tags": ["farewell", "basic"],
//     ...
//   }
// }
```

### Update Card

```javascript
const cardId = 'card_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/cards/${cardId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    front: 'Good morning',
    back: 'Buenos días',
    tags: ['greeting', 'basic', 'time'],
  }),
});

const data = await response.json();
// {
//   "card": {
//     "id": "card_xxx",
//     "front": "Good morning",
//     "back": "Buenos días",
//     "tags": ["greeting", "basic", "time"],
//     ...
//   }
// }
```

### Delete Card

```javascript
const cardId = 'card_xxx';
const accessToken = localStorage.getItem('access_token');

const response = await fetch(`https://your-worker.workers.dev/api/cards/${cardId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const data = await response.json();
// {
//   "message": "Card deleted successfully",
//   "cardId": "card_xxx"
// }
```

---

## Error Handling

### Handle API Errors

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // API returned an error
      throw new Error(data.error.message);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

// Usage
try {
  const decks = await apiCall('https://your-worker.workers.dev/api/decks', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  console.log(decks);
} catch (error) {
  // Handle error (show to user, etc.)
  alert(`Error: ${error.message}`);
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Missing or invalid authorization header
- `TOKEN_EXPIRED` (401): Access token has expired
- `USER_NOT_FOUND` (404): User doesn't exist
- `DECK_NOT_FOUND` (404): Deck doesn't exist
- `CARD_NOT_FOUND` (404): Card doesn't exist
- `FORBIDDEN` (403): User doesn't own the resource
- `MISSING_CODE` (400): Missing OAuth authorization code
- `MISSING_DECK_NAME` (400): Deck name is required
- `MISSING_CARD_DATA` (400): Card front/back is required
