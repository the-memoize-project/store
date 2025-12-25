import env from "@env";
import Id from '@id';

const Card = {
  /**
   * Creates a new flashcard with FSRS data.
   *
   * @param {Object} deck - Deck identifier.
   * @param {Object} card - Card data (front, back, FSRS fields).
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with data or error.
   *
   * @example
   * Card.create({ id: 'deck_123' }, { front: 'Hello', back: 'Hola', state: 0, ... }, { id: 'user_123' })
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
   * Retrieves a card by ID.
   *
   * @param {Object} card - Card identifier.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with data or error.
   *
   * @example
   * Card.get({ id: 'card_456' }, { id: 'user_123' })
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
   * @param {Object} deck - Deck identifier.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with data array or error.
   *
   * @example
   * Card.list({ id: 'deck_123' }, { id: 'user_123' })
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
   * Updates a card's content and FSRS metadata.
   *
   * @param {Object} card - Card data with id.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with success or error.
   *
   * @example
   * Card.update({ id: 'card_456', front: 'Hello', back: 'Hola', state: 2, ... }, { id: 'user_123' })
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
   * Deletes all cards in a deck.
   *
   * @param {Object} deck - Deck identifier.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with success or error.
   *
   * @example
   * Card.deleteByDeck({ id: 'deck_123' }, { id: 'user_123' })
   */
  async deleteByDeck(deck, user) {
    const deck_id = deck.id;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
      `DELETE FROM card WHERE deck_id = ? AND user_id = ?`
    )
      .bind(deck_id, user_id)
      .run();

    return success
      ? { data: true }
      : { error: "Failed to delete cards" }
  },

  /**
   * Deletes a card by ID.
   *
   * @param {Object} card - Card identifier.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with success or error.
   *
   * @example
   * Card.delete({ id: 'card_456' }, { id: 'user_123' })
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
