import { Google } from "@the-memoize-project/auth";
import { headers } from '@the-memoize-project/router/worker'

const me = async (next) => () =>  {
  try {
    const user = await Google.me(headers.authorization);
    return user?.id
      ? next(user)
      : new Response(null, { status: 401 });
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
};

export default me;
