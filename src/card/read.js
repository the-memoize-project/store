import router, { args, params } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

router.get("/card", me(async (user) => {
  try {
    const deck = { id: args.deck };
    const result = await Card.list(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));

router.get("/card/:id", me(async (user) => {
  try {
    const card = { ...params };
    const result = await Card.get(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
