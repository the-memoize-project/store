import router, { body } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import { me } from '@auth';

router.post("/deck", me(async (user) => {
  try {
    const deck = { ...body };
    const result = await Deck.create(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));
