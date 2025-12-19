import router, { headers, params, query } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.get("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck_id = query.deck_id || null;
    const result = await Card.list(user, deck_id);
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
