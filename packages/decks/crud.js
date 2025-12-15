import { error, success } from "../utils/index.js";
import { generateId } from "../utils/crypto.js";

/**
 * List all decks for a user
 */
export async function listDecks(request, env) {
  try {
    const { userId } = request.auth;

    // Get user's deck IDs
    const userDecksData = await env.DECKS_KV.get(`user_decks:${userId}`, "json");
    const deckIds = userDecksData?.deckIds || [];

    // Get all deck data
    const decks = await Promise.all(
      deckIds.map(async (deckId) => {
        const deck = await env.DECKS_KV.get(`deck:${deckId}`, "json");
        return deck;
      })
    );

    // Filter out null decks (in case some were deleted)
    const validDecks = decks.filter(deck => deck !== null);

    return success({
      decks: validDecks,
      total: validDecks.length,
    });
  } catch (err) {
    console.error("List decks error:", err);
    return error("Failed to list decks", 500, "LIST_DECKS_ERROR");
  }
}

/**
 * Get a specific deck
 */
export async function getDeck(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const deckId = url.pathname.split("/").pop();

    if (!deckId) {
      return error("Missing deck ID", 400, "MISSING_DECK_ID");
    }

    // Get deck data
    const deck = await env.DECKS_KV.get(`deck:${deckId}`, "json");

    if (!deck) {
      return error("Deck not found", 404, "DECK_NOT_FOUND");
    }

    // Verify deck belongs to user
    if (deck.userId !== userId) {
      return error("Unauthorized access to deck", 403, "FORBIDDEN");
    }

    // Get card count for this deck
    const deckCardsData = await env.CARDS_KV.get(`deck_cards:${deckId}`, "json");
    const cardCount = deckCardsData?.cardIds?.length || 0;

    return success({
      deck: {
        ...deck,
        cardCount,
      },
    });
  } catch (err) {
    console.error("Get deck error:", err);
    return error("Failed to get deck", 500, "GET_DECK_ERROR");
  }
}

/**
 * Create a new deck
 */
export async function createDeck(request, env) {
  try {
    const { userId } = request.auth;
    const body = await request.json();

    const { name, description = "" } = body;

    if (!name) {
      return error("Missing deck name", 400, "MISSING_DECK_NAME");
    }

    // Generate deck ID
    const deckId = generateId("deck");

    // Create deck data
    const deck = {
      id: deckId,
      userId,
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save deck
    await env.DECKS_KV.put(`deck:${deckId}`, JSON.stringify(deck));

    // Add deck to user's deck list
    const userDecksData = await env.DECKS_KV.get(`user_decks:${userId}`, "json");
    const deckIds = userDecksData?.deckIds || [];
    deckIds.push(deckId);

    await env.DECKS_KV.put(`user_decks:${userId}`, JSON.stringify({ deckIds }));

    // Initialize empty card list for deck
    await env.CARDS_KV.put(`deck_cards:${deckId}`, JSON.stringify({ cardIds: [] }));

    return success({
      deck,
    }, 201);
  } catch (err) {
    console.error("Create deck error:", err);
    return error("Failed to create deck", 500, "CREATE_DECK_ERROR");
  }
}

/**
 * Update a deck
 */
export async function updateDeck(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const deckId = url.pathname.split("/").pop();

    if (!deckId) {
      return error("Missing deck ID", 400, "MISSING_DECK_ID");
    }

    const body = await request.json();
    const { name, description } = body;

    // Get existing deck
    const deck = await env.DECKS_KV.get(`deck:${deckId}`, "json");

    if (!deck) {
      return error("Deck not found", 404, "DECK_NOT_FOUND");
    }

    // Verify deck belongs to user
    if (deck.userId !== userId) {
      return error("Unauthorized access to deck", 403, "FORBIDDEN");
    }

    // Update deck data
    const updatedDeck = {
      ...deck,
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      updated_at: new Date().toISOString(),
    };

    // Save updated deck
    await env.DECKS_KV.put(`deck:${deckId}`, JSON.stringify(updatedDeck));

    return success({
      deck: updatedDeck,
    });
  } catch (err) {
    console.error("Update deck error:", err);
    return error("Failed to update deck", 500, "UPDATE_DECK_ERROR");
  }
}

/**
 * Delete a deck
 */
export async function deleteDeck(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const deckId = url.pathname.split("/").pop();

    if (!deckId) {
      return error("Missing deck ID", 400, "MISSING_DECK_ID");
    }

    // Get existing deck
    const deck = await env.DECKS_KV.get(`deck:${deckId}`, "json");

    if (!deck) {
      return error("Deck not found", 404, "DECK_NOT_FOUND");
    }

    // Verify deck belongs to user
    if (deck.userId !== userId) {
      return error("Unauthorized access to deck", 403, "FORBIDDEN");
    }

    // Get all cards in deck
    const deckCardsData = await env.CARDS_KV.get(`deck_cards:${deckId}`, "json");
    const cardIds = deckCardsData?.cardIds || [];

    // Delete all cards
    await Promise.all(
      cardIds.map(cardId => env.CARDS_KV.delete(`card:${cardId}`))
    );

    // Delete deck cards list
    await env.CARDS_KV.delete(`deck_cards:${deckId}`);

    // Delete deck
    await env.DECKS_KV.delete(`deck:${deckId}`);

    // Remove deck from user's deck list
    const userDecksData = await env.DECKS_KV.get(`user_decks:${userId}`, "json");
    if (userDecksData) {
      const deckIds = userDecksData.deckIds.filter(id => id !== deckId);
      await env.DECKS_KV.put(`user_decks:${userId}`, JSON.stringify({ deckIds }));
    }

    return success({
      message: "Deck deleted successfully",
      deckId,
    });
  } catch (err) {
    console.error("Delete deck error:", err);
    return error("Failed to delete deck", 500, "DELETE_DECK_ERROR");
  }
}
