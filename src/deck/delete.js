import router, { params } from "@the-memoize-project/router/worker";
import init from "./init";
import Deck from "./deck";
import Card from "@card/card";
import { me } from '@auth';

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
}));
