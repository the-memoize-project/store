import router, { headers, params } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

router.get("/deck", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const decks = await Deck.listByUser(user.key);
    return new Response(JSON.stringify(decks), init);
  } catch (error) {
    console.error("Error listing decks:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});

router.get("/deck/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck = await Deck.getById(params.id, user.key);

    if (!deck) {
      return new Response(
        JSON.stringify({ error: "Deck not found" }),
        { ...init, status: 404 }
      );
    }

    return new Response(JSON.stringify(deck), init);
  } catch (error) {
    console.error("Error getting deck:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});
