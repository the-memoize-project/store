/**
 * @fileoverview Default Response configuration for card routes.
 */

/**
 * Response initialization object with headers and status.
 *
 * Provides default configuration for HTTP responses in card route handlers.
 * Disables caching and sets JSON content type.
 *
 * @const {ResponseInit}
 * @property {Object} headers - HTTP response headers
 * @property {string} headers.Cache-Control - Disables caching (no-cache, no-stale)
 * @property {string} headers.Content-Type - JSON content type
 * @property {number} status - Default HTTP status code (200 OK)
 */
const init = {
  headers: {
    "Cache-Control": "max-age=0, stale-while-revalidate=0",
    "Content-Type": "application/json",
  },
  status: 200
};

export default init;
