/**
 * @fileoverview DELETE /deck/:id route handler for removing decks.
 */

import router, { params } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import Card from "@card/card";
import { me } from '@auth';

/**
 * Deletes a deck and all its cards.
 *
 * Requires authentication via me() middleware. Extracts deck ID from URL parameter.
 * Only deletes the deck if it belongs to the authenticated user.
 *
 * **Deletion Process:**
 * 1. First deletes all cards in the deck (Card.deleteByDeck)
 * 2. Then deletes the deck itself (Deck.delete)
 *
 * ⚠️ WARNING: This operation permanently removes the deck and all its flashcards.
 * This action cannot be undone.
 *
 * @example
 * DELETE /deck/deck_123
 *
 * Response: { "data": true }
 * Error: { "error": "Failed to delete cards" } if card deletion fails
 * Error: { "error": "Deck not found or not authorized" } if deck deletion fails
 * Error: 500 on server failure
 */
router.delete("/deck/:id", me(async (user) => {
  try {
    const deck = { ...params };

    // First delete all cards in the deck
    const cardsResult = await Card.deleteByDeck(deck, user);
    if (cardsResult.error) {
      const body = JSON.stringify(cardsResult);
      return new Response(body, init);
    }

    // Then delete the deck
    const result = await Deck.delete(deck, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
