/**
 * @fileoverview GET /card routes for retrieving flashcards.
 */

import router, { args, params } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

/**
 * Lists all cards in a deck.
 *
 * Requires authentication via me() middleware. Extracts deck ID from query parameter.
 * Returns all cards in the deck owned by the authenticated user, ordered by creation date (newest first).
 *
 * @example
 * GET /card?deck=deck_123
 *
 * Response: { "data": [{ "id": "card_456", "front": "Hello", ... }, ...] }
 * Error: 500 on failure
 */
router.get("/card", me(async (user) => {
  try {
    const deck = { id: args.deck };
    const result = await Card.list(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));

/**
 * Gets a single card by ID.
 *
 * Requires authentication via me() middleware. Extracts card ID from URL parameter.
 * Only returns the card if it belongs to the authenticated user.
 *
 * @example
 * GET /card/card_456
 *
 * Response: { "data": { "id": "card_456", "front": "Hello", "back": "Hola", ... } }
 * Error: { "error": "Failed to get card" } if not found or unauthorized
 * Error: 500 on server failure
 */
router.get("/card/:id", me(async (user) => {
  try {
    const card = { ...params };
    const result = await Card.get(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
