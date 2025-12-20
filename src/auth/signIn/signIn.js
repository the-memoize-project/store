import router, { headers } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from './init'

router.get("/auth/sign-in", async () => {
  try {
    const data = await Google.signIn(args.code);
    return Response(data, init);
  } catch (error) {
    return Response(error.maessage, 401);
  }
});
