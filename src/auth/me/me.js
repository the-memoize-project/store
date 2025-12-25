import { Google } from "@the-memoize-project/auth";
import { headers } from '@the-memoize-project/router/worker'

/**
 * Authentication middleware using Google OAuth.
 *
 * @param {Function} next - Handler to call with authenticated user.
 * @returns {Function} Async function that returns a Response.
 *
 * @description
 * Validates access token from Authorization header and injects user context.
 * Returns 401 if invalid, 500 on error.
 *
 * @example
 * router.get('/api/decks', me((user) => Response.json({ userId: user.id })))
 */
const me = (next) => async () =>  {
  try {
    const user = await Google.me(headers.authorization);
    if (!user?.id) {
      return new Response(null, { status: 401 });
    }
    return await next(user);
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}

export default me;
