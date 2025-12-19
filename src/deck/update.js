import router, { body, headers, params } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

router.put("/deck/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);

    if (!body.name) {
      return new Response(
        JSON.stringify({ error: "Missing required field: name" }),
        { ...init, status: 400 }
      );
    }

    const deck = await Deck.update(
      params.id,
      {
        name: body.name,
        description: body.description || "",
      },
      user.key
    );

    return new Response(JSON.stringify(deck), init);
  } catch (error) {
    console.error("Error updating deck:", error);

    if (error.message?.includes("not found")) {
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
