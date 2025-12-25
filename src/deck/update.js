/**
 * @fileoverview PUT /deck/:id route handler for updating decks.
 *
 * ⚠️ WARNING: This file imports Google.me() directly instead of using the @auth/me middleware.
 * This is inconsistent with other route handlers. Consider refactoring to use:
 * `import { me } from '@auth'` and `router.put("/deck/:id", me(async (user) => { ... }))`
 * for consistency with other routes.
 */

import router, { body, headers, params } from "@the-memoize-project/router/worker";
import Google from "./google";
import init from "./init";
import Deck from "./deck";

/**
 * Updates a deck's name and description.
 *
 * Authenticates using Google.me() directly (inconsistent with other routes).
 * Merges request body with URL parameters.
 *
 * @example
 * PUT /deck/deck_123
 * Body: {
 *   "name": "Updated Spanish Vocabulary",
 *   "description": "Updated description"
 * }
 *
 * Response: { "data": true }
 * Error: { "error": "Deck not found or not authorized" } if not found
 * Error: 500 on server failure
 */
router.put("/deck/:id", async () => {
  try {
    const user = await Google.me(headers.authorization);
    const deck = { ...body, ...params };
    const result = await Deck.update(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (error) {
    return new Response(error.message, { ...init, status: 500 });
  }
});
