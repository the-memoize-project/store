import env from "@env";

const Deck = {
  delete(key) {
    return env.DECK.delete(key);
  },

  get(key) {
    return env.DECK.get(key, { type: "json" }) ?? []
  },

  put(key, value) {
    return env.DECK.put(key, JSON.strigify(value));
  }
}

export default Deck;
