import env from "@env";
import Id from '@id';

const Deck = {
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
