import router, { headers, params } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.delete("/card/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    await Card.delete(params.id, user.key);
    return new Response(JSON.stringify({ success: true }), init);
  } catch (error) {
    console.error("Error deleting card:", error);

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
