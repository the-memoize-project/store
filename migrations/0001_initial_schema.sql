-- Migration: Initial schema for decks and cards
-- Created: 2025-12-19

-- Deck table
CREATE TABLE IF NOT EXISTS deck (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  user_id TEXT NOT NULL
);

-- Card table with foreign key to deck
CREATE TABLE IF NOT EXISTS card (
  id TEXT PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  state TEXT,
  stability REAL,
  difficulty REAL,
  due INTEGER,
  last_review INTEGER,
  reps INTEGER DEFAULT 0,
  lapses INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  deck_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (deck_id) REFERENCES deck(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deck_user_id ON deck(user_id);
CREATE INDEX IF NOT EXISTS idx_deck_created_at ON deck(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_user_id ON card(user_id);
CREATE INDEX IF NOT EXISTS idx_card_deck_id ON card(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_due ON card(due);
CREATE INDEX IF NOT EXISTS idx_card_created_at ON card(created_at DESC);
