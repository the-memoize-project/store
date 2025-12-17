import router, { args } from "@the-memoize-project/router";
import Google from "./google";
import User from "./user";
import init from './init'

router.get("/auth/callback", async () => {
  try {
    const data = await Google.authorization(args.code);
    const user = await User.signIn(data);
    return Response(user, init);
  } catch (error) {
    return Response(error.maessage, 401);
  }
});
