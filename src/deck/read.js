import router, { headers, params } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

router.get("/deck", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const result = await Deck.list(user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});

router.get("/deck/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck = { ...params };
    const result = await Deck.get(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
