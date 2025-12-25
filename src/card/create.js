/**
 * @fileoverview POST /card route handler for creating flashcards.
 */

import router, { args, body } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

/**
 * Creates a new flashcard in a deck.
 *
 * Requires authentication via me() middleware. Extracts deck ID from query parameter
 * and card data from request body. Creates card with FSRS scheduling metadata.
 *
 * @example
 * POST /card?deck=deck_123
 * Body: {
 *   "front": "Hello",
 *   "back": "Hola",
 *   "state": 0,
 *   "stability": 1.0,
 *   "difficulty": 5.0,
 *   "due": 1640995200000,
 *   "last_review": 1640995200000,
 *   "reps": 0,
 *   "lapses": 0
 * }
 *
 * Response: { "data": { "id": "card_xyz", ... } }
 * Error: 500 on failure
 */
router.post("/card", me(async (user) => {
  try {
    const deck = { id: args.deck };
    const card = { ...body };
    const result = await Card.create(deck, card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
}));
