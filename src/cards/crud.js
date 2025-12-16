import { error, success } from "../utils/index.js";
import { generateId } from "../utils/crypto.js";

/**
 * Verify user owns the deck
 */
async function verifyDeckOwnership(deckId, userId, env) {
  const deck = await env.DECKS_KV.get(`deck:${deckId}`, "json");

  if (!deck) {
    return { error: true, response: error("Deck not found", 404, "DECK_NOT_FOUND") };
  }

  if (deck.userId !== userId) {
    return { error: true, response: error("Unauthorized access to deck", 403, "FORBIDDEN") };
  }

  return { error: false, deck };
}

/**
 * List all cards in a deck
 */
export async function listCards(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const deckId = pathParts[pathParts.indexOf("decks") + 1];

    if (!deckId) {
      return error("Missing deck ID", 400, "MISSING_DECK_ID");
    }

    // Verify deck ownership
    const verifyResult = await verifyDeckOwnership(deckId, userId, env);
    if (verifyResult.error) {
      return verifyResult.response;
    }

    // Get deck's card IDs
    const deckCardsData = await env.CARDS_KV.get(`deck_cards:${deckId}`, "json");
    const cardIds = deckCardsData?.cardIds || [];

    // Get all card data
    const cards = await Promise.all(
      cardIds.map(async (cardId) => {
        const card = await env.CARDS_KV.get(`card:${cardId}`, "json");
        return card;
      })
    );

    // Filter out null cards (in case some were deleted)
    const validCards = cards.filter(card => card !== null);

    return success({
      cards: validCards,
      total: validCards.length,
    });
  } catch (err) {
    console.error("List cards error:", err);
    return error("Failed to list cards", 500, "LIST_CARDS_ERROR");
  }
}

/**
 * Get a specific card
 */
export async function getCard(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const cardId = url.pathname.split("/").pop();

    if (!cardId) {
      return error("Missing card ID", 400, "MISSING_CARD_ID");
    }

    // Get card data
    const card = await env.CARDS_KV.get(`card:${cardId}`, "json");

    if (!card) {
      return error("Card not found", 404, "CARD_NOT_FOUND");
    }

    // Verify card's deck belongs to user
    const verifyResult = await verifyDeckOwnership(card.deckId, userId, env);
    if (verifyResult.error) {
      return verifyResult.response;
    }

    return success({
      card,
    });
  } catch (err) {
    console.error("Get card error:", err);
    return error("Failed to get card", 500, "GET_CARD_ERROR");
  }
}

/**
 * Create a new card
 */
export async function createCard(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const deckId = pathParts[pathParts.indexOf("decks") + 1];

    if (!deckId) {
      return error("Missing deck ID", 400, "MISSING_DECK_ID");
    }

    const body = await request.json();
    const { front, back, tags = [] } = body;

    if (!front || !back) {
      return error("Missing card front or back", 400, "MISSING_CARD_DATA");
    }

    // Verify deck ownership
    const verifyResult = await verifyDeckOwnership(deckId, userId, env);
    if (verifyResult.error) {
      return verifyResult.response;
    }

    // Generate card ID
    const cardId = generateId("card");

    // Create card data
    const card = {
      id: cardId,
      deckId,
      front,
      back,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save card
    await env.CARDS_KV.put(`card:${cardId}`, JSON.stringify(card));

    // Add card to deck's card list
    const deckCardsData = await env.CARDS_KV.get(`deck_cards:${deckId}`, "json");
    const cardIds = deckCardsData?.cardIds || [];
    cardIds.push(cardId);

    await env.CARDS_KV.put(`deck_cards:${deckId}`, JSON.stringify({ cardIds }));

    // Update deck's updated_at timestamp
    const deck = verifyResult.deck;
    deck.updated_at = new Date().toISOString();
    await env.DECKS_KV.put(`deck:${deckId}`, JSON.stringify(deck));

    return success({
      card,
    }, 201);
  } catch (err) {
    console.error("Create card error:", err);
    return error("Failed to create card", 500, "CREATE_CARD_ERROR");
  }
}

/**
 * Update a card
 */
export async function updateCard(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const cardId = url.pathname.split("/").pop();

    if (!cardId) {
      return error("Missing card ID", 400, "MISSING_CARD_ID");
    }

    const body = await request.json();
    const { front, back, tags } = body;

    // Get existing card
    const card = await env.CARDS_KV.get(`card:${cardId}`, "json");

    if (!card) {
      return error("Card not found", 404, "CARD_NOT_FOUND");
    }

    // Verify card's deck belongs to user
    const verifyResult = await verifyDeckOwnership(card.deckId, userId, env);
    if (verifyResult.error) {
      return verifyResult.response;
    }

    // Update card data
    const updatedCard = {
      ...card,
      ...(front !== undefined && { front }),
      ...(back !== undefined && { back }),
      ...(tags !== undefined && { tags }),
      updated_at: new Date().toISOString(),
    };

    // Save updated card
    await env.CARDS_KV.put(`card:${cardId}`, JSON.stringify(updatedCard));

    // Update deck's updated_at timestamp
    const deck = verifyResult.deck;
    deck.updated_at = new Date().toISOString();
    await env.DECKS_KV.put(`deck:${card.deckId}`, JSON.stringify(deck));

    return success({
      card: updatedCard,
    });
  } catch (err) {
    console.error("Update card error:", err);
    return error("Failed to update card", 500, "UPDATE_CARD_ERROR");
  }
}

/**
 * Delete a card
 */
export async function deleteCard(request, env) {
  try {
    const { userId } = request.auth;
    const url = new URL(request.url);
    const cardId = url.pathname.split("/").pop();

    if (!cardId) {
      return error("Missing card ID", 400, "MISSING_CARD_ID");
    }

    // Get existing card
    const card = await env.CARDS_KV.get(`card:${cardId}`, "json");

    if (!card) {
      return error("Card not found", 404, "CARD_NOT_FOUND");
    }

    // Verify card's deck belongs to user
    const verifyResult = await verifyDeckOwnership(card.deckId, userId, env);
    if (verifyResult.error) {
      return verifyResult.response;
    }

    // Delete card
    await env.CARDS_KV.delete(`card:${cardId}`);

    // Remove card from deck's card list
    const deckCardsData = await env.CARDS_KV.get(`deck_cards:${card.deckId}`, "json");
    if (deckCardsData) {
      const cardIds = deckCardsData.cardIds.filter(id => id !== cardId);
      await env.CARDS_KV.put(`deck_cards:${card.deckId}`, JSON.stringify({ cardIds }));
    }

    // Update deck's updated_at timestamp
    const deck = verifyResult.deck;
    deck.updated_at = new Date().toISOString();
    await env.DECKS_KV.put(`deck:${card.deckId}`, JSON.stringify(deck));

    return success({
      message: "Card deleted successfully",
      cardId,
    });
  } catch (err) {
    console.error("Delete card error:", err);
    return error("Failed to delete card", 500, "DELETE_CARD_ERROR");
  }
}
