import router, { body, headers } from "@the-memoize-project/router";
import Google from "./google";
import init from './init'
import Deck from './deck'

router.post("/deck", async () => {
  try {
    const user = await Google.me(headers.authorization);
    await Deck.put(user.key, body.decks);
    return Response(true, init);
  } catch (error) {
    return Response(error.maessage, 401);
  }
});
