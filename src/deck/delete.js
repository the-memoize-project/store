/**
 * @fileoverview DELETE /deck/:id route handler for removing decks.
 */

import router, { params } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import { me } from '@auth';

/**
 * Deletes a deck and all its cards.
 *
 * Requires authentication via me() middleware. Extracts deck ID from URL parameter.
 * Only deletes the deck if it belongs to the authenticated user.
 *
 * ⚠️ WARNING: This operation cascades to delete all cards in the deck due to
 * foreign key constraints. All flashcards in this deck will be permanently removed.
 *
 * @example
 * DELETE /deck/deck_123
 *
 * Response: { "data": true }
 * Error: { "error": "Deck not found or not authorized" } if not found
 * Error: 500 on server failure
 */
router.delete("/deck/:id", me(async (user) => {
  try {
    const deck = { ...params };
    const result = await Deck.delete(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
