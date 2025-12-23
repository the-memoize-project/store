import router, { body, params } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

router.put("/card/:id", me(async (user) => {
  try {
    const card = { ...body, ...params };
    const result = await Card.update(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
