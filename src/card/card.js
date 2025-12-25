/**
 * @fileoverview Card CRUD operations for flashcard management with FSRS scheduling.
 * Provides database operations for creating, reading, updating, and deleting flashcards with FSRS (Free Spaced Repetition Scheduler) metadata.
 */

import env from "@env";
import Id from '@id';

/**
 * @typedef {Object} CardInput
 * @property {string} front - Front side of the flashcard
 * @property {string} back - Back side of the flashcard
 * @property {number} state - Learning state (0=new, 1=learning, 2=review, 3=relearning)
 * @property {number} stability - Memory strength (higher = longer intervals)
 * @property {number} difficulty - Card difficulty rating
 * @property {number} due - Next review timestamp (Unix ms)
 * @property {number} last_review - Last review timestamp (Unix ms)
 * @property {number} reps - Number of successful repetitions
 * @property {number} lapses - Number of times the card was forgotten
 */

/**
 * @typedef {Object} CardData
 * @property {string} id - Unique card identifier
 * @property {string} front - Front side of the flashcard
 * @property {string} back - Back side of the flashcard
 * @property {number} state - Learning state (0=new, 1=learning, 2=review, 3=relearning)
 * @property {number} stability - Memory strength (higher = longer intervals)
 * @property {number} difficulty - Card difficulty rating
 * @property {number} due - Next review timestamp (Unix ms)
 * @property {number} last_review - Last review timestamp (Unix ms)
 * @property {number} reps - Number of successful repetitions
 * @property {number} lapses - Number of times the card was forgotten
 * @property {number} created_at - Creation timestamp (Unix ms)
 * @property {string} deck_id - Parent deck ID
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
 * @property {CardData|CardData[]|boolean} data - Result data
 */

/**
 * @typedef {Object} ErrorResult
 * @property {string} error - Error message
 */

/**
 * @typedef {SuccessResult|ErrorResult} Result
 */

/**
 * Card CRUD operations with FSRS scheduling support.
 *
 * Provides methods to manage flashcards with FSRS (Free Spaced Repetition Scheduler) metadata.
 * All operations enforce user authorization - users can only access their own cards.
 * Cards are organized within decks and track learning progress through FSRS fields.
 *
 * @namespace Card
 */
const Card = {
  /**
   * Creates a new flashcard.
   *
   * Generates a unique ID and stores the card in the database with FSRS scheduling metadata.
   * The card is associated with a deck and user.
   *
   * @async
   * @param {DeckIdentifier} deck - Parent deck containing the card
   * @param {CardInput} card - Card data with front, back, and FSRS fields
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: CardData } on success, { error: string } on failure
   *
   * @example
   * const { data, error } = await Card.create(
   *   { id: 'deck_123' },
   *   {
   *     front: 'Hello',
   *     back: 'Hola',
   *     state: 0,
   *     stability: 1.0,
   *     difficulty: 5.0,
   *     due: Date.now(),
   *     last_review: Date.now(),
   *     reps: 0,
   *     lapses: 0
   *   },
   *   { id: 'user_123' }
   * );
   * if (error) {
   *   console.error(error);
   * } else {
   *   console.log(data.id); // "card_xyz789"
   * }
   */
  async create(deck, card, user) {
    const id = Id.new();
    const { front, back, state, stability, difficulty, due, last_review, reps, lapses } = card;
    const created_at = Date.now();
    const deck_id = deck.id;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `INSERT INTO card (id, front, back, state, stability, difficulty, due, last_review, reps, lapses, created_at, deck_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(id, front, back, state, stability, difficulty, due, last_review, reps, lapses, created_at, deck_id, user_id)
      .run();

    return success
      ? { data: { id, front, back, state, stability, difficulty, due, last_review, reps, lapses, created_at, deck_id, user_id } }
      : { error: "Failed to create card" }
  },

  /**
   * Retrieves a single card by ID.
   *
   * Enforces user authorization - only returns card if it belongs to the authenticated user.
   *
   * @async
   * @param {Object} card - Object with card ID
   * @param {string} card.id - Card ID
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: CardData } on success, { error: string } if not found
   *
   * @example
   * const { data, error } = await Card.get(
   *   { id: 'card_456' },
   *   { id: 'user_123' }
   * );
   * if (data) {
   *   console.log(data.front); // "Hello"
   *   console.log(data.state); // 0
   * }
   */
  async get(card, user) {
    const id = card.id;
    const user_id = user.id;

    const data = await env.DB.prepare(
      `SELECT * FROM card WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .first();

    return data
      ? { data }
      : { error: "Failed to get card" }
  },

  /**
   * Lists all cards in a deck.
   *
   * Returns cards ordered by creation date (newest first).
   * Only returns cards that belong to the authenticated user.
   *
   * @async
   * @param {DeckIdentifier} deck - Deck containing the cards
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: CardData[] } on success, { error: string } on failure
   *
   * @example
   * const { data: cards } = await Card.list(
   *   { id: 'deck_123' },
   *   { id: 'user_123' }
   * );
   * console.log(cards.length); // 10
   * console.log(cards[0].front); // "Most recent card"
   */
  async list(deck, user) {
    const deck_id = deck.id;
    const user_id = user.id;

    const { results: data } = await env.DB.prepare(
      `SELECT *
       FROM card
       WHERE deck_id = ? AND user_id = ?
       ORDER BY created_at DESC`
    )
      .bind(deck_id, user_id)
      .all();

    return data
      ? { data }
      : { error: "Failed to list card" }
  },

  /**
   * Updates a card's content and FSRS scheduling metadata.
   *
   * Only updates if card belongs to authenticated user.
   * Used to update learning progress after reviews (state, stability, difficulty, etc.).
   *
   * @async
   * @param {CardData} card - Card with id and fields to update
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: true } on success, { error: string } if not found/unauthorized
   *
   * @example
   * const { data, error } = await Card.update(
   *   {
   *     id: 'card_456',
   *     front: 'Hello',
   *     back: 'Hola',
   *     state: 2,
   *     stability: 5.5,
   *     difficulty: 4.2,
   *     due: Date.now() + 86400000,
   *     last_review: Date.now(),
   *     reps: 3,
   *     lapses: 0
   *   },
   *   { id: 'user_123' }
   * );
   */
  async update(card, user) {
    const { id, front, back, state, stability, difficulty, due, last_review, reps, lapses } = card;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `UPDATE card
       SET front = ?, back = ?, state = ?, stability = ?, difficulty = ?, due = ?, last_review = ?, reps = ?, lapses = ?
       WHERE id = ? AND user_id = ?`
    )
      .bind(front, back, state, stability, difficulty, due, last_review, reps, lapses, id, user_id)
      .run();

    return success
      ? { data: true }
      : { error: "Card not found or not authorized" }
  },

  /**
   * Deletes a card.
   *
   * Only deletes if card belongs to authenticated user.
   *
   * @async
   * @param {Object} card - Object with card ID
   * @param {string} card.id - Card ID
   * @param {User} user - Authenticated user
   * @returns {Promise<Result>} { data: true } on success, { error: string } if not found/unauthorized
   *
   * @example
   * const { data, error } = await Card.delete(
   *   { id: 'card_456' },
   *   { id: 'user_123' }
   * );
   * if (data) {
   *   console.log('Card deleted successfully');
   * }
   */
  async delete(card, user) {
    const id = card.id;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `DELETE FROM card WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .run();

    return success
      ? { data: true }
      : { error: "Card not found or not authorized" }
  },
};

export default Card;
