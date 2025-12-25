/**
 * @fileoverview Environment variable management for Cloudflare Workers.
 * Provides global access to Worker bindings (D1, KV, secrets).
 */

/**
 * @typedef {Object} CloudflareEnv
 * @property {D1Database} DB - Cloudflare D1 database instance
 * @property {KVNamespace} [USERS_KV] - User data KV namespace
 * @property {KVNamespace} [DECKS_KV] - Deck metadata KV namespace
 * @property {KVNamespace} [CARDS_KV] - Card data KV namespace
 * @property {KVNamespace} [SESSIONS_KV] - Session tokens KV namespace
 * @property {string} [GOOGLE_CLIENT_ID] - Google OAuth client ID
 * @property {string} [GOOGLE_CLIENT_SECRET] - Google OAuth client secret
 * @property {string} [JWT_SECRET] - JWT signing secret
 */

/**
 * Environment bindings accessor and initializer.
 *
 * This function serves dual purposes:
 * 1. **Initializer**: When called with an object, merges bindings into itself
 * 2. **Accessor**: Properties can be accessed directly (e.g., env.DB)
 *
 * **Usage Pattern:**
 * - Call once at Worker entry point with environment object
 * - Access bindings anywhere via property access
 *
 * **Why this pattern?**
 * - Avoids prop drilling through function parameters
 * - Provides global access while maintaining single initialization point
 * - Simplifies module imports (no need to pass env everywhere)
 *
 * @function
 * @param {CloudflareEnv} [data] - Cloudflare Worker environment bindings
 * @returns {Function & CloudflareEnv} The env function with bindings as properties
 *
 * @example
 * // Initialize at Worker entry point
 * export default {
 *   fetch(request, environment) {
 *     env(environment);  // Initialize once
 *     return router.handle(request);
 *   }
 * };
 *
 * @example
 * // Access in any module
 * import env from '@env';
 *
 * async function getUser(id) {
 *   const user = await env.DB
 *     .prepare('SELECT * FROM user WHERE id = ?')
 *     .bind(id)
 *     .first();
 *   return user;
 * }
 *
 * @example
 * // Access secrets
 * const clientId = env.GOOGLE_CLIENT_ID;
 * const secret = env.GOOGLE_CLIENT_SECRET;
 */
const env = (data) => {
  Object.assign(env, data);
  return env;
};

export default env;
