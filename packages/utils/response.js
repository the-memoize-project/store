/**
 * Create a JSON response
 */
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...headers,
    },
  });
}

/**
 * Create an error response
 */
export function error(message, status = 400, code = "ERROR") {
  return json({
    error: {
      message,
      code,
      status,
    },
  }, status);
}

/**
 * Create a success response
 */
export function success(data, status = 200) {
  return json(data, status);
}

/**
 * Handle CORS preflight
 */
export function corsPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
