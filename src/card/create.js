import router, { args, body } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

router.post("/card", me(async (user) => {
  try {
    const deck = { id: args.deck };
    const card = { ...body };
    const result = await Card.create(deck, card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));
