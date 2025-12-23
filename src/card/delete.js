import router, { headers, params } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

router.delete("/card/:id", me(async (user) => {
  try {
    const card = { ...params };
    const result = await Card.delete(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));
