import router, { headers } from "@the-memoize-project/router";
import Google from "./google";
import init from './init'
import Card from './card'

router.get("/card", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const cards = await Card.get(user.key)
    return Response(cards, init);
  } catch (error) {
    return Response(error.message, 401);
  }
});
