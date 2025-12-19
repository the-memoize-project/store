import env from "@env";

const Card = {
  delete(key) {
    return env.CARD.delete(key);
  },

  get(key) {
    return env.CARD.get(key, { type: "json" }) ?? []
  },

  put(key, value) {
    return env.CARD.put(key, JSON.stringify(value));
  }
}

export default Card;
