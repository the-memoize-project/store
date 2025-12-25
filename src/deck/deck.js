/**
 * @fileoverview Deck CRUD operations for flashcard management.
 * Provides database operations for creating, reading, updating, and deleting decks.
 */

import env from "@env";
import Id from '@id';

/**
 * @typedef {Object} DeckInput
 * @property {string} name - Deck name
 * @property {string} description - Deck description
 */

/**
 * @typedef {Object} DeckData
 * @property {string} id - Unique deck identifier
 * @property {string} name - Deck name
 * @property {string} description - Deck description
 * @property {number} created_at - Creation timestamp (Unix ms)
 * @property {string} user_id - Owner's user ID
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 */

/**
 * @typedef {Object} DeckIdentifier
 * @property {string} id - Deck ID
 */

/**
 * @typedef {Object} SuccessResult
 * @property {DeckData|DeckData[]|boolean} data - Result data
 */

/**
 * @typedef {Object} ErrorResult
 * @property {string} error - Error message
 */

/**
 * @typedef {SuccessResult|ErrorResult} Result
 */

/**
 * Deck CRUD operations.
 *
 * Provides methods to manage flashcard decks with user authorization.
 * All operations enforce user ownership - users can only access their own decks.
 *
 * @namespace Deck
 */
const Deck = {
  /**
   * Creates a new deck.
   *
   * Generates a unique ID and stores the deck in the database with the current timestamp.
   *
   * @async
   * @param {DeckInput} deck - Deck data (name, description)
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: DeckData } on success, { error: string } on failure
   *
   * @example
   * const { data, error } = await Deck.create(
   *   { name: 'Spanish Vocabulary', description: 'Common words' },
   *   { id: 'user_123' }
   * );
   * if (error) {
   *   console.error(error);
   * } else {
   *   console.log(data.id); // "deck_xyz789"
   * }
   */
  async create(deck, user) {
    const id = Id.new();
    const { name, description } = deck;
    const created_at = Date.now();
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `INSERT INTO deck (id, name, description, created_at, user_id)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(id, name, description, created_at, user_id)
      .run();

    return success
      ? { data: { id, name, description, created_at, user_id } }
      : { error: "Failed to create deck" }
  },

  /**
   * Retrieves a single deck by ID.
   *
   * Enforces user authorization - only returns deck if it belongs to the authenticated user.
   *
   * @async
   * @param {DeckIdentifier} deck - Object with deck ID
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: DeckData } on success, { error: string } if not found
   *
   * @example
   * const { data, error } = await Deck.get(
   *   { id: 'deck_123' },
   *   { id: 'user_123' }
   * );
   * if (data) {
   *   console.log(data.name); // "Spanish Vocabulary"
   * }
   */
  async get(deck, user) {
    const id = deck.id;
    const user_id = user.id;

    const data = await env.DB.prepare(
      `SELECT id, name, description, created_at, user_id
       FROM deck
       WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .first();

    return data
      ? { data }
      : { error: "Failed to get deck" }
  },

  /**
   * Lists all decks for the authenticated user.
   *
   * Returns decks ordered by creation date (newest first).
   *
   * @async
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: DeckData[] } on success, { error: string } on failure
   *
   * @example
   * const { data: decks } = await Deck.list({ id: 'user_123' });
   * console.log(decks.length); // 5
   * console.log(decks[0].name); // "Most recent deck"
   */
  async list(user) {
    const user_id = user.id;

    const { results: data } = await env.DB.prepare(
      `SELECT id, name, description, created_at, user_id
       FROM deck
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
      .bind(user_id)
      .all();

    return data
      ? { data }
      : { error: "Failed to list deck" }
  },

  /**
   * Updates a deck's name and description.
   *
   * Only updates if deck belongs to authenticated user.
   *
   * **Note:** Line 58 has a bug - uses Id.new() instead of deck.id.
   * This should be fixed to: `const id = deck.id;`
   *
   * @async
   * @param {DeckData} deck - Deck with id, name, and description
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: true } on success, { error: string } if not found/unauthorized
   *
   * @example
   * const { data, error } = await Deck.update(
   *   { id: 'deck_123', name: 'Updated Name', description: 'New description' },
   *   { id: 'user_123' }
   * );
   */
  async update(deck, user) {
    const id = Id.new();
    const { name, description } = deck;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `UPDATE deck
       SET name = ?, description = ?
       WHERE id = ? AND user_id = ?`
    )
      .bind(name, description, id, user_id)
      .run();

    return success
      ? { data: true }
      : { error: "Deck not found or not authorized" }
  },

  /**
   * Deletes a deck.
   *
   * Only deletes if deck belongs to authenticated user.
   * **Warning:** This cascades to delete all cards in the deck due to foreign key constraints.
   *
   * @async
   * @param {DeckIdentifier} deck - Object with deck ID
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: true } on success, { error: string } if not found/unauthorized
   *
   * @example
   * const { data, error } = await Deck.delete(
   *   { id: 'deck_123' },
   *   { id: 'user_123' }
   * );
   * if (data) {
   *   console.log('Deck and all its cards deleted');
   * }
   */
  async delete(deck, user) {
    const id = deck.id;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `DELETE FROM deck WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .run();

    return success
      ? { data: true }
      : { error: "Deck not found or not authorized" }
  },
};

export default Deck;
