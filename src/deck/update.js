import router, { body, headers, params } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

router.put("/deck/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck = { ...body, ...params };
    const result = await Deck.update(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
