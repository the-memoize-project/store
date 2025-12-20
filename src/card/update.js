import router, { body, headers, params } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.put("/card/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const card = { ...body, ...params };
    const result = await Card.update(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
