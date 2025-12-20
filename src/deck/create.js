import router, { body, headers } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

router.post("/deck", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck = { ...body };
    const result = await Deck.create(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
