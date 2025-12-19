import env from "@env";

const Card = {
  /**
   * Create a new card
   * @param {Object} card - Card object with all required fields
   * @returns {Promise<Object>} Created card
   */
  async create(card) {
    const {
      id,
      front,
      back,
      state,
      stability,
      difficulty,
      due,
      last_review,
      reps,
      lapses,
      deck_id,
      user_id,
    } = card;
    const created_at = Date.now();

    const result = await env.DB.prepare(
      `INSERT INTO card (
        id, front, back, state, stability, difficulty, due, last_review,
        reps, lapses, created_at, deck_id, user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        front,
        back,
        state,
        stability,
        difficulty,
        due,
        last_review,
        reps ?? 0,
        lapses ?? 0,
        created_at,
        deck_id,
        user_id
      )
      .run();

    if (!result.success) {
      throw new Error("Failed to create card");
    }

    return {
      id,
      front,
      back,
      state,
      stability,
      difficulty,
      due,
      last_review,
      reps: reps ?? 0,
      lapses: lapses ?? 0,
      created_at,
      deck_id,
      user_id,
    };
  },

  /**
   * Get a single card by ID
   * @param {string} id - Card ID
   * @param {string} user_id - User ID for authorization
   * @returns {Promise<Object|null>} Card object or null
   */
  async getById(id, user_id) {
    const result = await env.DB.prepare(
      `SELECT * FROM card WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .first();

    return result;
  },

  /**
   * Get all cards for a user
   * @param {string} user_id - User ID
   * @param {string|null} deck_id - Optional deck_id to filter by deck
   * @returns {Promise<Array>} Array of cards
   */
  async listByUser(user_id, deck_id = null) {
    let query;
    let bindings;

    if (deck_id) {
      query = `SELECT * FROM card WHERE user_id = ? AND deck_id = ? ORDER BY created_at DESC`;
      bindings = [user_id, deck_id];
    } else {
      query = `SELECT * FROM card WHERE user_id = ? ORDER BY created_at DESC`;
      bindings = [user_id];
    }

    const result = await env.DB.prepare(query).bind(...bindings).all();

    return result.results || [];
  },

  /**
   * Update an existing card
   * @param {string} id - Card ID
   * @param {Object} updates - Fields to update
   * @param {string} user_id - User ID for authorization
   * @returns {Promise<Object>} Updated card
   */
  async update(id, updates, user_id) {
    const {
      front,
      back,
      state,
      stability,
      difficulty,
      due,
      last_review,
      reps,
      lapses,
    } = updates;

    const result = await env.DB.prepare(
      `UPDATE card
       SET front = ?, back = ?, state = ?, stability = ?, difficulty = ?,
           due = ?, last_review = ?, reps = ?, lapses = ?
       WHERE id = ? AND user_id = ?`
    )
      .bind(
        front,
        back,
        state,
        stability,
        difficulty,
        due,
        last_review,
        reps,
        lapses,
        id,
        user_id
      )
      .run();

    if (!result.success || result.meta.changes === 0) {
      throw new Error("Card not found or not authorized");
    }

    return this.getById(id, user_id);
  },

  /**
   * Delete a card by ID
   * @param {string} id - Card ID
   * @param {string} user_id - User ID for authorization
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, user_id) {
    const result = await env.DB.prepare(
      `DELETE FROM card WHERE id = ? AND user_id = ?`
    )
      .bind(id, user_id)
      .run();

    if (!result.success || result.meta.changes === 0) {
      throw new Error("Card not found or not authorized");
    }

    return true;
  },
};

export default Card;
