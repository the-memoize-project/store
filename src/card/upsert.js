import router, { body, headers } from "@the-memoize-project/router";
import Google from "./google";
import init from './init'
import Card from './card'

router.post("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);
    await Card.put(user.key, body.cards);
    return Response(true, init);
  } catch (error) {
    return Response(error.message, 401);
  }
});
