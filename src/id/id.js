/**
 * @fileoverview Unique ID generation utility for database entities.
 * Generates compact, URL-safe IDs using base-32 encoding.
 */

/**
 * ID generation utility
 * @namespace Id
 */
const Id = {
  /**
   * Generates a new unique identifier.
   *
   * Uses Math.random() with base-32 encoding to create compact, URL-safe IDs.
   * IDs are typically 10-11 characters long and use characters 0-9 and a-v.
   *
   * **Characteristics:**
   * - Length: 10-11 characters (variable)
   * - Character set: 0-9, a-v (base-32)
   * - URL-safe: Yes
   * - Collision-resistant: Yes (for typical use cases up to ~100k entities)
   *
   * **Not suitable for:**
   * - Security tokens (not cryptographically secure)
   * - Sequential ordering (IDs are random)
   *
   * @returns {string} A unique identifier
   *
   * @example
   * const id = Id.new();
   * // "k7q9m2x5p8"
   *
   * @example
   * // Using in database
   * const deckId = Id.new();
   * await db.insert({ id: deckId, name: "My Deck" });
   */
  new() {
    return Math.random().toString(32).slice(2);
  }
}

export default Id
