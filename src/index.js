/**
 * Cloudflare Worker entry point.
 *
 * @property {Function} fetch - Worker fetch handler.
 *
 * @description
 * Initializes headers and environment bindings, then routes requests.
 * Routes are registered via side-effect imports (@card, @deck).
 *
 * @example
 * // POST /card?deck=deck_123
 * // GET /deck
 * // PUT /card/card_456
 * // DELETE /deck/deck_123
 */

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
