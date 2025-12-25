/**
 * @fileoverview GET /deck routes for retrieving decks.
 */

import router, { params } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import { me } from '@auth';

/**
 * Lists all decks for the authenticated user.
 *
 * Requires authentication via me() middleware.
 * Returns all decks owned by the user, ordered by creation date (newest first).
 *
 * @example
 * GET /deck
 *
 * Response: { "data": [{ "id": "deck_123", "name": "Spanish Vocabulary", ... }, ...] }
 * Error: 500 on failure
 */
router.get("/deck", me(async (user) => {
  try {
    const result = await Deck.list(user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});

/**
 * Gets a single deck by ID.
 *
 * Requires authentication via me() middleware. Extracts deck ID from URL parameter.
 * Only returns the deck if it belongs to the authenticated user.
 *
 * @example
 * GET /deck/deck_123
 *
 * Response: { "data": { "id": "deck_123", "name": "Spanish Vocabulary", ... } }
 * Error: { "error": "Failed to get deck" } if not found or unauthorized
 * Error: 500 on server failure
 */
router.get("/deck/:id", me(async (user) => {
  try {
    const deck = { ...params };
    const result = await Deck.get(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
