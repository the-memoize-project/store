import env from "@env";

const Deck = {
  /**
   * Create a new deck
   * @param {Object} deck - Deck object with id, name, description, user_id
   * @returns {Promise<Object>} Created deck
   */
  async create(deck) {
    const { id, name, description, user_id } = deck;
    const created_at = Date.now();

    const result = await env.DB.prepare(
      `INSERT INTO deck (id, name, description, created_at, user_id)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(id, name, description, created_at, user_id)
      .run();

    if (!result.success) {
      throw new Error("Failed to create deck");
    }

    return { id, name, description, created_at, user_id };
  },

  /**
   * Get a single deck by ID
   * @param {string} id - Deck ID
   * @param {string} user_id - User ID for authorization
   * @returns {Promise<Object|null>} Deck object or null
   */
  async getById(id, user_id) {
    const result = await env.DB.prepare(
      `SELECT id, name, description, created_at, user_id
       FROM deck
       WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .first();

    return result;
  },

  /**
   * Get all decks for a user
   * @param {string} user_id - User ID
   * @returns {Promise<Array>} Array of decks
   */
  async listByUser(user_id) {
    const result = await env.DB.prepare(
      `SELECT id, name, description, created_at, user_id
       FROM deck
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
      .bind(user_id)
      .all();

    return result.results || [];
  },

  /**
   * Update an existing deck
   * @param {string} id - Deck ID
   * @param {Object} updates - Fields to update (name, description)
   * @param {string} user_id - User ID for authorization
   * @returns {Promise<Object>} Updated deck
   */
  async update(id, updates, user_id) {
    const { name, description } = updates;

    const result = await env.DB.prepare(
      `UPDATE deck
       SET name = ?, description = ?
       WHERE id = ? AND user_id = ?`
    )
      .bind(name, description, id, user_id)
      .run();

    if (!result.success || result.meta.changes === 0) {
      throw new Error("Deck not found or not authorized");
    }

    return this.getById(id, user_id);
  },

  /**
   * Delete a deck by ID
   * @param {string} id - Deck ID
   * @param {string} user_id - User ID for authorization
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, user_id) {
    const result = await env.DB.prepare(
      `DELETE FROM deck WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .run();

    if (!result.success || result.meta.changes === 0) {
      throw new Error("Deck not found or not authorized");
    }

    return true;
  },
};

export default Deck;
