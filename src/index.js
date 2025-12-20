import env from "@env";
import router from "@the-memoize-project/router/worker";

import "@auth";
import "@card";
import "@deck";

export default {
  fetch(request, environment) {
    env.handle(environment);
    return router.handle(request);
  },
};
