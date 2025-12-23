import router, { params } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import { me } from '@auth';

router.delete("/deck/:id", me(async (user) => {
  try {
    const deck = { ...params };
    const result = await Deck.delete(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
