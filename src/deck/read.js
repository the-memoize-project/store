import router, { headers } from "@the-memoize-project/router";
import Google from "./google";
import init from './init'
import Deck from './deck'

router.get("/deck", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const decks = await Deck.get(user.key)
    return Response(decks, init);
  } catch (error) {
    return Response(error.maessage, 401);
  }
});
