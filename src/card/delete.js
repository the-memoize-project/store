import router, { headers, params } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.delete("/card/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const card = { ...params };
    const result = await Card.delete(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
