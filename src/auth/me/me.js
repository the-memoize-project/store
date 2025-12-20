import router, { headers } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from './init'

router.get("/auth/me", async () => {
  try {
    const user = await Google.me(headers.authorization);
    return Response(user, init);
  } catch (error) {
    return Response(error.maessage, 401);
  }
});
