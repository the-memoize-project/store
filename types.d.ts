/**
 * Type definitions for Memoize Store
 */

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  userId: string;
  token: string;
  created_at: number;
  expires_at: number;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  cardCount?: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    status: number;
  };
}

export interface ListDecksResponse {
  decks: Deck[];
  total: number;
}

export interface ListCardsResponse {
  cards: Card[];
  total: number;
}

export interface Env {
  USERS_KV: KVNamespace;
  DECKS_KV: KVNamespace;
  CARDS_KV: KVNamespace;
  SESSIONS_KV: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  API_BASE_URL: string;
}
