import env from "@env";
import router, { headers } from "@the-memoize-project/router/worker";

import "@card";
import "@deck";

export default {
  fetch(request, environment) {
    headers(request);
    env(environment);
    return router.handle(request);
  },
};
