import env from "@env";
import Id from '@id';

const Card = {
  async delete(deck, user) {
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
  }
};

export default Card;
