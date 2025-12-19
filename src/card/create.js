import router, { body, headers } from "@the-memoize-project/router";
import Google from "./google";
import init from "./init";
import Card from "./card";

router.post("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const card = { ...body };
    const result = await Card.create(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
