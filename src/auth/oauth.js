import { error, success } from "../utils/index.js";
import { generateId, createAccessToken } from "../utils/crypto.js";

/**
 * Exchange Google OAuth code for user info
 */
async function exchangeCodeForToken(code, env) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(errorData.error_description || "Failed to exchange code for token");
  }

  return tokenResponse.json();
}

/**
 * Get user info from Google
 */
async function getUserInfo(accessToken) {
  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error("Failed to get user info from Google");
  }

  return userInfoResponse.json();
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(request, env) {
  try {
    // Parse request body
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return error("Missing authorization code", 400, "MISSING_CODE");
    }

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, env);

    // Get user info
    const googleUser = await getUserInfo(tokenData.access_token);

    // Check if user exists
    let userId;
    let userData;
    const existingUser = await env.USERS_KV.get(`user:email:${googleUser.email}`, "json");

    if (existingUser) {
      // User exists, update their info
      userId = existingUser.id;
      userData = {
        ...existingUser,
        name: googleUser.name,
        picture: googleUser.picture,
        updated_at: new Date().toISOString(),
      };
    } else {
      // Create new user
      userId = generateId("user");
      userData = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Save user data
    await env.USERS_KV.put(`user:${userId}`, JSON.stringify(userData));
    await env.USERS_KV.put(`user:email:${googleUser.email}`, JSON.stringify({ id: userId }));

    // Create access token
    const { token, payload } = await createAccessToken(userId);

    // Store session
    await env.SESSIONS_KV.put(
      `session:${token}`,
      JSON.stringify(payload),
      {
        expirationTtl: 7 * 24 * 60 * 60, // 7 days in seconds
      }
    );

    // Return user data and token
    return success({
      user: userData,
      access_token: token,
    });
  } catch (err) {
    console.error("OAuth callback error:", err);
    return error(err.message || "Authentication failed", 500, "AUTH_ERROR");
  }
}

/**
 * Validate Google access token
 */
export async function validateGoogleToken(request, env) {
  try {
    const authResult = request.auth;

    if (!authResult) {
      return error("Unauthorized", 401, "UNAUTHORIZED");
    }

    return success({
      user: authResult.user,
      valid: true,
    });
  } catch (err) {
    return error("Token validation failed", 401, "VALIDATION_ERROR");
  }
}

/**
 * Logout user
 */
export async function logout(request, env) {
  try {
    const authResult = request.auth;

    if (!authResult) {
      return error("Unauthorized", 401, "UNAUTHORIZED");
    }

    // Delete session
    await env.SESSIONS_KV.delete(`session:${authResult.token}`);

    return success({
      message: "Logged out successfully",
    });
  } catch (err) {
    return error("Logout failed", 500, "LOGOUT_ERROR");
  }
}
