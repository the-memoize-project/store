/**
 * Memoize Store - Backend API
 * Built on Cloudflare Workers with KV storage
 */

import router from "@the-memoize-project/router/worker";
import { handleOAuthCallback, validateGoogleToken, logout } from "../packages/auth/index.js";
import { listDecks, getDeck, createDeck, updateDeck, deleteDeck } from "../packages/decks/index.js";
import { listCards, getCard, createCard, updateCard, deleteCard } from "../packages/cards/index.js";
import { requireAuth } from "../packages/middleware/index.js";
import { corsPreflightResponse, error } from "../packages/utils/index.js";

// Authentication routes (public)
router.post("/auth/callback", handleOAuthCallback);

// Protected routes - Authentication validation
router.get("/auth/validate", requireAuth(validateGoogleToken));
router.post("/auth/logout", requireAuth(logout));

// Deck routes (protected)
router.get("/api/decks", requireAuth(listDecks));
router.post("/api/decks", requireAuth(createDeck));
router.get("/api/decks/:id", requireAuth(getDeck));
router.put("/api/decks/:id", requireAuth(updateDeck));
router.delete("/api/decks/:id", requireAuth(deleteDeck));

// Card routes (protected)
router.get("/api/decks/:deckId/cards", requireAuth(listCards));
router.post("/api/decks/:deckId/cards", requireAuth(createCard));
router.get("/api/cards/:id", requireAuth(getCard));
router.put("/api/cards/:id", requireAuth(updateCard));
router.delete("/api/cards/:id", requireAuth(deleteCard));

/**
 * Main worker fetch handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return corsPreflightResponse();
      }

      // Handle request with router
      const response = await router.handle(request, env, ctx);

      // Return response or 404
      return response ?? error("Not Found", 404, "NOT_FOUND");
    } catch (err) {
      console.error("Worker error:", err);
      return error("Internal Server Error", 500, "INTERNAL_ERROR");
    }
  },
};
