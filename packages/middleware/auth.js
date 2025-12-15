import { error } from "../utils/index.js";
import { verifyAccessToken } from "../utils/crypto.js";

/**
 * Authentication middleware
 * Validates access token and attaches user to request context
 */
export async function authMiddleware(request, env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return error("Missing authorization header", 401, "UNAUTHORIZED");
  }

  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return error("Invalid authorization header format", 401, "UNAUTHORIZED");
  }

  // Get session from KV
  const sessionData = await env.SESSIONS_KV.get(`session:${token}`, "json");

  if (!sessionData) {
    return error("Invalid or expired token", 401, "UNAUTHORIZED");
  }

  // Verify token hasn't expired
  if (!verifyAccessToken(sessionData)) {
    // Clean up expired session
    await env.SESSIONS_KV.delete(`session:${token}`);
    return error("Token expired", 401, "TOKEN_EXPIRED");
  }

  // Get user data
  const userData = await env.USERS_KV.get(`user:${sessionData.userId}`, "json");

  if (!userData) {
    return error("User not found", 404, "USER_NOT_FOUND");
  }

  // Attach user to request context
  return {
    user: userData,
    userId: sessionData.userId,
    token,
  };
}

/**
 * Wrap a handler with authentication
 */
export function requireAuth(handler) {
  return async (request, env, ctx) => {
    const authResult = await authMiddleware(request, env);

    // If authResult is a Response, it's an error
    if (authResult instanceof Response) {
      return authResult;
    }

    // Add auth context to request
    request.auth = authResult;

    return handler(request, env, ctx);
  };
}
