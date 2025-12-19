import router, { headers, params, query } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.get("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck_id = query.deck_id || null;
    const cards = await Card.listByUser(user.key, deck_id);
    return new Response(JSON.stringify(cards), init);
  } catch (error) {
    console.error("Error listing cards:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});

router.get("/card/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const card = await Card.getById(params.id, user.key);

    if (!card) {
      return new Response(
        JSON.stringify({ error: "Card not found" }),
        { ...init, status: 404 }
      );
    }

    return new Response(JSON.stringify(card), init);
  } catch (error) {
    console.error("Error getting card:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});
