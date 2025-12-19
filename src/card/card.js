import env from "@env";
import Id from '@id';

const Card = {
  async create(card, user) {
    const id = Id.new();
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
      deck_id,
    } = card;
    const created_at = Date.now();
    const user_id = user.id;

    const { success } = await env.DB.prepare(
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

    return success
      ? { data: { id, front, back, state, stability, difficulty, due, last_review, reps: reps ?? 0, lapses: lapses ?? 0, created_at, deck_id, user_id } }
      : { error: "Failed to create card" }
  },

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

  async list(user, deck_id = null) {
    const user_id = user.id;

    let query;
    let bindings;

    if (deck_id) {
      query = `SELECT * FROM card WHERE user_id = ? AND deck_id = ? ORDER BY created_at DESC`;
      bindings = [user_id, deck_id];
    } else {
      query = `SELECT * FROM card WHERE user_id = ? ORDER BY created_at DESC`;
      bindings = [user_id];
    }

    const { results: data } = await env.DB.prepare(query).bind(...bindings).all();

    return data
      ? { data }
      : { error: "Failed to list card" }
  },

  async update(card, user) {
    const id = Id.new();
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
    } = card;
    const user_id = user.id;

    const { success } = await env.DB.prepare(
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

    return success
      ? { data: { id, front, back, state, stability, difficulty, due, last_review, reps, lapses, created_at, user_id } }
      : { error: "Card not found or not authorized" }
  },

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
