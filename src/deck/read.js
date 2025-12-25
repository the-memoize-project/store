import router, { params } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import { me } from '@auth';

router.get("/deck", me(async (user) => {
  try {
    const result = await Deck.list(user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));

router.get("/deck/:id", me(async (user) => {
  try {
    const deck = { ...params };
    const result = await Deck.get(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
