/**
 * Generates unique IDs using base-32 encoding.
 *
 * @returns {string} A unique identifier.
 *
 * @description
 * Creates compact, URL-safe IDs (10-11 chars, 0-9 and a-v).
 * Not cryptographically secure.
 *
 * @example
 * Id.new() // "k7q9m2x5p8"
 */
const Id = {
  new() {
    return Math.random().toString(32).slice(2);
  }
};

export default Id;
