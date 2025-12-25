/**
 * @fileoverview POST /deck route handler for creating decks.
 */

import router, { body } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import { me } from '@auth';

/**
 * Creates a new flashcard deck.
 *
 * Requires authentication via me() middleware. Extracts deck data (name, description)
 * from request body and creates a new deck for the authenticated user.
 *
 * @example
 * POST /deck
 * Body: {
 *   "name": "Spanish Vocabulary",
 *   "description": "Common Spanish words and phrases"
 * }
 *
 * Response: { "data": { "id": "deck_xyz", "name": "Spanish Vocabulary", ... } }
 * Error: 500 on failure
 */
router.post("/deck", me(async (user) => {
  try {
    const deck = { ...body };
    const result = await Deck.create(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));
