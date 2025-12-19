import router, { body, headers, params } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.put("/card/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);

    if (!body.front || !body.back) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: front, back" }),
        { ...init, status: 400 }
      );
    }

    const card = await Card.update(
      params.id,
      {
        front: body.front,
        back: body.back,
        state: body.state,
        stability: body.stability,
        difficulty: body.difficulty,
        due: body.due,
        last_review: body.last_review,
        reps: body.reps,
        lapses: body.lapses,
      },
      user.key
    );

    return new Response(JSON.stringify(card), init);
  } catch (error) {
    console.error("Error updating card:", error);

    if (error.message?.includes("not found")) {
      return new Response(
        JSON.stringify({ error: "Card not found" }),
        { ...init, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});
