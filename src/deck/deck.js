import env from "@env";
import Id from '@id';

const Deck = {
  /**
   * Creates a new deck.
   *
   * @param {Object} deck - Deck data (name, description).
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with data or error.
   *
   * @example
   * Deck.create({ name: 'Spanish', description: 'Words' }, { id: 'user_123' })
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
   * Retrieves a deck by ID.
   *
   * @param {Object} deck - Deck identifier.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with data or error.
   *
   * @example
   * Deck.get({ id: 'deck_123' }, { id: 'user_123' })
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
   * Lists all decks for a user.
   *
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with data array or error.
   *
   * @example
   * Deck.list({ id: 'user_123' })
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
   * @param {Object} deck - Deck data with id.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with success or error.
   *
   * @example
   * Deck.update({ id: 'deck_123', name: 'Updated', description: 'New' }, { id: 'user_123' })
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
   * @param {Object} deck - Deck identifier.
   * @param {Object} user - User identifier.
   * @returns {Promise<Object>} Result with success or error.
   *
   * @example
   * Deck.delete({ id: 'deck_123' }, { id: 'user_123' })
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
