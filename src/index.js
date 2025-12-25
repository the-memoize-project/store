/**
 * @fileoverview Cloudflare Worker entry point for Memoize Store API.
 *
 * Initializes the worker environment and routes HTTP requests to appropriate handlers.
 * Side-effect imports (@card, @deck) register all HTTP routes during module initialization.
 */

import env from "@env";
import router, { headers } from "@the-memoize-project/router/worker";

import "@card";
import "@deck";

/**
 * Cloudflare Worker export.
 *
 * Provides the fetch handler that processes all incoming HTTP requests.
 * The handler initializes request headers and environment bindings, then
 * delegates request handling to the router which dispatches to registered routes.
 *
 * @property {Function} fetch - Cloudflare Worker fetch handler
 */
export default {
  /**
   * Processes incoming HTTP requests.
   *
   * Initializes the request context by:
   * 1. Setting headers from the incoming request
   * 2. Binding Cloudflare environment (D1 database, KV stores, secrets)
   * 3. Routing the request to appropriate handlers
   *
   * All routes are registered via side-effect imports (@card, @deck) which
   * define POST, GET, PUT, DELETE endpoints for flashcard management.
   *
   * @param {Request} request - Incoming HTTP request
   * @param {CloudflareEnv} environment - Cloudflare Worker bindings (DB, KV, secrets)
   * @returns {Promise<Response>} HTTP response from the appropriate route handler
   *
   * @example
   * // Worker handles requests like:
   * // POST /card?deck=deck_123
   * // GET /deck
   * // PUT /card/card_456
   * // DELETE /deck/deck_123
   */
  fetch(request, environment) {
    headers(request);
    env(environment);
    return router.handle(request);
  },
};
