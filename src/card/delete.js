/**
 * @fileoverview DELETE /card/:id route handler for removing flashcards.
 */

import router, { headers, params } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

/**
 * Deletes a card by ID.
 *
 * Requires authentication via me() middleware. Extracts card ID from URL parameter.
 * Only deletes the card if it belongs to the authenticated user.
 *
 * @example
 * DELETE /card/card_456
 *
 * Response: { "data": true }
 * Error: { "error": "Card not found or not authorized" } if not found
 * Error: 500 on server failure
 */
router.delete("/card/:id", me(async (user) => {
  try {
    const card = { ...params };
    const result = await Card.delete(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));
