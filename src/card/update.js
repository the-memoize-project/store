/**
 * @fileoverview PUT /card/:id route handler for updating flashcards.
 */

import router, { body, params } from "@the-memoize-project/router/worker";
import init from "./init";
import Card from "./card";
import { me } from '@auth';

/**
 * Updates card content and FSRS scheduling data.
 *
 * Requires authentication via me() middleware. Merges request body with URL parameters.
 * Used to update learning progress after reviews (state, stability, difficulty, etc.).
 *
 * @example
 * PUT /card/card_456
 * Body: {
 *   "front": "Hello",
 *   "back": "Hola",
 *   "state": 2,
 *   "stability": 5.5,
 *   "difficulty": 4.2,
 *   "due": 1641081600000,
 *   "last_review": 1640995200000,
 *   "reps": 3,
 *   "lapses": 0
 * }
 *
 * Response: { "data": true }
 * Error: { "error": "Card not found or not authorized" } if not found
 * Error: 500 on server failure
 */
router.put("/card/:id", me(async (user) => {
  try {
    const card = { ...body, ...params };
    const result = await Card.update(card, user);
    const body = JSON.stringify(result);
    return new Response(body, init);
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
});
