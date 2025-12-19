import router, { body, headers } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

router.post("/deck", async () => {
  try {
    const user = await Google.me(headers.authorization);

    if (!body.id || !body.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: id, name" }),
        { ...init, status: 400 }
      );
    }

    const deck = await Deck.create({
      id: body.id,
      name: body.name,
      description: body.description || "",
      user_id: user.key,
    });

    return new Response(JSON.stringify(deck), init);
  } catch (error) {
    console.error("Error creating deck:", error);

    if (error.message?.includes("UNIQUE constraint")) {
      return new Response(
        JSON.stringify({ error: "Deck with this ID already exists" }),
        { ...init, status: 409 }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { ...init, status: error.message?.includes("not authorized") ? 401 : 500 }
    );
  }
});
