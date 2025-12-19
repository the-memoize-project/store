import router, { body, headers } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.post("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);

    if (!body.id || !body.front || !body.back || !body.deck_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: id, front, back, deck_id",
        }),
        { ...init, status: 400 }
      );
    }

    const card = await Card.create({
      id: body.id,
      front: body.front,
      back: body.back,
      state: body.state,
      stability: body.stability,
      difficulty: body.difficulty,
      due: body.due,
      last_review: body.last_review,
      reps: body.reps,
      lapses: body.lapses,
      deck_id: body.deck_id,
      user_id: user.key,
    });

    return new Response(JSON.stringify(card), init);
  } catch (error) {
    console.error("Error creating card:", error);

    if (error.message?.includes("UNIQUE constraint")) {
      return new Response(
        JSON.stringify({ error: "Card with this ID already exists" }),
        { ...init, status: 409 }
      );
    }

    if (error.message?.includes("FOREIGN KEY constraint")) {
      return new Response(
        JSON.stringify({ error: "Deck not found" }),
        { ...init, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});
