/**
 * Generate a random ID
 */
export function generateId(prefix = "") {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}_${timestamp}_${randomPart}` : `${timestamp}_${randomPart}`;
}

/**
 * Generate a secure random token
 */
export async function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a string using SHA-256
 */
export async function hash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a simple JWT-like token (not cryptographically secure, but sufficient for demo)
 * In production, use proper JWT libraries or Cloudflare's own token generation
 */
export async function createAccessToken(userId) {
  const token = await generateToken();
  const payload = {
    userId,
    token,
    created_at: Date.now(),
    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  return { token, payload };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(payload) {
  if (!payload) return false;
  if (!payload.expires_at) return false;
  if (Date.now() > payload.expires_at) return false;
  return true;
}
