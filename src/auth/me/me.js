/**
 * @fileoverview Authentication middleware for validating user access tokens.
 * Integrates with Google OAuth via @the-memoize-project/auth package.
 */

import { Google } from "@the-memoize-project/auth";
import { headers } from '@the-memoize-project/router/worker'

/**
 * @typedef {Object} User
 * @property {string} id - Google user ID
 * @property {string} email - User email address
 * @property {string} name - User display name
 * @property {string} picture - Profile picture URL
 */

/**
 * @callback NextHandler
 * @param {User} user - Authenticated user object
 * @returns {Response|Promise<Response>} HTTP response
 */

/**
 * Authentication middleware using Google OAuth.
 *
 * Validates the user's access token from the Authorization header and injects
 * authenticated user context into the route handler.
 *
 * **Flow:**
 * 1. Extract access token from Authorization header
 * 2. Validate token with Google OAuth
 * 3. If valid and user has ID, call next handler with user
 * 4. If invalid, return 401 Unauthorized
 * 5. If error occurs, return 500 Internal Server Error
 *
 * **Curried Pattern:**
 * Returns a function that returns a function, enabling middleware composition:
 * ```js
 * const handler = me(
 *   logger(
 *     rateLimiter(
 *       (user) => Response.json({ userId: user.id })
 *     )
 *   )
 * );
 * ```
 *
 * **Security:**
 * - Validates token on every request (no caching)
 * - Returns minimal error information
 * - Rejects users without valid ID
 *
 * @function
 * @param {NextHandler} next - Handler function to call with authenticated user
 * @returns {Function} Async function that returns a Response
 *
 * @example
 * // Basic usage
 * import { me } from '@auth';
 * import router from '@the-memoize-project/router/worker';
 *
 * router.get('/api/decks', me((user) => {
 *   return Response.json({ userId: user.id });
 * }));
 *
 * @example
 * // With async handler
 * router.get('/api/decks', me(async (user) => {
 *   const decks = await Deck.list(user);
 *   return Response.json({ decks });
 * }));
 *
 * @example
 * // Middleware composition
 * const requireAdmin = (next) => (user) => {
 *   if (!user.isAdmin) {
 *     return Response.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *   return next(user);
 * };
 *
 * router.delete('/admin/users/:id', me(requireAdmin((user) => {
 *   // Only admins reach here
 *   return Response.json({ success: true });
 * })));
 */
const me = (next) => async () =>  {
  try {
    const user = await Google.me(headers.authorization);
    return user?.id
      ? next(user)
      : new Response(null, { status: 401 });
  } catch (_error) {
    return new Response(null, { status: 500 });
  }
};

export default me;
