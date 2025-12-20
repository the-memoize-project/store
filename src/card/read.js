import router, { args, headers, params } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.get("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck = { id: args.deck };
    const result = await Card.list(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});

router.get("/card/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const card = { ...params };
    const result = await Card.get(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
